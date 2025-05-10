import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // look up the user record
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch mindmaps with error handling and sorting
    const mindmaps = await prisma.mindmap.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        pdfName: true,
        pdfUrl: true,
        mindmapUrl: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc' // Sort by newest first
      },
    });

    // Return a clear response even if there are no mindmaps
    return NextResponse.json({ 
      results: mindmaps,
      count: mindmaps.length,
      hasResults: mindmaps.length > 0
    });
  } catch (error) {
    console.error("Error fetching mindmap results:", error);
    return NextResponse.json({ 
      error: "Failed to retrieve mindmaps", 
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined 
    }, { status: 500 });
  }
}
