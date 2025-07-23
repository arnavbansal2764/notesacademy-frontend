import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function POST(req: NextRequest) {
    try {
        const adminSession = await getAdminSession();
        if (!adminSession) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentMonth = getCurrentMonth();
        
        // Force renewal of all accounts
        const result = await prisma.magicSlidesAccount.updateMany({
            data: {
                currentUsage: 0,
                isActive: true,
                lastResetMonth: currentMonth
            }
        });
        
        console.log(`🔄 MANUAL RENEWAL: Renewed ${result.count} accounts for month ${currentMonth}`);
        
        return NextResponse.json({ 
            message: `Successfully renewed ${result.count} accounts for month ${currentMonth}`,
            success: true,
            renewedCount: result.count
        });
        
    } catch (error) {
        console.error('Manual renewal error:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            success: false 
        }, { status: 500 });
    }
}
