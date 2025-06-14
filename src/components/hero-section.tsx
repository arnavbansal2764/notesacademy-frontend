"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
    const [isMounted, setIsMounted] = useState(false)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<any>(null)
    const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [userCoins, setUserCoins] = useState<number | null>(null)
    const [isLowPerformanceMode, setIsLowPerformanceMode] = useState(false)
    const { data: session } = useSession()
    const router = useRouter()

    // Detect device performance capabilities
    useEffect(() => {
        if (typeof window !== "undefined") {
            // Check for performance indicators
            const isLowPerf = (
                window.innerWidth < 768 || // Mobile devices
                navigator.hardwareConcurrency <= 2 || // Low-end CPUs
                (navigator as any).deviceMemory <= 4 // Low RAM (if available)
            )
            setIsLowPerformanceMode(isLowPerf)
        }
    }, [])

    // Handle scroll effect for navbar with throttling
    useEffect(() => {
        if (typeof window !== "undefined") {
            let ticking = false
            const handleScroll = () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        setScrolled(window.scrollY > 50)
                        ticking = false
                    })
                    ticking = true
                }
            }
            window.addEventListener("scroll", handleScroll, { passive: true })
            return () => window.removeEventListener("scroll", handleScroll)
        }
    }, [])

    // Set isMounted to true after component mounts
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Auto-rotate features with cleanup
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 4)
        }, 10000)
        return () => clearInterval(interval)
    }, [])

    // Fetch user coins when component mounts or session changes
    useEffect(() => {
        if (session?.user) {
            fetchUserCoins()
        }
    }, [session])

    // Memoize background elements to prevent re-renders
    const backgroundElements = useMemo(() => {
        if (!isMounted || isLowPerformanceMode) return null
        
        // Reduce number of elements for better performance
        const elementCount = 8 // Reduced from 20
        
        return [...Array(elementCount)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-xl"
                style={{
                    width: Math.random() * 150 + 30, // Smaller elements
                    height: Math.random() * 150 + 30,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                }}
                animate={{
                    x: [0, Math.random() * 100 - 50, 0],
                    y: [0, Math.random() * 100 - 50, 0],
                    opacity: [0.05, 0.15, 0.05],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: Math.random() * 10 + 15, // Slower animations
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear", // More efficient than complex easing
                }}
            />
        ))
    }, [isMounted, isLowPerformanceMode])

    // Function to fetch user coins
    const fetchUserCoins = useCallback(async () => {
        try {
            const response = await fetch('/api/user-profile')
            if (response.ok) {
                const data = await response.json()
                setUserCoins(data.user?.coins || 0)
            }
        } catch (error) {
            console.error('Error fetching user coins:', error)
        }
    }, [])

    const features = useMemo(() => [
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
    ], [])

    // Optimized animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    }

    return (
        <>
            <section className="relative min-h-screen pt-24 overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black md:px-10">
                {/* Optimized Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    {backgroundElements}
                </div>

                {/* Hero Content */}
                <motion.div 
                    className="container mx-auto px-4 pt-16 md:pt-24 relative z-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="flex flex-col items-center text-center mb-12">
                        <motion.div variants={itemVariants}>
                            <Badge className="mb-4 px-3 py-1 bg-white/10 text-white border-none">
                                <span className="animate-pulse mr-1 h-2 w-2 rounded-full bg-green-500 inline-block"></span>
                                New AI Teaching Platform
                            </Badge>
                        </motion.div>

                        <motion.h1
                            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                            variants={itemVariants}
                        >
                            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                Transform Your Teaching
                            </span>
                            <br />
                            <span className="text-white">With AI-Powered Tools</span>
                        </motion.h1>

                        <motion.p
                            className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-8"
                            variants={itemVariants}
                        >
                            Generate MCQs, subjective questions, and interactive flowcharts from your study materials in seconds
                        </motion.p>
                    </div>
                    
                    <motion.h2 
                        className="text-center text-3xl font-bold text-white mb-8 pb-10"
                        variants={itemVariants}
                    >
                        Features of our Product
                    </motion.h2>

                    {/* Optimized Feature Showcase */}
                    <motion.div
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24"
                        variants={itemVariants}
                    >
                        {/* Feature Tabs */}
                        <div className="order-2 lg:order-1">
                            <div className="flex flex-col gap-4 mb-8">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        className={`cursor-pointer rounded-xl p-4 transition-all duration-300 ${activeFeature === index
                                                ? `bg-gradient-to-r ${feature.color} shadow-lg`
                                                : "bg-white/5 hover:bg-white/10"
                                            }`}
                                        onClick={() => setActiveFeature(index)}
                                        whileHover={{ scale: isLowPerformanceMode ? 1 : 1.02 }}
                                        whileTap={{ scale: isLowPerformanceMode ? 1 : 0.98 }}
                                        transition={{ duration: 0.2 }}
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
                        </div>

                        {/* Optimized Feature Preview */}
                        <div className="hidden lg:block order-1 lg:order-2 relative">
                            <div className="relative h-[400px] w-full max-w-[500px] mx-auto">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        className="absolute inset-0 rounded-xl overflow-hidden border border-white/20 shadow-2xl"
                                        initial={false}
                                        animate={{
                                            opacity: activeFeature === index ? 1 : 0,
                                            scale: activeFeature === index ? 1 : 0.95,
                                            zIndex: activeFeature === index ? 10 : 0,
                                        }}
                                        transition={{ 
                                            duration: 0.3,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <div className={`h-full w-full bg-gradient-to-br ${feature.color} p-6`}>
                                            <div className="bg-black/30 backdrop-blur-sm rounded-lg h-full w-full p-4 flex flex-col">
                                                <div className="flex items-center gap-2 mb-4">
                                                    {feature.icon}
                                                    <h3 className="font-semibold">{feature.title}</h3>
                                                </div>

                                                <div className="flex-1 bg-black/20 rounded-lg p-4 overflow-hidden">
                                                    {/* Simplified preview content without heavy animations */}
                                                    {index === 0 && (
                                                        <div className="space-y-3">
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

                            {/* Static decorative elements */}
                            <div className="absolute -top-10 -right-10 h-40 w-40 bg-purple-500/20 rounded-full blur-3xl opacity-50"></div>
                            <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-blue-500/20 rounded-full blur-3xl opacity-50"></div>
                        </div>
                    </motion.div>                    
                </motion.div>
            </section>
        </>
    )
}

