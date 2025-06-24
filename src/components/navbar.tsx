"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, LayoutDashboard, BrainCircuit, User, ChevronDown, FileText, BookOpen, HelpCircle, GitBranch, Presentation } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [userCoins, setUserCoins] = useState<number | null>(null)
    const { data: session, status } = useSession()
    const router = useRouter()
    const isAuthenticated = status === "authenticated"

    // Handle scroll effect for navbar
    useEffect(() => {
        // Only access window in the browser environment
        if (typeof window !== "undefined") {
            const handleScroll = () => {
                setScrolled(window.scrollY > 50)
            }
            
            // Initial check for the scroll position
            handleScroll()
            
            window.addEventListener("scroll", handleScroll)
            return () => window.removeEventListener("scroll", handleScroll)
        }
    }, [])

    const handleSignOut = async () => {
        await signOut({ redirect: false })
        router.push("/")
    }

    const handleGetStarted = () => {
        router.push("/auth")
    }

    const handleNavigation = (path: string) => {
        router.push(path)
        setIsMenuOpen(false)
    }

    // Get user initials for avatar fallback
    const getUserInitials = () => {
        if (!session?.user?.name) return "NA"
        return session.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
    }

    // Fetch user coins when session is available
    useEffect(() => {
        if (session?.user) {
            fetchUserCoins()
        }
    }, [session])

    const fetchUserCoins = async () => {
        try {
            const response = await fetch('/api/user-profile')
            if (response.ok) {
                const data = await response.json()
                setUserCoins(data.user?.coins || 0)
            }
        } catch (error) {
            console.error('Error fetching user coins:', error)
        }
    }

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-slate-900/90 backdrop-blur-md py-3 shadow-lg" : "bg-slate-900/80 backdrop-blur-md py-4"
                }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <BrainCircuit className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-2xl bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                            NotesAcademy
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <button
                            onClick={() => handleNavigation("/")}
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            Home
                        </button>

                        {/* Generate Content Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                    Generate Content
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="start">
                                <DropdownMenuItem 
                                    onClick={() => handleNavigation("/ppt-generator")}
                                    className="text-gray-300 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white cursor-pointer"
                                >
                                    <Presentation className="h-4 w-4 mr-2 text-pink-400" />
                                    PPT Maker
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => handleNavigation("/short-notes-generator")}
                                    className="text-gray-300 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white cursor-pointer"
                                >
                                    <BookOpen className="h-4 w-4 mr-2 text-green-400" />
                                    Short Notes
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => handleNavigation("/mcq-generator")}
                                    className="text-gray-300 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white cursor-pointer"
                                >
                                    <FileText className="h-4 w-4 mr-2 text-purple-400" />
                                    MCQ Generator
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => handleNavigation("/subjective-qa")}
                                    className="text-gray-300 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white cursor-pointer"
                                >
                                    <HelpCircle className="h-4 w-4 mr-2 text-blue-400" />
                                    Subjective Q&A
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuItem 
                                    onClick={() => handleNavigation("/flowchart-generator")}
                                    className="text-gray-300 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white cursor-pointer"
                                >
                                    <GitBranch className="h-4 w-4 mr-2 text-indigo-400" />
                                    <div className="flex flex-col">
                                        <span>Flowcharts & Mindmaps</span>
                                        <span className="text-xs text-gray-500">Visual learning tools</span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Link
                            href="/pricing"
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            Pricing
                        </Link>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                {/* Coins Display */}
                                {userCoins !== null && (
                                    <div className="flex items-center bg-slate-800 px-3 py-1 rounded-full">
                                        <span className="text-lg mr-1">🪙</span>
                                        <span className="text-yellow-400 font-medium">{userCoins}</span>
                                    </div>
                                )}
                                
                                {/* User Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
                                                {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                                            </div>
                                            <span className="hidden lg:block">{session.user.name}</span>
                                            <ChevronDown className="h-4 w-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-48 bg-slate-800 border-slate-700" align="end">
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/dashboard"
                                                className="flex items-center px-2 py-2 text-gray-300 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white cursor-pointer"
                                            >
                                                <User className="h-4 w-4 mr-2" />
                                                Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-slate-700" />
                                        <DropdownMenuItem 
                                            onClick={() => signOut()}
                                            className="text-gray-300 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white cursor-pointer"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Sign Out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <Button
                                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-md shadow-purple-500/20"
                                onClick={handleGetStarted}
                            >
                                Get Started
                            </Button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white">
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-slate-800"
                        >
                            <div className="py-4 space-y-4">
                                {/* Mobile Generate Content Section */}
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">Generate Content</p>
                                    <button
                                        onClick={() => handleNavigation("/ppt-generator")}
                                        className="flex items-center w-full px-2 py-2 text-gray-300 hover:text-white transition-colors"
                                    >
                                        <Presentation className="h-4 w-4 mr-2 text-pink-400" />
                                        PPT Maker
                                    </button>
                                    <button
                                        onClick={() => handleNavigation("/short-notes-generator")}
                                        className="flex items-center w-full px-2 py-2 text-gray-300 hover:text-white transition-colors"
                                    >
                                        <BookOpen className="h-4 w-4 mr-2 text-green-400" />
                                        Short Notes
                                    </button>
                                    <button
                                        onClick={() => handleNavigation("/mcq-generator")}
                                        className="flex items-center w-full px-2 py-2 text-gray-300 hover:text-white transition-colors"
                                    >
                                        <FileText className="h-4 w-4 mr-2 text-purple-400" />
                                        MCQ Generator
                                    </button>
                                    <button
                                        onClick={() => handleNavigation("/subjective-qa")}
                                        className="flex items-center w-full px-2 py-2 text-gray-300 hover:text-white transition-colors"
                                    >
                                        <HelpCircle className="h-4 w-4 mr-2 text-blue-400" />
                                        Subjective Q&A
                                    </button>
                                    <button
                                        onClick={() => handleNavigation("/flowchart-generator")}
                                        className="flex items-center w-full px-2 py-2 text-gray-300 hover:text-white transition-colors"
                                    >
                                        <GitBranch className="h-4 w-4 mr-2 text-indigo-400" />
                                        Flowcharts & Mindmaps
                                    </button>
                                </div>

                                <div className="border-t border-slate-800 pt-4">
                                    <Link
                                        href="/pricing"
                                        className="block text-gray-300 hover:text-white transition-colors px-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Pricing
                                    </Link>
                                </div>
                                
                                {isAuthenticated ? (
                                    <div className="pt-4 border-t border-slate-800 space-y-4">
                                        {userCoins !== null && (
                                            <div className="flex items-center px-2">
                                                <span className="text-lg mr-2">🪙</span>
                                                <span className="text-yellow-400 font-medium">{userCoins} coins</span>
                                            </div>
                                        )}
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center px-2 py-2 text-gray-300 hover:text-white transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <User className="h-4 w-4 mr-2" />
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                signOut()
                                                setIsMenuOpen(false)
                                            }}
                                            className="flex items-center w-full px-2 py-2 text-gray-300 hover:text-white transition-colors"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pt-4 border-t border-slate-800">
                                        <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                                            <Button variant="outline" className="w-full text-white border-white hover:bg-white hover:text-black">
                                                Sign In
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    )
}

