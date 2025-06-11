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
import { FileUp, CheckCircle2, AlertCircle, BookOpen, Download, FileText } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { uploadToS3 } from "@/lib/s3-upload"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CoinBalanceDisplay } from "@/components/ui/coin-balance-display"

export default function ShortNotesGeneratorPage() {
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

    // Generated notes states
    const [notesUrl, setNotesUrl] = useState<string>("")
    const [isDownloading, setIsDownloading] = useState(false)

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

    // Handle file upload and notes generation
    const generateShortNotes = async () => {
        if (!file) return

        // Check if user is authenticated
        if (!session?.user) {
            toast.error("Please sign in to generate short notes")
            return
        }

        // Check coins before proceeding
        if (userCoins === null) {
            toast.error("Unable to check coin balance. Please try again.")
            return
        }

        if (userCoins < 1) {
            toast.error("Insufficient coins! You need 1 coin to generate short notes.")
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

            // Step 2: Generate short notes using our API route
            setIsGenerating(true)

            const response = await fetch("/api/generate-short-notes", {
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
                throw new Error(errorData.error || "Failed to generate short notes")
            }

            const data = await response.json()

            setNotesUrl(data.file_url)
            setIsGenerating(false)

            toast.success(`Short notes generated successfully! Remaining coins: ${data.remainingCoins}`)

            // Step 3: Save results to database if user is logged in
            if (session?.user) {
                await saveResults(data.file_url, file.name, uploadResult.url)
            }

            // Automatically switch to the generated tab
            setActiveTab("generated")
        } catch (error) {
            console.error("Error in short notes generation process:", error)
            setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred")
            setUploadStatus("error")
            setIsUploading(false)
            setIsGenerating(false)

            toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
        }
    }

    // New function to save results
    const saveResults = async (notesUrl: string, pdfName: string, pdfUrl: string) => {
        if (!session?.user) {
            toast.error("You must be logged in to save results")
            return
        }

        setIsSaving(true)

        try {
            const response = await fetch("/api/short-notes-results", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pdfName,
                    pdfUrl,
                    notesUrl,
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

    // Download generated notes
    const handleDownloadNotes = async () => {
        if (!notesUrl) {
            toast.error("No notes to download")
            return
        }

        setIsDownloading(true)
        try {
            const response = await fetch(notesUrl)
            if (!response.ok) throw new Error('Download failed')
            
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.style.display = 'none'
            a.href = url
            a.download = file?.name?.replace('.pdf', '_short_notes.pdf') || 'short_notes.pdf'
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            
            toast.success("Short notes downloaded successfully!")
        } catch (error) {
            console.error("Error downloading notes:", error)
            toast.error("Failed to download notes")
        } finally {
            setIsDownloading(false)
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
                message="AI is creating short notes"
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
                        className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Short Notes Generator
                    </motion.h1>
                    <motion.p
                        className="text-gray-300 mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        Transform your lengthy study materials into concise, easy-to-review notes. Our AI analyzes your PDF
                        and creates summarized notes with key points and important concepts.
                    </motion.p>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="upload">Upload PDF</TabsTrigger>
                            <TabsTrigger value="generated" disabled={!notesUrl}>
                                Generated Notes
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload">
                            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardHeader>
                                        <motion.div variants={itemVariants}>
                                            <CardTitle>Upload Your Study Material</CardTitle>
                                            <CardDescription className="text-gray-400">
                                                Upload a PDF file to generate concise short notes
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
                                                                <BookOpen className="h-5 w-5 mr-2 text-green-400" />
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
                                            onClick={generateShortNotes}
                                            disabled={!file || isUploading || isGenerating || !session?.user || (session?.user && userCoins !== null && userCoins < 1)}
                                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                        >
                                            {!session?.user ? "Sign In Required" : 
                                             userCoins !== null && userCoins < 1 ? "Insufficient Coins" : 
                                             "Generate Short Notes"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="generated">
                            {notesUrl ? (
                                <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                                    <motion.div 
                                        className="flex justify-between items-center"
                                        variants={itemVariants}
                                    >
                                        <h2 className="text-2xl font-bold">Short Notes Generated</h2>
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <Card className="bg-slate-800 border-slate-700">
                                            <CardHeader>
                                                <CardTitle className="flex items-center">
                                                    <FileText className="h-5 w-5 mr-2 text-green-400" />
                                                    Your Short Notes are Ready!
                                                </CardTitle>
                                                <CardDescription className="text-gray-400">
                                                    AI has successfully condensed your study material into concise notes
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                                                    <p className="text-green-400 font-medium flex items-center">
                                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                                        Short notes successfully generated from: {file?.name}
                                                    </p>
                                                    <p className="text-green-200 text-sm mt-1">
                                                        Your concise study notes are ready for download
                                                    </p>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex justify-center">
                                                <Button
                                                    onClick={handleDownloadNotes}
                                                    disabled={isDownloading}
                                                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    {isDownloading ? "Downloading..." : "Download Short Notes"}
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <p className="text-gray-400">No short notes generated yet.</p>
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
