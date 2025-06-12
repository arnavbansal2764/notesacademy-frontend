"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Star, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { QuickPaymentModal } from "@/components/ui/quick-payment-modal";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PricingPlan {
  id: string;
  name: string;
  coins: number;
  price: number;
  originalPrice?: number;
  icon: any;
  color: string;
  gradient: string;
  features: string[];
  popular?: boolean;
  description: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter Pack",
    coins: 5,
    price: 10,
    icon: Zap,
    color: "blue",
    gradient: "from-blue-500 to-cyan-500",
    description: "Perfect for trying out our AI tools",
    features: [
      "5 AI-powered generations",
      "MCQ Quiz Generator",
      "Subjective Q&A Generator", 
      "Short Notes Generator",
      "Flowchart & Mindmap Creator",
      "Download & Share Results"
    ]
  },
  {
    id: "popular",
    name: "Popular Pack",
    coins: 20,
    price: 299,
    originalPrice: 396,
    icon: Star,
    color: "purple",
    gradient: "from-purple-500 to-pink-500",
    description: "Most popular choice for teachers",
    features: [
      "20 AI-powered generations",
      "All Starter features",
      "Priority processing",
      "Advanced analytics",
      "Email support"
    ],
    popular: true
  },
  {
    id: "premium",
    name: "Premium Pack",
    coins: 50,
    price: 599,
    originalPrice: 990,
    icon: Crown,
    color: "gold",
    gradient: "from-yellow-500 to-orange-500",
    description: "Ultimate package for serious tutors",
    features: [
      "50 AI-powered generations",
      "All Popular features",
      "Premium support",
      "Early access to new features",
      "Custom export options"
    ]
  }
];

export function PricingContent() {
  const { data: session } = useSession();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isQuickPaymentModalOpen, setIsQuickPaymentModalOpen] = useState(false);

  // Check if user was redirected from auth

  const reason = searchParams?.get("reason");
  
  const email = searchParams?.get("email");

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      toast.error("Payment system unavailable. Please try again later.");
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    // Show toast if user was redirected from auth
    if (reason === "account_required") {
      toast.error("Account not found. Please purchase coins to create your account.");
    } else if (reason === "account_created") {
      toast.success("Your account has been created! Please check your email for login details.");
    }
  }, [reason]);

  const handlePurchase = async (plan: PricingPlan) => {
    if (!razorpayLoaded) {
      toast.error("Payment system is loading. Please try again in a moment.");
      return;
    }

    // For authenticated users, proceed with standard flow
    if (session) {
      setIsProcessing(plan.id);

      try {
        // Create order with authentication
        const orderResponse = await fetch("/api/create-razorpay-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: plan.price * 100, // Convert to paise
            currency: "INR",
            coins: plan.coins,
            planName: plan.name
          }),
        });

        if (!orderResponse.ok) {
          throw new Error("Failed to create order");
        }

        const order = await orderResponse.json();

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: "Notes Academy",
          description: `${plan.name} - ${plan.coins} Coins`,
          order_id: order.id,
          prefill: {
            name: session?.user?.name || "",
            email: session?.user?.email || "",
          },
          notes: {
            email: session?.user?.email || "",
            name: session?.user?.name || "",
            coins: plan.coins,
            planId: plan.id,
            isNewUser: "false"
          },
          theme: {
            color: "#6366f1",
          },
          handler: function (response: any) {
            // Redirect to success page with payment details
            const successUrl = new URL('/payment-success', window.location.origin);
            successUrl.searchParams.set('amount', plan.price.toString());
            successUrl.searchParams.set('coins', plan.coins.toString());
            successUrl.searchParams.set('plan', encodeURIComponent(plan.name));
            successUrl.searchParams.set('transaction_id', response.razorpay_payment_id);
            
            window.location.href = successUrl.toString();
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(null);
              toast.error("Payment cancelled");
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (error) {
        console.error("Payment error:", error);
        toast.error("Failed to initiate payment. Please try again.");
        setIsProcessing(null);
      }
    } else {
      // For non-authenticated users, show quick payment modal
      setSelectedPlan(plan);
      setIsQuickPaymentModalOpen(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <main className="container mx-auto px-4 py-16">
      {/* Load Razorpay script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => console.error("Failed to load Razorpay")}
      />
      
      {/* Quick Payment Modal for unauthenticated users */}
      <QuickPaymentModal
        isOpen={isQuickPaymentModalOpen}
        onClose={() => setIsQuickPaymentModalOpen(false)}
        plan={selectedPlan}
      />

      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Attention Grabbing Coin Info */}
          

          {reason === "account_required" && (
            <motion.div
              className="mb-6 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-amber-400 font-medium">
                {email ? `Account not found for ${email}` : "Account not found"}
              </p>
              <p className="text-amber-200 text-sm mt-1">
                Purchase any package below to create your account and start using our AI tools.
              </p>
            </motion.div>
          )}
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight">
            {reason === "account_required" ? "Create Your Account" : "Choose Your Teaching Package"}
          </h1>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Secure payments via Razorpay</span>
            <span className="mx-2">•</span>
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Instant coin delivery</span>
            <span className="mx-2">•</span>
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            <span>Account auto-creation</span>
          </div>
        </motion.div>
        <motion.div
          className="mb-8 p-6 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/40 rounded-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">🪙</span>
            <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent text-center">
              1 Coin = 1 AI Generation
            </h2>
            <span className="text-4xl">⚡</span>
          </div>
          <p className="text-yellow-200 text-lg text-center">
            Use 1 coin to generate MCQs, Short Notes, Subjective Q&As, or Interactive Mindmaps from any PDF
          </p>
        </motion.div>
        {/* Pricing Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {pricingPlans.map((plan) => {
            const IconComponent = plan.icon;
            const isPopular = plan.popular;

            return (
              <motion.div
                key={plan.id}
                variants={itemVariants}
                className={`relative ${isPopular ? 'scale-105' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}

                <Card className={`bg-slate-800 border-slate-700 h-full ${isPopular ? 'border-purple-500 shadow-lg shadow-purple-500/20' : ''}`}>
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-4xl font-bold">₹{plan.price}</span>
                        {plan.originalPrice && (
                          <span className="text-lg text-gray-400 line-through">₹{plan.originalPrice}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-yellow-400">
                        <span className="text-2xl">🪙</span>
                        <span className="text-xl font-semibold">{plan.coins} Coins</span>
                      </div>
                      {plan.originalPrice && (
                        <div className="text-sm text-green-400 font-medium">
                          Save ₹{plan.originalPrice - plan.price}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      onClick={() => handlePurchase(plan)}
                      disabled={isProcessing === plan.id || !razorpayLoaded}
                      className={`w-full bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white font-medium p-8 text-xl`}
                    >
                      {isProcessing === plan.id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin "></div>
                          Processing...
                        </div>
                      ) : (
                        session ? 
                        `Get ${plan.coins} Coins - ₹${plan.price}` : 
                        `Buy Now - ₹${plan.price}`
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">How do coins work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Each AI generation (MCQ, subjective Q&A, or mindmap) costs 1 coin. Purchase coins to unlock unlimited access to our AI tools.</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Do coins expire?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">No! Your coins never expire. Use them whenever you need to generate study materials from your PDFs.</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Is payment secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Yes! We use Razorpay for secure payments. Your payment information is encrypted and never stored on our servers.</p>
              </CardContent>
            </Card>

            
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="h-12 bg-slate-800 rounded-lg mb-4 animate-pulse"></div>
          <div className="h-6 bg-slate-800 rounded-lg mb-8 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-slate-800 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <Navbar />
      
      <Suspense fallback={<LoadingFallback />}>
        <PricingContent />
      </Suspense>

      <Footer />
    </div>
  );
}
