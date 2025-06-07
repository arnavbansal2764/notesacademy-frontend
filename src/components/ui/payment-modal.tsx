"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, User, Mail, Phone, Coins, X } from "lucide-react"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface PaymentModalProps {
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

export function PaymentModal({ isOpen, onClose, plan }: PaymentModalProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [userDetails, setUserDetails] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setUserDetails(prev => ({ ...prev, [field]: value }))
  }

  const handlePayment = async () => {
    if (!plan) return

    // Validate required fields
    if (!userDetails.name || !userDetails.email || !userDetails.phone) {
      toast.error("Please fill in all required fields")
      return
    }

    // Validate phone number
    if (userDetails.phone.length < 10) {
      toast.error("Please enter a valid phone number")
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
            name: userDetails.name,
            email: userDetails.email,
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
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone,
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
              onClose() // Close modal
              
              // Refresh the page to update coin balance
              if (typeof window !== 'undefined') {
                window.location.reload()
              }
            } else {
              toast.error("Payment verification failed")
            }
          } catch (error) {
            console.error("Payment verification error:", error)
            toast.error("Payment verification failed")
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
    } finally {
      setIsProcessing(false)
    }
  }

  if (!plan) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Complete Payment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
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
          </div>

          <div>
            <Label htmlFor="phone" className="flex items-center mb-2">
              <Phone className="h-4 w-4 mr-2" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={userDetails.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="bg-slate-800 border-slate-600"
              placeholder="Enter your phone number"
              required
            />
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

        <p className="text-xs text-gray-400 text-center mt-4">
          Secure payment powered by Razorpay. Your payment information is encrypted and secure.
        </p>
      </div>
    </Modal>
  )
}
