"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle, Home, RefreshCw, ArrowLeft } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Application error:", error)
    }, [error])

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="relative mb-8">
                    {/* Animated background elements */}
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
                    <div className="absolute top-10 right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl" />

                    {/* Error content */}
                    <motion.div
                        className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden shadow-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Top gradient bar */}
                        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                        <div className="p-8">
                            <div className="flex flex-col items-center text-center mb-8">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 20,
                                        delay: 0.2,
                                    }}
                                    className="relative mb-6"
                                >
                                    <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
                                    <div className="relative bg-red-500/20 p-4 rounded-full">
                                        <AlertCircle className="h-12 w-12 text-red-500" />
                                    </div>
                                </motion.div>

                                <motion.h1
                                    className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                >
                                    Something Went Wrong
                                </motion.h1>

                                <motion.p
                                    className="text-gray-400 max-w-md"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                >
                                    We apologize for the inconvenience. An unexpected error has occurred.
                                </motion.p>
                            </div>

                            <motion.div
                                className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-6"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                            >
                                <p className="text-sm text-gray-400 font-mono">
                                    {error.message || "An unknown error occurred"}
                                    {error.digest && <span className="block mt-1 text-xs text-gray-500">Error ID: {error.digest}</span>}
                                </p>
                            </motion.div>

                            <motion.div
                                className="flex flex-col sm:flex-row gap-3 justify-center"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                            >
                                <Button
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    className="flex items-center justify-center"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Go Back
                                </Button>

                                <Button
                                    onClick={() => reset()}
                                    className="flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Try Again
                                </Button>

                                <Button variant="outline" asChild className="flex items-center justify-center">
                                    <Link href="/">
                                        <Home className="mr-2 h-4 w-4" />
                                        Return Home
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Support information */}
                <motion.div
                    className="text-center text-sm text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                >
                    <p>
                        If this problem persists, please contact our support team at{" "}
                        <a
                            href="mailto:support@notesacademy.com"
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            support@notesacademy.com
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
