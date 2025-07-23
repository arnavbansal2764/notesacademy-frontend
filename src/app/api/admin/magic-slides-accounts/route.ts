import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function GET(req: NextRequest) {
    try {
        const adminSession = await getAdminSession();
        if (!adminSession) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentMonth = getCurrentMonth();

        // Get all MagicSlides accounts with their usage
        const accounts = await prisma.magicSlidesAccount.findMany({
            orderBy: {
                accountId: 'asc'
            }
        });

        // Calculate summary statistics
        const totalAccounts = accounts.length;
        const activeAccounts = accounts.filter(acc => acc.isActive).length;
        const exhaustedAccounts = accounts.filter(acc => acc.currentUsage >= acc.monthlyLimit).length;
        const totalUsage = accounts.reduce((sum, acc) => sum + acc.currentUsage, 0);
        const totalCapacity = accounts.reduce((sum, acc) => sum + acc.monthlyLimit, 0);
        const availableSlots = totalCapacity - totalUsage;

        // Group accounts by status
        const activeAccountsList = accounts.filter(acc => acc.isActive && acc.currentUsage < acc.monthlyLimit);
        const exhaustedAccountsList = accounts.filter(acc => acc.currentUsage >= acc.monthlyLimit);
        const disabledAccountsList = accounts.filter(acc => !acc.isActive && acc.currentUsage < acc.monthlyLimit);

        return NextResponse.json({
            summary: {
                totalAccounts,
                activeAccounts,
                exhaustedAccounts,
                disabledAccounts: totalAccounts - activeAccounts,
                totalUsage,
                totalCapacity,
                availableSlots,
                usagePercentage: Math.round((totalUsage / totalCapacity) * 100),
                currentMonth
            },
            accounts: {
                all: accounts,
                active: activeAccountsList,
                exhausted: exhaustedAccountsList,
                disabled: disabledAccountsList
            }
        });

    } catch (error) {
        console.error('Admin MagicSlides accounts API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
