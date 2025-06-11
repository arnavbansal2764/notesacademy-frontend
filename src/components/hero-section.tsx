"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileUp, BookOpen, BrainCircuit, BarChart3, CheckCircle2, ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PaymentModal } from "@/components/ui/payment-modal"
import Script from "next/script"
import toast from "react-hot-toast"

export default function HeroSection() {
    const [scrolled, setScrolled] = useState(false)
    const [activeFeature, setActiveFeature] = useState(0)
    const [windowSize, setWindowSize] = useState({ width: 800, height: 600 }) // Default fallback values
    const [isMounted, setIsMounted] = useState(false)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<any>(null)
    const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [userCoins, setUserCoins] = useState<number | null>(null)
    const { data: session } = useSession()
    const router = useRouter()

    // Handle scroll effect for navbar
    useEffect(() => {
        // Only run on the client side
        if (typeof window !== "undefined") {
            const handleScroll = () => {
                setScrolled(window.scrollY > 50)
            }
            window.addEventListener("scroll", handleScroll)
            return () => window.removeEventListener("scroll", handleScroll)
        }
    }, [])

    // Set isMounted to true after component mounts
    useEffect(() => {
        setIsMounted(true)
        if (typeof window !== "undefined") {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            })
            
            // Optional: Add resize listener
            const handleResize = () => {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight
                })
            }
            
            window.addEventListener('resize', handleResize)
            return () => window.removeEventListener('resize', handleResize)
        }
    }, [])

    // Auto-rotate features
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 3)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

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

    const handleGetStarted = () => {
        if (session) {
            router.push("/dashboard")
        } else {
            router.push("/pricing")
        }
    }

    const handleUploadPDF = () => {
        if (session) {
            router.push("/mcq-generator")
        } else {
            router.push("/auth")
        }
    }

    const handleWatchDemo = () => {
        // Scroll to product showcase section or open demo modal
        const productSection = document.getElementById("product-showcase")
        if (productSection) {
            productSection.scrollIntoView({ behavior: "smooth" })
        }
    }

    const handleQuickPurchase = async () => {
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
            // Default starter plan
            const plan = {
                name: "Starter Pack",
                price: 99,
                coins: 10,
                originalPrice: 149
            }

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

    const features = [
        {
            title: "MCQ Generator",
            description: "Upload any PDF study material and get instant MCQs based on it",
            icon: <BookOpen className="h-8 w-8 text-rose-500" />,
            color: "from-rose-500 to-pink-600",
            image: "/placeholder.svg?height=300&width=400",
        },
        {
            title: "Short Notes Generator",
            description: "Trims down your study material into concise, easy to learn pointers",
            icon: <BrainCircuit className="h-8 w-8 text-blue-500" />,
            color: "from-blue-500 to-cyan-600",
            image: "/placeholder.svg?height=300&width=400",
        },
        {
            title: "Visual Mind-Maps and Flowchart Generator",
            description: "Convert complex topics into easy-to-understand visual flowcharts",
            icon: <BarChart3 className="h-8 w-8 text-green-500" />,
            color: "from-green-500 to-teal-600",
            image: "/placeholder.svg?height=300&width=400",
        },
        {
            title: "Subjective Questions Generator",
            description: "Generates subjective questions along with it's detailed answers",
            icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
            color: "from-purple-500 to-violet-600",
            image: "/placeholder.svg?height=300&width=400",
        },
    ]

    const benefitItems = [
        "Save 70% of study preparation time",
        "Improve knowledge retention by 3x",
        "Practice with unlimited question variations",
        "Visualize complex concepts easily",
    ]

    return (
        <>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                onLoad={() => setIsRazorpayLoaded(true)}
                onError={() => console.error("Failed to load Razorpay")}
            />

            <section className="relative min-h-screen pt-24 overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black px-10">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Only render animated elements on the client side */}
                    {isMounted && [...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-xl"
                            initial={{
                                width: Math.random() * 200 + 50,
                                height: Math.random() * 200 + 50,
                                x: Math.random() * windowSize.width,
                                y: Math.random() * windowSize.height,
                                opacity: 0.1,
                            }}
                            animate={{
                                x: Math.random() * windowSize.width,
                                y: Math.random() * windowSize.height,
                                opacity: [0.1, 0.2, 0.1],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration: Math.random() * 20 + 10,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatType: "reverse",
                            }}
                        />
                    ))}
                </div>

                {/* Hero Content */}
                <div className="container mx-auto px-4 pt-16 md:pt-24 relative z-10">
                    <div className="flex flex-col items-center text-center mb-12">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            <Badge className="mb-4 px-3 py-1 bg-white/10 text-white border-none">
                                <span className="animate-pulse mr-1 h-2 w-2 rounded-full bg-green-500 inline-block"></span>
                                New AI Teaching Platform
                            </Badge>
                        </motion.div>

                        <motion.h1
                            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                Transform Your Teaching
                            </span>
                            <br />
                            <span className="text-white">With AI-Powered Tools</span>
                        </motion.h1>

                        <motion.p
                            className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            Generate MCQs, subjective questions, and interactive flowcharts from your study materials in seconds
                        </motion.p>
                    </div>
                    <h2 className="text-center text-3xl font-bold text-white mb-8 pb-10">Features of our Product</h2>
                    {/* Feature Showcase */}
                    <motion.div
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        {/* Feature Tabs */}
                        <div className="order-2 lg:order-1">
                            <div className="flex flex-col gap-4 mb-8">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        className={`cursor-pointer rounded-xl p-4 transition-all duration-300 ${activeFeature === index
                                                ? `bg-gradient-to-r ${feature.color} shadow-lg shadow-${feature.color.split("-")[1]}/20`
                                                : "bg-white/5 hover:bg-white/10"
                                            }`}
                                        onClick={() => setActiveFeature(index)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`rounded-lg p-2 ${activeFeature === index ? "bg-white/20" : "bg-white/5"}`}>
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold mb-1">{feature.title}</h3>
                                                <p className={`${activeFeature === index ? "text-white/90" : "text-white/60"}`}>
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Why teachers love us:</h3>
                                <ul className="space-y-3">
                                    {benefitItems.map((item, index) => (
                                        <motion.li
                                            key={index}
                                            className="flex items-center gap-3"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4, delay: 0.1 * index }}
                                        >
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <span className="text-white/80">{item}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div> */}
                        </div>

                        {/* Feature Preview */}
                        <div className="hidden lg:block order-1 lg:order-2 relative">
                            <div className="relative h-[400px] w-full max-w-[500px] mx-auto">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        className="absolute inset-0 rounded-xl overflow-hidden border border-white/20 shadow-2xl"
                                        initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                                        animate={{
                                            opacity: activeFeature === index ? 1 : 0,
                                            scale: activeFeature === index ? 1 : 0.9,
                                            rotate: activeFeature === index ? 0 : 5,
                                            zIndex: activeFeature === index ? 10 : 0,
                                        }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <div className={`h-full w-full bg-gradient-to-br ${feature.color} p-6`}>
                                            <div className="bg-black/30 backdrop-blur-sm rounded-lg h-full w-full p-4 flex flex-col">
                                                <div className="flex items-center gap-2 mb-4">
                                                    {feature.icon}
                                                    <h3 className="font-semibold">{feature.title}</h3>
                                                </div>

                                                <div className="flex-1 bg-black/20 rounded-lg p-4 overflow-hidden">
                                                    {index === 0 && (
                                                        <div className="animate-pulse space-y-3">
                                                            <div className="h-4 bg-white/20 rounded w-3/4"></div>
                                                            <div className="h-4 bg-white/20 rounded w-1/2"></div>
                                                            <div className="h-4 bg-white/20 rounded w-5/6"></div>
                                                            <div className="h-4 bg-white/20 rounded w-2/3"></div>
                                                            <div className="h-4 bg-white/20 rounded w-4/5"></div>
                                                        </div>
                                                    )}

                                                    {index === 1 && (
                                                        <div className="space-y-4">
                                                            <div className="p-2 bg-white/10 rounded-lg">
                                                                <p className="text-sm font-medium">1. What is the main purpose of AI in education?</p>
                                                                <div className="mt-2 space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-4 w-4 rounded-full border border-white/40"></div>
                                                                        <p className="text-xs text-white/70">A. Replace teachers</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-4 w-4 rounded-full border border-white/40 bg-white/80"></div>
                                                                        <p className="text-xs text-white/70">B. Enhance learning experience</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-4 w-4 rounded-full border border-white/40"></div>
                                                                        <p className="text-xs text-white/70">C. Reduce education costs</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="p-2 bg-white/10 rounded-lg">
                                                                <p className="text-sm font-medium">2. Which technology powers LearnGenius?</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {index === 2 && (
                                                        <div className="h-full flex items-center justify-center">
                                                            <svg width="200" height="150" viewBox="0 0 200 150">
                                                                <circle cx="100" cy="30" r="20" fill="white" fillOpacity="0.3" />
                                                                <line x1="100" y1="50" x2="60" y2="80" stroke="white" strokeWidth="2" />
                                                                <line x1="100" y1="50" x2="140" y2="80" stroke="white" strokeWidth="2" />
                                                                <rect x="40" y="80" width="40" height="25" rx="5" fill="white" fillOpacity="0.3" />
                                                                <rect x="120" y="80" width="40" height="25" rx="5" fill="white" fillOpacity="0.3" />
                                                                <line x1="60" y1="105" x2="60" y2="125" stroke="white" strokeWidth="2" />
                                                                <line x1="140" y1="105" x2="140" y2="125" stroke="white" strokeWidth="2" />
                                                                <rect x="40" y="125" width="40" height="25" rx="5" fill="white" fillOpacity="0.3" />
                                                                <rect x="120" y="125" width="40" height="25" rx="5" fill="white" fillOpacity="0.3" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -top-10 -right-10 h-40 w-40 bg-purple-500/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                        </div>
                    </motion.div>                    
                </div>
            </section>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                plan={selectedPlan}
            />
        </>
    )
}

