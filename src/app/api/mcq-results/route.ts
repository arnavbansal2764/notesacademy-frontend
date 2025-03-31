import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    // console.log("GET MCQ RESULTS - Request received");
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      // console.log("GET MCQ RESULTS - Unauthorized, no session");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });
    
    if (!user) {
      // console.log("GET MCQ RESULTS - User not found");
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // console.log(`GET MCQ RESULTS - Fetching results for user ID: ${user.id}`);
    
    // Use correct capitalization matching the Prisma schema (MCQResult, not mCQResult)
    const results = await prisma.mcqresult.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // console.log(`GET MCQ RESULTS - Found ${results.length} results`);
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error fetching MCQ results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // console.log("POST MCQ RESULTS - Request received");
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      // console.log("POST MCQ RESULTS - Unauthorized, no session");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    const { 
      pdfName,
      pdfUrl,
      totalQuestions, 
      correctAnswers, 
      incorrectAnswers,
      score,
      timeTaken,
      questions 
    } = data;
    
    // console.log("POST MCQ RESULTS - Request data:", {
    //   pdfName,
    //   totalQuestions,
    //   correctAnswers,
    //   incorrectAnswers,
    //   score,
    //   timeTaken,
    //   questionsCount: questions?.length
    // });
    
    // Get user from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });
    
    if (!user) {
      // console.log("POST MCQ RESULTS - User not found");
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // console.log(`POST MCQ RESULTS - Creating result for user ID: ${user.id}`);
    
    // Use correct model name with proper capitalization
    const result = await prisma.mcqresult.create({
      data: {
        userId: user.id,
        title: pdfName ? `MCQ Quiz - ${pdfName}` : 'MCQ Quiz',
        pdfName,
        pdfUrl,
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        score,
        timeTaken,
        questions: questions,
      },
    });
    
    // console.log(`POST MCQ RESULTS - Success, created result with ID: ${result.id}`);
    
    // Make sure to return a response
    return NextResponse.json({ resultId: result.id, success: true });
  } catch (error) {
    console.error('Error saving MCQ results:', error);
    return NextResponse.json(
      { error: 'Failed to save results', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}