"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { AIVisualizationLoader } from "@/components/ui/ai-visualization-loader"
import { FileUp, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, RefreshCw, FileText, Download } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { uploadToS3 } from "@/lib/s3-upload"
import confetti from "canvas-confetti"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CoinBalanceDisplay } from "@/components/ui/coin-balance-display"
import { downloadMCQPDF } from "@/lib/pdf-generator"

// Define types for our MCQ data
interface MCQOption {
    id: string
    text: string
}

interface MCQ {
    question: string
    options: string[]
    correct_answer: string
    explanation: string
    userAnswer?: string
}

interface QuizResults {
    totalQuestions: number
    correctAnswers: number
    incorrectAnswers: number
    score: number
    timeTaken: number
}

export default function MCQGeneratorPage() {
    // Add session and router
    const { data: session } = useSession()
    const router = useRouter()

    // File upload states
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
    const [uploadProgress, setUploadProgress] = useState(0)
    const [s3Url, setS3Url] = useState<string>("")
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [activeTab, setActiveTab] = useState<string>("upload")

    // Quiz states
    const [mcqs, setMcqs] = useState<MCQ[]>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
    const [quizStartTime, setQuizStartTime] = useState<number | null>(null)
    const [quizEndTime, setQuizEndTime] = useState<number | null>(null)
    const [quizResults, setQuizResults] = useState<QuizResults | null>(null)

    // Add saving state
    const [isSaving, setIsSaving] = useState(false)
    const [savedResultId, setSavedResultId] = useState<string | null>(null)

    // Add coin checking state
    const [userCoins, setUserCoins] = useState<number | null>(null)
    const [isCheckingCoins, setIsCheckingCoins] = useState(false)

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null)
    const tabsRef = useRef<HTMLButtonElement>(null)

    // Fetch user coins when component mounts or session changes
    useEffect(() => {
        if (session?.user) {
            fetchUserCoins()
        }
    }, [session])

    // Redirect unauthenticated users after 10 seconds
    useEffect(() => {
        if (session !== undefined && !session?.user) {
            const timer = setTimeout(() => {
                router.push('/pricing')
            }, 10000) // 10 seconds

            return () => clearTimeout(timer)
        }
    }, [session, router])

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
        }

        setFile(selectedFile)
        setUploadStatus("idle")
        setErrorMessage("")
    }

    // Handle file upload and MCQ generation
    const generateMCQs = async () => {
        if (!file) return

        // Check if user is authenticated
        if (!session?.user) {
            toast.error("Please sign in to generate MCQs")
            return
        }

        // Check coins before proceeding
        if (userCoins === null) {
            toast.error("Unable to check coin balance. Please try again.")
            return
        }

        if (userCoins < 1) {
            toast.error("Insufficient coins! You need 1 coin to generate MCQs.")
            return
        }

        try {
            // Step 1: Upload file to S3
            setIsUploading(true)
            setUploadStatus("uploading")
            setUploadProgress(0)

            const uploadResult = await uploadToS3(file, (progress) => {
                setUploadProgress(progress)
            })

            if (!uploadResult.success || !uploadResult.url) {
                throw new Error(uploadResult.error || "Failed to upload file")
            }

            setS3Url(uploadResult.url)
            setUploadStatus("success")
            setIsUploading(false)

            // Step 2: Generate MCQs using our API route
            setIsGenerating(true)

            const response = await fetch("/api/generate-mcqs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pdf_url: uploadResult.url,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                if (response.status === 402) {
                    // Insufficient coins
                    throw new Error(errorData.error || "Insufficient coins")
                }
                throw new Error(errorData.error || "Failed to generate MCQs")
            }

            const data = await response.json()

            // Process the MCQs
            setMcqs(data.questions)

            // Reset quiz state
            setCurrentQuestionIndex(0)
            setSelectedOption(null)
            setIsAnswerSubmitted(false)
            setQuizStartTime(Date.now())
            setQuizEndTime(null)
            setQuizResults(null)

            setIsGenerating(false)

            toast.success(`${data.questions.length} questions generated! Remaining coins: ${data.remainingCoins}`)

            // Automatically switch to the quiz tab
            setActiveTab("generated")
        } catch (error) {
            console.error("Error in MCQ generation process:", error)
            setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred")
            setUploadStatus("error")
            setIsUploading(false)
            setIsGenerating(false)

            toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
        }
    }

    // Handle option selection
    const handleOptionSelect = (option: string) => {
        if (isAnswerSubmitted) return
        setSelectedOption(option)
    }

    // Submit answer
    const handleSubmitAnswer = () => {
        if (!selectedOption || isAnswerSubmitted) return

        // Update the MCQ with the user's answer
        const updatedMcqs = [...mcqs]
        updatedMcqs[currentQuestionIndex].userAnswer = selectedOption
        setMcqs(updatedMcqs)

        setIsAnswerSubmitted(true)

        // Show toast for correct/incorrect answer
        const isCorrect = selectedOption === mcqs[currentQuestionIndex].correct_answer

        if (isCorrect) {
            toast.success("Correct answer!")
        } else {
            toast.error(`Incorrect. The correct answer is ${mcqs[currentQuestionIndex].correct_answer}.`)
        }
    }

    // Move to next question
    const handleNextQuestion = () => {
        if (currentQuestionIndex < mcqs.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
            setSelectedOption(mcqs[currentQuestionIndex + 1].userAnswer || null)
            setIsAnswerSubmitted(!!mcqs[currentQuestionIndex + 1].userAnswer)
        } else {
            // End of quiz
            setQuizEndTime(Date.now())
            calculateResults()
        }
    }

    // Move to previous question
    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
            setSelectedOption(mcqs[currentQuestionIndex - 1].userAnswer || null)
            setIsAnswerSubmitted(!!mcqs[currentQuestionIndex - 1].userAnswer)
        }
    }

    // Calculate quiz results
    const calculateResults = () => {
        if (!quizStartTime) return

        const endTime = quizEndTime || Date.now()
        const timeTaken = Math.floor((endTime - quizStartTime) / 1000) // in seconds

        let correctAnswers = 0
        let incorrectAnswers = 0

        mcqs.forEach((mcq) => {
            if (mcq.userAnswer === mcq.correct_answer) {
                correctAnswers++
            } else if (mcq.userAnswer) {
                incorrectAnswers++
            }
        })

        const score = (correctAnswers / mcqs.length) * 100

        const results = {
            totalQuestions: mcqs.length,
            correctAnswers,
            incorrectAnswers,
            score,
            timeTaken,
        }

        setQuizResults(results)

        // Save results to database if user is logged in
        if (session?.user && file && s3Url) {
            saveResultsToDatabase(results)
        }

        // Show toast with results
        toast.success(`Quiz completed! Your score: ${Math.round(score)}%`)

        // Trigger confetti if score is good
        if (score >= 70) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
            })
        }
    }

    // Modified function to save results to database
    const saveResultsToDatabase = async (results: QuizResults) => {
        if (!session?.user) {
            toast.error("You must be logged in to save results")
            return
        }

        if (!file || !s3Url) {
            toast.error("Missing file information")
            return
        }

        setIsSaving(true)

        try {
            // console.log("Preparing to save MCQ results to database...")
            // console.log("Session user:", session.user)

            // Transform the mcqs to match the schema expected by the dashboard
            const formattedQuestions = mcqs.map(mcq => ({
                question: mcq.question,
                options: mcq.options,
                correct_answer: mcq.correct_answer,
                selected_answer: mcq.userAnswer,
                explanation: mcq.explanation
            }));

            // console.log("Formatted questions:", formattedQuestions.length)

            const requestData = {
                pdfName: file.name,
                pdfUrl: s3Url,
                totalQuestions: results.totalQuestions,
                correctAnswers: results.correctAnswers,
                incorrectAnswers: results.incorrectAnswers,
                score: results.score,
                timeTaken: results.timeTaken,
                questions: formattedQuestions,
            };

            // console.log("Sending request to save MCQ results:", requestData);

            const response = await fetch("/api/mcq-results", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            const responseText = await response.text();
            // console.log("Response from server:", response.status, responseText);

            if (!response.ok) {
                throw new Error(`Failed to save results: ${response.status} ${responseText}`);
            }

            try {
                const data = JSON.parse(responseText);
                setSavedResultId(data.resultId);
                // console.log("Successfully saved result with ID:", data.resultId);
                toast.success("Results saved to your dashboard");
            } catch (parseError) {
                console.error("Error parsing response as JSON:", parseError);
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            console.error("Error saving results:", error);
            toast.error(`Failed to save results: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    }

    // Reset quiz
    const resetQuiz = () => {
        // Reset all user answers
        const resetMcqs = mcqs.map((mcq) => ({
            ...mcq,
            userAnswer: undefined,
        }))

        setMcqs(resetMcqs)
        setCurrentQuestionIndex(0)
        setSelectedOption(null)
        setIsAnswerSubmitted(false)
        setQuizStartTime(Date.now())
        setQuizEndTime(null)
        setQuizResults(null)

        toast("Quiz reset! Start again.")
    }

    // Format time (seconds to MM:SS)
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
    }

    // Get letter for option index (0 -> A, 1 -> B, etc.)
    const getOptionLetter = (index: number) => {
        return String.fromCharCode(65 + index)
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

    // Add PDF download function
    const handleDownloadPDF = () => {
        if (mcqs.length === 0) {
            toast.error("No questions to download");
            return;
        }

        try {
            const title = file?.name?.replace('.pdf', '') || 'MCQ Quiz';
            const mcqsForPDF = mcqs.map(mcq => ({
                question: mcq.question,
                options: mcq.options,
                correct_answer: mcq.correct_answer,
                explanation: mcq.explanation
            }));

            downloadMCQPDF(title, mcqsForPDF);
            toast.success("PDF downloaded successfully!");
        } catch (error) {
            console.error("Error downloading PDF:", error);
            toast.error("Failed to download PDF");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
            <Navbar />

            {/* AI Visualization Loaders */}
            <AIVisualizationLoader isLoading={isUploading} message="Uploading your PDF" variant="upload" theme="blue" />

            <AIVisualizationLoader
                isLoading={isGenerating}
                message="AI is generating questions"
                variant="neural"
                theme="blue"
            />

            <main className="container mx-auto px-4 py-16">
                <motion.div
                    className="max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.h1
                        className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        MCQ Generator
                    </motion.h1>
                    <motion.p
                        className="text-gray-300 mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        Upload your study material in PDF format and our AI will generate comprehensive multiple-choice questions to
                        test your knowledge.
                    </motion.p>

                    <motion.p className="text-gray-400 mb-8 italic">
                        Note: You can view all your generated quizzes in your dashboard.
                    </motion.p>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="upload" ref={tabsRef}>
                                Upload PDF
                            </TabsTrigger>
                            <TabsTrigger value="generated" id="generated-tab" disabled={mcqs.length === 0}>
                                Quiz
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload">
                            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardHeader>
                                        <motion.div variants={itemVariants}>
                                            <CardTitle>Upload Your Study Material</CardTitle>
                                            <CardDescription className="text-gray-400">
                                                Upload a PDF file to generate multiple-choice questions
                                            </CardDescription>
                                        </motion.div>
                                    </CardHeader>
                                    <CardContent>
                                        <motion.div className="space-y-6" variants={containerVariants}>
                                            <motion.div variants={itemVariants}>
                                                <div
                                                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                            ${uploadStatus === "error" ? "border-red-500 bg-red-500/10" : "border-slate-600 hover:bg-slate-700/50"}`}
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        className="hidden"
                                                        accept=".pdf"
                                                        onChange={handleFileChange}
                                                    />
                                                    <AnimatePresence mode="wait">
                                                        {uploadStatus === "error" ? (
                                                            <motion.div
                                                                key="error"
                                                                initial={{ scale: 0.8, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                exit={{ scale: 0.8, opacity: 0 }}
                                                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                            >
                                                                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                key="upload"
                                                                initial={{ scale: 0.8, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                exit={{ scale: 0.8, opacity: 0 }}
                                                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                            >
                                                                <FileUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                    <p className="text-lg font-medium mb-1">
                                                        {file ? file.name : "Drag & drop or click to upload"}
                                                    </p>
                                                    <p className="text-sm text-gray-400">Supports PDF files up to 10MB</p>
                                                    {errorMessage && <p className="text-sm text-red-500 mt-2">{errorMessage}</p>}
                                                </div>
                                            </motion.div>

                                            <AnimatePresence>
                                                {file && uploadStatus !== "error" && (
                                                    <motion.div
                                                        className="space-y-4"
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                                            <div className="flex items-center">
                                                                <FileText className="h-5 w-5 mr-2 text-blue-400" />
                                                                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                                            </div>
                                                            {uploadStatus === "success" ? (
                                                                <motion.div
                                                                    initial={{ scale: 0, opacity: 0 }}
                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                                                >
                                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                                </motion.div>
                                                            ) : null}
                                                        </div>

                                                        {/* Coin Balance Display */}
                                                        {session?.user && (
                                                            <CoinBalanceDisplay
                                                                coins={userCoins}
                                                                requiredCoins={1}
                                                                isLoading={isCheckingCoins}
                                                            />
                                                        )}

                                                        {uploadStatus === "uploading" && !isUploading && (
                                                            <motion.div
                                                                className="space-y-2"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                <div className="flex justify-between text-sm">
                                                                    <span>Uploading...</span>
                                                                    <span>{uploadProgress}%</span>
                                                                </div>
                                                                <Progress value={uploadProgress} className="h-2" />
                                                            </motion.div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end">
                                        <Button
                                            onClick={generateMCQs}
                                            disabled={!file || isUploading || isGenerating || !session?.user || (userCoins !== null && userCoins < 1)}
                                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                                        >
                                            {!session?.user ? "Sign In Required" : 
                                             userCoins !== null && userCoins < 1 ? "Insufficient Coins" : 
                                             "Generate MCQs"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="generated">
                            {mcqs.length > 0 ? (
                                <motion.div
                                    className="space-y-6"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {/* Quiz Header */}
                                    <motion.div
                                        className="flex justify-between items-center"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center space-x-2">
                                            {quizResults && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                >
                                                    <Button variant="outline" size="sm" onClick={resetQuiz}>
                                                        <RefreshCw className="h-4 w-4 mr-1" />
                                                        Restart Quiz
                                                    </Button>
                                                </motion.div>
                                            )}
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleDownloadPDF}
                                                    className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 hover:bg-green-500/20"
                                                >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Download PDF
                                                </Button>
                                            </motion.div>
                                        </div>
                                        <motion.div
                                            className="text-sm text-gray-400"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.2, duration: 0.3 }}
                                        >
                                            Question {currentQuestionIndex + 1} of {mcqs.length}
                                        </motion.div>
                                    </motion.div>

                                    {/* Progress Bar */}
                                    <motion.div
                                        initial={{ scaleX: 0, originX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                    >
                                        <Progress value={(currentQuestionIndex / mcqs.length) * 100} className="h-1.5 bg-slate-700" />
                                    </motion.div>

                                    {/* Quiz Results */}
                                    <AnimatePresence>
                                        {quizResults && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            >
                                                <Card className="bg-slate-800/50 border-slate-700 mb-6">
                                                    <CardHeader>
                                                        <CardTitle className="text-center">Quiz Results</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="flex flex-col items-center">
                                                            <motion.div
                                                                className="relative w-32 h-32 mb-4"
                                                                initial={{ scale: 0.8, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                transition={{ delay: 0.2, duration: 0.5 }}
                                                            >
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <motion.span
                                                                        className="text-3xl font-bold"
                                                                        initial={{ scale: 0.5, opacity: 0 }}
                                                                        animate={{ scale: 1, opacity: 1 }}
                                                                        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 25 }}
                                                                    >
                                                                        {Math.round(quizResults.score)}%
                                                                    </motion.span>
                                                                </div>
                                                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                                                    <circle
                                                                        className="text-slate-700 stroke-current"
                                                                        strokeWidth="10"
                                                                        cx="50"
                                                                        cy="50"
                                                                        r="40"
                                                                        fill="transparent"
                                                                    ></circle>
                                                                    <motion.circle
                                                                        className={`${quizResults.score >= 70
                                                                                ? "text-green-500"
                                                                                : quizResults.score >= 40
                                                                                    ? "text-yellow-500"
                                                                                    : "text-red-500"
                                                                            } stroke-current`}
                                                                        strokeWidth="10"
                                                                        strokeLinecap="round"
                                                                        cx="50"
                                                                        cy="50"
                                                                        r="40"
                                                                        fill="transparent"
                                                                        transform="rotate(-90 50 50)"
                                                                        initial={{ strokeDasharray: "0 251" }}
                                                                        animate={{ strokeDasharray: `${quizResults.score * 2.51} 251` }}
                                                                        transition={{ delay: 0.3, duration: 1.5, ease: "easeOut" }}
                                                                    ></motion.circle>
                                                                </svg>
                                                            </motion.div>

                                                            <motion.div
                                                                className="grid grid-cols-2 gap-4 w-full max-w-xs"
                                                                variants={containerVariants}
                                                                initial="hidden"
                                                                animate="visible"
                                                            >
                                                                <motion.div
                                                                    variants={itemVariants}
                                                                    className="bg-slate-700/50 p-3 rounded-lg text-center"
                                                                >
                                                                    <div className="text-green-400 font-medium">Correct</div>
                                                                    <div className="text-2xl font-bold">{quizResults.correctAnswers}</div>
                                                                </motion.div>
                                                                <motion.div
                                                                    variants={itemVariants}
                                                                    className="bg-slate-700/50 p-3 rounded-lg text-center"
                                                                >
                                                                    <div className="text-red-400 font-medium">Incorrect</div>
                                                                    <div className="text-2xl font-bold">{quizResults.incorrectAnswers}</div>
                                                                </motion.div>
                                                                <motion.div
                                                                    variants={itemVariants}
                                                                    className="bg-slate-700/50 p-3 rounded-lg text-center"
                                                                >
                                                                    <div className="text-blue-400 font-medium">Unanswered</div>
                                                                    <div className="text-2xl font-bold">
                                                                        {quizResults.totalQuestions -
                                                                            quizResults.correctAnswers -
                                                                            quizResults.incorrectAnswers}
                                                                    </div>
                                                                </motion.div>
                                                                <motion.div
                                                                    variants={itemVariants}
                                                                    className="bg-slate-700/50 p-3 rounded-lg text-center"
                                                                >
                                                                    <div className="text-purple-400 font-medium">Time</div>
                                                                    <div className="text-2xl font-bold">{formatTime(quizResults.timeTaken)}</div>
                                                                </motion.div>
                                                            </motion.div>
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="flex justify-center">
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.7, duration: 0.3 }}
                                                        >
                                                            <Button
                                                                onClick={resetQuiz}
                                                                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                                                            >
                                                                Try Again
                                                            </Button>
                                                        </motion.div>
                                                    </CardFooter>
                                                </Card>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Question Card */}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentQuestionIndex}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        >
                                            <Card className="bg-slate-800 border-slate-700">
                                                <CardHeader>
                                                    <CardTitle className="flex">
                                                        <span className="font-bold text-lg mr-2">{currentQuestionIndex + 1}.</span>
                                                        <span>{mcqs[currentQuestionIndex].question}</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <motion.div
                                                        className="space-y-3"
                                                        variants={containerVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                    >
                                                        {mcqs[currentQuestionIndex].options.map((option, index) => {
                                                            const optionLetter = getOptionLetter(index)
                                                            const isSelected = selectedOption === optionLetter
                                                            const isCorrect = mcqs[currentQuestionIndex].correct_answer === optionLetter
                                                            const isIncorrect = isAnswerSubmitted && isSelected && !isCorrect

                                                            let optionClass = "border border-slate-600 bg-slate-700/50 hover:bg-slate-700"

                                                            if (isAnswerSubmitted) {
                                                                if (isCorrect) {
                                                                    optionClass = "border border-green-500 bg-green-500/20 hover:bg-green-500/30"
                                                                } else if (isIncorrect) {
                                                                    optionClass = "border border-red-500 bg-red-500/20 hover:bg-red-500/30"
                                                                }
                                                            } else if (isSelected) {
                                                                optionClass = "border-2 border-blue-500 bg-blue-500/20 hover:bg-blue-500/30"
                                                            }

                                                            return (
                                                                <motion.div
                                                                    key={index}
                                                                    variants={itemVariants}
                                                                    className={`p-3 rounded-lg transition-all cursor-pointer ${optionClass}`}
                                                                    onClick={() => handleOptionSelect(optionLetter)}
                                                                    whileHover={{ scale: 1.01 }}
                                                                    whileTap={{ scale: 0.99 }}
                                                                >
                                                                    <div className="flex items-start">
                                                                        <div
                                                                            className={`flex items-center justify-center w-6 h-6 rounded-full mr-3 flex-shrink-0 ${isSelected ? "bg-blue-500 text-white" : "bg-slate-600 text-gray-300"
                                                                                }`}
                                                                        >
                                                                            {optionLetter}
                                                                        </div>
                                                                        <p>{option}</p>
                                                                    </div>
                                                                </motion.div>
                                                            )
                                                        })}
                                                    </motion.div>

                                                    {/* Explanation */}
                                                    <AnimatePresence>
                                                        {isAnswerSubmitted && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                transition={{ duration: 0.3 }}
                                                                className="mt-6 p-4 bg-slate-700/30 rounded-lg border-l-4 border-blue-500"
                                                            >
                                                                <p className="text-sm font-medium text-blue-400 mb-1">Explanation:</p>
                                                                <p className="text-sm text-gray-300">{mcqs[currentQuestionIndex].explanation}</p>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </CardContent>
                                                <CardFooter className="flex justify-between">
                                                    <Button variant="outline" onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0}>
                                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                                        Previous
                                                    </Button>

                                                    {!isAnswerSubmitted ? (
                                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                            <Button
                                                                onClick={handleSubmitAnswer}
                                                                disabled={!selectedOption}
                                                                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                                                            >
                                                                Submit Answer
                                                            </Button>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                            <Button
                                                                onClick={handleNextQuestion}
                                                                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                                                            >
                                                                {currentQuestionIndex === mcqs.length - 1 ? (
                                                                    quizResults ? (
                                                                        "Review Results"
                                                                    ) : (
                                                                        "Finish Quiz"
                                                                    )
                                                                ) : (
                                                                    <>
                                                                        Next
                                                                        <ChevronRight className="h-4 w-4 ml-1" />
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </motion.div>
                                                    )}
                                                </CardFooter>
                                            </Card>
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Question Navigation */}
                                    <motion.div
                                        className="flex flex-wrap gap-2 justify-center mt-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                    >
                                        {mcqs.map((mcq, index) => {
                                            let buttonClass = "w-10 h-10 rounded-full flex items-center justify-center text-sm"

                                            if (index === currentQuestionIndex) {
                                                buttonClass += " bg-blue-500 text-white"
                                            } else if (mcq.userAnswer) {
                                                buttonClass +=
                                                    mcq.userAnswer === mcq.correct_answer
                                                        ? " bg-green-500/20 text-green-400 border border-green-500"
                                                        : " bg-red-500/20 text-red-400 border border-red-500"
                                            } else {
                                                buttonClass += " bg-slate-700/50 text-gray-400 border border-slate-600"
                                            }

                                            return (
                                                <motion.button
                                                    key={index}
                                                    className={buttonClass}
                                                    onClick={() => {
                                                        setCurrentQuestionIndex(index)
                                                        setSelectedOption(mcqs[index].userAnswer || null)
                                                        setIsAnswerSubmitted(!!mcqs[index].userAnswer)
                                                    }}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    {index + 1}
                                                </motion.button>
                                            )
                                        })}
                                    </motion.div>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <p className="text-gray-400">No questions generated yet.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </main>

            <Footer />
        </div>
    )
}

