"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, LayoutDashboard, BrainCircuit, User, ChevronDown } from "lucide-react"
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
                            onClick={() => handleNavigation("/mcq-generator")}
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            MCQ Generator
                        </button>
                        <button
                            onClick={() => handleNavigation("/subjective-qa")}
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            Subjective Q&A
                        </button>
                        <button
                            onClick={() => handleNavigation("/flowchart-generator")}
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors group"
                        >
                            <span className="relative">
                                Flowcharts & Mindmaps
                                <span className="absolute -top-1 -right-10 transition-opacity group-hover:opacity-100 opacity-80">
                                    {/* <Badge className="text-xs bg-gradient-to-r from-indigo-400 to-purple-500 border-none px-1.5 py-0">
                                        New
                                    </Badge> */}
                                </span>
                            </span>
                        </button>
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
                                <div className="relative">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
                                            {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                                        </div>
                                        <span className="hidden lg:block">{session.user.name}</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </button>

                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700 py-1"
                                            >
                                                <Link
                                                    href="/dashboard"
                                                    className="flex items-center px-4 py-2 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
                                                >
                                                    <User className="h-4 w-4 mr-2" />
                                                    Dashboard
                                                </Link>
                                                <button
                                                    onClick={() => signOut()}
                                                    className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
                                                >
                                                    <LogOut className="h-4 w-4 mr-2" />
                                                    Sign Out
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
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
                                <button
                                    onClick={() => handleNavigation("/mcq-generator")}
                                    className="block text-gray-300 hover:text-white transition-colors"
                                >
                                    MCQ Generator
                                </button>
                                <button
                                    onClick={() => handleNavigation("/subjective-qa")}
                                    className="block text-gray-300 hover:text-white transition-colors"
                                >
                                    Subjective Q&A
                                </button>
                                <button
                                    onClick={() => handleNavigation("/flowchart-generator")}
                                    className="block text-gray-300 hover:text-white transition-colors"
                                >
                                    Mindmaps
                                </button>
                                <Link
                                    href="/pricing"
                                    className="block text-gray-300 hover:text-white transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Pricing
                                </Link>
                                
                                {isAuthenticated ? (
                                    <div className="pt-4 border-t border-slate-800 space-y-4">
                                        {userCoins !== null && (
                                            <div className="flex items-center">
                                                <span className="text-lg mr-2">🪙</span>
                                                <span className="text-yellow-400 font-medium">{userCoins} coins</span>
                                            </div>
                                        )}
                                        <Link
                                            href="/dashboard"
                                            className="block text-gray-300 hover:text-white transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                signOut()
                                                setIsMenuOpen(false)
                                            }}
                                            className="block text-gray-300 hover:text-white transition-colors"
                                        >
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

