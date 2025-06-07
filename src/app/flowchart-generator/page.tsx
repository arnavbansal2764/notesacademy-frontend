"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import toast, { Toaster } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader } from "@/components/ui/loader"
import { FileUp, CheckCircle2, Share, FileText, ArrowRight, RefreshCw, AlertCircle, History } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { uploadToS3 } from "@/lib/s3-upload"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CoinBalanceDisplay } from "@/components/ui/coin-balance-display"

export default function FlowchartGeneratorPage() {
    const router = useRouter()

    // Auth
    const { data: session } = useSession()

    // File upload states
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [s3Url, setS3Url] = useState<string>("")
    const [errorMessage, setErrorMessage] = useState<string>("")

    // Visualization states
    const [mindmapUrl, setMindmapUrl] = useState<string>("")
    const [mindmapTitle, setMindmapTitle] = useState<string>("")
    const [currentStep, setCurrentStep] = useState<"upload" | "processing" | "result" | "error">("upload")

    // Add coin checking state
    const [userCoins, setUserCoins] = useState<number | null>(null)
    const [isCheckingCoins, setIsCheckingCoins] = useState(false)

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Fetch user coins when component mounts or session changes
    useEffect(() => {
        if (session?.user) {
            fetchUserCoins()
        }
    }, [session])

    // Listen for coin balance updates from payment
    useEffect(() => {
        const handleCoinBalanceUpdate = () => {
            if (session?.user) {
                fetchUserCoins()
            }
        }

        window.addEventListener('coinBalanceUpdated', handleCoinBalanceUpdate)
        
        return () => {
            window.removeEventListener('coinBalanceUpdated', handleCoinBalanceUpdate)
        }
    }, [session])

    // Function to fetch user coins
    const fetchUserCoins = async () => {
        try {
            setIsCheckingCoins(true)
            const response = await fetch('/api/user-profile')
            if (response.ok) {
                const data = await response.json()
                setUserCoins(data.user?.coins || 0)
            }
        } catch (error) {
            console.error('Error fetching user coins:', error)
            toast.error('Failed to check coin balance')
        } finally {
            setIsCheckingCoins(false)
        }
    }

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null
        if (selectedFile && !selectedFile.name.toLowerCase().endsWith(".pdf")) {
            setErrorMessage("Please upload a PDF file")
            toast.error("Please upload a PDF file")
            return
        }

        if (selectedFile) {
            toast.success(`${selectedFile.name} selected`)
            setFile(selectedFile)
            setErrorMessage("")
        }
    }

    // Handle file upload and mindmap generation
    const handleGenerateFlowchart = async () => {
        if (!file) {
            toast.error("Please select a PDF file first")
            return
        }

        // Check if user is authenticated
        if (!session?.user) {
            toast.error("Please sign in to generate mindmaps")
            return
        }

        // Check coins before proceeding
        if (userCoins === null) {
            toast.error("Unable to check coin balance. Please try again.")
            return
        }

        if (userCoins < 1) {
            toast.error("Insufficient coins! You need 1 coin to generate mindmaps.")
            return
        }

        try {
            // Step 1: Upload file to S3
            setIsUploading(true)
            setCurrentStep("processing")
            setUploadProgress(0)

            const uploadToastId = toast.loading("Uploading your PDF...")

            const uploadResult = await uploadToS3(file, (progress) => {
                setUploadProgress(progress)
            })

            if (!uploadResult.success || !uploadResult.url) {
                toast.dismiss(uploadToastId)
                throw new Error(uploadResult.error || "Failed to upload file")
            }

            setS3Url(uploadResult.url)
            setIsUploading(false)

            toast.success("PDF uploaded successfully", {
                id: uploadToastId,
            })

            // Step 2: Generate mindmap
            setIsGenerating(true)
            const generatingToastId = toast.loading("Generating your mindmap visualization...")

            const response = await fetch("/api/generate-mindmap", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pdf_url: uploadResult.url,
                }),
            })

            if (!response.ok) {
                toast.dismiss(generatingToastId)
                const errorData = await response.json()
                if (response.status === 402) {
                    // Insufficient coins
                    throw new Error(errorData.error || "Insufficient coins")
                }
                throw new Error(errorData.error || "Failed to generate mindmap")
            }

            const data = await response.json()

            if (!data.mindmapUrl) {
                throw new Error("Invalid response from server")
            }

            // Set the mindmap URL and title
            setMindmapUrl(data.mindmapUrl)
            setMindmapTitle(data.title || "Generated Mindmap")

            setIsGenerating(false)

            toast.success(`Mindmap generated successfully! Remaining coins: ${data.remainingCoins}`, {
                id: generatingToastId,
            })

            // Redirect to the view page with the mindmap URL and title as query parameters
            router.push(
                `/view?url=${encodeURIComponent(data.mindmapUrl)}&title=${encodeURIComponent(data.title || "Generated Mindmap")}`,
            )
        } catch (error) {
            console.error("Error in mindmap generation process:", error)
            setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred")
            setIsUploading(false)
            setIsGenerating(false)
            setCurrentStep("error")

            toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
        }
    }

    // For demo purposes, load sample data
    const loadSampleData = () => {
        const sampleUrl = "https://raw.githubusercontent.com/jsoncrack/data/main/physics.json"
        const sampleTitle = "Physics Concepts (Sample)"

        // Redirect to the view page with the sample data
        router.push(`/view?url=${encodeURIComponent(sampleUrl)}&title=${encodeURIComponent(sampleTitle)}`)
    }

    // Reset the form
    const resetForm = () => {
        setFile(null)
        setS3Url("")
        setMindmapUrl("")
        setMindmapTitle("")
        setCurrentStep("upload")
        setErrorMessage("")
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 },
        },
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
            <Navbar />


            <main className="container mx-auto px-4 py-16">
                <div className="max-w-5xl mx-auto">
                    <motion.h1
                        className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Flowchart & Mindmap Generator
                    </motion.h1>
                    <motion.p
                        className="text-gray-300 mb-8"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Transform complex concepts into visual, easy-to-understand flowcharts and mindmaps. Our AI analyzes your PDF
                        content and creates beautiful, interactive visualizations.
                    </motion.p>

                    <AnimatePresence mode="wait">
                        {currentStep === "upload" && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardHeader>
                                        <CardTitle>Upload Your Study Material</CardTitle>
                                        <CardDescription className="text-gray-400">
                                            Upload a PDF file to generate an interactive mindmap visualization
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                                            <motion.div
                                                variants={itemVariants}
                                                className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:bg-slate-700/50 transition-colors cursor-pointer"
                                                onClick={() => fileInputRef.current?.click()}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <input
                                                    type="file"
                                                    id="pdf-upload"
                                                    className="hidden"
                                                    accept=".pdf"
                                                    onChange={handleFileChange}
                                                    ref={fileInputRef}
                                                />
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
                                                >
                                                    <FileUp className="h-16 w-16 mx-auto mb-4 text-indigo-400" />
                                                </motion.div>
                                                <motion.p
                                                    className="text-xl font-medium mb-2"
                                                    initial={{ y: 10, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    {file ? file.name : "Drag & drop or click to upload"}
                                                </motion.p>
                                                <motion.p
                                                    className="text-sm text-gray-400"
                                                    initial={{ y: 10, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: 0.4 }}
                                                >
                                                    Supports PDF files up to 10MB
                                                </motion.p>
                                                {errorMessage && (
                                                    <motion.p
                                                        className="text-sm text-red-500 mt-2"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                    >
                                                        {errorMessage}
                                                    </motion.p>
                                                )}
                                            </motion.div>

                                            {file && (
                                                <motion.div
                                                    className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <div className="flex items-center">
                                                        <FileText className="h-5 w-5 mr-2 text-purple-400" />
                                                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                                    </div>
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                </motion.div>
                                            )}

                                            {/* Coin Balance Display */}
                                            {session?.user && file && (
                                                <CoinBalanceDisplay
                                                    coins={userCoins}
                                                    requiredCoins={1}
                                                    isLoading={isCheckingCoins}
                                                />
                                            )}

                                            <motion.div
                                                className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
                                                variants={itemVariants}
                                            >
                                                <Button
                                                    onClick={handleGenerateFlowchart}
                                                    disabled={!file || !session?.user || (session?.user && userCoins !== null && userCoins < 1)}
                                                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
                                                    size="lg"
                                                >
                                                    <FileUp className="mr-2 h-4 w-4" />
                                                    {!session?.user ? "Sign In Required" : 
                                                     userCoins !== null && userCoins < 1 ? "Insufficient Coins" : 
                                                     "Generate Mindmap"}
                                                </Button>
                                                <Button variant="outline" size="lg" onClick={loadSampleData}>
                                                    View Sample
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {currentStep === "processing" && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardHeader>
                                        <CardTitle>Processing Your Document</CardTitle>
                                        <CardDescription className="text-gray-400">
                                            Please wait while we analyze your PDF and generate a mindmap
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-8 py-8">
                                            <div className="flex flex-col items-center justify-center">
                                                {isUploading ? (
                                                    <div className="space-y-6 w-full max-w-md">
                                                        <div className="flex justify-between text-sm mb-2">
                                                            <span>Uploading PDF...</span>
                                                            <span>{uploadProgress}%</span>
                                                        </div>
                                                        <Progress value={uploadProgress} className="h-2" />
                                                        <div className="flex justify-center">
                                                            <Loader variant="dots" size="lg" text="Uploading to secure storage" />
                                                        </div>
                                                    </div>
                                                ) : isGenerating ? (
                                                    <div className="space-y-8 w-full">
                                                        <div className="flex justify-center">
                                                            <div className="relative w-32 h-32">
                                                                {/* Neural network animation */}
                                                                <motion.div
                                                                    className="absolute inset-0 rounded-full border-4 border-indigo-500/30"
                                                                    animate={{
                                                                        scale: [1, 1.2, 1],
                                                                        borderColor: [
                                                                            "rgba(99, 102, 241, 0.3)",
                                                                            "rgba(168, 85, 247, 0.3)",
                                                                            "rgba(236, 72, 153, 0.3)",
                                                                            "rgba(99, 102, 241, 0.3)",
                                                                        ],
                                                                    }}
                                                                    transition={{
                                                                        duration: 3,
                                                                        repeat: Number.POSITIVE_INFINITY,
                                                                        ease: "easeInOut",
                                                                    }}
                                                                />

                                                                {/* Nodes */}
                                                                {[...Array(6)].map((_, i) => {
                                                                    const angle = (i * Math.PI * 2) / 6
                                                                    const x = Math.cos(angle) * 40
                                                                    const y = Math.sin(angle) * 40

                                                                    return (
                                                                        <motion.div
                                                                            key={i}
                                                                            className="absolute w-4 h-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                                                            style={{ left: "calc(50% - 8px)", top: "calc(50% - 8px)", x, y }}
                                                                            animate={{
                                                                                scale: [1, 1.3, 1],
                                                                                backgroundColor: [
                                                                                    "rgb(99, 102, 241)",
                                                                                    "rgb(168, 85, 247)",
                                                                                    "rgb(236, 72, 153)",
                                                                                    "rgb(99, 102, 241)",
                                                                                ],
                                                                            }}
                                                                            transition={{
                                                                                duration: 2,
                                                                                repeat: Number.POSITIVE_INFINITY,
                                                                                delay: i * 0.3,
                                                                                ease: "easeInOut",
                                                                            }}
                                                                        />
                                                                    )
                                                                })}

                                                                {/* Center node */}
                                                                <motion.div
                                                                    className="absolute left-1/2 top-1/2 w-8 h-8 -ml-4 -mt-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/20"
                                                                    animate={{
                                                                        scale: [1, 1.2, 1],
                                                                        boxShadow: [
                                                                            "0 0 0 0 rgba(168, 85, 247, 0.4)",
                                                                            "0 0 0 10px rgba(168, 85, 247, 0)",
                                                                            "0 0 0 0 rgba(168, 85, 247, 0)",
                                                                        ],
                                                                    }}
                                                                    transition={{
                                                                        duration: 2,
                                                                        repeat: Number.POSITIVE_INFINITY,
                                                                        ease: "easeInOut",
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="text-center">
                                                            <motion.h3
                                                                className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2"
                                                                animate={{
                                                                    opacity: [0.7, 1, 0.7],
                                                                }}
                                                                transition={{
                                                                    duration: 2,
                                                                    repeat: Number.POSITIVE_INFINITY,
                                                                    ease: "easeInOut",
                                                                }}
                                                            >
                                                                AI Processing
                                                            </motion.h3>
                                                            <p className="text-gray-400 mb-6">
                                                                Our AI is analyzing your document and creating a mindmap
                                                            </p>
                                                        </div>

                                                        <div className="space-y-4 max-w-md mx-auto">
                                                            <motion.div
                                                                className="flex items-center space-x-3 p-4 bg-slate-700/30 rounded-lg border border-indigo-500/20"
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 0.5 }}
                                                            >
                                                                <div className="bg-indigo-500/20 p-2 rounded-full">
                                                                    <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-white">Document Analysis</div>
                                                                    <div className="text-sm text-gray-400">Parsing structure and content</div>
                                                                </div>
                                                            </motion.div>

                                                            <motion.div
                                                                className="flex items-center space-x-3 p-4 bg-slate-700/30 rounded-lg border border-purple-500/20"
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 1.2 }}
                                                            >
                                                                <div className="bg-purple-500/20 p-2 rounded-full">
                                                                    <CheckCircle2 className="h-5 w-5 text-purple-400" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-white">Concept Extraction</div>
                                                                    <div className="text-sm text-gray-400">Identifying key topics and relationships</div>
                                                                </div>
                                                            </motion.div>

                                                            <motion.div
                                                                className="flex items-center space-x-3 p-4 bg-slate-700/30 rounded-lg border border-pink-500/20"
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 1.9 }}
                                                            >
                                                                <div className="bg-pink-500/20 p-2 rounded-full">
                                                                    <motion.div
                                                                        animate={{ rotate: 360 }}
                                                                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                                                    >
                                                                        <RefreshCw className="h-5 w-5 text-pink-400" />
                                                                    </motion.div>
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-white">Visualization Generation</div>
                                                                    <div className="text-sm text-gray-400">Creating interactive mindmap</div>
                                                                </div>
                                                            </motion.div>
                                                        </div>

                                                        {/* Animated progress bar */}
                                                        <motion.div
                                                            className="max-w-md mx-auto h-1 bg-slate-700 rounded-full overflow-hidden"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 2.5 }}
                                                        >
                                                            <motion.div
                                                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                                                                initial={{ width: "0%" }}
                                                                animate={{ width: "100%" }}
                                                                transition={{
                                                                    duration: 15,
                                                                    ease: "easeInOut",
                                                                }}
                                                            />
                                                        </motion.div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-center">
                                        <Button variant="outline" onClick={resetForm}>
                                            Cancel
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        )}

                        {currentStep === "error" && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardHeader>
                                        <CardTitle className="text-red-500 flex items-center">
                                            <AlertCircle className="h-5 w-5 mr-2" />
                                            Error Processing Your Document
                                        </CardTitle>
                                        <CardDescription className="text-gray-400">
                                            We encountered a problem while generating your mindmap
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                                            <p className="text-red-400">{errorMessage || "An unexpected error occurred"}</p>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-gray-300">Here are some things you can try:</p>
                                            <ul className="list-disc pl-5 space-y-2 text-gray-400">
                                                <li>Check that your PDF is not password protected</li>
                                                <li>Ensure your PDF contains readable text (not just scanned images)</li>
                                                <li>Try with a smaller PDF file (under 10MB)</li>
                                                <li>Check your internet connection and try again</li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between">
                                        <Button variant="outline" onClick={loadSampleData}>
                                            <History className="h-4 w-4 mr-2" />
                                            View Sample
                                        </Button>
                                        <Button
                                            onClick={resetForm}
                                            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
                                        >
                                            Try Again
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Features Section */}
                    <motion.div
                        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                            <div className="bg-indigo-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                <FileUp className="h-6 w-6 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Upload Any PDF</h3>
                            <p className="text-gray-400">
                                Simply upload your study materials, research papers, or any PDF document to get started.
                            </p>
                        </div>

                        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                            <div className="bg-purple-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                <ArrowRight className="h-6 w-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
                            <p className="text-gray-400">
                                Our advanced AI analyzes your document, extracts key concepts, and identifies relationships.
                            </p>
                        </div>

                        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                            <div className="bg-pink-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                <Share className="h-6 w-6 text-pink-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Interactive Results</h3>
                            <p className="text-gray-400">
                                Explore your interactive mindmap, zoom in on details, and share with classmates or colleagues.
                            </p>
                        </div>
                    </motion.div>

                    {/* User History Section (only shown when logged in) */}
                    {session?.user && (
                        <motion.div
                            className="mt-16"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <History className="h-5 w-5 mr-2" />
                                        Your Recent Mindmaps
                                    </CardTitle>
                                    <CardDescription className="text-gray-400">Access your previously generated mindmaps</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-center text-gray-400 py-6">
                                        Your generated mindmaps will appear here for easy access
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
