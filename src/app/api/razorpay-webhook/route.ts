import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "Paras%956";

// Add this GET handler for health check
export async function GET() {
  return NextResponse.json(
    { 
      status: "ok", 
      message: "Razorpay webhook endpoint is healthy",
      timestamp: new Date().toISOString()
    }, 
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
    try {
        // Get raw body and verify Razorpay signature
        const body = await req.json();
        const signature = req.headers.get("x-razorpay-signature") || "";

        // Log the entire webhook payload for debugging
        // console.log("\n*******Razorpay Webhook Received********\n", JSON.stringify(body, null, 2));

        const expectedSignature = crypto
            .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
            .update(JSON.stringify(body))
            .digest("hex");

        if (signature !== expectedSignature) {
            return NextResponse.json({ message: "Invalid Signature" }, { status: 400 });
        }

        const event = body.event;
        if (event === "payment.captured") {
            const paymentEntity = body.payload.payment.entity;
            
            // Extract user information from notes
            const { 
                id: paymentId,
                amount,
                currency,
                status,
                order_id: orderId,
                method: paymentMethod,
                email: paymentEmail,
                contact: contactNumber,
                notes,
                acquirer_data: acquirerData
            } = paymentEntity;
            
            // Get user details from notes
            const name = notes?.name 
            const email = notes?.email 
            
            // Create or find the user
            let user = await prisma.user.findUnique({ 
                where: { email } 
            });
            
            if (!user) {
                // Create new user with empty password
                user = await prisma.user.create({
                    data: { 
                        name,
                        email, 
                        password: "" // Empty string as requested
                    }
                });
                // console.log(`Created new user: ${user.id} (${email})`);
            } else {
                // console.log(`Found existing user: ${user.id} (${email})`);
            }
            
            // Store payment information
            const payment = await prisma.payment.create({
                data: {
                    paymentId,
                    userId: user.id,
                    amount,
                    currency,
                    paymentMethod,
                    status,
                    contactNumber: contactNumber || "",
                    transactionId: acquirerData?.upi_transaction_id || acquirerData?.rrn || "",
                    orderId
                }
            });
            
            // console.log(`Payment recorded: ${payment.id} for user ${user.id}`);
            
            return NextResponse.json({ 
                message: "Payment processed successfully",
                userId: user.id,
                paymentId: payment.id 
            }, { status: 200 });
        }

        // Handle other events if needed
        // console.log(`Unhandled event: ${event}`);
        return NextResponse.json({ message: `Unhandled event: ${event}` }, { status: 200 });
        
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ 
            message: "Server error", 
            error: error instanceof Error ? error.message : "Unknown error" 
        }, { status: 500 });
    }
}
