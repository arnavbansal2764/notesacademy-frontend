"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { AIVisualizationLoader } from "@/components/ui/ai-visualization-loader"
import { FileUp, CheckCircle2, Download, HelpCircle, ChevronRight, ChevronDown } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { uploadToS3 } from "@/lib/s3-upload"
import { MindMap } from "@/components/mindmap/mindmap"
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
    // Get session for user authentication
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

    // Visualization states
    const [generatedVisualization, setGeneratedVisualization] = useState<boolean>(false)
    const [mindmapData, setMindmapData] = useState<MindMapData | null>(null)
    const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({})
    const [isSaving, setIsSaving] = useState(false)
    const [savedMindmapId, setSavedMindmapId] = useState<string | null>(null)

    // Fixed theme to blue
    const activeTheme = "blue"

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
            toast.success("PDF uploaded successfully")
        } catch (error) {
            console.error("Error uploading file:", error)
            setUploadStatus("error")
            setIsUploading(false)
            toast.error("Failed to upload file")
        }
    }

    const handleGenerate = async () => {
        if (!s3Url) return

        setIsGenerating(true)

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

            // Success toast only after loader is dismissed
            setTimeout(() => {
                toast.success("Visualization generated successfully!")

                // Auto-save if user is logged in
                if (session?.user) {
                    saveMindmapToDatabase()
                }
            }, 300)
        } catch (error) {
            console.error("Error generating visualization:", error)
            toast.error(error instanceof Error ? error.message : "Failed to generate visualization")
        } finally {
            setIsGenerating(false)
        }
    }

    const saveMindmapToDatabase = async () => {
        if (!session?.user) {
            toast.error("You must be logged in to save mindmaps")
            return
        }

        if (!mindmapData || !file || !s3Url) {
            toast.error("Missing mindmap or file information")
            return
        }

        setIsSaving(true)

        try {
            // console.log("Preparing to save mindmap to database...")

            const nodeCount = countNodes(mindmapData.root)

            const requestData = {
                title: mindmapData.root.text,
                pdfName: file.name,
                pdfUrl: s3Url,
                mindmapData: mindmapData,
                nodeCount: nodeCount,
            }

            // console.log("Sending request to save mindmap:", requestData)

            const response = await fetch("/api/mindmap-results", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            })

            const responseText = await response.text()
            // console.log("Response from server:", response.status, responseText)

            if (!response.ok) {
                throw new Error(`Failed to save mindmap: ${response.status} ${responseText}`)
            }

            try {
                const data = JSON.parse(responseText)
                setSavedMindmapId(data.resultId)
                // console.log("Successfully saved mindmap with ID:", data.resultId)
                toast.success("Mindmap saved to your dashboard")
            } catch (parseError) {
                console.error("Error parsing response as JSON:", parseError)
                throw new Error("Invalid response from server")
            }
        } catch (error) {
            console.error("Error saving mindmap:", error)
            toast.error(`Failed to save mindmap: ${error instanceof Error ? error.message : "Unknown error"}`)
        } finally {
            setIsSaving(false)
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

    // Enhanced PDF generation with beautiful design and clear organization
    const downloadAsPDF = async () => {
        if (!mindmapData) return

        const loadingToast = toast.loading("Preparing PDF download...")

        try {
            // Store original state to restore later
            const originalState = expandAllForExport()

            // Wait for DOM to update after expanding nodes
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Blue theme colors
            const colors = {
                primary: "#3b82f6",
                secondary: "#0891b2",
                accent: "#60a5fa",
                border: "#93c5fd",
                background: "#0f172a",
                mainTopic: "#4169e1",
                subTopic: "#38bdf8",
                formula: "#2563eb",
                connector: "#93c5fd",
            }

            // Create PDF document
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            })

            // PDF dimensions
            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            const margin = 15
            const contentWidth = pageWidth - margin * 2

            // Prepare for multi-column layout
            const columnCount = 2
            const columnWidth = (contentWidth - 10) / columnCount // 10mm gap between columns

            // Node styling
            const nodeHeight = 10
            const nodeSpacing = 8
            const indentation = 12

            // Clean up node text by removing strange characters
            const cleanNodeText = (text: string) => {
                return text
                    .replace(/ø=ÜÅ|ø=ÜÖ|ø=ÜA|ø=0A|ø=0Ö|ø=0O|ø=ÜO|ø=ÜC|ø=0C|ø=ÜD|ø=0D/g, "")
                    .replace(/FORMULA:/i, "")
                    .trim()
            }

            // Format formula text
            const formatFormula = (formula: string) => {
                return formula
                    .replace(/\*/g, "×")
                    .replace(/\//g, "÷")
                    .replace(/\^2/g, "²")
                    .replace(/\^3/g, "³")
                    .replace(/sqrt/g, "√")
                    .replace(/pi/g, "π")
                    .replace(/theta/g, "θ")
                    .replace(/delta/g, "δ")
                    .replace(/\(/g, "(")
                    .replace(/\)/g, ")")
                    .replace(/\+/g, "+")
                    .replace(/-/g, "-")
                    .replace(/_/g, "_")
            }

            // Organize nodes by main topics for better layout
            const processedNodes: {
                id: string
                text: string
                level: number
                isFormula: boolean
                parent: string | null
                x: number
                y: number
                width: number
                height: number
                column: number
                page: number
            }[] = []

            // Process all nodes to prepare for layout
            const processNode = (node: MindMapNode, level: number, parent: string | null = null) => {
                const isFormula =
                    node.text.includes("FORMULA:") ||
                    node.style === "formula" ||
                    node.text.includes("F =") ||
                    node.text.includes("g =") ||
                    node.text.includes("PE =") ||
                    node.text.includes("W =")

                processedNodes.push({
                    id: node.id,
                    text: cleanNodeText(node.text),
                    level,
                    isFormula,
                    parent,
                    x: 0,
                    y: 0,
                    width: 0,
                    height: nodeHeight,
                    column: 0,
                    page: 0,
                })

                if (node.children && node.children.length > 0 && expandedNodes[node.id]) {
                    node.children.forEach((child) => processNode(child, level + 1, node.id))
                }
            }

            // Start processing from root
            if (mindmapData.root.children && mindmapData.root.children.length > 0) {
                mindmapData.root.children.forEach((mainTopic) => {
                    processNode(mainTopic, 0)
                })
            }

            // Organize nodes into columns and pages
            const nodesPerColumn = Math.ceil(processedNodes.length / 6) // Adjust based on your content
            const nodesPerPage = nodesPerColumn * columnCount
            const pagesNeeded = Math.ceil(processedNodes.length / nodesPerPage)

            // Assign column and page to each node
            processedNodes.forEach((node, index) => {
                const page = Math.floor(index / nodesPerPage)
                const pageIndex = index % nodesPerPage
                const column = Math.floor(pageIndex / nodesPerColumn)

                node.page = page
                node.column = column
            })

            // Calculate positions for each node
            const calculatePositions = () => {
                // Group nodes by page and column
                const pageColumns: Record<number, Record<number, typeof processedNodes>> = {}

                processedNodes.forEach((node) => {
                    if (!pageColumns[node.page]) {
                        pageColumns[node.page] = {}
                    }

                    if (!pageColumns[node.page][node.column]) {
                        pageColumns[node.page][node.column] = []
                    }

                    pageColumns[node.page][node.column].push(node)
                })

                // Calculate positions for each node in each column
                Object.keys(pageColumns).forEach((pageKey) => {
                    const page = Number(pageKey)

                    Object.keys(pageColumns[page]).forEach((columnKey) => {
                        const column = Number(columnKey)
                        const nodes = pageColumns[page][column]

                        let currentY = 35 // Start position after header

                        nodes.forEach((node) => {
                            const x = margin + column * (columnWidth + 10) + node.level * indentation
                            const width = columnWidth - node.level * indentation

                            node.x = x
                            node.y = currentY
                            node.width = width

                            currentY += nodeHeight + nodeSpacing
                        })
                    })
                })
            }

            calculatePositions()

            // Draw a node
            const drawNode = (node: (typeof processedNodes)[0], pdf: jsPDF) => {
                // Determine node style based on level and content
                let fillColor
                const textColor = "#ffffff"

                if (node.level === 0) {
                    // Main topic
                    fillColor = colors.mainTopic
                } else if (node.isFormula) {
                    // Formula nodes
                    fillColor = colors.formula
                } else {
                    // Subtopics
                    fillColor = colors.subTopic
                }

                // Draw node background
                pdf.setFillColor(fillColor)
                pdf.rect(node.x, node.y, node.width, node.height, "F")

                // Set text style
                pdf.setTextColor(textColor)
                pdf.setFont(node.level === 0 ? "helvetica-bold" : "helvetica", node.level === 0 ? "bold" : "normal")
                pdf.setFontSize(node.level === 0 ? 10 : 9)

                // Prepare text
                let displayText = node.text
                if (node.isFormula) {
                    displayText = formatFormula(displayText)
                }

                // Calculate text width to check for overflow
                const textWidth = (pdf.getStringUnitWidth(displayText) * pdf.getFontSize()) / pdf.internal.scaleFactor

                // Truncate text if needed
                if (textWidth > node.width - 6) {
                    let truncated = displayText
                    while (
                        (pdf.getStringUnitWidth(truncated + "...") * pdf.getFontSize()) / pdf.internal.scaleFactor >
                        node.width - 6 &&
                        truncated.length > 0
                    ) {
                        truncated = truncated.slice(0, -1)
                    }
                    displayText = truncated + "..."
                }

                // Draw text centered vertically in the node
                pdf.text(displayText, node.x + 3, node.y + node.height / 2 + 1, { baseline: "middle" })
            }

            // Draw a page
            const drawPage = (pageIndex: number, pdf: jsPDF) => {
                // Add new page if not the first page
                if (pageIndex > 0) {
                    pdf.addPage()
                }

                // Fill background
                pdf.setFillColor(colors.background)
                pdf.rect(0, 0, pageWidth, pageHeight, "F")

                // Draw header
                pdf.setFillColor("#1e3a8a")
                pdf.rect(0, 0, pageWidth, 25, "F")

                // Add title
                pdf.setFont("helvetica", "bold")
                pdf.setFontSize(16)
                pdf.setTextColor(255, 255, 255)
                pdf.text(mindmapData!.root.text, margin, 15)

                // Add subtitle
                pdf.setFont("helvetica", "normal")
                pdf.setFontSize(9)
                pdf.setTextColor(200, 200, 200)
                pdf.text(
                    `Generated on ${new Date().toLocaleDateString()} - Page ${pageIndex + 1} of ${pagesNeeded}`,
                    margin,
                    22,
                )

                // Draw nodes for this page
                const pageNodes = processedNodes.filter((node) => node.page === pageIndex)
                pageNodes.forEach((node) => drawNode(node, pdf))

                // Draw footer
                pdf.setFont("helvetica", "normal")
                pdf.setFontSize(8)
                pdf.setTextColor(150, 150, 150)
                pdf.text("Created with Mindmap Generator", pageWidth / 2, pageHeight - 10, { align: "center" })
            }

            // Draw all pages
            for (let i = 0; i < pagesNeeded; i++) {
                drawPage(i, pdf)
            }

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

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
            <Navbar />

            {/* AI Visualization Loaders */}
            <AIVisualizationLoader isLoading={isUploading} message="Uploading your PDF" variant="upload" theme="blue" />

            <AIVisualizationLoader
                isLoading={isGenerating}
                message="AI is processing your data"
                variant="wave"
                theme="blue"
            />

            <main className="container mx-auto px-4 py-16">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
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
                                                    <FileUp className="h-5 w-5 mr-2 text-blue-400" />
                                                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                                </div>
                                                {uploadStatus === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                                            </div>
                                        )}

                                        {uploadStatus === "uploading" && !isUploading && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Uploading...</span>
                                                    <span>{uploadProgress}%</span>
                                                </div>
                                                <Progress value={uploadProgress} className="h-2" />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={handleUpload}
                                        disabled={!file || isUploading || uploadStatus === "success"}
                                    >
                                        Upload
                                    </Button>
                                    <Button
                                        onClick={handleGenerate}
                                        disabled={uploadStatus !== "success" || isGenerating}
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                                    >
                                        Generate Mindmap
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
                                                    {session?.user && !savedMindmapId && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={saveMindmapToDatabase}
                                                            disabled={isSaving}
                                                            className="flex items-center"
                                                        >
                                                            {isSaving ? (
                                                                <>Saving...</>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                                    Save to Dashboard
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                    {savedMindmapId && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={true}
                                                            className="flex items-center text-green-500"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                                            Saved to Dashboard
                                                        </Button>
                                                    )}
                                                    <Button variant="outline" size="sm" onClick={downloadAsPDF} className="flex items-center">
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Export as PDF
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {/* User Guide */}
                                            <div className="mb-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                                                <div className="flex items-start space-x-4">
                                                    <div className="bg-blue-500 rounded-full p-2">
                                                        <HelpCircle className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-lg mb-2">How to Use Your Mindmap</h3>
                                                        <ul className="space-y-2 text-sm text-gray-300">
                                                            <li className="flex items-center">
                                                                <ChevronRight className="h-4 w-4 mr-2 text-blue-400" />
                                                                <span>
                                                                    <strong>Expand/Collapse:</strong> Click on any node with a chevron to expand or
                                                                    collapse its children
                                                                </span>
                                                            </li>
                                                            <li className="flex items-center">
                                                                <ChevronDown className="h-4 w-4 mr-2 text-blue-400" />
                                                                <span>
                                                                    <strong>Expand All:</strong> Use the "Expand All" button to see the complete mindmap
                                                                </span>
                                                            </li>
                                                            <li className="flex items-center">
                                                                <Download className="h-4 w-4 mr-2 text-blue-400" />
                                                                <span>
                                                                    <strong>Export:</strong> Download your mindmap as PDF for sharing or printing
                                                                </span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            <div ref={mindmapContainerRef}>
                                                <MindMap data={mindmapData} theme="blue" expanded={false} />
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <div className="w-full">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="font-medium">Visualization Details</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="p-3 bg-slate-700/30 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
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
                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
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

