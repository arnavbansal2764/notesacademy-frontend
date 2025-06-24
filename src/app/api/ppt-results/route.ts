import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const pptResults = await prisma.ppt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        pdfName: true,
        pdfUrl: true,
        pptUrl: true,
        createdAt: true
      }
    });

    return NextResponse.json({ 
      results: pptResults,
      count: pptResults.length 
    });
  } catch (error: any) {
    console.error("Error fetching PPT results:", error);
    return NextResponse.json(
      { error: "Failed to fetch PPT results" },
      { status: 500 }
    );
  }
}
