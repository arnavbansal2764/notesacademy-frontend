import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"
import { checkAndDeductCoins } from "@/lib/coinUtils"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check and deduct coins
        const coinResult = await checkAndDeductCoins(user.id, "MINDMAP");
        if (!coinResult.success) {
            return NextResponse.json({ error: coinResult.message }, { status: 402 });
        }

        const body = await request.json()

        if (!body.pdf_url) {
            // Refund coin if validation fails
            await prisma.user.update({
                where: { id: user.id },
                data: { coins: { increment: 1 } }
            });
            return NextResponse.json({ error: "PDF URL is required" }, { status: 400 })
        }

        try {
            // Call the external API
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-mindmap`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pdf_url: body.pdf_url,
                }),
            })


            const data = await response.json()
            // Validate that essential fields are present
            if (!data.mindmap_url || !data.title) {
                // Refund coin if invalid response
                await prisma.user.update({
                    where: { id: user.id },
                    data: { coins: { increment: 1 } }
                });
                console.warn("Invalid response from mindmap service:", data)
                return NextResponse.json(
                    { error: "Invalid response from mindmap service. Your coin has been refunded." },
                    { status: 502 }
                )
            }

            // Save to database since user is authenticated
            try {
                // Extract filename from the PDF URL
                const pdfName = body.pdf_url.split('/').pop() || 'document.pdf';
                
                // Create the mindmap with the correct userId
                await prisma.mindmap.create({
                    data: {
                        userId: user.id,
                        title: data.title,
                        pdfName: pdfName,
                        pdfUrl: body.pdf_url,
                        mindmapUrl: data.mindmap_url,
                    },
                });
                
                console.log(`Mindmap successfully saved for user ${user.id}`);
            } catch (dbError) {
                console.error("Failed to save mindmap to DB:", dbError);
                // Don't refund coin here as the mindmap was generated successfully
            }

            // Normalize to camelCase for the client
            return NextResponse.json({
                mindmapUrl: data.mindmap_url,
                title: data.title,
                remainingCoins: coinResult.remainingCoins
            })
            
        } catch (apiError) {
            // Refund coin if external API fails
            await prisma.user.update({
                where: { id: user.id },
                data: { coins: { increment: 1 } }
            });
            
            console.warn("External API error:", apiError)
            return NextResponse.json({ error: "Failed to generate mindmap. Your coin has been refunded." }, { status: 500 })
        }
    } catch (error) {
        console.error("Error generating mindmap:", error)
        return NextResponse.json(
            { error: "Failed to generate mindmap" },
            { status: 500 },
        )
    }
}

