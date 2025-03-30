"use client"

import React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Brain, FileUp } from "lucide-react"

type AIVisualizationLoaderProps = {
    isLoading: boolean
    message?: string
    variant?: "neural" | "particles" | "pulse" | "wave" | "nodes" | "upload"
    theme?: "blue" | "purple" | "green" | "orange"
    className?: string
}

export function AIVisualizationLoader({
    isLoading,
    message = "AI is processing your data",
    variant = "wave",
    theme = "blue",
    className,
}: AIVisualizationLoaderProps) {
    const [dots, setDots] = useState("")
    const [messageIndex, setMessageIndex] = useState(0)

    // Define process step messages
    const processingSteps = [
        "Analyzing PDF content",
        "Identifying key concepts",
        "Mapping relationships",
        "Generating visualization",
    ]

    // Define upload step messages
    const uploadSteps = [
        "Preparing your file",
        "Uploading to secure storage",
        "Validating document",
        "Getting ready for processing",
    ]

    // Determine which steps to use based on variant
    const steps = variant === "upload" ? uploadSteps : processingSteps

    // Animated dots effect
    useEffect(() => {
        if (!isLoading) return

        const dotsInterval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
        }, 400)

        return () => clearInterval(dotsInterval)
    }, [isLoading])

    // Cycle through processing messages
    useEffect(() => {
        if (!isLoading) return

        const messageInterval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % steps.length)
        }, 3000)

        return () => clearInterval(messageInterval)
    }, [isLoading, steps])

    // Theme colors
    const themeColors = {
        blue: {
            primary: "#3b82f6",
            secondary: "#0ea5e9",
            accent: "#60a5fa",
            gradient: "from-blue-500 via-cyan-400 to-blue-600",
            glow: "0 0 15px rgba(59, 130, 246, 0.5), 0 0 30px rgba(59, 130, 246, 0.3)",
            bg: "bg-slate-900",
        },
        purple: {
            primary: "#8b5cf6",
            secondary: "#a855f7",
            accent: "#c084fc",
            gradient: "from-indigo-500 via-purple-500 to-pink-500",
            glow: "0 0 15px rgba(139, 92, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.3)",
            bg: "bg-slate-900",
        },
        green: {
            primary: "#10b981",
            secondary: "#34d399",
            accent: "#6ee7b7",
            gradient: "from-emerald-500 via-green-500 to-teal-500",
            glow: "0 0 15px rgba(16, 185, 129, 0.5), 0 0 30px rgba(16, 185, 129, 0.3)",
            bg: "bg-slate-900",
        },
        orange: {
            primary: "#f97316",
            secondary: "#fb923c",
            accent: "#fdba74",
            gradient: "from-orange-500 via-amber-500 to-yellow-500",
            glow: "0 0 15px rgba(249, 115, 22, 0.5), 0 0 30px rgba(249, 115, 22, 0.3)",
            bg: "bg-slate-900",
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
                        className={cn(
                            "relative flex flex-col items-center justify-center p-8 rounded-xl border border-slate-700/50 shadow-xl max-w-md w-full mx-4",
                            colors.bg,
                        )}
                        style={{
                            boxShadow: `0 0 40px rgba(0, 0, 0, 0.2), ${colors.glow}`,
                        }}
                    >
                        {/* Loader animation based on variant */}
                        <div className="mb-8 w-40 h-40 flex items-center justify-center">
                            {variant === "neural" && <NeuralNetworkLoader colors={colors} />}
                            {variant === "particles" && <EnhancedParticlesLoader colors={colors} />}
                            {variant === "pulse" && <PulseLoader colors={colors} />}
                            {variant === "wave" && <WaveLoader colors={colors} />}
                            {variant === "nodes" && <NodesLoader colors={colors} />}
                            {variant === "upload" && <UploadLoader colors={colors} />}
                        </div>

                        {/* Loading text with smooth transitions - Fixed text alignment */}
                        <div className="text-center w-full">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={messageIndex} // This ensures a new animation when the message changes
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.5 }}
                                    className="flex flex-col items-center"
                                >
                                    <p className="text-lg font-medium text-white mb-2 inline-flex items-center">
                                        {message === "AI is processing your data" || message === "Uploading your PDF"
                                            ? steps[messageIndex]
                                            : message}
                                        <motion.span
                                            animate={{ opacity: [0, 1, 1, 0] }}
                                            transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, times: [0, 0.2, 0.8, 1] }}
                                            className="inline-block ml-1"
                                        >
                                            ...
                                        </motion.span>
                                    </p>
                                    <p className="text-sm text-gray-400">This may take a moment</p>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// Upload Loader with file animation
function UploadLoader({ colors }: { colors: any }) {
    const theme = "upload"
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Glowing background effect */}
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                    background: `radial-gradient(circle, ${colors.primary}30 0%, ${colors.primary}10 40%, ${colors.bg} 70%)`,
                    boxShadow: colors.glow,
                }}
                animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.7, 0.9, 0.7],
                }}
                transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
            />

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
                    animate={{
                        pathLength: [0, 0.3, 0.5, 0.7, 0.9, 0.95, 0.98, 1],
                        rotate: 360,
                    }}
                    transition={{
                        pathLength: {
                            duration: 8,
                            ease: "easeInOut",
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "loop",
                            times: [0, 0.2, 0.4, 0.6, 0.7, 0.8, 0.9, 1],
                        },
                        rotate: {
                            duration: 20,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        },
                    }}
                    style={{
                        strokeDasharray: "251.2",
                        strokeDashoffset: "0",
                        transformOrigin: "center",
                    }}
                />
                <defs>
                    <linearGradient id={`${theme}Gradient`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={colors.primary} />
                        <stop offset="50%" stopColor={colors.secondary} />
                        <stop offset="100%" stopColor={colors.accent} />
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
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                        filter: [
                            `drop-shadow(0 0 8px ${colors.primary}80)`,
                            `drop-shadow(0 0 15px ${colors.primary})`,
                            `drop-shadow(0 0 8px ${colors.primary}80)`,
                        ],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                >
                    <FileUp size={40} className="text-white" />
                </motion.div>
            </motion.div>

            {/* Particles */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute">
                {[...Array(8)].map((_, i) => {
                    const angle = (i * Math.PI) / 4
                    const radius = 45
                    const x = 50 + Math.cos(angle) * radius
                    const y = 50 + Math.sin(angle) * radius

                    return (
                        <motion.circle
                            key={i}
                            cx={x}
                            cy={y}
                            r={1.5}
                            fill={i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.secondary : colors.accent}
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: [0, 0.8, 0],
                                cx: [x, 50],
                                cy: [y, 50],
                                scale: [1, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatDelay: 2 + i * 0.3,
                                ease: "easeInOut",
                                delay: i * 0.2,
                            }}
                        />
                    )
                })}
            </svg>
        </div>
    )
}

// Enhanced Particles Loader with smoother animations
function EnhancedParticlesLoader({ colors }: { colors: any }) {
    // Generate more particles for a smoother effect
    const particleCount = 50

    // Create particles with varied properties for more natural movement
    const particles = Array.from({ length: particleCount }, (_, i) => {
        const size = Math.random() * 3 + 0.5 // Smaller minimum size for subtlety
        const distance = Math.random() * 40 + 20 // Distance from center
        const angle = Math.random() * Math.PI * 2 // Random angle
        const x = 50 + Math.cos(angle) * distance // Position based on angle and distance
        const y = 50 + Math.sin(angle) * distance

        return {
            id: i,
            size,
            initialX: x,
            initialY: y,
            x,
            y,
            duration: Math.random() * 4 + 3, // Longer durations for smoother movement
            delay: Math.random() * 2,
            opacity: Math.random() * 0.5 + 0.3, // Varied opacity
            // Create varied movement patterns
            moveX: Math.random() * 15 - 7.5,
            moveY: Math.random() * 15 - 7.5,
            // Assign colors with more blue/primary for the theme
            color:
                i % 5 === 0
                    ? colors.primary
                    : i % 5 === 1
                        ? colors.secondary
                        : i % 5 === 2
                            ? colors.accent
                            : i % 5 === 3
                                ? `${colors.primary}90`
                                : `${colors.secondary}80`,
        }
    })

    // Create additional small background particles for depth
    const backgroundParticles = Array.from({ length: 30 }, (_, i) => {
        const size = Math.random() * 1.5 + 0.3
        const distance = Math.random() * 60 + 40 // Further from center
        const angle = Math.random() * Math.PI * 2

        return {
            id: i + particleCount,
            size,
            x: 50 + Math.cos(angle) * distance,
            y: 50 + Math.sin(angle) * distance,
            duration: Math.random() * 6 + 5, // Slower movement
            delay: Math.random() * 3,
            opacity: Math.random() * 0.3 + 0.1, // Lower opacity
            color: i % 3 === 0 ? `${colors.primary}40` : i % 3 === 1 ? `${colors.secondary}30` : `${colors.accent}20`,
        }
    })

    return (
        <div className="relative w-full h-full overflow-hidden rounded-full">
            {/* Glowing background effect */}
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                    background: `radial-gradient(circle, ${colors.primary}30 0%, ${colors.primary}10 40%, ${colors.bg} 70%)`,
                    boxShadow: colors.glow,
                }}
                animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.7, 0.9, 0.7],
                }}
                transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
            />

            {/* Pulsing ring */}
            <motion.div
                className="absolute top-1/2 left-1/2 rounded-full border-2"
                style={{
                    borderColor: `${colors.primary}40`,
                    width: "70%",
                    height: "70%",
                    x: "-50%",
                    y: "-50%",
                }}
                animate={{
                    scale: [0.8, 1.1, 0.8],
                    opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
            />

            {/* Central brain with smooth rotation and pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        rotate: {
                            duration: 20,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        },
                        scale: {
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                        },
                    }}
                >
                    <motion.div
                        animate={{
                            filter: [
                                `drop-shadow(0 0 8px ${colors.primary}80)`,
                                `drop-shadow(0 0 15px ${colors.primary})`,
                                `drop-shadow(0 0 8px ${colors.primary}80)`,
                            ],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                        }}
                    >
                        <Brain size={50} strokeWidth={1.5} className="text-white" />
                    </motion.div>
                </motion.div>
            </div>

            {/* Background particles for depth */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute">
                {backgroundParticles.map((particle) => (
                    <motion.circle
                        key={`bg-${particle.id}`}
                        cx={particle.x}
                        cy={particle.y}
                        r={particle.size}
                        fill={particle.color}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0, particle.opacity, 0],
                            cx: [particle.x, particle.x + (Math.random() * 10 - 5)],
                            cy: [particle.y, particle.y + (Math.random() * 10 - 5)],
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: particle.delay,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </svg>

            {/* Main particles with smooth movement */}
            <svg width="100%" height="100%" viewBox="0 0 100 100">
                {particles.map((particle) => {
                    // Create custom motion paths for more natural movement
                    const pathPoints = [
                        [particle.initialX, particle.initialY],
                        [particle.initialX + particle.moveX * 0.3, particle.initialY - particle.moveY * 0.7],
                        [particle.initialX + particle.moveX, particle.initialY + particle.moveY],
                        [particle.initialX - particle.moveX * 0.5, particle.initialY + particle.moveY * 0.3],
                        [particle.initialX, particle.initialY],
                    ]

                    return (
                        <motion.circle
                            key={particle.id}
                            cx={particle.initialX}
                            cy={particle.initialY}
                            r={particle.size}
                            fill={particle.color}
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: [0, particle.opacity, particle.opacity * 0.8, particle.opacity, 0],
                                cx: pathPoints.map((p) => p[0]),
                                cy: pathPoints.map((p) => p[1]),
                                scale: [0.3, 1, 0.8, 1, 0.3],
                            }}
                            transition={{
                                duration: particle.duration,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: particle.delay,
                                ease: "easeInOut",
                                times: [0, 0.25, 0.5, 0.75, 1], // Control timing of keyframes
                            }}
                        />
                    )
                })}

                {/* Occasional "data transfer" particles that move toward the brain */}
                {[...Array(8)].map((_, i) => {
                    const angle = Math.random() * Math.PI * 2
                    const distance = Math.random() * 30 + 30
                    const startX = 50 + Math.cos(angle) * distance
                    const startY = 50 + Math.sin(angle) * distance

                    return (
                        <motion.circle
                            key={`transfer-${i}`}
                            cx={startX}
                            cy={startY}
                            r={1.5}
                            fill={i % 2 === 0 ? colors.secondary : colors.accent}
                            initial={{ opacity: 0 }}
                            animate={{
                                cx: [startX, 50],
                                cy: [startY, 50],
                                opacity: [0, 0.8, 0],
                                scale: [0.5, 1.2, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatDelay: Math.random() * 5 + 3,
                                ease: "easeInOut",
                                delay: i * 0.5,
                            }}
                        />
                    )
                })}
            </svg>
        </div>
    )
}

// Neural Network Loader
function NeuralNetworkLoader({ colors }: { colors: any }) {
    // Generate random positions for neurons
    const generateNeurons = (count: number, layerIndex: number, totalLayers: number) => {
        return Array.from({ length: count }, (_, i) => {
            const xPos = (layerIndex / (totalLayers - 1)) * 100
            const yPos = ((i + 0.5) / count) * 100
            return { id: `${layerIndex}-${i}`, x: xPos, y: yPos }
        })
    }

    // Create a 4-layer neural network
    const layers = [4, 6, 6, 3]
    const totalLayers = layers.length

    const neurons = layers.flatMap((count, layerIndex) => generateNeurons(count, layerIndex, totalLayers))

    // Create connections between adjacent layers
    const connections: { from: string; to: string }[] = []

    for (let l = 0; l < totalLayers - 1; l++) {
        const currentLayer = neurons.filter((n) => n.id.startsWith(`${l}-`))
        const nextLayer = neurons.filter((n) => n.id.startsWith(`${l + 1}-`))

        currentLayer.forEach((from) => {
            nextLayer.forEach((to) => {
                connections.push({ from: from.id, to: to.id })
            })
        })
    }

    return (
        <div className="relative w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 100 100">
                {/* Connections */}
                {connections.map(({ from, to }, i) => {
                    const fromNeuron = neurons.find((n) => n.id === from)!
                    const toNeuron = neurons.find((n) => n.id === to)!

                    return (
                        <motion.line
                            key={`${from}-${to}`}
                            x1={fromNeuron.x}
                            y1={fromNeuron.y}
                            x2={toNeuron.x}
                            y2={toNeuron.y}
                            stroke={colors.accent}
                            strokeWidth="0.5"
                            strokeOpacity="0.6"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{
                                pathLength: 1,
                                opacity: 0.6,
                                strokeDasharray: "5,5",
                                strokeDashoffset: [0, -10],
                            }}
                            transition={{
                                pathLength: { delay: 0.2 + (i % 5) * 0.05, duration: 0.5 },
                                opacity: { delay: 0.2 + (i % 5) * 0.05, duration: 0.5 },
                                strokeDashoffset: {
                                    repeat: Number.POSITIVE_INFINITY,
                                    duration: 1.5,
                                    ease: "linear",
                                },
                            }}
                        />
                    )
                })}

                {/* Neurons */}
                {neurons.map((neuron, i) => (
                    <motion.circle
                        key={neuron.id}
                        cx={neuron.x}
                        cy={neuron.y}
                        r="2"
                        fill={
                            neuron.id.startsWith("0-")
                                ? colors.secondary
                                : neuron.id.startsWith(`${totalLayers - 1}-`)
                                    ? colors.accent
                                    : colors.primary
                        }
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            filter: `drop-shadow(0 0 2px ${colors.primary})`,
                        }}
                        transition={{
                            delay: 0.1 + (i % 5) * 0.05,
                            duration: 0.4,
                        }}
                    />
                ))}

                {/* Data pulse animations */}
                {connections.map(({ from, to }, i) => {
                    const fromNeuron = neurons.find((n) => n.id === from)!
                    const toNeuron = neurons.find((n) => n.id === to)!

                    return (
                        <motion.circle
                            key={`pulse-${from}-${to}`}
                            cx={fromNeuron.x}
                            cy={fromNeuron.y}
                            r="1"
                            fill={colors.accent}
                            initial={{ opacity: 0 }}
                            animate={{
                                cx: [fromNeuron.x, toNeuron.x],
                                cy: [fromNeuron.y, toNeuron.y],
                                opacity: [0, 1, 0],
                                scale: [0.5, 1.5, 0.5],
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatDelay: (i % 7) * 0.3,
                                ease: "easeInOut",
                                delay: (i % 5) * 0.2,
                            }}
                        />
                    )
                })}
            </svg>
        </div>
    )
}

// Pulse Loader
function PulseLoader({ colors }: { colors: any }) {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Central brain icon */}
            <div className="absolute z-10">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        filter: [
                            `drop-shadow(0 0 8px ${colors.primary}80)`,
                            `drop-shadow(0 0 15px ${colors.primary})`,
                            `drop-shadow(0 0 8px ${colors.primary}80)`,
                        ],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                >
                    <Brain size={40} className="text-white" />
                </motion.div>
            </div>

            {/* Concentric circles */}
            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        border: `1px solid ${colors.primary}`,
                        width: `${(i + 1) * 20}%`,
                        height: `${(i + 1) * 20}%`,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0.8, 1.2, 1.8],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.6,
                        ease: "easeOut",
                    }}
                />
            ))}

            {/* Sparks */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute">
                {[...Array(8)].map((_, i) => {
                    const angle = (i * Math.PI) / 4
                    const x1 = 50
                    const y1 = 50
                    const x2 = 50 + Math.cos(angle) * 40
                    const y2 = 50 + Math.sin(angle) * 40

                    return (
                        <motion.line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={i % 2 === 0 ? colors.secondary : colors.accent}
                            strokeWidth="1"
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{
                                pathLength: [0, 1, 0],
                                opacity: [0, 1, 0],
                                strokeWidth: ["1px", "2px", "1px"],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.2,
                                ease: "easeInOut",
                            }}
                        />
                    )
                })}
            </svg>
        </div>
    )
}

// Enhanced Wave Loader with smoother animations
function WaveLoader({ colors }: { colors: any }) {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Glowing background effect */}
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                    background: `radial-gradient(circle, ${colors.primary}30 0%, ${colors.primary}10 40%, ${colors.bg} 70%)`,
                    boxShadow: colors.glow,
                }}
                animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.7, 0.9, 0.7],
                }}
                transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
            />

            {/* Central brain with smooth rotation and pulse */}
            <motion.div
                className="absolute z-10 rounded-full flex items-center justify-center"
                style={{
                    width: "70px",
                    height: "70px",
                    background: `radial-gradient(circle, ${colors.primary}40, ${colors.primary}10)`,
                    boxShadow: colors.glow,
                }}
                animate={{
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    scale: {
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    },
                }}
            >
                <motion.div
                    animate={{
                        rotate: [0, 5, 0, -5, 0],
                        filter: [
                            `drop-shadow(0 0 8px ${colors.primary}80)`,
                            `drop-shadow(0 0 15px ${colors.primary})`,
                            `drop-shadow(0 0 8px ${colors.primary}80)`,
                        ],
                    }}
                    transition={{
                        rotate: {
                            duration: 6,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                        },
                        filter: {
                            duration: 3,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                        },
                    }}
                >
                    <Brain size={40} strokeWidth={1.5} className="text-white" />
                </motion.div>
            </motion.div>

            {/* Enhanced wave animations with smoother transitions */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute">
                {[...Array(4)].map((_, i) => (
                    <motion.path
                        key={i}
                        d="M10,50 C20,40 30,60 40,50 C50,40 60,60 70,50 C80,40 90,60 100,50"
                        fill="none"
                        stroke={
                            i === 0 ? colors.primary : i === 1 ? colors.secondary : i === 2 ? colors.accent : `${colors.primary}60`
                        }
                        strokeWidth={3 - i * 0.5}
                        strokeLinecap="round"
                        initial={{ opacity: 0.3, y: 0 }}
                        animate={{
                            y: [0 + i * 4, 8 + i * 4, 0 + i * 4],
                            opacity: [0.3, 0.7, 0.3],
                            strokeDasharray: ["0, 200", "200, 0", "0, 200"],
                        }}
                        transition={{
                            duration: 3 + i * 0.5,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.4,
                            ease: "easeInOut",
                        }}
                        style={{
                            filter: `drop-shadow(0 0 3px ${colors.primary})`,
                        }}
                    />
                ))}
            </svg>

            {/* Additional wave patterns for more dynamic effect */}
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                className="absolute"
                style={{ transform: "rotate(180deg)" }}
            >
                {[...Array(3)].map((_, i) => (
                    <motion.path
                        key={`alt-${i}`}
                        d="M10,50 C30,45 50,55 70,50 C80,47 90,53 100,50"
                        fill="none"
                        stroke={i === 0 ? `${colors.secondary}80` : i === 1 ? `${colors.accent}70` : `${colors.primary}50`}
                        strokeWidth={2 - i * 0.3}
                        strokeLinecap="round"
                        initial={{ opacity: 0.2, y: 0 }}
                        animate={{
                            y: [0 + i * 3, 6 + i * 3, 0 + i * 3],
                            opacity: [0.2, 0.5, 0.2],
                            strokeDasharray: ["0, 200", "200, 0", "0, 200"],
                        }}
                        transition={{
                            duration: 4 + i * 0.7,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.6 + 0.5,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </svg>

            {/* Enhanced floating particles with smoother movement */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute">
                {[...Array(15)].map((_, i) => {
                    const angle = (i * Math.PI) / 7.5
                    const radius = 25 + (i % 4) * 10
                    const x = 50 + Math.cos(angle) * radius
                    const y = 50 + Math.sin(angle) * radius

                    return (
                        <motion.circle
                            key={i}
                            cx={x}
                            cy={y}
                            r={1.2 + (i % 3) * 0.6}
                            fill={
                                i % 4 === 0
                                    ? colors.primary
                                    : i % 4 === 1
                                        ? colors.secondary
                                        : i % 4 === 2
                                            ? colors.accent
                                            : `${colors.primary}80`
                            }
                            initial={{ opacity: 0.3 }}
                            animate={{
                                opacity: [0.3, 0.8, 0.3],
                                cx: [x, x + Math.cos(angle * 2) * 8, x],
                                cy: [y, y + Math.sin(angle * 2) * 8, y],
                                scale: [1, 1.3, 1],
                            }}
                            transition={{
                                duration: 4 + (i % 5),
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.2,
                                ease: "easeInOut",
                            }}
                        />
                    )
                })}
            </svg>

            {/* Energy pulses radiating from brain */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute">
                {[...Array(3)].map((_, i) => (
                    <motion.circle
                        key={`pulse-${i}`}
                        cx="50"
                        cy="50"
                        r="20"
                        fill="none"
                        stroke={i === 0 ? colors.primary : i === 1 ? colors.secondary : colors.accent}
                        strokeWidth={1.5 - i * 0.3}
                        strokeOpacity={0.5}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: [0, 2.5],
                            opacity: [0.7, 0],
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.8,
                            ease: "easeOut",
                        }}
                    />
                ))}
            </svg>
        </div>
    )
}

// Nodes Loader
function NodesLoader({ colors }: { colors: any }) {
    // Generate nodes
    const nodes = Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI) / 4
        const radius = 35
        return {
            id: i,
            x: 50 + Math.cos(angle) * radius,
            y: 50 + Math.sin(angle) * radius,
            size: 4 + (i % 3),
        }
    })

    return (
        <div className="relative w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 100 100">
                {/* Connections between nodes */}
                {nodes.map((node, i) => (
                    <React.Fragment key={`connections-${i}`}>
                        {nodes.map((target, j) => {
                            if (i !== j && (i + j) % 3 === 0) {
                                return (
                                    <motion.line
                                        key={`line-${i}-${j}`}
                                        x1={node.x}
                                        y1={node.y}
                                        x2={target.x}
                                        y2={target.y}
                                        stroke={colors.accent}
                                        strokeWidth="0.8"
                                        strokeOpacity="0.4"
                                        initial={{ opacity: 0 }}
                                        animate={{
                                            opacity: [0, 0.4, 0],
                                            strokeDasharray: "3,3",
                                            strokeDashoffset: [0, -6],
                                        }}
                                        transition={{
                                            opacity: {
                                                duration: 3,
                                                repeat: Number.POSITIVE_INFINITY,
                                                delay: (i + j) * 0.1,
                                                ease: "easeInOut",
                                            },
                                            strokeDashoffset: {
                                                duration: 1,
                                                repeat: Number.POSITIVE_INFINITY,
                                                ease: "linear",
                                            },
                                        }}
                                    />
                                )
                            }
                            return null
                        })}
                    </React.Fragment>
                ))}

                {/* Central node */}
                <motion.circle
                    cx="50"
                    cy="50"
                    r="8"
                    fill={colors.primary}
                    initial={{ scale: 0 }}
                    animate={{
                        scale: 1,
                        filter: `drop-shadow(0 0 5px ${colors.primary})`,
                    }}
                    transition={{
                        duration: 0.5,
                        ease: "backOut",
                    }}
                />

                <motion.circle
                    cx="50"
                    cy="50"
                    r="12"
                    fill="none"
                    stroke={colors.secondary}
                    strokeWidth="1"
                    strokeOpacity="0.6"
                    initial={{ scale: 0 }}
                    animate={{
                        scale: [0.8, 1.2, 0.8],
                        opacity: [0.2, 0.6, 0.2],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />

                {/* Outer nodes */}
                {nodes.map((node, i) => (
                    <motion.circle
                        key={`node-${i}`}
                        cx={node.x}
                        cy={node.y}
                        r={node.size}
                        fill={i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.secondary : colors.accent}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            y: [node.y - 2, node.y + 2, node.y - 2],
                        }}
                        transition={{
                            scale: {
                                duration: 0.4,
                                delay: 0.1 + i * 0.05,
                            },
                            opacity: {
                                duration: 0.4,
                                delay: 0.1 + i * 0.05,
                            },
                            y: {
                                duration: 2 + (i % 3),
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                            },
                        }}
                    />
                ))}

                {/* Data transfer animations */}
                {nodes.map((node, i) => (
                    <motion.circle
                        key={`data-${i}`}
                        cx="50"
                        cy="50"
                        r="2"
                        fill={i % 2 === 0 ? colors.secondary : colors.accent}
                        initial={{ opacity: 0 }}
                        animate={{
                            cx: ["50", node.x.toString()],
                            cy: ["50", node.y.toString()],
                            opacity: [0, 1, 0],
                            scale: [0.5, 1.5, 0],
                        }}
                        transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatDelay: 2 + i * 0.3,
                            ease: "easeInOut",
                            delay: i * 0.2,
                        }}
                    />
                ))}

                {/* Central icon */}
                <foreignObject x="38" y="38" width="24" height="24">
                    <Brain size={24} className="text-white" />
                </foreignObject>
            </svg>
        </div>
    )
}

