import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get overview statistics
    const [
      totalUsers,
      totalPayments,
      totalRevenue,
      totalMCQs,
      totalSubjective,
      totalMindmaps,
      totalShortNotes,
      totalPPTs,
      recentUsers,
      recentPayments,
      monthlyRevenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.payment.count({
        where: {
          status: {
            in: ['captured', 'completed', 'succeeded']
          }
        }
      }),
      prisma.payment.aggregate({
        where: {
          status: {
            in: ['captured', 'completed', 'succeeded']
          }
        },
        _sum: {
          amount: true
        }
      }),
      prisma.mcqresult.count(),
      prisma.subjectiveresult.count(),
      prisma.mindmap.count(),
      prisma.shortNotesResult.count(),
      prisma.ppt.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          email: true,
          coins: true,
          createdAt: true
        }
      }),
      prisma.payment.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        where: {
          status: {
            in: ['captured', 'completed', 'succeeded']
          }
        },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
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
    
    const stats = {
      overview: {
        totalUsers,
        totalPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalMCQs,
        totalSubjective,
        totalMindmaps,
        totalShortNotes,
        totalPPTs
      },
      recentActivity: {
        recentUsers,
        recentPayments
      },
      monthlyRevenue
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
