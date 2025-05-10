import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        if (!body.pdf_url) {
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

            if (!response.ok) {
                throw new Error(`API responded with status ${response.status}`)
            }

            const data = await response.json()
            // Validate that essential fields are present
            if (!data.mindmap_url || !data.title) {
                console.warn("Invalid response from mindmap service:", data)
                return NextResponse.json(
                    { error: "Invalid response from mindmap service" },
                    { status: 502 }
                )
            }

            // Persist in database if user is signed in
            const session = await getServerSession(authOptions)
            if (session?.user?.email) {
                try {
                    // Look up user by email to get the correct ID
                    const user = await prisma.user.findUnique({
                        where: { email: session.user.email },
                        select: { id: true }
                    });
                    
                    if (!user) {
                        console.error("User not found:", session.user.email);
                        return NextResponse.json({ 
                            error: "User not found", 
                            mindmapUrl: data.mindmap_url,
                            title: data.title 
                        }, { status: 207 }); // Partial success
                    }
                    
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
                    return NextResponse.json({ 
                        error: "Failed to save mindmap to your account", 
                        mindmapUrl: data.mindmap_url,
                        title: data.title 
                    }, { status: 207 }); // Return partial success
                }
            }

            // Normalize to camelCase for the client
            return NextResponse.json({
                mindmapUrl: data.mindmap_url,
                title: data.title,
            })
            
        } catch (apiError) {
            console.warn("External API error:", apiError)
            // Return error
            return NextResponse.json({ error: "Failed to connect to mindmap generation service" }, { status: 500 })
        }
    } catch (error) {
        console.error("Error generating mindmap:", error)

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Failed to generate mindmap",
            },
            { status: 500 },
        )
    }
}

