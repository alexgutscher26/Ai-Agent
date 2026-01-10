"use client"

import { useEffect, useState } from "react"
import { Lightbulb, RefreshCw } from "lucide-react"

export function TipOfTheDay() {
    const [tip, setTip] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        fetch("/api/tip")
            .then((res) => {
                if (res.ok) return res.json()
                throw new Error("Failed to fetch tip")
            })
            .then((data) => {
                if (data.tip) {
                    setTip(data.tip)
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 shadow-lg text-white flex flex-col sm:flex-row gap-6 items-center min-h-[120px] animate-pulse">
                <div className="h-12 w-12 rounded-full bg-white/10 flex-shrink-0" />
                <div className="flex-1 space-y-2 w-full">
                    <div className="h-4 bg-white/10 rounded w-1/4" />
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                </div>
            </div>
        )
    }

    if (!tip) return null

    return (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 shadow-lg text-white flex flex-col sm:flex-row gap-6 items-center">
            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="text-yellow-300" />
            </div>
            <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-lg mb-1">Tip of the Day</h3>
                <p className="text-slate-300 text-sm">
                    {tip}
                </p>
            </div>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
                Learn More
            </button>
        </div>
    )
}
