import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { checkAndDeductCoins } from '@/lib/coinUtils';

// Multiple MagicSlides accounts for failover
const magicSlidesAccounts = [
    {
        accessId: process.env.MAGICSLIDES_ACCESS_ID_1 || '5df474cf-65e2-4dfc-b0fc-b87a04817f2b',
        email: process.env.MAGICSLIDES_EMAIL_1 || 'bansalarnav221@gmail.com'
    },
    {
        accessId: process.env.MAGICSLIDES_ACCESS_ID_2 || '9384c726-a01e-4722-8c8c-c0a809434b04',
        email: process.env.MAGICSLIDES_EMAIL_2 || 'notesinstitute@gmail.com'
    },
    // Add more accounts as needed
    {
        accessId: process.env.MAGICSLIDES_ACCESS_ID_3 || '570f0f39-9683-42bb-b80c-132c5051d2fe',
        email: process.env.MAGICSLIDES_EMAIL_3 || 'arnavbansal.bt23cse@pec.edu.in'
    }
];

async function generatePPTWithFailover(requestData: any) {
    let lastError: any = null;

    for (let i = 0; i < magicSlidesAccounts.length; i++) {
        const account = magicSlidesAccounts[i];

        try {
            console.log(`Attempting PPT generation with account ${i + 1}: ${account.email}`);

            const response = await axios.post(
                'https://api.magicslides.app/public/api/ppt_from_topic',
                {
                    ...requestData,
                    email: account.email,
                    accessId: account.accessId
                },
                {
                    timeout: 30000, // 30 second timeout
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            // If successful, return the response
            console.log(`PPT generation successful with account ${i + 1}`);
            return {
                success: true,
                data: response.data,
                accountUsed: i + 1
            };

        } catch (error: any) {
            lastError = error;
            console.error(`Account ${i + 1} failed:`, error?.response?.data || error.message);

            // Check if it's a rate limit or quota error (should try next account)
            const errorMessage = error?.response?.data?.message || error.message || '';
            const isQuotaError = errorMessage.toLowerCase().includes('quota') ||
                errorMessage.toLowerCase().includes('limit') ||
                errorMessage.toLowerCase().includes('exceeded') ||
                error?.response?.status === 429;

            if (isQuotaError) {
                console.log(`Account ${i + 1} hit quota/rate limit, trying next account...`);
                continue;
            }

            // For other errors, still try next account but log the specific error
            console.log(`Account ${i + 1} failed with error: ${errorMessage}, trying next account...`);
            continue;
        }
    }

    // If all accounts failed
    return {
        success: false,
        error: lastError?.response?.data || lastError?.message || 'All MagicSlides accounts failed',
        accountsAttempted: magicSlidesAccounts.length
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

        // Prepare request data
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

        // Try generating PPT with failover mechanism
        const result = await generatePPTWithFailover(requestData);
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

        // Try to refund coins on unexpected errors
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
                        data: { coins: { increment: 2 } } // Assuming PPT costs 10 coins
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
