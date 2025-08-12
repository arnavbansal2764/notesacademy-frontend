import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/emailService";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true },
    });

    // For security, always return success even if user doesn't exist
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate cryptographically secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: email.toLowerCase() },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        email: email.toLowerCase(),
        token: resetToken,
        expiresAt,
      },
    });

    // Send reset email
    const resetLink = `${process.env.NEXTAUTH_URL || "https://notesacademy.in"}/reset-password?token=${resetToken}&email=${encodeURIComponent(
      email
    )}`;

    const emailResult = await sendPasswordResetEmail(email, resetLink);

    if (!emailResult.success) {
      console.error("Failed to send reset email:", emailResult.error);
      return NextResponse.json(
        { error: "Failed to send reset email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in forgot-password API:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
   