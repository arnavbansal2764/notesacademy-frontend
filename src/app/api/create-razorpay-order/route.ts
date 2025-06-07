import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_Z53yBZFgq4GkQL",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "7QOE8jUm3IEuK7Y5IGGeeMGz",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = "INR", coins, planName, userEmail, userName, isNewUser = false } = body;

    if (!amount || !coins) {
      return NextResponse.json({ error: "Amount and coins are required" }, { status: 400 });
    }

    // Check if we have user credentials - either from session or from request body
    const session = await getServerSession(authOptions);
    const email = session?.user?.email || userEmail;
    const name = session?.user?.name || userName;
    
    // For non-authenticated users, email is required in the request body
    if (!email && isNewUser) {
      return NextResponse.json({ error: "Email is required for new users" }, { status: 400 });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount, // amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        email: email || "",
        name: name || "",
        coins: coins.toString(),
        planName: planName || "",
        isNewUser: isNewUser ? "true" : "false"
      }
    });

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
