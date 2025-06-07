import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react"

export default function Footer() {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold text-xl mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                            NotesInstitute
                        </h3>
                        <p className="text-gray-400 mb-4">
                            Transforming education with AI-powered learning tools that make studying more efficient and effective.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="https://facebook.com" target="_blank" className="text-gray-400 hover:text-white transition-colors">
                                <Facebook size={20} />
                            </Link>
                            <Link href="https://twitter.com" target="_blank" className="text-gray-400 hover:text-white transition-colors">
                                <Twitter size={20} />
                            </Link>
                            <Link href="https://instagram.com" target="_blank" className="text-gray-400 hover:text-white transition-colors">
                                <Instagram size={20} />
                            </Link>
                            <Link href="https://linkedin.com" target="_blank" className="text-gray-400 hover:text-white transition-colors">
                                <Linkedin size={20} />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Products</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/mcq-generator" className="text-gray-400 hover:text-white transition-colors">
                                    MCQ Generator
                                </Link>
                            </li>
                            <li>
                                <Link href="/subjective-qa" className="text-gray-400 hover:text-white transition-colors">
                                    Subjective Q&A
                                </Link>
                            </li>
                            <li>
                                <Link href="/flowchart-generator" className="text-gray-400 hover:text-white transition-colors">
                                    Flowcharts & Mindmaps
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                                    Pricing
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Resources</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/tutorials" className="text-gray-400 hover:text-white transition-colors">
                                    Tutorials
                                </Link>
                            </li>
                            <li>
                                <Link href="/docs" className="text-gray-400 hover:text-white transition-colors">
                                    Documentation
                                </Link>
                            </li>
                            <li>
                                <Link href="/support" className="text-gray-400 hover:text-white transition-colors">
                                    Support
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Contact</h4>
                        <ul className="space-y-2">
                            <li className="flex items-center">
                                <Mail size={16} className="mr-2 text-gray-400" />
                                <a href="mailto:info@notesinstitute.com" className="text-gray-400 hover:text-white transition-colors">
                                    info@notesinstitute.com
                                </a>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-8 pt-8 text-center text-gray-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} NotesInstitute. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

