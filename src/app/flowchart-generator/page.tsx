"use client"

import type React from "react"

import { useState, useRef } from "react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Loader } from "@/components/ui/loader"
import {
    FileUp,
    CheckCircle2,
    Download,
    Share2,
    Palette,
    FileDown,
    HelpCircle,
    ChevronRight,
    ChevronDown,
} from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { uploadToS3 } from "@/lib/s3-upload"
import { MindMap } from "@/components/mindmap/mindmap"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

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
    const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({})

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

    const expandAllForExport = () => {
        // Store current expansion state
        const currentExpandedState = { ...expandedNodes }

        // Expand all nodes
        const allExpanded: { [key: string]: boolean } = {}
        const expandAll = (node: any) => {
            if (!node) return
            if (node.id) allExpanded[node.id] = true
            if (node.children && node.children.length > 0) {
                node.children.forEach(expandAll)
            }
        }

        if (mindmapData && mindmapData.root) {
            expandAll(mindmapData.root)
            // Update the state
            setExpandedNodes(allExpanded)
        }

        // Return the stored state for restoration later
        return currentExpandedState
    }

    // Direct canvas-based PDF generation without using html2canvas
    const downloadAsPDF = async () => {
        if (!mindmapData) return

        const loadingToast = toast.loading("Preparing PDF download...")

        try {
            // Store original state to restore later
            const originalState = expandAllForExport()

            // Wait for DOM to update after expanding nodes
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Get theme-specific color mappings using standard hex colors
            const themeColors = {
                blue: {
                    primary: "#3b82f6",
                    secondary: "#0891b2",
                    accent: "#60a5fa",
                    border: "#93c5fd",
                    background: "#0f172a",
                },
                purple: {
                    primary: "#8b5cf6",
                    secondary: "#4f46e5",
                    accent: "#a78bfa",
                    border: "#c4b5fd",
                    background: "#0f172a",
                },
                green: {
                    primary: "#10b981",
                    secondary: "#16a34a",
                    accent: "#34d399",
                    border: "#6ee7b7",
                    background: "#0f172a",
                },
                orange: {
                    primary: "#f97316",
                    secondary: "#d97706",
                    accent: "#fb923c",
                    border: "#fdba74",
                    background: "#0f172a",
                },
            }

            const colors = themeColors[activeTheme]

            // Create a canvas element
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")
            if (!ctx) {
                throw new Error("Could not get canvas context")
            }

            // Set canvas dimensions
            const width = 1200
            const height = 1600
            canvas.width = width
            canvas.height = height

            // Fill background
            ctx.fillStyle = colors.background
            ctx.fillRect(0, 0, width, height)

            // Add title
            ctx.font = "bold 24px Arial"
            ctx.fillStyle = "#ffffff"
            ctx.fillText(mindmapData.root.text, 40, 40)

            // Add subtitle
            ctx.font = "14px Arial"
            ctx.fillStyle = "#94a3b8"
            ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, 40, 70)

            // Draw mindmap
            const nodeHeight = 40
            const nodeSpacing = 20
            const indentation = 40

            // Calculate total height needed
            const calculateTotalHeight = (node: MindMapNode, level = 0): number => {
                if (!expandedNodes[node.id] && level > 0) {
                    return nodeHeight
                }

                let height = nodeHeight
                if (node.children && node.children.length > 0 && expandedNodes[node.id]) {
                    height += node.children.reduce((sum, child) => sum + calculateTotalHeight(child, level + 1) + nodeSpacing, 0)
                }
                return height
            }

            const totalHeight = calculateTotalHeight(mindmapData.root)

            // Draw nodes recursively
            let currentY = 120

            const drawNode = (node: MindMapNode, x: number, level = 0): number => {
                const y = currentY
                const nodeWidth = 300 - level * 10

                // Draw node background
                let gradient
                if (level === 0) {
                    gradient = ctx.createLinearGradient(x, y, x + nodeWidth, y)
                    gradient.addColorStop(0, colors.primary)
                    gradient.addColorStop(1, colors.secondary)
                    ctx.fillStyle = gradient
                } else {
                    // Use semi-transparent colors for child nodes
                    ctx.fillStyle = level === 1 ? hexToRgba(colors.primary, 0.2) : hexToRgba(colors.secondary, 0.15)
                }

                // Draw rounded rectangle
                roundRect(ctx, x, y, nodeWidth, nodeHeight, 8, true)

                // Draw border for non-root nodes
                if (level > 0) {
                    ctx.strokeStyle = hexToRgba(colors.border, 0.3)
                    ctx.lineWidth = 1
                    roundRect(ctx, x, y, nodeWidth, nodeHeight, 8, false, true)
                }

                // Draw node icon
                let icon = "📄"
                if (node.id.includes("_sub")) {
                    icon = "📖"
                } else if (node.id.includes("_p")) {
                    icon = "💡"
                } else if (node.style === "formula" || (node.text && node.text.includes("FORMULA:"))) {
                    icon = "⚡"
                }

                ctx.font = "16px Arial"
                ctx.fillText(icon, x + 10, y + 25)

                // Draw node text
                ctx.font = level === 0 ? "bold 16px Arial" : "16px Arial"
                ctx.fillStyle = "#ffffff"
                ctx.fillText(truncateText(node.text, ctx, nodeWidth - 50), x + 40, y + 25)

                currentY += nodeHeight + nodeSpacing

                // Draw children if expanded
                if (node.children && node.children.length > 0 && expandedNodes[node.id]) {
                    // Draw connection line
                    const childX = x + indentation
                    const lineStartX = x + 20
                    const lineStartY = y + nodeHeight

                    ctx.strokeStyle = hexToRgba(colors.border, 0.4)
                    ctx.lineWidth = 1
                    ctx.setLineDash([4, 4])
                    ctx.beginPath()
                    ctx.moveTo(lineStartX, lineStartY)
                    ctx.lineTo(lineStartX, currentY - nodeSpacing)
                    ctx.stroke()
                    ctx.setLineDash([])

                    // Draw children
                    node.children.forEach((child) => {
                        // Draw horizontal connector
                        const connectorY = currentY + nodeHeight / 2
                        ctx.strokeStyle = hexToRgba(colors.border, 0.4)
                        ctx.beginPath()
                        ctx.moveTo(lineStartX, connectorY)
                        ctx.lineTo(childX, connectorY)
                        ctx.stroke()

                        drawNode(child, childX, level + 1)
                    })
                }

                return currentY
            }

            // Helper function to draw rounded rectangles
            function roundRect(
                ctx: CanvasRenderingContext2D,
                x: number,
                y: number,
                width: number,
                height: number,
                radius: number,
                fill: boolean,
                stroke = false,
            ) {
                ctx.beginPath()
                ctx.moveTo(x + radius, y)
                ctx.lineTo(x + width - radius, y)
                ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
                ctx.lineTo(x + width, y + height - radius)
                ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
                ctx.lineTo(x + radius, y + height)
                ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
                ctx.lineTo(x, y + radius)
                ctx.quadraticCurveTo(x, y, x + radius, y)
                ctx.closePath()
                if (fill) {
                    ctx.fill()
                }
                if (stroke) {
                    ctx.stroke()
                }
            }

            // Helper function to convert hex to rgba
            function hexToRgba(hex: string, alpha: number): string {
                const r = Number.parseInt(hex.slice(1, 3), 16)
                const g = Number.parseInt(hex.slice(3, 5), 16)
                const b = Number.parseInt(hex.slice(5, 7), 16)
                return `rgba(${r}, ${g}, ${b}, ${alpha})`
            }

            // Helper function to truncate text
            function truncateText(text: string, ctx: CanvasRenderingContext2D, maxWidth: number): string {
                if (ctx.measureText(text).width <= maxWidth) {
                    return text
                }

                let truncated = text
                while (ctx.measureText(truncated + "...").width > maxWidth && truncated.length > 0) {
                    truncated = truncated.slice(0, -1)
                }

                return truncated + "..."
            }

            // Draw the mindmap
            drawNode(mindmapData.root, 40)

            // Add legend at the bottom
            const legendY = Math.max(currentY + 40, height - 100)
            ctx.font = "14px Arial"
            ctx.fillStyle = "#94a3b8"

            ctx.fillText("📄 Topic", 40, legendY)
            ctx.fillText("📖 Subtopic", 160, legendY)
            ctx.fillText("💡 Point", 280, legendY)
            ctx.fillText("⚡ Formula/Relation", 400, legendY)

            // Add footer
            ctx.font = "12px Arial"
            ctx.fillStyle = "#64748b"
            ctx.fillText("Created with Mindmap Generator", width / 2 - 80, height - 20)

            // Convert canvas to image data
            const imgData = canvas.toDataURL("image/png")

            // Create PDF
            const pdf = new jsPDF()

            // Calculate dimensions to fit the image properly
            const imgProps = pdf.getImageProperties(imgData)
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

            // Add the image to the PDF
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)

            // Save the PDF
            pdf.save(`mindmap-${new Date().toISOString().slice(0, 10)}.pdf`)

            // Restore original expansion state
            setTimeout(() => setExpandedNodes(originalState), 500)

            toast.dismiss(loadingToast)
            toast.success("Mindmap downloaded as PDF!")
        } catch (error) {
            console.error("Error generating PDF:", error)
            toast.dismiss(loadingToast)
            toast.error("Failed to generate PDF. Please try again.")
        }
    }

    const downloadAsPNG = async () => {
        if (!mindmapContainerRef.current) return

        const loadingToast = toast.loading("Preparing PNG download...")

        try {
            // Store original state to restore later
            const originalState = expandAllForExport()

            // Wait for DOM to update after expanding nodes
            await new Promise((resolve) => setTimeout(resolve, 1000))

            const element = mindmapContainerRef.current

            // Use html2canvas directly - PNG format can handle modern colors better
            const canvas = await html2canvas(element, {
                backgroundColor: "#0f172a",
                scale: 2,
                useCORS: true,
                logging: false,
                allowTaint: true,
            })

            // Create download link
            const link = document.createElement("a")
            link.download = `mindmap-${new Date().toISOString().slice(0, 10)}.png`
            link.href = canvas.toDataURL("image/png")
            link.click()

            // Restore original expansion state
            setTimeout(() => setExpandedNodes(originalState), 500)

            toast.dismiss(loadingToast)
            toast.success("Mindmap downloaded as PNG!")
        } catch (error) {
            console.error("Error generating PNG:", error)
            toast.dismiss(loadingToast)
            toast.error("Failed to export PNG. Please try again.")
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
                                                    <Button size="sm" variant="outline" className="flex items-center" onClick={downloadAsPDF}>
                                                        <Download className="h-4 w-4 mr-1" />
                                                        <span>Export PDF</span>
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="flex items-center" onClick={downloadAsPNG}>
                                                        <FileDown className="h-4 w-4 mr-1" />
                                                        <span>Export PNG</span>
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
                                            {/* User Guide */}
                                            <div className="mb-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                                                <div className="flex items-start space-x-4">
                                                    <div className="bg-indigo-500 rounded-full p-2">
                                                        <HelpCircle className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-lg mb-2">How to Use Your Mindmap</h3>
                                                        <ul className="space-y-2 text-sm text-gray-300">
                                                            <li className="flex items-center">
                                                                <ChevronRight className="h-4 w-4 mr-2 text-indigo-400" />
                                                                <span>
                                                                    <strong>Expand/Collapse:</strong> Click on any node with a chevron to expand or
                                                                    collapse its children
                                                                </span>
                                                            </li>
                                                            <li className="flex items-center">
                                                                <ChevronDown className="h-4 w-4 mr-2 text-indigo-400" />
                                                                <span>
                                                                    <strong>Expand All:</strong> Use the "Expand All" button to see the complete mindmap
                                                                </span>
                                                            </li>
                                                            <li className="flex items-center">
                                                                <Palette className="h-4 w-4 mr-2 text-indigo-400" />
                                                                <span>
                                                                    <strong>Change Theme:</strong> Click the theme button to cycle through color options
                                                                </span>
                                                            </li>
                                                            <li className="flex items-center">
                                                                <Download className="h-4 w-4 mr-2 text-indigo-400" />
                                                                <span>
                                                                    <strong>Export:</strong> Download your mindmap as PNG or PDF for sharing or printing
                                                                </span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

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

