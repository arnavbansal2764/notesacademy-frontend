"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LoaderProps {
    text?: string
    className?: string
    size?: "sm" | "md" | "lg"
    variant?: "default" | "dots" | "spinner" | "pulse"
}

export function Loader({ text, className, size = "md", variant = "default" }: LoaderProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
    }

    const renderLoader = () => {
        switch (variant) {
            case "dots":
                return (
                    <div className="flex space-x-2 justify-center items-center">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className={cn(
                                    "bg-blue-500 rounded-full",
                                    size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-4 w-4",
                                )}
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Number.POSITIVE_INFINITY,
                                    delay: i * 0.2,
                                }}
                            />
                        ))}
                    </div>
                )
            case "spinner":
                return (
                    <motion.div
                        className={cn(
                            "border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full",
                            sizeClasses[size],
                        )}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                )
            case "pulse":
                return (
                    <motion.div
                        className={cn("bg-blue-500 rounded-full", sizeClasses[size])}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                        }}
                    />
                )
            default:
                return (
                    <svg
                        className={cn("animate-spin", sizeClasses[size])}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                )
        }
    }

    return (
        <div className={cn("flex flex-col items-center justify-center", className)}>
            {renderLoader()}
            {text && (
                <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-sm font-medium text-gray-300"
                >
                    {text}
                </motion.p>
            )}
        </div>
    )
}

