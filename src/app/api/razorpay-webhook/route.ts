import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendPaymentConfirmationEmail } from "@/lib/emailService"; // <-- uncommented

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
        console.log("\n*******Razorpay Webhook Received********\n", JSON.stringify(body, null, 2));
        console.log("Received signature:", signature);

        const expectedSignature = crypto
            .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
            .update(JSON.stringify(body))
            .digest("hex");

        console.log("Expected signature:", expectedSignature);

        if (signature !== expectedSignature) {
            console.error("Signature verification failed");
            return NextResponse.json({ message: "Invalid Signature" }, { status: 400 });
        }

        console.log("Signature verification successful");

        const event = body.event;
        console.log("Event type:", event);

        if (event === "payment.captured" || event === "order.paid") {
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
            
            console.log("Extracted data:", { name, email, coinsToAdd });
            
            if (!email || !coinsToAdd) {
                console.error("Missing email or coins in payment notes");
                return NextResponse.json({ message: "Invalid payment data" }, { status: 400 });
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

            // Create or find the user
            let user = await prisma.user.findUnique({ 
                where: { email } 
            });
            
            console.log("Existing user found:", user ? `${user.id} with ${user.coins} coins` : "None");
            
            let isNewUser = false;
            
            if (!user) {
                // Create new user with empty password and purchased coins
                user = await prisma.user.create({
                    data: { 
                        name: name || "User",
                        email, 
                        password: "", // Empty string as requested
                        coins: coinsToAdd // Set initial coins to purchased amount
                    }
                });
                isNewUser = true;
                console.log(`Created new user: ${user.id} (${email}) with ${coinsToAdd} coins`);
            } else {
                // Add purchased coins to existing users
                const oldBalance = user.coins;
                console.log(`Before update: User ${user.id} has ${oldBalance} coins, adding ${coinsToAdd}`);
                
                // Use a more explicit update approach
                const newBalance = oldBalance + coinsToAdd;
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { coins: newBalance }
                });
                console.log(`After update: User ${user.id} should have ${newBalance} coins, actually has ${user.coins} coins`);
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
            
            // Verify the update worked by fetching fresh user data
            const updatedUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: { coins: true, email: true }
            });
            
            console.log(`Final verification - User ${user.id} now has ${updatedUser?.coins} coins in database`);
            
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
                    isNewUser
                });
                console.log(`Confirmation email sent to ${user.email}`);
            } catch (emailError) {
                console.error("Failed to send confirmation email:", emailError);
                // don't interrupt webhook
            }
            
            return NextResponse.json({ 
                message: "Payment processed successfully",
                userId: user.id,
                paymentId: payment.id,
                coinsAdded: coinsToAdd,
                newBalance: user.coins,
                verifiedBalance: updatedUser?.coins,
                eventType: event
            }, { status: 200 });
        } else if (event === "payment.failed") {
            const paymentEntity = body.payload.payment.entity;
            
            // Extract payment failure information
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
                error_code: errorCode,
                error_description: errorDescription,
                error_source: errorSource,
                error_step: errorStep,
                error_reason: errorReason,
                acquirer_data: acquirerData
            } = paymentEntity;
            
            console.log("Payment failed:", {
                paymentId,
                amount,
                currency,
                status,
                orderId,
                errorCode,
                errorDescription,
                errorSource,
                errorStep,
                errorReason,
                notes
            });
            
            // Get user details from notes
            const name = notes?.name;
            const email = notes?.email;
            const coinsAttempted = parseInt(notes?.coins || "0");
            
            console.log("Failed payment data:", { name, email, coinsAttempted });
            
            // Store failed payment information for tracking
            try {
                // Check if user exists
                const user = await prisma.user.findUnique({ 
                    where: { email } 
                });
                
                if (user) {
                    // Store failed payment record
                    const failedPayment = await prisma.payment.create({
                        data: {
                            paymentId,
                            userId: user.id,
                            amount,
                            currency,
                            paymentMethod,
                            status: "failed",
                            contactNumber: contactNumber || "",
                            transactionId: acquirerData?.transaction_id || "",
                            orderId
                        }
                    });
                    
                    console.log(`Failed payment recorded: ${failedPayment.id} for user ${user.id}`);
                } else {
                    console.log(`Failed payment for non-existent user: ${email}`);
                }
            } catch (dbError) {
                console.error("Error storing failed payment:", dbError);
                // Don't fail the webhook response if DB storage fails
            }
            
            return NextResponse.json({ 
                message: "Payment failure processed successfully",
                paymentId,
                status: "failed",
                errorCode,
                errorDescription,
                eventType: event
            }, { status: 200 });
        }

        // Handle other events if needed
        console.log(`Unhandled event: ${event}`);
        return NextResponse.json({ message: `Unhandled event: ${event}` }, { status: 200 });
        
    } catch (error) {
        console.error("Webhook Error:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
        return NextResponse.json({ 
            message: "Server error", 
            error: error instanceof Error ? error.message : "Unknown error" 
        }, { status: 500 });
    }
}
