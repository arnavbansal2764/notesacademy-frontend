"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Linkedin, Github, Mail, Target, Users, Lightbulb, Zap, BookOpen, Brain, FileText, Network } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
            <Navbar />

            <main className="container mx-auto px-4 py-16">
                <div className="max-w-6xl mx-auto">
                    {/* Hero Section */}
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            About NotesAcademy
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Revolutionizing education through AI-powered tools that transform the way teachers create content and students learn.
                        </p>
                    </motion.div>

                    {/* Mission Section */}
                    <motion.section
                        className="mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                    >
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center text-2xl">
                                    <Target className="h-6 w-6 mr-3 text-blue-400" />
                                    Our Mission
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    At NotesAcademy, we believe that education should be accessible, efficient, and engaging. Our AI-powered platform
                                    empowers educators, tutors, and parents to create high-quality educational content instantly, while helping students
                                    learn more effectively through interactive visualizations and comprehensive study materials.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.section>

                    {/* What We Do Section */}
                    <motion.section
                        className="mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold mb-8 text-center">What We Do</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <div className="bg-blue-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                        <FileText className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <CardTitle>Question Generation</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Generate objective and subjective questions from any PDF material using advanced AI
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <div className="bg-purple-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                        <Network className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <CardTitle>Mind Mapping</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Create interactive flowcharts and mind maps to visualize complex concepts
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <div className="bg-green-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                        <BookOpen className="h-6 w-6 text-green-400" />
                                    </div>
                                    <CardTitle>Short Notes</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Transform lengthy documents into concise, easy-to-review study notes
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <div className="bg-orange-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                        <Brain className="h-6 w-6 text-orange-400" />
                                    </div>
                                    <CardTitle>AI Presentations</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Generate professional PowerPoint presentations from any topic instantly
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <div className="bg-indigo-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                        <Zap className="h-6 w-6 text-indigo-400" />
                                    </div>
                                    <CardTitle>Interactive Quizzes</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Create engaging MCQ quizzes with instant feedback and detailed explanations
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <div className="bg-pink-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                        <Users className="h-6 w-6 text-pink-400" />
                                    </div>
                                    <CardTitle>For Everyone</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Designed for teachers, tutors, students, and parents to enhance learning outcomes
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </motion.section>

                    {/* Problems We Solve */}
                    <motion.section
                        className="mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center text-2xl">
                                    <Lightbulb className="h-6 w-6 mr-3 text-yellow-400" />
                                    Problems We Solve
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-3 text-blue-400">For Educators</h3>
                                        <ul className="space-y-2 text-gray-300">
                                            <li>• Time-consuming content creation</li>
                                            <li>• Difficulty in generating diverse question types</li>
                                            <li>• Creating engaging visual learning materials</li>
                                            <li>• Preparation of comprehensive study materials</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-3 text-green-400">For Students</h3>
                                        <ul className="space-y-2 text-gray-300">
                                            <li>• Understanding complex concepts</li>
                                            <li>• Retention of study material</li>
                                            <li>• Lack of practice questions</li>
                                            <li>• Overwhelming amount of information</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.section>

                    {/* Target Audience */}
                    <motion.section
                        className="mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold mb-8 text-center">Who We Serve</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="bg-slate-800 border-slate-700 text-center">
                                <CardHeader>
                                    <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users className="h-8 w-8 text-blue-400" />
                                    </div>
                                    <CardTitle>Teachers</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Create engaging content and assessments for your students
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700 text-center">
                                <CardHeader>
                                    <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Brain className="h-8 w-8 text-purple-400" />
                                    </div>
                                    <CardTitle>Tutors</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Enhance your tutoring sessions with AI-generated materials
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700 text-center">
                                <CardHeader>
                                    <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <BookOpen className="h-8 w-8 text-green-400" />
                                    </div>
                                    <CardTitle>Students</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Study smarter with interactive materials and practice questions
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700 text-center">
                                <CardHeader>
                                    <div className="bg-orange-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users className="h-8 w-8 text-orange-400" />
                                    </div>
                                    <CardTitle>Parents</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Support your child's learning with quality educational content
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </motion.section>

                    {/* Product Development Stage */}
                    <motion.section
                        className="mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center text-2xl">
                                    <Zap className="h-6 w-6 mr-3 text-green-400" />
                                    Current Development Stage
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                                        <span className="font-medium text-green-400">✅ Live & Operational</span>
                                        <span className="text-sm text-green-300">Available Now</span>
                                    </div>

                                    <p className="text-gray-300 text-lg">
                                        NotesAcademy is fully operational and serving users worldwide. Our platform features:
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-blue-400">Available Features:</h4>
                                            <ul className="space-y-1 text-gray-300 text-sm">
                                                <li>✅ MCQ Question Generator</li>
                                                <li>✅ Subjective Q&A Generator</li>
                                                <li>✅ Interactive Mind Maps</li>
                                                <li>✅ Short Notes Generator</li>
                                                <li>✅ AI-Powered PPT Generator</li>
                                                <li>✅ User Dashboard & Analytics</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-purple-400">Coming Soon:</h4>
                                            <ul className="space-y-1 text-gray-300 text-sm">
                                                <li>🔄 Advanced Analytics</li>
                                                <li>🔄 Collaborative Features</li>
                                                <li>🔄 Mobile Application</li>
                                                <li>🔄 Multi-language Support</li>
                                                <li>🔄 Integration with LMS</li>
                                                <li>🔄 Advanced AI Models</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.section>

                    {/* Team Section */}
                    <motion.section
                        className="mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold mb-8 text-center">Meet the Team</h2>
                        <div className="flex justify-center">
                            <Card className="bg-slate-800 border-slate-700 max-w-md">
                                <CardHeader className="text-center">
                                    <div className="relative w-32 h-32 mx-auto mb-4">
                                        <Image
                                            src="/mypic.jpg"
                                            alt="Arnav Bansal"
                                            width={128}
                                            height={128}
                                            className="rounded-full object-cover border-4 border-blue-500 w-32 h-32"
                                            onError={(e) => {
                                                // Fallback to placeholder if image doesn't exist
                                                e.currentTarget.style.display = 'none';
                                                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                                if (nextElement) {
                                                    nextElement.style.display = 'flex';
                                                }
                                            }}
                                        />
                                        <div
                                            className="hidden w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-4xl font-bold items-center justify-center border-4 border-blue-500"
                                        >
                                            AB
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl">Arnav Bansal</CardTitle>
                                    <CardDescription className="text-lg text-blue-400">
                                        Founder & Lead Developer
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <p className="text-gray-300 mb-6 leading-relaxed">
                                        Passionate developer and educator with a vision to revolutionize learning through AI.
                                        Arnav combines technical expertise with deep understanding of educational challenges to
                                        create innovative solutions that make learning more effective and accessible.
                                    </p>

                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-green-400">Expertise:</h4>
                                        <div className="flex flex-wrap gap-2 justify-center mb-6">
                                            <span className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm">Full-Stack Development</span>
                                            <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm">AI Integration</span>
                                            <span className="px-3 py-1 bg-green-900/50 text-green-300 rounded-full text-sm">EdTech</span>
                                            <span className="px-3 py-1 bg-orange-900/50 text-orange-300 rounded-full text-sm">UI/UX Design</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-center space-x-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="bg-blue-900/20 border-blue-500/30 hover:bg-blue-900/40"
                                        >
                                            <Link
                                                href="https://www.linkedin.com/in/arnav-bansal-5716b9220/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Linkedin className="h-4 w-4 mr-2" />
                                                LinkedIn
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="bg-gray-900/20 border-gray-500/30 hover:bg-gray-900/40"
                                        >
                                            <Link href="/contact">
                                                <Mail className="h-4 w-4 mr-2" />
                                                Contact
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.section>

                    {/* Call to Action */}
                    <motion.section
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                    >
                        <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30">
                            <CardHeader>
                                <CardTitle className="text-3xl">Ready to Transform Your Teaching?</CardTitle>
                                <CardDescription className="text-xl text-gray-300">
                                    Join thousands of educators who are already using NotesAcademy to create better learning experiences.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button
                                        size="lg"
                                        asChild
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                                    >
                                        <Link href="/pricing">
                                            Get Started Today
                                        </Link>
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        asChild
                                        className="border-blue-500/30 hover:bg-blue-900/20"
                                    >
                                        <Link href="/flowchart-generator">
                                            Try Free Sample
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.section>
                </div>
            </main>

            <Footer />
        </div>
    )
}