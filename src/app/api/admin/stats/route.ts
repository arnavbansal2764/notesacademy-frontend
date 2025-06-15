import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const [
      totalUsers,
      totalPayments,
      totalRevenue,
      totalMCQs,
      totalSubjective,
      totalMindmaps,
      totalShortNotes,
      recentUsers,
      recentPayments,
      monthlyRevenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.payment.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: { in: ['captured', 'completed', 'succeeded'] } }
      }),
      prisma.mcqresult.count(),
      prisma.subjectiveresult.count(),
      prisma.mindmap.count(),
      prisma.shortNotesResult.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, createdAt: true, coins: true }
      }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } }
        }
      }),
      prisma.payment.groupBy({
        by: ['createdAt'],
        _sum: { amount: true },
        where: {
          status: { in: ['captured', 'completed', 'succeeded'] },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)
          }
        }
      })
    ]);
    
    return NextResponse.json({
      overview: {
        totalUsers,
        totalPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalMCQs,
        totalSubjective,
        totalMindmaps,
        totalShortNotes
      },
      recentActivity: {
        recentUsers,
        recentPayments
      },
      monthlyRevenue
    });
  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
