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
    
    const { pdfName, pdfUrl, notesUrl } = await request.json();
    
    if (!pdfUrl || !notesUrl) {
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
    
    // Create a new short notes result
    const result = await prisma.shortNotesResult.create({
      data: {
        userId: user.id,
        pdfName,
        pdfUrl,
        notesUrl,
        title: pdfName ? `Short Notes - ${pdfName}` : "Short Notes",
      },
    });
    
    return NextResponse.json({ success: true, resultId: result.id });
  } catch (error) {
    console.error("Error saving short notes result:", error);
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
    
    // Get all short notes results for the user
    const results = await prisma.shortNotesResult.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error fetching short notes results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
