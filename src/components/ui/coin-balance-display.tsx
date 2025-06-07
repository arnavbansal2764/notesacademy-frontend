"use client"

import { motion } from "framer-motion"
import { Coins, AlertTriangle } from "lucide-react"

interface CoinBalanceDisplayProps {
    coins: number | null
    requiredCoins: number
    isLoading?: boolean
    className?: string
}

export function CoinBalanceDisplay({ 
    coins, 
    requiredCoins, 
    isLoading = false, 
    className = "" 
}: CoinBalanceDisplayProps) {
    const hasEnoughCoins = coins !== null && coins >= requiredCoins
    const isInsufficient = coins !== null && coins < requiredCoins

    return (
        <motion.div
            className={`flex items-center justify-between p-3 rounded-lg border ${
                isInsufficient 
                    ? "bg-red-500/10 border-red-500/30" 
                    : hasEnoughCoins 
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-slate-700/50 border-slate-600"
            } ${className}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-full ${
                    isInsufficient 
                        ? "bg-red-500/20" 
                        : hasEnoughCoins 
                            ? "bg-green-500/20"
                            : "bg-slate-600/20"
                }`}>
                    {isInsufficient ? (
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                    ) : (
                        <Coins className={`h-4 w-4 ${
                            hasEnoughCoins ? "text-green-400" : "text-slate-400"
                        }`} />
                    )}
                </div>
                <div>
                    <p className="text-sm font-medium text-white">
                        {isLoading ? "Checking balance..." : "Coin Balance"}
                    </p>
                    <p className="text-xs text-gray-400">
                        Required: {requiredCoins} coin{requiredCoins !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className={`text-lg font-bold ${
                    isInsufficient 
                        ? "text-red-400" 
                        : hasEnoughCoins 
                            ? "text-green-400"
                            : "text-yellow-400"
                }`}>
                    {isLoading ? "..." : coins !== null ? coins : "?"}
                </p>
                <p className="text-xs text-gray-400">
                    {isInsufficient ? "Insufficient" : hasEnoughCoins ? "Available" : "Unknown"}
                </p>
            </div>
        </motion.div>
    )
}
