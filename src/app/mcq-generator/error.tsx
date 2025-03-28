"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const router = useRouter()

    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
            <div className="max-w-md w-full p-6 bg-slate-800 rounded-lg border border-red-500/30">
                <div className="flex flex-col items-center text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-medium mb-2">Something went wrong!</h2>
                    <p className="text-gray-400 mb-6">We encountered an error while loading the MCQ Generator.</p>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => router.push("/")}>
                            Go Home
                        </Button>
                        <Button
                            onClick={() => reset()}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

