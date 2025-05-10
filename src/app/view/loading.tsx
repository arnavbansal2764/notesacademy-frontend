"use client"

import { motion } from "framer-motion"

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center">
                <motion.div
                    className="relative w-24 h-24 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Animated circles representing a neural network */}
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute top-1/2 left-1/2 rounded-full border-4 border-indigo-500/30"
                            initial={{
                                x: -12,
                                y: -12,
                                width: 24,
                                height: 24,
                                opacity: 0.3,
                                borderColor: "rgba(99, 102, 241, 0.3)",
                            }}
                            animate={{
                                x: -40,
                                y: -40,
                                width: 80,
                                height: 80,
                                opacity: 0,
                                borderColor: "rgba(99, 102, 241, 0)",
                            }}
                            transition={{
                                duration: 2,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.4,
                                ease: "easeOut",
                            }}
                        />
                    ))}

                    {/* Central node */}
                    <motion.div
                        className="absolute top-1/2 left-1/2 w-12 h-12 -ml-6 -mt-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                        animate={{
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                        }}
                    />
                </motion.div>

                <motion.h2
                    className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    Loading Mindmap
                </motion.h2>

                <motion.div
                    className="mt-4 flex space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-3 h-3 rounded-full bg-indigo-500"
                            animate={{
                                y: [0, -10, 0],
                                backgroundColor: [
                                    "rgb(99, 102, 241)", // indigo-500
                                    "rgb(168, 85, 247)", // purple-500
                                    "rgb(236, 72, 153)", // pink-500
                                    "rgb(99, 102, 241)", // back to indigo-500
                                ],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.2,
                                ease: "easeInOut",
                                times: [0, 0.5, 1],
                            }}
                        />
                    ))}
                </motion.div>
            </div>
        </div>
    )
}
