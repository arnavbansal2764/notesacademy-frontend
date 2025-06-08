"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Zap, Star, Crown, ArrowRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import toast from "react-hot-toast"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PricingPlan {
  id: string;
  name: string;
  coins: number;
  price: number;
  originalPrice?: number;
  icon: any;
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
    price: 99,
    icon: Zap,
    gradient: "from-blue-500 to-cyan-500",
    description: "Perfect for trying out our AI tools",
    features: [
      "5 AI-powered generations",
      "All core features",
      "7-day result history",
      "Download & share"
    ]
  },
  {
    id: "popular",
    name: "Popular Pack",
    coins: 20,
    price: 299,
    originalPrice: 396,
    icon: Star,
    gradient: "from-purple-500 to-pink-500",
    description: "Most popular choice for students",
    features: [
      "20 AI-powered generations",
      "Priority processing",
      "30-day result history",
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
    gradient: "from-yellow-500 to-orange-500",
    description: "Ultimate package for serious learners",
    features: [
      "50 AI-powered generations",
      "Unlimited history",
      "Premium support",
      "Early access to features"
    ]
  }
];

export default function PricingSection() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Add coin balance state
  const [userCoins, setUserCoins] = useState<number | null>(null)

  // Fetch user coins when component mounts or session changes
  useEffect(() => {
    if (session?.user) {
      fetchUserCoins()
    }
  }, [session])

  // Function to fetch user coins
  const fetchUserCoins = async () => {
    try {
      const response = await fetch('/api/user-profile')
      if (response.ok) {
        const data = await response.json()
        setUserCoins(data.user?.coins || 0)
      }
    } catch (error) {
      console.error('Error fetching user coins:', error)
    }
  }

  const handlePlanSelect = async (plan: PricingPlan) => {
    if (!session) {
      router.push("/auth")
      return
    }

    if (!isRazorpayLoaded) {
      toast.error("Payment system is loading. Please try again in a moment.")
      return
    }

    if (isProcessing) {
      return
    }

    setIsProcessing(true)

    try {
      // Create order
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: plan.price * 100, // Convert to paise
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          notes: {
            plan: plan.name,
            coins: plan.coins.toString(),
            name: session.user?.name || "",
            email: session.user?.email || "",
          },
        }),
      })

      if (!orderResponse.ok) {
        throw new Error("Failed to create order")
      }

      const orderData = await orderResponse.json()

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Notes Academy",
        description: `${plan.name} - ${plan.coins} Coins`,
        order_id: orderData.id,
        prefill: {
          name: session.user?.name || "",
          email: session.user?.email || "",
          contact: "",
        },
        theme: {
          color: "#3B82F6",
        },
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
            }),
          })

          if (verifyResponse.ok) {
            toast.success(`Payment successful! ${plan.coins} coins added to your account.`)
            
            // Refresh coin balance instead of full page reload
            await fetchUserCoins()
            
            // Optional: Also trigger a custom event for other components
            window.dispatchEvent(new CustomEvent('coinBalanceUpdated'))
          } else {
            toast.error("Payment verification failed")
          }
        } catch (error) {
          console.error("Payment verification error:", error)
          toast.error("Payment verification failed")
        } finally {
          setIsProcessing(false)
        }
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false)
          toast.error("Payment cancelled")
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  } catch (error) {
    console.error("Payment error:", error)
    toast.error("Failed to initiate payment")
    setIsProcessing(false)
  }
}

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
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <>
      {/* Load Razorpay script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setIsRazorpayLoaded(true)}
        onError={() => console.error("Failed to load Razorpay")}
      />
    
      <section className="py-20 px-4 bg-gradient-to-b from-slate-800 to-slate-900">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Choose the perfect package for your learning needs. Start with any plan and upgrade anytime.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Secure payments</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Instant delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>No expiry</span>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {pricingPlans.map((plan, index) => {
            const IconComponent = plan.icon;
            const isPopular = plan.popular;

            return (
              <motion.div
                key={plan.id}
                variants={itemVariants}
                className={`relative ${isPopular ? 'scale-105' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}

                <Card className={`bg-slate-800/50 backdrop-blur-sm border-slate-700 h-full transition-all duration-300 hover:bg-slate-700/50 hover:scale-105 ${isPopular ? 'border-purple-500 shadow-lg shadow-purple-500/20' : ''}`}>
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-3xl font-bold">₹{plan.price}</span>
                        {plan.originalPrice && (
                          <span className="text-lg text-gray-400 line-through">₹{plan.originalPrice}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-yellow-400">
                        <span className="text-xl">🪙</span>
                        <span className="text-lg font-semibold">{plan.coins} Coins</span>
                      </div>
                      {plan.originalPrice && (
                        <div className="text-sm text-green-400 font-medium">
                          Save ₹{plan.originalPrice - plan.price}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      onClick={() => handlePlanSelect(plan)}
                      disabled={!isRazorpayLoaded || isProcessing}
                      className={`w-full bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white font-medium`}
                    >
                      {!session ? "Sign In to Purchase" : 
                       !isRazorpayLoaded ? "Loading..." : 
                       isProcessing ? "Processing..." :
                       `Choose Plan`}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        
      </section>
    </>
  )
}
