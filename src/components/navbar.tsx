"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-bold text-2xl bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                            NotesAcademy
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/mcq-generator" className="text-gray-300 hover:text-white transition-colors">
                            MCQ Generator
                        </Link>
                        <Link href="/subjective-qa" className="text-gray-300 hover:text-white transition-colors">
                            Subjective Q&A
                        </Link>
                        <Link href="/flowchart-generator" className="text-gray-300 hover:text-white transition-colors">
                            Flowcharts & Mindmaps
                        </Link>
                        <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
                            Get Started
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white">
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden pt-4 pb-2 space-y-4">
                        <Link
                            href="/mcq-generator"
                            className="block text-gray-300 hover:text-white transition-colors py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            MCQ Generator
                        </Link>
                        <Link
                            href="/subjective-qa"
                            className="block text-gray-300 hover:text-white transition-colors py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Subjective Q&A
                        </Link>
                        <Link
                            href="/flowchart-generator"
                            className="block text-gray-300 hover:text-white transition-colors py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Flowcharts & Mindmaps
                        </Link>
                        <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
                            Get Started
                        </Button>
                    </div>
                )}
            </div>
        </nav>
    )
}

