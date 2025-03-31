import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    // console.log("GET MINDMAP RESULTS - Request received");
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      // console.log("GET MINDMAP RESULTS - Unauthorized, no session");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });
    
    if (!user) {
      // console.log("GET MINDMAP RESULTS - User not found");
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // console.log(`GET MINDMAP RESULTS - Fetching results for user ID: ${user.id}`);
    
    const results = await prisma.mindmap.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // console.log(`GET MINDMAP RESULTS - Found ${results.length} results`);
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error fetching mindmap results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // console.log("POST MINDMAP RESULTS - Request received");
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      // console.log("POST MINDMAP RESULTS - Unauthorized, no session");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    const { 
      title,
      pdfName,
      pdfUrl,
      mindmapData,
      nodeCount
    } = data;
    
    // console.log("POST MINDMAP RESULTS - Request data:", {
      title,
      pdfName,
      nodeCount
    });
    
    // Get user from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });
    
    if (!user) {
      // console.log("POST MINDMAP RESULTS - User not found");
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // console.log(`POST MINDMAP RESULTS - Creating result for user ID: ${user.id}`);
    
    // Save mindmap result to database
    const result = await prisma.mindmap.create({
      data: {
        userId: user.id,
        title: title || (pdfName ? `Mindmap - ${pdfName}` : 'Untitled Mindmap'),
        pdfName,
        pdfUrl,
        mindmapData: mindmapData,
        nodeCount,
      },
    });
    
    // console.log(`POST MINDMAP RESULTS - Success, created result with ID: ${result.id}`);
    
    return NextResponse.json({ resultId: result.id, success: true });
  } catch (error) {
    console.error('Error saving mindmap results:', error);
    return NextResponse.json(
      { error: 'Failed to save results', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}