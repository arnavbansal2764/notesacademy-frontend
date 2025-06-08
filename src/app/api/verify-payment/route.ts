import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"
import prisma from "@/lib/prisma"

const RAZORPAY_KEY_SECRET = "7QOE8jUm3IEuK7Y5IGGeeMGz"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 })
        }

        const body = await request.json()
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

        // Verify the payment signature
        const text = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac("sha256", RAZORPAY_KEY_SECRET)
            .update(text.toString())
            .digest("hex")

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
        }

        // Check if payment already exists in our database
        const existingPayment = await prisma.payment.findUnique({
            where: { paymentId: razorpay_payment_id }
        })

        if (existingPayment) {
            // Payment already processed
            return NextResponse.json({ 
                message: "Payment already verified",
                alreadyProcessed: true 
            })
        }

        // Get the latest user data to return updated coin balance
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, coins: true }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ 
            message: "Payment verified successfully",
            userId: user.id,
            currentCoins: user.coins
        })

    } catch (error) {
        console.error("Payment verification error:", error)
        return NextResponse.json(
            { error: "Failed to verify payment" },
            { status: 500 }
        )
    }
}
