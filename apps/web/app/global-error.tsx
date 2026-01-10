"use client"

import { useEffect } from "react"
import { AlertCircle } from "lucide-react"

import "./globals.css"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <html lang="en">
            <body className="min-h-screen bg-background text-foreground antialiased md:flex md:items-center md:justify-center">
                <div className="flex flex-col items-center justify-center p-4">
                    {/* We can't use existing complex components safely here if they rely on context providers that might be broken, 
               but basic tailwind classes are fine since we imported globals.css */}
                    <div className="w-[420px] max-w-full rounded-lg border bg-card text-card-foreground shadow-lg">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <div className="flex items-center gap-2 text-red-500">
                                <AlertCircle className="h-5 w-5" />
                                <h3 className="text-2xl font-semibold leading-none tracking-tight">System Error</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                A critical system error occurred.
                            </p>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
                                <p className="font-mono">{error.message || "Unknown critical error"}</p>
                            </div>
                        </div>
                        <div className="flex items-center p-6 pt-0 justify-end gap-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Reload Application
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    )
}
