"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, User, Mail, Coins, X } from "lucide-react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface QuickPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  plan: {
    name: string
    price: number
    coins: number
    originalPrice?: number
  } | null
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function QuickPaymentModal({ isOpen, onClose, plan }: QuickPaymentModalProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setUserDetails(prev => ({ ...prev, [field]: value }))
  }

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handlePayment = async () => {
    if (!plan) return

    // Validate required fields
    if (!userDetails.name || !userDetails.email) {
      toast.error("Please fill in all required fields")
      return
    }

    // Validate email
    if (!validateEmail(userDetails.email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsProcessing(true)

    try {
      // Create order for unauthenticated user
      const orderResponse = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: plan.price * 100, // Convert to paise
          currency: "INR",
          coins: plan.coins,
          planName: plan.name,
          userEmail: userDetails.email,
          userName: userDetails.name,
          isNewUser: true
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
        name: "NotesAcademy",
        description: `${plan!.name} - ${plan!.coins} Coins`,
        order_id: orderData.id,
        prefill: { name: userDetails.name, email: userDetails.email },
        notes: { name: userDetails.name, email: userDetails.email, coins: plan!.coins, planName: plan!.name, isNewUser: "true" },
        theme: { color: "#3B82F6" },
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
          ondismiss() {
            setIsProcessing(false)
            setShowEmbed(false)
            toast.error("Payment cancelled")
          },
        },
      }

      setShowEmbed(true)
      ;(options as any).checkout = {
        container: "#quick-rzp-embed-container"
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Failed to initiate payment")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!plan) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-full sm:max-w-lg p-2 sm:p-6"
    >
      <div className="p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Complete Payment
          </h2>
          
        </div>

        {/* Plan Summary */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{plan.name}</CardTitle>
            <CardDescription>
              Get {plan.coins} coins for your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-yellow-400">
                <Coins className="h-5 w-5 mr-2" />
                <span className="font-medium">{plan.coins} Coins</span>
              </div>
              <div className="text-right">
                {plan.originalPrice && (
                  <div className="text-sm text-gray-400 line-through">
                    ₹{plan.originalPrice}
                  </div>
                )}
                <div className="text-2xl font-bold text-green-400">
                  ₹{plan.price}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Details Form */}
        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="name" className="flex items-center mb-2">
              <User className="h-4 w-4 mr-2" />
              Full Name *
            </Label>
            <Input
              id="name"
              type="text"
              value={userDetails.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="bg-slate-800 border-slate-600"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center mb-2">
              <Mail className="h-4 w-4 mr-2" />
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={userDetails.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="bg-slate-800 border-slate-600"
              placeholder="Enter your email"
              required
            />
            <p className="text-xs mt-1 text-blue-400">
              We'll create your account with this email address
            </p>
          </div>
        </div>

        {/* Payment Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 py-3 text-lg font-medium"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Pay ₹{plan.price}
              </div>
            )}
          </Button>
        </motion.div>

        {/* embed checkout container */}
        {showEmbed && (
          <div
            id="quick-rzp-embed-container"
            className="mt-4 p-4 bg-white rounded shadow w-full h-auto"
          />
        )}

        <p className="text-xs text-gray-400 text-center mt-4">
          Secure payment powered by Razorpay. Your account will be automatically created after payment.
        </p>
      </div>
    </Modal>
  )
}
