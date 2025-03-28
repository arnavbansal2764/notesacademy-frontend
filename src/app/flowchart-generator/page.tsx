"use client"

import type React from "react"

import { useState, useRef } from "react"
import toast, { Toaster } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Loader } from "@/components/ui/loader"
import { FileUp, CheckCircle2, Download, Share2, Palette } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { uploadToS3 } from "@/lib/s3-upload"
import { MindMap } from "@/components/mindmap/mindmap"
import html2canvas from "html2canvas"

interface MindMapNode {
    id: string
    text: string
    children: MindMapNode[]
    style?: string
}

interface MindMapData {
    root: {
        id: string
        text: string
        children: MindMapNode[]
    }
}

export default function FlowchartGeneratorPage() {
    // File upload states
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
    const [uploadProgress, setUploadProgress] = useState(0)
    const [s3Url, setS3Url] = useState<string>("")
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [activeTab, setActiveTab] = useState<string>("upload")

    // Visualization states
    const [generatedVisualization, setGeneratedVisualization] = useState<boolean>(false)
    const [mindmapData, setMindmapData] = useState<MindMapData | null>(null)
    const [activeTheme, setActiveTheme] = useState<"blue" | "purple" | "green" | "orange">("blue")

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null)
    const mindmapContainerRef = useRef<HTMLDivElement>(null)

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

    const handleUpload = async () => {
        if (!file) return

        setIsUploading(true)
        setUploadStatus("uploading")
        setUploadProgress(0)

        const uploadToastId = toast.loading("Uploading your PDF...")

        try {
            const uploadResult = await uploadToS3(file, (progress) => {
                setUploadProgress(progress)
            })

            if (!uploadResult.success || !uploadResult.url) {
                throw new Error(uploadResult.error || "Failed to upload file")
            }

            setS3Url(uploadResult.url)
            setUploadStatus("success")
            setIsUploading(false)

            toast.success("PDF uploaded successfully", {
                id: uploadToastId,
            })
        } catch (error) {
            console.error("Error uploading file:", error)
            toast.error("Failed to upload file", {
                id: uploadToastId,
            })
            setUploadStatus("error")
            setIsUploading(false)
        }
    }

    const handleGenerate = async () => {
        if (!s3Url) return

        setIsGenerating(true)
        const generatingToastId = toast.loading("Generating your visualization...")

        try {
            const response = await fetch("/api/generate-mindmap", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pdf_url: s3Url,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to generate visualization")
            }

            // Parse the response
            const data = await response.json()

            // For demonstration, we'll use sample data if the response doesn't match our expected format
            // In a real implementation, you would adapt this to handle the actual API response format
            if (data.root) {
                setMindmapData(data)
            } else {
                // Sample data for demonstration
                setMindmapData({
                    root: {
                        id: "root",
                        text: file?.name?.replace(".pdf", "") || "Document Mindmap",
                        children: [
                            {
                                id: "topic1",
                                text: "Main Topic 1",
                                children: [
                                    {
                                        id: "topic1_sub1",
                                        text: "Subtopic 1.1",
                                        children: [
                                            {
                                                id: "topic1_sub1_p1",
                                                text: "Point 1.1.1",
                                                children: [],
                                            },
                                            {
                                                id: "topic1_sub1_p2",
                                                text: "Point 1.1.2",
                                                children: [],
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                id: "topic2",
                                text: "Main Topic 2",
                                children: [
                                    {
                                        id: "topic2_sub1",
                                        text: "Subtopic 2.1",
                                        children: [],
                                    },
                                ],
                            },
                        ],
                    },
                })
            }

            setGeneratedVisualization(true)
            setActiveTab("generated")

            toast.success("Visualization generated successfully!", {
                id: generatingToastId,
            })
        } catch (error) {
            console.error("Error generating visualization:", error)
            toast.error(error instanceof Error ? error.message : "Failed to generate visualization", {
                id: generatingToastId,
            })
        } finally {
            setIsGenerating(false)
        }
    }

    const downloadVisualization = async () => {
        if (!mindmapContainerRef.current) return

        try {
            toast.loading("Preparing download...")

            const element = mindmapContainerRef.current
            const canvas = await html2canvas(element, {
                backgroundColor: "#0f172a", // Match the background color
                scale: 2, // Higher quality
            })

            const dataUrl = canvas.toDataURL("image/png")
            const link = document.createElement("a")
            link.download = `mindmap-${new Date().toISOString().slice(0, 10)}.png`
            link.href = dataUrl
            link.click()

            toast.dismiss()
            toast.success("Visualization downloaded!")
        } catch (error) {
            console.error("Error downloading visualization:", error)
            toast.dismiss()
            toast.error("Failed to download visualization")
        }
    }

    const colorThemes = [
        { id: "blue", name: "Ocean Blue", primary: "bg-blue-500", secondary: "bg-cyan-400" },
        { id: "purple", name: "Royal Purple", primary: "bg-purple-500", secondary: "bg-indigo-400" },
        { id: "green", name: "Forest Green", primary: "bg-emerald-500", secondary: "bg-green-400" },
        { id: "orange", name: "Sunset Orange", primary: "bg-orange-500", secondary: "bg-amber-400" },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
            <Navbar />

            {/* React Hot Toast */}
            <Toaster position="top-right" />

            <main className="container mx-auto px-4 py-16">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Mindmap & Concept Map Generator
                    </h1>
                    <p className="text-gray-300 mb-8">
                        Transform complex concepts into visual, easy-to-understand mindmaps. Our AI analyzes your PDF content and
                        creates beautiful, interactive visualizations.
                    </p>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="upload">Upload PDF</TabsTrigger>
                            <TabsTrigger value="generated" disabled={!generatedVisualization}>
                                Generated Visualization
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload">
                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle>Upload Your Study Material</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Upload a PDF file to generate a mindmap or concept map
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:bg-slate-700/50 transition-colors cursor-pointer">
                                            <input
                                                type="file"
                                                id="pdf-upload"
                                                className="hidden"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                                ref={fileInputRef}
                                            />
                                            <label htmlFor="pdf-upload" className="cursor-pointer">
                                                <FileUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                                <p className="text-lg font-medium mb-1">
                                                    {file ? file.name : "Drag & drop or click to upload"}
                                                </p>
                                                <p className="text-sm text-gray-400">Supports PDF files up to 10MB</p>
                                            </label>
                                        </div>

                                        {file && (
                                            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                                <div className="flex items-center">
                                                    <FileUp className="h-5 w-5 mr-2 text-purple-400" />
                                                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                                </div>
                                                {uploadStatus === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                                            </div>
                                        )}

                                        {uploadStatus === "uploading" && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Uploading...</span>
                                                    <span>{uploadProgress}%</span>
                                                </div>
                                                <Progress value={uploadProgress} className="h-2" />
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="detail-level">Detail Level</Label>
                                                <select id="detail-level" className="w-full rounded-md bg-slate-700 border-slate-600 p-2">
                                                    <option value="simple">Simple Overview</option>
                                                    <option value="moderate" selected>
                                                        Moderate Detail
                                                    </option>
                                                    <option value="detailed">Comprehensive Detail</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="initial-state">Initial State</Label>
                                                <select id="initial-state" className="w-full rounded-md bg-slate-700 border-slate-600 p-2">
                                                    <option value="collapsed">Collapsed (Root Only)</option>
                                                    <option value="partial" selected>
                                                        Partially Expanded
                                                    </option>
                                                    <option value="expanded">Fully Expanded</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Color Theme</Label>
                                            <div className="flex flex-wrap gap-3">
                                                {colorThemes.map((theme) => (
                                                    <button
                                                        key={theme.id}
                                                        onClick={() => setActiveTheme(theme.id as any)}
                                                        className={`flex items-center space-x-2 p-2 rounded-md transition-all ${activeTheme === theme.id ? "ring-2 ring-white" : ""
                                                            }`}
                                                    >
                                                        <div className="flex">
                                                            <div className={`w-6 h-6 rounded-l-md ${theme.primary}`}></div>
                                                            <div className={`w-6 h-6 rounded-r-md ${theme.secondary}`}></div>
                                                        </div>
                                                        <span className="text-sm">{theme.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={handleUpload}
                                        disabled={!file || isUploading || uploadStatus === "success"}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader variant="dots" size="sm" className="mr-2" />
                                                Uploading...
                                            </>
                                        ) : (
                                            "Upload"
                                        )}
                                    </Button>
                                    <Button
                                        onClick={handleGenerate}
                                        disabled={uploadStatus !== "success" || isGenerating}
                                        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader variant="spinner" size="sm" className="mr-2" />
                                                Generating...
                                            </>
                                        ) : (
                                            "Generate Mindmap"
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="generated">
                            {generatedVisualization && mindmapData && (
                                <div className="space-y-6">
                                    <Card className="bg-slate-800 border-slate-700">
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <CardTitle>{mindmapData.root.text}</CardTitle>
                                                    <CardDescription className="text-gray-400">
                                                        Generated from {file?.name || "your PDF"}
                                                    </CardDescription>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex items-center"
                                                        onClick={downloadVisualization}
                                                    >
                                                        <Download className="h-4 w-4 mr-1" />
                                                        <span>Export</span>
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="flex items-center">
                                                        <Share2 className="h-4 w-4 mr-1" />
                                                        <span>Share</span>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex items-center"
                                                        onClick={() => {
                                                            // Cycle through themes
                                                            const themes: Array<"blue" | "purple" | "green" | "orange"> = [
                                                                "blue",
                                                                "purple",
                                                                "green",
                                                                "orange",
                                                            ]
                                                            const currentIndex = themes.indexOf(activeTheme)
                                                            const nextIndex = (currentIndex + 1) % themes.length
                                                            setActiveTheme(themes[nextIndex])
                                                        }}
                                                    >
                                                        <Palette className="h-4 w-4 mr-1" />
                                                        <span>Change Theme</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div ref={mindmapContainerRef}>
                                                <MindMap data={mindmapData} theme={activeTheme} expanded={false} />
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <div className="w-full">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="font-medium">Visualization Details</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="p-3 bg-slate-700/30 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                                                                <span>Type</span>
                                                            </div>
                                                            <span className="text-sm text-gray-300">Mindmap</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-slate-700/30 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                                                <span>Nodes</span>
                                                            </div>
                                                            <span className="text-sm text-gray-300">{countNodes(mindmapData.root)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-slate-700/30 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                                                <span>Theme</span>
                                                            </div>
                                                            <span className="text-sm text-gray-300 capitalize">{activeTheme}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardFooter>
                                    </Card>

                                    <div className="flex justify-center">
                                        <Button
                                            onClick={() => {
                                                setFile(null)
                                                setUploadStatus("idle")
                                                setGeneratedVisualization(false)
                                                setMindmapData(null)
                                                setActiveTab("upload")
                                            }}
                                            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
                                        >
                                            Generate New Mindmap
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Footer />
        </div>
    )
}

// Helper function to count total nodes in the mindmap
function countNodes(node: MindMapNode): number {
    let count = 1 // Count the node itself

    if (node.children && node.children.length > 0) {
        // Add the count of all children
        count += node.children.reduce((sum, child) => sum + countNodes(child), 0)
    }

    return count
}

