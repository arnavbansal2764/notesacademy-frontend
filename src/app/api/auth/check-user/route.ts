import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true, email: true }
    });
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    
    // Check if user needs to set a password (password is empty string)
    const needsPasswordSetup = !user.password || user.password === "";
    
    return NextResponse.json({ 
      exists: true,
      needsPasswordSetup,
      email: user.email
    });
    
  } catch (error) {
    console.error("Check user error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}