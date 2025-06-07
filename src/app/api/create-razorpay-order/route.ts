import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: "rzp_test_Z53yBZFgq4GkQL",
  key_secret: "7QOE8jUm3IEuK7Y5IGGeeMGz",
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, currency = "INR", coins, planName } = body;

    if (!amount || !coins) {
      return NextResponse.json({ error: "Amount and coins are required" }, { status: 400 });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount, // amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        email: session.user.email,
        name: session.user.name || "",
        coins: coins.toString(),
        planName: planName || ""
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
