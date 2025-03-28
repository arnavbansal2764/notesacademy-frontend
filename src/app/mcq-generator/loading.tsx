import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
            <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                <h2 className="text-xl font-medium">Loading MCQ Generator...</h2>
            </div>
        </div>
    )
}

