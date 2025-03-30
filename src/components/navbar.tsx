"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, LayoutDashboard, BrainCircuit } from "lucide-react"
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

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
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
                        <Link
                            href="/mcq-generator"
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            MCQ Generator
                        </Link>
                        <Link
                            href="/subjective-qa"
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            Subjective Q&A
                        </Link>
                        <Link
                            href="/flowchart-generator"
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
                        </Link>

                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-9 w-9 border-2 border-white/20">
                                            <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
                                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-600">
                                                {getUserInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-slate-800 border border-slate-700" align="end" forceMount>
                                    <div className="flex items-center justify-start gap-2 p-2">
                                        <div className="flex flex-col space-y-1 leading-none">
                                            {session.user.name && <p className="font-medium">{session.user.name}</p>}
                                            {session.user.email && (
                                                <p className="w-[200px] truncate text-sm text-muted-foreground">{session.user.email}</p>
                                            )}
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator className="bg-slate-700" />
                                    <DropdownMenuItem asChild className="focus:bg-slate-700">
                                        <Link href="/dashboard" className="cursor-pointer flex items-center">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-700" />
                                    <DropdownMenuItem
                                        className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-slate-700"
                                        onClick={handleSignOut}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Sign out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                {isMenuOpen && (
                    <div className="md:hidden pt-4 pb-2 space-y-4 animate-in slide-in-from-top-5 duration-300">
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
                            className="flex items-center text-gray-300 hover:text-white transition-colors py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <span>Flowcharts & Mindmaps</span>
                            {/* <Badge className="ml-2 text-xs bg-gradient-to-r from-indigo-400 to-purple-500 border-none px-1.5 py-0">
                                New
                            </Badge> */}
                        </Link>

                        {isAuthenticated ? (
                            <div className="py-2 space-y-2">
                                <div className="flex items-center space-x-2 pb-2">
                                    <Avatar className="h-9 w-9 border-2 border-white/20">
                                        <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
                                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-600">
                                            {getUserInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-white">{session.user.name}</p>
                                        <p className="text-xs text-gray-300 truncate max-w-[200px]">{session.user.email}</p>
                                    </div>
                                </div>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center text-gray-300 hover:text-white transition-colors py-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    <span>Dashboard</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false)
                                        handleSignOut()
                                    }}
                                    className="flex items-center w-full text-left text-red-400 hover:text-red-300 transition-colors py-2"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Sign out</span>
                                </button>
                            </div>
                        ) : (
                            <Button
                                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-md shadow-purple-500/20"
                                onClick={() => {
                                    setIsMenuOpen(false)
                                    router.push("/auth")
                                }}
                            >
                                Get Started
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}

