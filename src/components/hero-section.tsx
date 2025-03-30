"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileUp, BookOpen, BrainCircuit, BarChart3, CheckCircle2, ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function EnhancedHeroSection() {
    const [scrolled, setScrolled] = useState(false)
    const [activeFeature, setActiveFeature] = useState(0)
    const [windowSize, setWindowSize] = useState({ width: 800, height: 600 }) // Default fallback values
    const [isMounted, setIsMounted] = useState(false)

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

    const features = [
        {
            title: "PDF Analysis",
            description: "Upload any PDF study material and get instant learning resources",
            icon: <BookOpen className="h-8 w-8 text-rose-500" />,
            color: "from-rose-500 to-pink-600",
            image: "/placeholder.svg?height=300&width=400",
        },
        {
            title: "MCQ Generation",
            description: "AI-powered multiple choice questions with detailed explanations",
            icon: <BrainCircuit className="h-8 w-8 text-blue-500" />,
            color: "from-blue-500 to-cyan-600",
            image: "/placeholder.svg?height=300&width=400",
        },
        {
            title: "Visual Flowcharts",
            description: "Convert complex topics into easy-to-understand visual flowcharts",
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
            <section className="relative min-h-screen pt-24 overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
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
                                New AI Learning Platform
                            </Badge>
                        </motion.div>

                        <motion.h1
                            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                Transform Your Learning
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

                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-lg px-8"
                            >
                                Get Started Free
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg">
                                <FileUp className="mr-2 h-5 w-5" /> Upload PDF
                            </Button>
                        </motion.div>

                        <motion.div
                            className="flex items-center justify-center gap-2 text-white/60 text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                        >
                            <ChevronDown className="h-4 w-4 animate-bounce" />
                            <span>Scroll to explore</span>
                            <ChevronDown className="h-4 w-4 animate-bounce" />
                        </motion.div>
                    </div>

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

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Why students love us:</h3>
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
                            </div>
                        </div>

                        {/* Feature Preview */}
                        <div className="order-1 lg:order-2 relative">
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

                    {/* Stats Section */}
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        {[
                            { value: "10,000+", label: "Active Students" },
                            { value: "500,000+", label: "Questions Generated" },
                            { value: "98%", label: "Satisfaction Rate" },
                            { value: "30+", label: "Subject Areas" },
                        ].map((stat, index) => (
                            <Card key={index} className="bg-white/5 border-white/10 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-30"></div>
                                <CardContent className="p-6 text-center relative">
                                    <h3 className="text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                                        {stat.value}
                                    </h3>
                                    <p className="text-white/60">{stat.label}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </motion.div>

                    {/* CTA Section */}
                    <motion.div
                        className="max-w-4xl mx-auto text-center mb-24 relative"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-3xl opacity-30 rounded-3xl"></div>
                        <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to revolutionize your learning?</h2>
                            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                                Join thousands of students who are saving time and improving their grades with our AI-powered learning
                                tools.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button size="lg" className="bg-white text-black hover:bg-white/90 text-lg px-8">
                                    Start Free Trial
                                </Button>
                                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg">
                                    Watch Demo
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    )
}

