"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronDown, FileText, BookOpen, Lightbulb, Zap, ActivityIcon as Function } from "lucide-react"

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

interface MindMapProps {
    data: MindMapData
    theme?: "blue" | "purple" | "green" | "orange"
    expanded?: boolean
}

export function MindMap({ data, theme = "blue", expanded = false }: MindMapProps) {
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({})
    const containerRef = useRef<HTMLDivElement>(null)

    // Initialize with root node expanded and optionally all nodes expanded
    useEffect(() => {
        const initialState: Record<string, boolean> = { [data.root.id]: true }

        if (expanded) {
            // Recursively set all nodes to expanded
            const expandAll = (node: MindMapNode) => {
                initialState[node.id] = true
                node.children.forEach(expandAll)
            }

            data.root.children.forEach(expandAll)
        }

        setExpandedNodes(initialState)
    }, [data, expanded])

    // Toggle node expansion
    const toggleNode = (id: string) => {
        setExpandedNodes((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

    // Get theme colors
    const getThemeColors = () => {
        switch (theme) {
            case "purple":
                return {
                    primary: "from-purple-500 to-indigo-600",
                    secondary: "bg-purple-500/10 border-purple-500/30",
                    accent: "text-purple-400",
                    connection: "bg-purple-500/30",
                }
            case "green":
                return {
                    primary: "from-emerald-500 to-green-600",
                    secondary: "bg-emerald-500/10 border-emerald-500/30",
                    accent: "text-emerald-400",
                    connection: "bg-emerald-500/30",
                }
            case "orange":
                return {
                    primary: "from-orange-500 to-amber-600",
                    secondary: "bg-orange-500/10 border-orange-500/30",
                    accent: "text-orange-400",
                    connection: "bg-orange-500/30",
                }
            default: // blue
                return {
                    primary: "from-blue-500 to-cyan-600",
                    secondary: "bg-blue-500/10 border-blue-500/30",
                    accent: "text-blue-400",
                    connection: "bg-blue-500/30",
                }
        }
    }

    const colors = getThemeColors()

    // Get icon based on node type or style
    const getNodeIcon = (node: MindMapNode) => {
        if (node.style === "formula") {
            return <Function className="h-4 w-4 mr-2 flex-shrink-0" />
        }

        if (node.text.includes("FORMULA:")) {
            return <Function className="h-4 w-4 mr-2 flex-shrink-0" />
        }

        if (node.text.includes("RELATION:")) {
            return <Zap className="h-4 w-4 mr-2 flex-shrink-0" />
        }

        if (node.id.includes("_sub")) {
            return <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
        }

        if (node.id.includes("_p")) {
            return <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0" />
        }

        return <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
    }

    // Recursive component to render nodes
    const renderNode = (node: MindMapNode, level = 0, isLast = false) => {
        const isExpanded = expandedNodes[node.id] || false
        const hasChildren = node.children && node.children.length > 0

        // Determine node style based on level and type
        let nodeStyle = ""
        if (level === 0) {
            nodeStyle = `bg-gradient-to-r ${colors.primary} text-white font-bold py-3 px-4 rounded-lg`
        } else if (node.style === "formula") {
            nodeStyle = `${colors.secondary} border text-white font-mono py-2 px-3 rounded-md`
        } else {
            nodeStyle = `${colors.secondary} border py-2 px-3 rounded-md`
        }

        return (
            <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: level * 0.05 }}
                className="relative"
            >
                {/* Connection line to parent (except for root) */}
                {level > 0 && (
                    <div
                        className={`absolute top-1/2 -left-4 w-4 h-px ${colors.connection}`}
                        style={{ transform: "translateY(-50%)" }}
                    />
                )}

                <div className="flex flex-col">
                    <div className="flex items-start">
                        {/* Node content */}
                        <div
                            className={`flex items-center ${nodeStyle} ${hasChildren ? "cursor-pointer" : ""}`}
                            onClick={hasChildren ? () => toggleNode(node.id) : undefined}
                        >
                            {/* Expand/collapse icon for nodes with children */}
                            {hasChildren && (
                                <motion.div
                                    initial={{ rotate: 0 }}
                                    animate={{ rotate: isExpanded ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="mr-2 flex-shrink-0"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </motion.div>
                            )}

                            {/* Node icon */}
                            {getNodeIcon(node)}

                            {/* Node text */}
                            <span className={node.style === "formula" ? "font-mono" : ""}>{node.text}</span>
                        </div>
                    </div>

                    {/* Children container with indentation */}
                    {hasChildren && (
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="ml-6 mt-2 pl-4 border-l border-dashed border-slate-600"
                                >
                                    {node.children.map((child, index) =>
                                        renderNode(child, level + 1, index === node.children.length - 1),
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </motion.div>
        )
    }

    return (
        <div ref={containerRef} className="p-4 overflow-auto max-h-[70vh] bg-slate-900 rounded-lg">
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => {
                        // Toggle between expanding all and collapsing to just root
                        if (Object.keys(expandedNodes).length > 1) {
                            setExpandedNodes({ [data.root.id]: true })
                        } else {
                            const allExpanded: Record<string, boolean> = {}

                            const expandAll = (node: MindMapNode) => {
                                allExpanded[node.id] = true
                                node.children.forEach(expandAll)
                            }

                            expandAll(data.root)
                            setExpandedNodes(allExpanded)
                        }
                    }}
                    className="text-sm text-gray-400 hover:text-white flex items-center"
                >
                    {Object.keys(expandedNodes).length > 1 ? (
                        <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Collapse All
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Expand All
                        </>
                    )}
                </button>
            </div>

            {renderNode(data.root)}
        </div>
    )
}

// Missing ChevronUp import
import { ChevronUp } from "lucide-react"

