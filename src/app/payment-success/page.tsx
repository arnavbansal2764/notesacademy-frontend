"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Head from "next/head";

interface PaymentDetails {
  amount: number;
  coins: number;
  planName: string;
  transactionId?: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  useEffect(() => {
    // Extract payment details from URL params
    const amount = searchParams?.get("amount");
    const coins = searchParams?.get("coins");
    const planName = searchParams?.get("plan");
    const transactionId = searchParams?.get("transaction_id");
    if (amount && coins && planName) {
      const details = {
        amount: parseInt(amount),
        coins: parseInt(coins),
        planName: decodeURIComponent(planName),
        transactionId: transactionId || undefined
      };
      setPaymentDetails(details);
      
    }
  }, [searchParams]);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
            router.push('/auth?message=account_created');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleContinue = () => {
    router.push('/auth');
  };

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Payment Successful - Notes Academy</title>
        <meta name="description" content={`Payment of ₹${paymentDetails.amount} successful for ${paymentDetails.planName}`} />
        
        {/* Facebook Meta Tags for Conversion Tracking */}
        <meta property="fb:pixel_id" content={process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || ""} />
        <meta property="purchase:amount" content={paymentDetails.amount.toString()} />
        <meta property="purchase:currency" content="INR" />
        <meta property="purchase:product" content={paymentDetails.planName} />
        
        {/* Structured Data for Better Tracking */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Order",
              "orderNumber": paymentDetails.transactionId,
              "orderStatus": "Confirmed",
              "priceCurrency": "INR",
              "price": paymentDetails.amount,
              "seller": {
                "@type": "Organization",
                "name": "Notes Academy"
              },
              "orderedItem": {
                "@type": "Product",
                "name": paymentDetails.planName,
                "description": `${paymentDetails.coins} AI generation coins`
              }
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="bg-slate-800 border-slate-700 text-center">
            <CardHeader className="pb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="h-12 w-12 text-white" />
              </motion.div>
              
              <CardTitle className="text-2xl font-bold text-green-400 mb-2">
                Payment Successful!
              </CardTitle>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <p className="text-gray-300">
                  Your transaction for{" "}
                  <span className="font-bold text-white text-xl">₹{paymentDetails.amount}</span>{" "}
                  is successful
                </p>
                <p className="text-sm text-gray-400">
                  {paymentDetails.planName} • {paymentDetails.coins} Coins
                </p>
                {paymentDetails.transactionId && (
                  <p className="text-xs text-gray-500">
                    Transaction ID: {paymentDetails.transactionId}
                  </p>
                )}
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-slate-700/50 rounded-lg p-4"
              >
                <div className="flex items-center justify-center gap-2 text-blue-400 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Auto-redirect in {countdown} seconds</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 5, ease: "linear" }}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
                >
                  Continue to Account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-xs text-gray-500 space-y-1"
              >
                <p>✓ Coins have been added to your account</p>
                <p>✓ You can start using AI tools immediately</p>
                <p>✓ Check your email for purchase confirmation</p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-300">Loading...</p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
