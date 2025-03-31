import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';


export async function POST(req: Request) {
  try {
    // Get ID from request body
    const body = await req.json();
    const { id } = body;
    const mindmapId = id;
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get the specific mindmap
    const mindmap = await prisma.mindmap.findUnique({
      where: {
        id: mindmapId,
      },
    });
    
    if (!mindmap) {
      return NextResponse.json({ error: 'Mindmap not found' }, { status: 404 });
    }
    
    // Check if the mindmap belongs to the user
    if (mindmap.userId !== user.id) {
      return NextResponse.json({ error: 'You do not have permission to view this mindmap' }, { status: 403 });
    }
    
    return NextResponse.json({ mindmap });
  } catch (error) {
    console.error('Error fetching mindmap detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mindmap' },
      { status: 500 }
    );
  }
}