import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendPaymentConfirmationEmail } from "@/lib/emailService";

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "Paras%956";

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
        console.log("\n*******Razorpay Webhook Received********\n");


        const expectedSignature = crypto
            .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
            .update(JSON.stringify(body))
            .digest("hex");


        if (signature !== expectedSignature) {
            console.error("Signature verification failed");
            return NextResponse.json({ message: "Invalid Signature" }, { status: 400 });
        }

     

        const event = body.event;
        console.log("Event type:", event);

        // Only process payment.captured events
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
            
            console.log("Payment entity:", {
                paymentId,
                amount,
                currency,
                status,
                orderId,
                notes
            });
            
            // Get user details from notes
            const name = notes?.name;
            const email = notes?.email;
            const coinsToAdd = parseInt(notes?.coins || "0");
            const planName = notes?.planName || "Coin Package";
            
            console.log("Extracted data:", { name, email, coinsToAdd, planName });
            
            if (!email || !coinsToAdd) {
                console.error("Missing email or coins in payment notes");
                return NextResponse.json({ message: "Invalid payment data" }, { status: 200 });
            }

            // Check if payment already exists to prevent duplicate processing
            const existingPayment = await prisma.payment.findUnique({
                where: { paymentId }
            });

            if (existingPayment) {
                console.log("Payment already processed:", paymentId);
                return NextResponse.json({ 
                    message: "Payment already processed",
                    paymentId 
                }, { status: 200 });
            }

            // Check if user exists
            let user = await prisma.user.findUnique({ 
                where: { email } 
            });
            
            let isNewUser = false;
            
            if (user) {
                // User exists - increment coins
                console.log(`User exists: ${user.id} with ${user.coins} coins, adding ${coinsToAdd}`);
                
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { coins: { increment: coinsToAdd } }
                });
                
                console.log(`Updated existing user: ${user.id} now has ${user.coins} coins`);
            } else {
                // User doesn't exist - create new user with coins
                user = await prisma.user.create({
                    data: { 
                        name: name || "User",
                        email, 
                        password: "", // Empty password for new users
                        coins: coinsToAdd
                    }
                });
                isNewUser = true;
                console.log(`Created new user: ${user.id} (${email}) with ${coinsToAdd} coins`);
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
            
            console.log(`Payment recorded: ${payment.id} for user ${user.id} - ${coinsToAdd} coins added`);
            
            // Send payment confirmation email
            try {
                await sendPaymentConfirmationEmail({
                    email: user.email,
                    name: user.name || "User",
                    amount,
                    currency,
                    coinsAdded: coinsToAdd,
                    newBalance: user.coins,
                    paymentId,
                    isNewUser,
                    planName
                });
                console.log(`Confirmation email sent to ${user.email}`);
            } catch (emailError) {
                console.error("Failed to send confirmation email:", emailError);
                // Don't interrupt webhook processing for email failures
            }
            
            return NextResponse.json({ 
                message: "Payment processed successfully",
                userId: user.id,
                paymentId: payment.id,
                coinsAdded: coinsToAdd,
                newBalance: user.coins,
                isNewUser,
                eventType: event
            }, { status: 200 });
        }

        // Ignore all other events
        console.log(`Ignoring event: ${event}`);
        return NextResponse.json({ 
            message: `Event ${event} ignored - only processing payment.captured`,
            eventType: event 
        }, { status: 200 });
        
    } catch (error) {
        console.error("Webhook Error:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
        return NextResponse.json({ 
            message: "Server error", 
            error: error instanceof Error ? error.message : "Unknown error" 
        }, { status: 500 });
    }
}