"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Modal } from "@/components/ui/modal"
import { AIVisualizationLoader } from "@/components/ui/ai-visualization-loader"
import { FileUp, CheckCircle2, AlertCircle, Eye, BookOpen, Download } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { uploadToS3 } from "@/lib/s3-upload"
import { useSession } from "next-auth/react"
import { CoinBalanceDisplay } from "@/components/ui/coin-balance-display"
import { downloadSubjectivePDF } from "@/lib/pdf-generator"

interface SubjectiveQuestion {
    question: string
    answer: string
}

export default function SubjectiveQAPage() {
    // Add session
    const { data: session } = useSession()

    // File upload states
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
    const [uploadProgress, setUploadProgress] = useState(0)
    const [s3Url, setS3Url] = useState<string>("")
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [activeTab, setActiveTab] = useState<string>("upload")

    // Questions states
    const [questions, setQuestions] = useState<SubjectiveQuestion[]>([])

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedQuestion, setSelectedQuestion] = useState<SubjectiveQuestion | null>(null)

    // Add new state
    const [isSaving, setIsSaving] = useState(false)
    const [savedResultId, setSavedResultId] = useState<string | null>(null)

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

    // Handle file upload and question generation
    const generateQuestions = async () => {
        if (!file) return

        // Check if user is authenticated
        if (!session?.user) {
            toast.error("Please sign in to generate questions")
            return
        }

        // Check coins before proceeding
        if (userCoins === null) {
            toast.error("Unable to check coin balance. Please try again.")
            return
        }

        if (userCoins < 1) {
            toast.error("Insufficient coins! You need 1 coin to generate questions.")
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

            // Step 2: Generate questions using our API route
            setIsGenerating(true)

            const response = await fetch("/api/generate-subjective", {
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
                throw new Error(errorData.error || "Failed to generate questions")
            }

            const data = await response.json()

            setQuestions(data.questions)
            setIsGenerating(false)

            toast.success(`${data.questions.length} questions generated! Remaining coins: ${data.remainingCoins}`)

            // Step 3: Save results to database if user is logged in
            if (session?.user) {
                await saveResults(data.questions, file.name, uploadResult.url)
            }

            // Automatically switch to the questions tab
            setActiveTab("generated")
        } catch (error) {
            console.error("Error in question generation process:", error)
            setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred")
            setUploadStatus("error")
            setIsUploading(false)
            setIsGenerating(false)

            toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
        }
    }

    // New function to save results
    const saveResults = async (questions: SubjectiveQuestion[], pdfName: string, pdfUrl: string) => {
        if (!session?.user) {
            toast.error("You must be logged in to save results")
            return
        }

        setIsSaving(true)

        try {
            const response = await fetch("/api/subjective-results", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pdfName,
                    pdfUrl,
                    questions,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to save results")
            }

            const data = await response.json()
            setSavedResultId(data.resultId)
            toast.success("Results saved to your dashboard")
        } catch (error) {
            console.error("Error saving results:", error)
            toast.error("Failed to save results")
        } finally {
            setIsSaving(false)
        }
    }

    // Open modal with selected question
    const openAnswerModal = (question: SubjectiveQuestion) => {
        setSelectedQuestion(question)
        setIsModalOpen(true)
    }

    // Add PDF download functions
    const handleDownloadQuestionsOnly = () => {
        if (questions.length === 0) {
            toast.error("No questions to download")
            return
        }

        try {
            const title = file?.name?.replace('.pdf', '') || 'Subjective Questions'
            const questionsForPDF = questions.map(q => ({
                question: q.question,
                answer: q.answer
            }))

            downloadSubjectivePDF(title, questionsForPDF, undefined, false)
            toast.success("Questions PDF downloaded successfully!")
        } catch (error) {
            console.error("Error downloading PDF:", error)
            toast.error("Failed to download PDF")
        }
    }

    const handleDownloadWithAnswers = () => {
        if (questions.length === 0) {
            toast.error("No questions to download")
            return
        }

        try {
            const title = file?.name?.replace('.pdf', '') || 'Subjective Questions'
            const questionsForPDF = questions.map(q => ({
                question: q.question,
                answer: q.answer
            }))

            downloadSubjectivePDF(title, questionsForPDF, undefined, true)
            toast.success("Questions with answers PDF downloaded successfully!")
        } catch (error) {
            console.error("Error downloading PDF:", error)
            toast.error("Failed to download PDF")
        }
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

            {/* AI Visualization Loaders */}
            <AIVisualizationLoader isLoading={isUploading} message="Uploading your PDF" variant="upload" theme="blue" />

            <AIVisualizationLoader
                isLoading={isGenerating}
                message="AI is creating subjective questions"
                variant="pulse"
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
                        className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Subjective Question Generator
                    </motion.h1>
                    <motion.p
                        className="text-gray-300 mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        Upload your study material in PDF format and our AI will generate thought-provoking subjective questions to
                        deepen your understanding.
                    </motion.p>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="upload">Upload PDF</TabsTrigger>
                            <TabsTrigger value="generated" disabled={questions.length === 0}>
                                Questions
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload">
                            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardHeader>
                                        <motion.div variants={itemVariants}>
                                            <CardTitle>Upload Your Study Material</CardTitle>
                                            <CardDescription className="text-gray-400">
                                                Upload a PDF file to generate subjective questions
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
                                                                <BookOpen className="h-5 w-5 mr-2 text-blue-400" />
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
                                                        {session?.user && file && (
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
                                            onClick={generateQuestions}
                                            disabled={!file || isUploading || isGenerating || !session?.user || (session?.user && userCoins !== null && userCoins < 1)}
                                            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                                        >
                                            {!session?.user ? "Sign In Required" : 
                                             userCoins !== null && userCoins < 1 ? "Insufficient Coins" : 
                                             "Generate Questions"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="generated">
                            {questions.length > 0 ? (
                                <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                                    <motion.div 
                                        className="flex justify-between items-center"
                                        variants={itemVariants}
                                    >
                                        <h2 className="text-2xl font-bold">Generated Questions</h2>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={handleDownloadQuestionsOnly}
                                                className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/30 hover:bg-blue-500/20"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Questions Only
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleDownloadWithAnswers}
                                                className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 hover:bg-green-500/20"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                With Answers
                                            </Button>
                                        </div>
                                    </motion.div>

                                    {questions.map((question, index) => (
                                        <motion.div key={index} variants={itemVariants}>
                                            <Card className="bg-slate-800 border-slate-700 hover:bg-slate-800/80 transition-colors">
                                                <CardHeader>
                                                    <CardTitle className="flex">
                                                        <span className="font-bold text-lg mr-2">{index + 1}.</span>
                                                        <span>{question.question}</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardFooter className="flex justify-end">
                                                    <Button
                                                        onClick={() => openAnswerModal(question)}
                                                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Answer
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        </motion.div>
                                    ))}
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

            {/* Answer Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {selectedQuestion && (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            Question & Answer
                        </h2>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-2 text-gray-200">Question:</h3>
                            <p className="text-gray-300 p-4 bg-slate-700/50 rounded-lg border-l-4 border-blue-500">
                                {selectedQuestion.question}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2 text-gray-200">Answer:</h3>
                            <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-800/30">
                                <p className="text-gray-300 whitespace-pre-line">{selectedQuestion.answer}</p>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Footer />
        </div>
    )
}

