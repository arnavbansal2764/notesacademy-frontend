import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { pdfName, pdfUrl, questions } = await request.json();
    
    if (!pdfUrl || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Get the user from the session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Create a new subjective result
    const result = await prisma.subjectiveresult.create({
      data: {
        userId: user.id,
        pdfName,
        pdfUrl,
        questions: questions,
        title: pdfName ? `Subjective Quiz - ${pdfName}` : "Subjective Quiz",
      },
    });
    
    return NextResponse.json({ success: true, resultId: result.id });
  } catch (error) {
    console.error("Error saving subjective result:", error);
    return NextResponse.json(
      { error: "Failed to save results" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Get all subjective results for the user
    const results = await prisma.subjectiveresult.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error fetching subjective results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}