"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Home, Search, ArrowLeft } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
            <Navbar />

            <main className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
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
                                        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl" />
                                        <div className="relative bg-indigo-500/20 p-4 rounded-full">
                                            <Search className="h-12 w-12 text-indigo-400" />
                                        </div>
                                    </motion.div>

                                    <motion.h1
                                        className="text-5xl font-bold mb-2 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                    >
                                        404
                                    </motion.h1>

                                    <motion.h2
                                        className="text-2xl font-bold mb-2 text-white"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.5 }}
                                    >
                                        Page Not Found
                                    </motion.h2>

                                    <motion.p
                                        className="text-gray-400 max-w-md"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5, duration: 0.5 }}
                                    >
                                        The page you are looking for might have been removed, had its name changed, or is temporarily
                                        unavailable.
                                    </motion.p>
                                </div>

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
                                        asChild
                                        className="flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
                                    >
                                        <Link href="/">
                                            <Home className="mr-2 h-4 w-4" />
                                            Return Home
                                        </Link>
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
