"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type AnimatedLoaderProps = {
    isLoading: boolean
    loadingText?: string
    progress?: number
    variant?: "mindmap" | "upload" | "processing" | "ppt"
    theme?: "blue" | "purple" | "green" | "orange"
    className?: string
}

export function AnimatedLoader({
    isLoading,
    loadingText = "Processing",
    progress,
    variant = "mindmap",
    theme = "purple",
    className,
}: AnimatedLoaderProps) {
    const [dots, setDots] = useState("")

    // Animated dots effect
    useEffect(() => {
        if (!isLoading) return

        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
        }, 400)

        return () => clearInterval(interval)
    }, [isLoading])

    // Theme colors
    const themeColors = {
        blue: {
            primary: "#3b82f6",
            secondary: "#0891b2",
            accent: "#60a5fa",
            nodeColors: ["#38bdf8", "#0ea5e9", "#0284c7", "#0369a1", "#075985", "#0c4a6e"],
        },
        purple: {
            primary: "#8b5cf6",
            secondary: "#4f46e5",
            accent: "#a78bfa",
            nodeColors: ["#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95"],
        },
        green: {
            primary: "#10b981",
            secondary: "#16a34a",
            accent: "#34d399",
            nodeColors: ["#34d399", "#10b981", "#059669", "#047857", "#065f46", "#064e3b"],
        },
        orange: {
            primary: "#f97316",
            secondary: "#d97706",
            accent: "#fb923c",
            nodeColors: ["#fb923c", "#f97316", "#ea580c", "#c2410c", "#9a3412", "#7c2d12"],
        },
    }

    const colors = themeColors[theme]

    if (!isLoading) return null

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm", className)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative flex flex-col items-center justify-center p-8 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl max-w-md w-full mx-4"
                    >
                        {/* Progress indicator */}
                        {progress !== undefined && progress > 0 && (
                            <div className="absolute -top-2 left-0 w-full overflow-hidden">
                                <motion.div
                                    className="h-1 bg-gradient-to-r"
                                    style={{
                                        backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.accent})`,
                                        width: `${progress}%`,
                                    }}
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        )}

                        {/* Loader animation based on variant */}
                        <div className="mb-8">
                            {variant === "mindmap" && (
                                <div className="relative w-40 h-40">
                                    {/* Central node */}
                                    <motion.div
                                        className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-lg z-10"
                                        style={{
                                            backgroundColor: colors.primary,
                                            transform: "translate(-50%, -50%)",
                                        }}
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                                    >
                                        AI
                                    </motion.div>

                                    {/* Connection lines - render first so they appear behind nodes */}
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div
                                            key={`line-${i}`}
                                            className="absolute top-1/2 left-1/2 h-[1px] bg-white/30 origin-left"
                                            style={{
                                                width: "60px",
                                                transform: `translate(0, -50%) rotate(${i * 60}deg)`,
                                                transformOrigin: "left center",
                                            }}
                                            initial={{ scaleX: 0, opacity: 0 }}
                                            animate={{ scaleX: 1, opacity: 0.6 }}
                                            transition={{
                                                duration: 0.5,
                                                delay: i * 0.1,
                                            }}
                                        />
                                    ))}

                                    {/* Orbiting nodes */}
                                    {[...Array(6)].map((_, i) => {
                                        // Calculate position on a circle
                                        const angle = i * (Math.PI / 3) // 60 degrees in radians
                                        const x = Math.cos(angle) * 60 // 60px radius
                                        const y = Math.sin(angle) * 60

                                        return (
                                            <motion.div
                                                key={i}
                                                className="absolute w-8 h-8 rounded-full shadow-md flex items-center justify-center text-xs text-white font-medium"
                                                style={{
                                                    backgroundColor: colors.nodeColors[i],
                                                    left: "50%",
                                                    top: "50%",
                                                    transform: "translate(-50%, -50%)",
                                                    x,
                                                    y,
                                                }}
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                }}
                                                transition={{
                                                    duration: 0.5,
                                                    delay: 0.2 + i * 0.1,
                                                }}
                                            >
                                                {i + 1}
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            )}

                            {variant === "upload" && (
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    {/* Circular progress */}
                                    <svg className="w-32 h-32" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="8" />
                                        <motion.circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke={`url(#${theme}Gradient)`}
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: progress ? progress / 100 : 0.75 }}
                                            transition={{
                                                duration: 0.5,
                                                ease: "easeInOut",
                                            }}
                                            style={{
                                                strokeDasharray: "251.2",
                                                strokeDashoffset: "0",
                                                transformOrigin: "center",
                                                rotate: "-90deg",
                                            }}
                                        />
                                        <defs>
                                            <linearGradient id={`${theme}Gradient`} x1="0%" y1="0%" x2="100%" y2="0%">
                                                {theme === "purple" ? (
                                                    <>
                                                        <stop offset="0%" stopColor="#6366f1" />
                                                        <stop offset="50%" stopColor="#a855f7" />
                                                        <stop offset="100%" stopColor="#ec4899" />
                                                    </>
                                                ) : theme === "blue" ? (
                                                    <>
                                                        <stop offset="0%" stopColor="#3b82f6" />
                                                        <stop offset="100%" stopColor="#06b6d4" />
                                                    </>
                                                ) : theme === "green" ? (
                                                    <>
                                                        <stop offset="0%" stopColor="#10b981" />
                                                        <stop offset="100%" stopColor="#4ade80" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <stop offset="0%" stopColor="#f97316" />
                                                        <stop offset="100%" stopColor="#fbbf24" />
                                                    </>
                                                )}
                                            </linearGradient>
                                        </defs>
                                    </svg>

                                    {/* File icon */}
                                    <motion.div
                                        className="absolute inset-0 flex items-center justify-center"
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <motion.path
                                                d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />
                                            <motion.path
                                                d="M14 2V8H20"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.5, delay: 1.5 }}
                                            />
                                            <motion.path
                                                d="M12 18V12"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 1 }}
                                                transition={{ duration: 0.5, delay: 2 }}
                                            />
                                            <motion.path
                                                d="M9 15L12 18L15 15"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 1 }}
                                                transition={{ duration: 0.5, delay: 2 }}
                                            />
                                        </svg>
                                    </motion.div>
                                </div>
                            )}

                            {variant === "processing" && (
                                <div className="w-32 h-32 flex items-center justify-center">
                                    <div className="relative">
                                        {/* Spinning circles */}
                                        {[...Array(3)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute rounded-full border-4 border-t-transparent border-l-transparent"
                                                style={{
                                                    width: `${80 - i * 20}px`,
                                                    height: `${80 - i * 20}px`,
                                                    top: `${i * 10}px`,
                                                    left: `${i * 10}px`,
                                                    borderRightColor: i === 0 ? colors.primary : i === 1 ? colors.secondary : colors.accent,
                                                    borderBottomColor: i === 0 ? colors.primary : i === 1 ? colors.secondary : colors.accent,
                                                }}
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Number.POSITIVE_INFINITY,
                                                    ease: "linear",
                                                    delay: i * 0.2,
                                                }}
                                            />
                                        ))}

                                        {/* Brain pulse */}
                                        <motion.div
                                            className="absolute inset-0 flex items-center justify-center"
                                            animate={{ scale: [0.8, 1, 0.8] }}
                                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M9.5 2C9.5 2 9 6 7.5 8C6.5 9.5 4.5 11 4.5 13C4.5 15 6.5 16.5 9 16.5C11 16.5 12.5 15 12.5 15M14.5 2C14.5 2 15 6 16.5 8C17.5 9.5 19.5 11 19.5 13C19.5 15 17.5 16.5 15 16.5C13 16.5 11.5 15 11.5 15M12 15V22M8 22H16"
                                                    stroke="white"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </motion.div>
                                    </div>
                                </div>
                            )}

                            {variant === "ppt" && (
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    {/* Slides animation */}
                                    {[...Array(3)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute rounded-lg border-2"
                                            style={{
                                                width: `${80 - i * 8}px`,
                                                height: `${60 - i * 6}px`,
                                                borderColor: i === 0 ? colors.primary : i === 1 ? colors.secondary : colors.accent,
                                                left: `${10 + i * 4}px`,
                                                top: `${20 + i * 4}px`,
                                                backgroundColor: `${i === 0 ? colors.primary : i === 1 ? colors.secondary : colors.accent}10`,
                                            }}
                                            animate={{
                                                y: [0, -5, 0],
                                                opacity: [0.7, 1, 0.7],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Number.POSITIVE_INFINITY,
                                                delay: i * 0.3,
                                                ease: "easeInOut",
                                            }}
                                        />
                                    ))}

                                    {/* Presentation icon */}
                                    <motion.div
                                        className="absolute inset-0 flex items-center justify-center"
                                        animate={{
                                            scale: [1, 1.1, 1],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Number.POSITIVE_INFINITY,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M8 2V5H16V2H8ZM6 7V22H18V7H6ZM8 9H16V11H8V9ZM8 13H16V15H8V13ZM8 17H13V19H8V17Z"
                                                fill="white"
                                            />
                                        </svg>
                                    </motion.div>
                                </div>
                            )}
                        </div>

                        {/* Loading text */}
                        <motion.p
                            className="text-lg font-medium text-white text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {variant === "mindmap" ? "Generating your mindmap" : loadingText}
                            {dots}
                        </motion.p>

                        {progress !== undefined && progress > 0 && (
                            <motion.p
                                className="text-sm text-gray-400 mt-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                {progress}% Complete
                            </motion.p>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

