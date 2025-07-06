import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { checkAndDeductCoins } from '@/lib/coinUtils';

// Multiple MagicSlides accounts for failover
const magicSlidesAccounts = [
    {
        id: 'account_1',
        accessId: process.env.MAGICSLIDES_ACCESS_ID_2 || '9384c726-a01e-4722-8c8c-c0a809434b04',
        email: process.env.MAGICSLIDES_EMAIL_2 || 'notesinstitute@gmail.com'
    },
    {
        id: 'account_2',
        accessId: process.env.MAGICSLIDES_ACCESS_ID_3 || '570f0f39-9683-42bb-b80c-132c5051d2fe',
        email: process.env.MAGICSLIDES_EMAIL_3 || 'arnavbansal.bt23cse@pec.edu.in'
    },
    {
        id: 'account_3',
        accessId: process.env.MAGICSLIDES_ACCESS_ID_4 || '54bfa2b0-8dbb-4e25-b773-837f75df70c0',
        email: process.env.MAGICSLIDES_EMAIL_4 || 'paras1201paras@gmail.com'
    },
    {
        id: 'account_4',
        accessId: process.env.MAGICSLIDES_ACCESS_ID_5 || '679445ad-55d9-4f62-a903-99ee881561d0',
        email: process.env.MAGICSLIDES_EMAIL_5 || 'mocktestninja@gmail.com'
    },
    {
        id: 'account_5',
        accessId: process.env.MAGICSLIDES_ACCESS_ID_6 || '071620df-c95c-400e-9156-4bc079592e4d',
        email: process.env.MAGICSLIDES_EMAIL_6 || 'notesacademy00@gmail.com'
    },
    {
        id: 'account_6',
        accessId: process.env.MAGICSLIDES_ACCESS_ID_7 || '42718117-6055-406a-aebc-551cc3bbb454',
        email: process.env.MAGICSLIDES_EMAIL_7 || 'contactnotesacademy@gmail.com'
    },
    {
        id: 'account_7',
        accessId: process.env.MAGICSLIDES_ACCESS_ID_8 || '62f153bc-6c99-4bd7-a8e5-2fd0ca5213ae',
        email: process.env.MAGICSLIDES_EMAIL_8 || 'pb.parasbansal@gmail.com'
    },
    {
        id: 'account_8',
        accessId: process.env.MAGICSLIDES_ACCESS_ID_9 || '5fd7292c-6334-4675-827d-01ed91f4d483',
        email: process.env.MAGICSLIDES_EMAIL_9 || 'pbansal.analytics@gmail.com'
    },
    {
        id: 'account_9',
        accessId: process.env.MAGICSLIDES_ACCESS_ID_10 || 'e83d5411-9e30-4cc7-ac7c-08516d1f9ef0',
        email: process.env.MAGICSLIDES_EMAIL_10 || 'virendermamta@gmail.com'
    },
    {
        id: 'account_10',
        accessId: process.env.MAGICSLIDES_ACCESS_ID_11 || '1f89c4ac-6ee0-491a-b039-b1c94a724f49',
        email: process.env.MAGICSLIDES_EMAIL_11 || 'vinamratasolutions@gmail.com'
    },
];

// Monthly usage tracker (resets on 1st of each month)
const monthlyUsage = new Map<string, { month: string, count: number }>(); // accountId -> { month: 'YYYY-MM', count: number }

const MONTHLY_PPT_LIMIT = 3;

function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function isAccountActive(accountId: string): boolean {
    const currentMonth = getCurrentMonth();
    const usage = monthlyUsage.get(accountId);
    
    // If no usage record or it's a new month, account is active
    if (!usage || usage.month !== currentMonth) {
        return true;
    }
    
    // Check if account has reached monthly limit
    return usage.count < MONTHLY_PPT_LIMIT;
}

function incrementAccountUsage(accountId: string): void {
    const currentMonth = getCurrentMonth();
    const usage = monthlyUsage.get(accountId);
    
    if (!usage || usage.month !== currentMonth) {
        // New month or first usage - reset/initialize
        monthlyUsage.set(accountId, { month: currentMonth, count: 1 });
        console.log(`Account ${accountId} usage initialized for ${currentMonth}: 1/${MONTHLY_PPT_LIMIT}`);
    } else {
        // Increment usage for current month
        usage.count += 1;
        monthlyUsage.set(accountId, usage);
        console.log(`Account ${accountId} usage updated for ${currentMonth}: ${usage.count}/${MONTHLY_PPT_LIMIT}`);
        
        if (usage.count >= MONTHLY_PPT_LIMIT) {
            console.log(`Account ${accountId} has reached monthly limit and will be disabled until next month`);
        }
    }
}

function disableAccountForMonth(accountId: string): void {
    const currentMonth = getCurrentMonth();
    monthlyUsage.set(accountId, { month: currentMonth, count: MONTHLY_PPT_LIMIT });
    console.log(`Account ${accountId} disabled for current month due to error`);
}

async function generatePPTWithFailover(requestData: any) {
    let lastError: any = null;
    const activeAccounts = magicSlidesAccounts.filter(account => isAccountActive(account.id));
    
    if (activeAccounts.length === 0) {
        return {
            success: false,
            error: 'All MagicSlides accounts have reached their monthly limit',
            accountsAttempted: 0
        };
    }

    for (let i = 0; i < activeAccounts.length; i++) {
        const account = activeAccounts[i];

        try {
            console.log(`Attempting PPT generation with account ${account.id}: ${account.email}`);

            const response = await axios.post(
                'https://api.magicslides.app/public/api/ppt_from_topic',
                {
                    ...requestData,
                    email: account.email,
                    accessId: account.accessId
                },
                {
                    timeout: 30000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`PPT generation successful with account ${account.id}`);
            
            // Increment usage count for successful generation
            incrementAccountUsage(account.id);
            
            return {
                success: true,
                data: response.data,
                accountUsed: account.id
            };

        } catch (error: any) {
            lastError = error;
            console.error(`Account ${account.id} failed:`, error?.response?.status, error?.response?.data || error.message);
            
            // Disable account for current month on any error
            disableAccountForMonth(account.id);
            
            // Continue to next account
            continue;
        }
    }

    return {
        success: false,
        error: lastError?.response?.data || lastError?.message || 'All active MagicSlides accounts failed',
        accountsAttempted: activeAccounts.length
    };
}

export async function POST(req: NextRequest) {
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

        const coinResult = await checkAndDeductCoins(user.id, "PPT");
        if (!coinResult.success) {
            return NextResponse.json({ error: coinResult.message }, { status: 402 });
        }

        const body = await req.json();
        const {
            topic,
            extraInfoSource,
            language,
            slideCount,
            aiImages,
            imageForEachSlide,
            googleImage,
            googleText,
            presentationFor
        } = body;

        const requestData = {
            topic,
            extraInfoSource,
            language,
            slideCount,
            aiImages,
            imageForEachSlide,
            googleImage,
            googleText,
            presentationFor
        };

        const result = await generatePPTWithFailover(requestData);

        if (!result.success) {
            console.error('PPT generation failed:', result.error);
            
            // Refund coins since generation failed
            try {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { coins: { increment: 2 } }
                });
                console.log('Coins refunded due to PPT generation failure');
            } catch (refundError) {
                console.error('Failed to refund coins:', refundError);
            }
            
            return NextResponse.json({ 
                error: `PPT generation failed. Tried ${result.accountsAttempted} active accounts.`,
                details: result.error
            }, { status: 500 });
        }

        const apiResponse = {
            "ppt_url": result.data.data.url,
            "pdf_url": result.data.data.pdfUrl,
        };
        
        // Save PPT result to database
        await prisma.ppt.create({
            data: {
                userId: user.id,
                title: topic,
                pdfUrl: result.data.data.pdfUrl,
                pptUrl: result.data.data.url
            }
        });
        
        console.log(`PPT generated successfully using account ${result.accountUsed}:`, apiResponse);
        return NextResponse.json(apiResponse);

    } catch (error: any) {
        console.error('Unexpected error in PPT generation:', error);

        // Refund coins on unexpected errors
        try {
            const session = await getServerSession(authOptions);
            if (session?.user?.email) {
                const user = await prisma.user.findUnique({
                    where: { email: session.user.email },
                    select: { id: true }
                });
                if (user) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { coins: { increment: 2 } }
                    });
                    console.log('Coins refunded due to unexpected error');
                }
            }
        } catch (refundError) {
            console.error('Failed to refund coins after unexpected error:', refundError);
        }

        return NextResponse.json(
            { error: 'An unexpected error occurred while generating PPT. Please try again.' },
            { status: 500 }
        );
    }
}
