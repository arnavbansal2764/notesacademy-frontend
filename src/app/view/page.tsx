"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, RefreshCw } from "lucide-react"
import JsonCrackEmbed from "@/components/JsonCrackEmbed"

export default function ViewPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [jsonUrl, setJsonUrl] = useState<string>("")
    const [title, setTitle] = useState<string>("")

    useEffect(() => {
        // Get the URL and title from the query parameters
        const url = searchParams.get("url")
        const titleParam = searchParams.get("title")

        if (!url) {
            // If no URL is provided, redirect back to the generator page
            router.push("/flowchart-generator")
            return
        }

        setJsonUrl(url)
        setTitle(titleParam || "Mindmap Visualization")
    }, [searchParams, router])

    // Handle generating another mindmap
    const handleGenerateAnother = () => {
        router.push("/flowchart-generator")
    }

    if (!jsonUrl) {
        return null // Don't render anything while redirecting
    }

    return (
        <div className="fixed inset-0 bg-slate-900 flex flex-col">
            {/* Minimal header with button */}
            <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-slate-900 to-transparent p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        {title}
                    </h1>
                    <div>

                    <Button
                        onClick={handleGenerateAnother}
                        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Generate Another Mindmap
                    </Button>
                    <Button
                        onClick={()=>router.push('/dashboard')}
                        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 ml-5"
                    >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                    </Button>
                    </div>
                </div>
            </div>

            {/* Full screen mindmap */}
            <div className="flex-1 w-full h-full">
                <JsonCrackEmbed jsonUrl={jsonUrl} className="w-full h-full" />
            </div>
        </div>
    )
}
