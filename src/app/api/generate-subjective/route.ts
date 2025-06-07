import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { checkAndDeductCoins } from "@/lib/coinUtils";
import prisma from "@/lib/prisma";

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
    const coinResult = await checkAndDeductCoins(user.id, "SUBJECTIVE");
    if (!coinResult.success) {
      return NextResponse.json({ error: coinResult.message }, { status: 402 });
    }

    const body = await request.json();

    if (!body.pdf_url) {
      // Refund coin if validation fails
      await prisma.user.update({
        where: { id: user.id },
        data: { coins: { increment: 1 } }
      });
      return NextResponse.json({ error: "PDF URL is required" }, { status: 400 });
    }

    try {
      // Call the external API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-subjective`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdf_url: body.pdf_url,
        }),
      });

      if (!response.ok) {
        // Refund coin if API fails
        await prisma.user.update({
          where: { id: user.id },
          data: { coins: { increment: 1 } }
        });
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();

      return NextResponse.json({
        questions: data.questions,
        remainingCoins: coinResult.remainingCoins
      });

    } catch (apiError) {
      // Refund coin if external API fails
      await prisma.user.update({
        where: { id: user.id },
        data: { coins: { increment: 1 } }
      });

      console.error("External API error:", apiError);
      return NextResponse.json({ error: "Failed to generate questions. Your coin has been refunded." }, { status: 500 });
    }
  } catch (error) {
    console.error("Error generating subjective questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
