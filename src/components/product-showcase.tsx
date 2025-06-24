"use client"
import { motion } from "framer-motion"
import { FileText, List, HelpCircle, GitBranch, BookOpen, Presentation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function ProductShowcase() {
    const { data: session } = useSession()
    const router = useRouter()

    const handleMCQGenerator = () => {
        if (session) {
            router.push("/mcq-generator")
        } else {
            // Scroll to pricing section on the same page
            const pricingSection = document.querySelector('section[id*="pricing"]') || 
                                 document.querySelector('[data-pricing]') ||
                                 document.querySelector('.pricing-section');
            if (pricingSection) {
                pricingSection.scrollIntoView({ behavior: "smooth" })
            } else {
                // Fallback to auth if pricing section not found
                router.push("/auth")
            }
        }
    }

    const handleShortNotesGenerator = () => {
        if (session) {
            router.push("/short-notes-generator")
        } else {
            // Scroll to pricing section on the same page
            const pricingSection = document.querySelector('section[id*="pricing"]') || 
                                 document.querySelector('[data-pricing]') ||
                                 document.querySelector('.pricing-section');
            if (pricingSection) {
                pricingSection.scrollIntoView({ behavior: "smooth" })
            } else {
                // Fallback to auth if pricing section not found
                router.push("/auth")
            }
        }
    }

    const handleSubjectiveQA = () => {
        if (session) {
            router.push("/subjective-qa")
        } else {
            // Scroll to pricing section on the same page
            const pricingSection = document.querySelector('section[id*="pricing"]') || 
                                 document.querySelector('[data-pricing]') ||
                                 document.querySelector('.pricing-section');
            if (pricingSection) {
                pricingSection.scrollIntoView({ behavior: "smooth" })
            } else {
                // Fallback to auth if pricing section not found
                router.push("/auth")
            }
        }
    }

    const handleFlowchartGenerator = () => {
        if (session) {
            router.push("/flowchart-generator")
        } else {
            // Scroll to pricing section on the same page
            const pricingSection = document.querySelector('section[id*="pricing"]') || 
                                 document.querySelector('[data-pricing]') ||
                                 document.querySelector('.pricing-section');
            if (pricingSection) {
                pricingSection.scrollIntoView({ behavior: "smooth" })
            } else {
                // Fallback to auth if pricing section not found
                router.push("/auth")
            }
        }
    }

    const handlePPTGenerator = () => {
        if (session) {
            router.push("/ppt-generator")
        } else {
            // Scroll to pricing section on the same page
            const pricingSection = document.querySelector('section[id*="pricing"]') || 
                                 document.querySelector('[data-pricing]') ||
                                 document.querySelector('.pricing-section');
            if (pricingSection) {
                pricingSection.scrollIntoView({ behavior: "smooth" })
            } else {
                // Fallback to auth if pricing section not found
                router.push("/auth")
            }
        }
    }

    const handleGetStarted = () => {
        if (session) {
            router.push("/dashboard")
        } else {
            // Scroll to pricing section on the same page
            const pricingSection = document.querySelector('section[id*="pricing"]') || 
                                 document.querySelector('[data-pricing]') ||
                                 document.querySelector('.pricing-section');
            if (pricingSection) {
                pricingSection.scrollIntoView({ behavior: "smooth" })
            } else {
                // Fallback to auth if pricing section not found
                router.push("/auth")
            }
        }
    }

    return (
        <section id="product-showcase" className="py-20 bg-gradient-to-b from-black to-gray-900 px-4 md:px-12">
            <div className="container mx-auto">
                <motion.h2
                    className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    Explore Our AI-Powered Teaching Tools
                </motion.h2>

                {/* PPT Generator */}
                <div id="ppt" className="mb-32">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-2xl md:text-3xl font-bold mb-4">Instant PPT Generator</h3>
                            <p className="text-gray-300 mb-6">
                                Create professional PowerPoint presentations instantly from any topic. Our AI generates beautiful slides with content, images, and formatting ready for your class or meeting.
                            </p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start">
                                    <Presentation className="h-6 w-6 mr-2 text-pink-400 flex-shrink-0 mt-0.5" />
                                    <span>Generates 3-30 professional slides from any topic</span>
                                </li>
                                <li className="flex items-start">
                                    <Presentation className="h-6 w-6 mr-2 text-pink-400 flex-shrink-0 mt-0.5" />
                                    <span>Includes relevant images and visual elements</span>
                                </li>
                                <li className="flex items-start">
                                    <Presentation className="h-6 w-6 mr-2 text-pink-400 flex-shrink-0 mt-0.5" />
                                    <span>Downloads as both PowerPoint and PDF formats</span>
                                </li>
                            </ul>
                            <Button
                                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                                onClick={handlePPTGenerator}
                            >
                                Try PPT Generator
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <Card className="bg-slate-800 border-slate-700 shadow-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Presentation className="h-5 w-5 mr-2 text-pink-400" />
                                        PPT Sample
                                    </CardTitle>
                                    <CardDescription>Generated presentation on "Artificial Intelligence in Healthcare"</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="border border-slate-600 rounded p-3 bg-slate-700/50">
                                            <h4 className="font-semibold text-pink-400 mb-2">Slide 1: Title Slide</h4>
                                            <p className="text-sm text-gray-300">
                                                "Artificial Intelligence in Healthcare: Transforming Patient Care"
                                            </p>
                                        </div>
                                        <div className="border border-slate-600 rounded p-3 bg-slate-700/50">
                                            <h4 className="font-semibold text-blue-400 mb-2">Slide 2: Introduction</h4>
                                            <ul className="text-sm text-gray-300 space-y-1">
                                                <li>• Current healthcare challenges</li>
                                                <li>• Role of AI in modern medicine</li>
                                                <li>• Benefits and opportunities</li>
                                            </ul>
                                        </div>
                                        <div className="border border-slate-600 rounded p-3 bg-slate-700/50">
                                            <h4 className="font-semibold text-purple-400 mb-2">Slide 3: Applications</h4>
                                            <ul className="text-sm text-gray-300 space-y-1">
                                                <li>• Medical imaging analysis</li>
                                                <li>• Drug discovery</li>
                                                <li>• Personalized treatment</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>

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
                            <Button
                                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white"
                                onClick={handleMCQGenerator}
                            >
                                Try MCQ Generator
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <Card className="bg-slate-800 border-slate-700 shadow-xl">
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

                {/* Short Notes Generator */}
                <div id="shortnotes" className="mb-32">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-2xl md:text-3xl font-bold mb-4">Short Notes Generator</h3>
                            <p className="text-gray-300 mb-6">
                                Transform lengthy study materials into concise, easy-to-review notes. Our AI analyzes your PDF
                                and extracts key points, important concepts, and essential information into digestible format.
                            </p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start">
                                    <BookOpen className="h-6 w-6 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Condenses complex chapters into focused short notes</span>
                                </li>
                                <li className="flex items-start">
                                    <BookOpen className="h-6 w-6 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Highlights key concepts and important definitions</span>
                                </li>
                                <li className="flex items-start">
                                    <BookOpen className="h-6 w-6 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Perfect for quick revision and exam preparation</span>
                                </li>
                            </ul>
                            <Button
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                                onClick={handleShortNotesGenerator}
                            >
                                Try Short Notes Generator
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <Card className="bg-slate-800 border-slate-700 shadow-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <BookOpen className="h-5 w-5 mr-2 text-green-400" />
                                        Short Notes Sample
                                    </CardTitle>
                                    <CardDescription>Generated from "Photosynthesis Chapter" PDF</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="border-l-4 border-green-400 pl-4">
                                            <h4 className="font-semibold text-green-400 mb-1">Key Definition</h4>
                                            <p className="text-sm">
                                                <strong>Photosynthesis:</strong> Process by which plants convert light energy into chemical energy (glucose) using chlorophyll.
                                            </p>
                                        </div>
                                        <div className="border-l-4 border-blue-400 pl-4">
                                            <h4 className="font-semibold text-blue-400 mb-1">Important Formula</h4>
                                            <p className="text-sm font-mono bg-slate-700 p-2 rounded">
                                                6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂
                                            </p>
                                        </div>
                                        <div className="border-l-4 border-purple-400 pl-4">
                                            <h4 className="font-semibold text-purple-400 mb-1">Key Points</h4>
                                            <ul className="text-sm space-y-1">
                                                <li>• Occurs in chloroplasts</li>
                                                <li>• Two stages: Light & Dark reactions</li>
                                                <li>• Produces oxygen as byproduct</li>
                                            </ul>
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
                            <Card className="bg-slate-800 border-slate-700 shadow-xl">
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
                            <Button
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                                onClick={handleSubjectiveQA}
                            >
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
                                        <h4 className="font-semibold text-lg">Visual Teaching</h4>
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
                                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white"
                                onClick={handleFlowchartGenerator}
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
                            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 relative overflow-hidden shadow-xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20"></div>
                                <img
                                    src="https://marketplace.canva.com/EAFs8i1Wibk/2/0/1600w/canva-black-doodle-tools-for-generating-ideas-mind-map-T3PGwmgJmUM.jpg"
                                    alt="Flowchart Example"
                                    className="w-full h-auto rounded border border-slate-600"
                                />
                                
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
                    <div className="max-w-3xl mx-auto bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-8 rounded-xl border border-purple-700/50 shadow-lg">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Transform Your Teaching Experience?</h3>
                        <p className="text-gray-300 mb-6">
                            Join thousands of teachers who are already using our platform to enhance their teaching efficiency and their student's 
                            knowledge retention.
                        </p>
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white"
                            onClick={handleGetStarted}
                        >
                            Get Started Today
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

