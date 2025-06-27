import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { checkAndDeductCoins } from '@/lib/coinUtils';

const accessId = process.env.MAGICSLIDES_ACCESS_ID || '5df474cf-65e2-4dfc-b0fc-b87a04817f2b';

// platform @notesinstitute.in
// 9384c726-a01e-4722-8c8c-c0a809434b04

// bansalarnav221@gmail.com
// 5df474cf-65e2-4dfc-b0fc-b87a04817f2b
const magicslidesEmail = process.env.MAGICSLIDES_EMAIL || 'bansalarnav221@gmail.com';
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

        const response = await axios.post(
            'https://api.magicslides.app/public/api/ppt_from_topic',
            {
                topic,
                extraInfoSource,
                email : magicslidesEmail,
                accessId,
                language,
                slideCount,
                aiImages,
                imageForEachSlide,
                googleImage,
                googleText,
                presentationFor
            }
        );
        const apiResponse = {
            "ppt_url" : response.data.data.url,
            "pdf_url" : response.data.data.pdfUrl,
        }
        
        // Save PPT result to database
        await prisma.ppt.create({
            data: {
                userId: user.id,
                title: topic,
                pdfUrl: response.data.data.pdfUrl,
                pptUrl: response.data.data.url
            }
        });
        
        console.log(apiResponse)
        return NextResponse.json(apiResponse);
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.response?.data || error.message || 'Unknown error' },
            { status: 500 }
        );
    }
}
