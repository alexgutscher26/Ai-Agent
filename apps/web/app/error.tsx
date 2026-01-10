"use client"

import { useEffect } from "react"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4">
            <Card className="w-[420px] max-w-full shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <CardTitle>Something went wrong!</CardTitle>
                    </div>
                    <CardDescription>
                        An unexpected error has occurred. We apologize for the inconvenience.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
                        <p className="font-mono">
                            {error.message || "Unknown error occurred"}
                        </p>
                        {error.digest && (
                            <p className="mt-2 text-xs opacity-70">
                                Error ID: {error.digest}
                            </p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => window.location.href = '/'}>
                        Go Home
                    </Button>
                    <Button onClick={() => reset()}>Try again</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
