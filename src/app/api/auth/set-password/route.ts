import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }
    
    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters long" }, { status: 400 });
    }
    
    // Only select fields we need to avoid DateTime issues
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update only the password field
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword
      },
      select: { id: true } // Only select id to avoid DateTime issues
    });
    
    return NextResponse.json({ 
      message: "Password set successfully",
    });
    
  } catch (error) {
    console.error("Set password error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}