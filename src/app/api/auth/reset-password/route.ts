import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email, password } = body;

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Find and validate the reset token
    const resetTokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        email: email.toLowerCase(),
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!resetTokenRecord) {
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Delete the used reset token
    await prisma.passwordResetToken.delete({
      where: { id: resetTokenRecord.id }
    });

    // Clean up any other expired tokens
    await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in reset-password API:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
