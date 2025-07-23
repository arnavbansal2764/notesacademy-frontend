import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { checkAndDeductCoins } from '@/lib/coinUtils';
import { seedMagicSlidesAccounts } from '@/lib/seedMagicSlidesAccounts';

function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

async function ensureMagicSlidesAccountsExist() {
    // Always run seed on each deployment/restart - it will only create missing accounts
    console.log('Ensuring MagicSlides accounts exist...');
    const result = await seedMagicSlidesAccounts();
    
    if (!result.success) {
        console.error('Failed to seed accounts:', result.error);
        throw new Error('Failed to initialize MagicSlides accounts');
    }
    
    console.log(result.message);
}

async function renewAccountsIfNeeded() {
    const currentMonth = getCurrentMonth();
    
    // Find accounts that need renewal (different lastResetMonth)
    const accountsToRenew = await prisma.magicSlidesAccount.findMany({
        where: {
            lastResetMonth: {
                not: currentMonth
            }
        }
    });

    if (accountsToRenew.length > 0) {
        // Reset usage, activate ALL accounts, and reset monthly limit for new month
        await prisma.magicSlidesAccount.updateMany({
            where: {
                lastResetMonth: {
                    not: currentMonth
                }
            },
            data: {
                currentUsage: 0,
                isActive: true, // Reactivate all accounts on monthly renewal
                lastResetMonth: currentMonth
            }
        });
        
        console.log(`🔄 MONTHLY RENEWAL: Renewed ${accountsToRenew.length} MagicSlides accounts for month ${currentMonth}`);
        console.log(`✅ All accounts reactivated with fresh usage limits (3 PPTs each)`);
    }
}

async function getActiveAccounts() {
    // Ensure accounts exist and check for monthly renewal
    await ensureMagicSlidesAccountsExist();
    await renewAccountsIfNeeded();

    // Get active accounts with remaining usage
    return await prisma.magicSlidesAccount.findMany({
        where: {
            isActive: true,
            currentUsage: {
                lt: 3 // Less than monthly limit
            }
        },
        orderBy: {
            currentUsage: 'asc' // Prefer accounts with lower usage
        }
    });
}

async function incrementAccountUsage(accountId: string) {
    await prisma.magicSlidesAccount.update({
        where: {
            accountId: accountId
        },
        data: {
            currentUsage: {
                increment: 1
            }
        }
    });

    // Check if account reached limit and disable it
    const account = await prisma.magicSlidesAccount.findUnique({
        where: { accountId }
    });

    if (account && account.currentUsage >= account.monthlyLimit) {
        await prisma.magicSlidesAccount.update({
            where: { accountId },
            data: { isActive: false }
        });
        console.log(`⚠️ Account ${accountId} disabled after reaching monthly limit (${account.currentUsage}/${account.monthlyLimit})`);
    }
}

async function disableAccountOnError(accountId: string, error: any) {
    try {
        await prisma.magicSlidesAccount.update({
            where: {
                accountId: accountId
            },
            data: {
                isActive: false
            }
        });
        
        const errorInfo = error?.response?.status ? 
            `HTTP ${error.response.status}` : 
            error?.message || 'Unknown error';
            
        console.log(`❌ Account ${accountId} DISABLED in database due to error: ${errorInfo}`);
        
        // Log detailed error for debugging
        if (error?.response?.data) {
            console.log(`Error details for ${accountId}:`, error.response.data);
        }
        
    } catch (dbError) {
        console.error(`Failed to disable account ${accountId} in database:`, dbError);
    }
}

async function generatePPTWithFailover(requestData: any) {
    let lastError: any = null;
    const activeAccounts = await getActiveAccounts();
    
    if (activeAccounts.length === 0) {
        return {
            success: false,
            error: 'All MagicSlides accounts have reached their monthly limit or are disabled',
            accountsAttempted: 0
        };
    }

    console.log(`🚀 Starting PPT generation with ${activeAccounts.length} active accounts available`);

    for (let i = 0; i < activeAccounts.length; i++) {
        const account = activeAccounts[i];

        try {
            console.log(`📝 Attempting PPT generation with ${account.accountId}: ${account.email} (Usage: ${account.currentUsage}/${account.monthlyLimit})`);

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

            console.log(`✅ PPT generation successful with ${account.accountId}`);
            
            // Increment usage count for successful generation
            await incrementAccountUsage(account.accountId);
            
            return {
                success: true,
                data: response.data,
                accountUsed: account.accountId
            };

        } catch (error: any) {
            lastError = error;
            
            // Log detailed error information
            const errorStatus = error?.response?.status;
            const errorData = error?.response?.data;
            const errorMessage = error?.message;
            
            console.error(`❌ Account ${account.accountId} failed with status ${errorStatus}:`, errorData || errorMessage);
            
            // Disable account in database due to error
            await disableAccountOnError(account.accountId, error);
            
            // Continue to next account
            continue;
        }
    }

    console.error(`💥 All ${activeAccounts.length} active accounts failed`);
    
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