import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        if (!body.pdf_url) {
            return NextResponse.json({ error: "PDF URL is required" }, { status: 400 })
        }

        // Call the external API
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-mcqs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                pdf_url: body.pdf_url,
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`API responded with status ${response.status}: ${errorText}`)
        }

        const data = await response.json()

        return NextResponse.json(data)
    } catch (error) {
        console.error("Error generating MCQs:", error)

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Failed to generate MCQs",
            },
            { status: 500 },
        )
    }
}

