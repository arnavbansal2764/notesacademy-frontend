import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request, 
  { params }: { params: { id: string } }
) {
  try {
    // Get the ID from params object - must be awaited in Next.js App Router
    const { id } = await params;
    const mindmapId = id;
    
    // console.log(`GET MINDMAP DETAIL - Request received for ID: ${mindmapId}`);
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      // console.log("GET MINDMAP DETAIL - Unauthorized, no session");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!mindmapId) {
      return NextResponse.json({ error: 'Mindmap ID is required' }, { status: 400 });
    }
    
    // Get user from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });
    
    if (!user) {
      // console.log("GET MINDMAP DETAIL - User not found");
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // console.log(`GET MINDMAP DETAIL - Fetching mindmap with ID: ${mindmapId}`);
    
    // Get the specific mindmap
    const mindmap = await prisma.mindmap.findUnique({
      where: {
        id: mindmapId,
      },
    });
    
    if (!mindmap) {
      // console.log(`GET MINDMAP DETAIL - Mindmap with ID ${mindmapId} not found`);
      return NextResponse.json({ error: 'Mindmap not found' }, { status: 404 });
    }
    
    // Check if the mindmap belongs to the user
    if (mindmap.userId !== user.id) {
      // console.log(`GET MINDMAP DETAIL - User ${user.id} does not have permission to view mindmap ${mindmapId}`);
      return NextResponse.json({ error: 'You do not have permission to view this mindmap' }, { status: 403 });
    }
    
    // console.log(`GET MINDMAP DETAIL - Successfully fetched mindmap ${mindmapId}`);
    
    return NextResponse.json({ mindmap });
  } catch (error) {
    console.error('Error fetching mindmap detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mindmap' },
      { status: 500 }
    );
  }
}