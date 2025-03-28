"use client"
import { motion } from "framer-motion"
import { FileText, List, HelpCircle, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProductShowcase() {
    return (
        <section className="py-20 px-4">
            <div className="container mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                    Our AI-Powered Learning Tools
                </h2>

                {/* MCQ Generator */}
                <div id="mcq" className="mb-32">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-2xl md:text-3xl font-bold mb-4">MCQ Generator</h3>
                            <p className="text-gray-300 mb-6">
                                Transform your study materials into comprehensive multiple-choice questions. Our AI analyzes your PDFs
                                and generates 10-15 targeted questions to test your knowledge.
                            </p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start">
                                    <List className="h-6 w-6 mr-2 text-purple-400 flex-shrink-0 mt-0.5" />
                                    <span>Automatically generates 10-15 questions from your PDF</span>
                                </li>
                                <li className="flex items-start">
                                    <List className="h-6 w-6 mr-2 text-purple-400 flex-shrink-0 mt-0.5" />
                                    <span>Covers key concepts and important details</span>
                                </li>
                                <li className="flex items-start">
                                    <List className="h-6 w-6 mr-2 text-purple-400 flex-shrink-0 mt-0.5" />
                                    <span>Includes answer explanations to enhance understanding</span>
                                </li>
                            </ul>
                            <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
                                Try MCQ Generator
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="h-5 w-5 mr-2 text-purple-400" />
                                        MCQ Sample
                                    </CardTitle>
                                    <CardDescription>Generated from "Introduction to Neural Networks" PDF</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="font-medium">1. Which of the following is a type of neural network architecture?</p>
                                        <div className="pl-5 space-y-1 text-sm">
                                            <p className="flex items-center">
                                                <span className="inline-block w-5">A.</span> Convolutional Neural Network
                                            </p>
                                            <p className="flex items-center">
                                                <span className="inline-block w-5">B.</span> Recursive Function Network
                                            </p>
                                            <p className="flex items-center">
                                                <span className="inline-block w-5">C.</span> Binary Search Network
                                            </p>
                                            <p className="flex items-center">
                                                <span className="inline-block w-5">D.</span> Quantum Neural Network
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-medium">2. What is the purpose of an activation function in neural networks?</p>
                                        <div className="pl-5 space-y-1 text-sm">
                                            <p className="flex items-center">
                                                <span className="inline-block w-5">A.</span> To initialize weights
                                            </p>
                                            <p className="flex items-center">
                                                <span className="inline-block w-5">B.</span> To introduce non-linearity
                                            </p>
                                            <p className="flex items-center">
                                                <span className="inline-block w-5">C.</span> To normalize input data
                                            </p>
                                            <p className="flex items-center">
                                                <span className="inline-block w-5">D.</span> To reduce computational complexity
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>

                {/* Subjective Question Generator */}
                <div id="subjective" className="mb-32">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="order-2 md:order-1"
                        >
                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <HelpCircle className="h-5 w-5 mr-2 text-blue-400" />
                                        Subjective Question Sample
                                    </CardTitle>
                                    <CardDescription>Generated from "Climate Change Impact" PDF</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="font-medium">
                                            1. Explain how rising global temperatures affect marine ecosystems and discuss potential
                                            mitigation strategies.
                                        </p>
                                        <div className="pl-5 text-sm text-gray-300 border-l-2 border-blue-400 mt-2">
                                            <p className="italic">
                                                Hint: Consider coral bleaching, ocean acidification, and changes in marine biodiversity.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-medium">
                                            2. Compare and contrast the effectiveness of carbon taxation versus cap-and-trade systems in
                                            reducing greenhouse gas emissions.
                                        </p>
                                        <div className="pl-5 text-sm text-gray-300 border-l-2 border-blue-400 mt-2">
                                            <p className="italic">
                                                Hint: Consider economic impacts, implementation challenges, and real-world examples.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="order-1 md:order-2"
                        >
                            <h3 className="text-2xl md:text-3xl font-bold mb-4">Subjective Question Generator</h3>
                            <p className="text-gray-300 mb-6">
                                Develop critical thinking skills with our subjective question generator. It creates thought-provoking
                                questions that require in-depth analysis and comprehensive answers.
                            </p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start">
                                    <HelpCircle className="h-6 w-6 mr-2 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <span>Generates open-ended questions that promote critical thinking</span>
                                </li>
                                <li className="flex items-start">
                                    <HelpCircle className="h-6 w-6 mr-2 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <span>Provides helpful hints and guidance for answering</span>
                                </li>
                                <li className="flex items-start">
                                    <HelpCircle className="h-6 w-6 mr-2 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <span>Covers complex topics requiring synthesis of information</span>
                                </li>
                            </ul>
                            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                                Try Subjective Q&A
                            </Button>
                        </motion.div>
                    </div>
                </div>

                {/* Flowchart Generator */}
                <div id="flowchart" className="mb-16">
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-2xl md:text-3xl font-bold mb-4">
                                <span className="bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                    Our Hero Product: Flowchart & Mindmap Generator
                                </span>
                            </h3>
                            <p className="text-gray-300 max-w-3xl mx-auto mb-8">
                                Transform complex concepts into visual, easy-to-understand flowcharts and mindmaps. Our AI analyzes your
                                PDF content and creates beautiful, interactive visualizations that make learning and memorization
                                effortless.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <ul className="space-y-4 mb-6">
                                <li className="flex items-start">
                                    <GitBranch className="h-6 w-6 mr-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-lg">Visual Learning</h4>
                                        <p className="text-gray-300">
                                            Convert text-heavy content into visual diagrams that are easier to understand and remember
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <GitBranch className="h-6 w-6 mr-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-lg">Interactive Exploration</h4>
                                        <p className="text-gray-300">
                                            Zoom, pan, and click through interactive elements to explore concepts in depth
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <GitBranch className="h-6 w-6 mr-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-lg">Customizable Designs</h4>
                                        <p className="text-gray-300">
                                            Adjust colors, layouts, and styles to match your learning preferences
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <GitBranch className="h-6 w-6 mr-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-lg">Export & Share</h4>
                                        <p className="text-gray-300">
                                            Download as images or PDFs, or share directly with classmates and study groups
                                        </p>
                                    </div>
                                </li>
                            </ul>
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
                            >
                                Try Flowchart Generator
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20"></div>
                                <img
                                    src="/placeholder.svg?height=400&width=600"
                                    alt="Flowchart Example"
                                    className="w-full h-auto rounded border border-slate-600"
                                />
                                <div className="mt-4 text-center relative z-10">
                                    <h4 className="font-semibold">Neural Network Architecture Flowchart</h4>
                                    <p className="text-sm text-gray-300">Generated from "Deep Learning Fundamentals" PDF</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mt-20"
                >
                    <div className="max-w-3xl mx-auto bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-8 rounded-xl border border-purple-700/50">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Transform Your Learning Experience?</h3>
                        <p className="text-gray-300 mb-6">
                            Join thousands of students who are already using Notes Academy to enhance their study efficiency and
                            knowledge retention.
                        </p>
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                        >
                            Get Started Today
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

