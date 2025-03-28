import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        if (!body.pdf_url) {
            return NextResponse.json({ error: "PDF URL is required" }, { status: 400 })
        }

        try {
            // Call the external API
            const response = await fetch("http://localhost:8080/generate-subjective", {
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
            return NextResponse.json(data)
        } catch (apiError) {
            console.warn("External API error, using sample data:", apiError)
        }
    } catch (error) {
        console.error("Error generating subjective questions:", error)

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Failed to generate subjective questions",
            },
            { status: 500 },
        )
    }
}
