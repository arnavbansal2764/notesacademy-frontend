import Link from "next/link"

export default function Footer() {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div>
                        <h3 className="font-bold text-lg bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                            NotesAcademy
                        </h3>
                        <p className="text-gray-400 text-sm">
                            AI-powered study tools for smarter learning
                        </p>
                    </div>

                    <div className="flex space-x-6 text-sm">
                        <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                            Pricing
                        </Link>
                        <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                            Contact
                        </Link>
                        <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                            Privacy
                        </Link>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-6 pt-6 text-center text-gray-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} NotesAcademy. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

