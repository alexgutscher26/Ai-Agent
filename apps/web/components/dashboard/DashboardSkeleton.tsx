
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
    return (
        <div className="bg-background min-h-screen text-foreground">
            <div className="flex h-screen w-full">
                {/* Sidebar Skeleton */}
                <aside className="hidden md:flex flex-col w-64 bg-card border-r border-muted/40 h-full p-6 gap-6">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                    <div className="mt-auto">
                        <Skeleton className="h-24 w-full rounded-xl" />
                    </div>
                </aside>

                {/* Main Content Skeleton */}
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
                    <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-muted/40 flex-shrink-0">
                        <div className="flex gap-4 w-1/3">
                            <Skeleton className="h-8 w-full rounded-lg" />
                        </div>
                        <div className="flex gap-4">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-32 rounded-lg" />
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div className="max-w-6xl mx-auto flex flex-col gap-6 md:gap-8">

                            {/* Welcome Banner Skeleton */}
                            <div className="bg-card rounded-xl shadow-sm border border-muted/40 p-6 md:p-8 h-64 flex flex-col justify-center space-y-4">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-2/3" />
                                <Skeleton className="h-4 w-1/2" />
                                <div className="flex gap-4 pt-4">
                                    <Skeleton className="h-12 w-40" />
                                    <Skeleton className="h-12 w-40" />
                                </div>
                            </div>

                            {/* Stats Grid Skeleton */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-card p-6 rounded-xl border border-muted/40 h-32 flex flex-col justify-between">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-8 w-8 rounded-lg" />
                                        </div>
                                        <Skeleton className="h-8 w-16" />
                                    </div>
                                ))}
                            </div>

                            {/* Content Grid Skeleton */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-card rounded-xl border border-muted/40 h-64 p-6">
                                    <Skeleton className="h-6 w-48 mb-6" />
                                    <div className="space-y-4">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                    </div>
                                </div>
                                <div className="bg-card rounded-xl border border-muted/40 h-64 p-6">
                                    <Skeleton className="h-6 w-32 mb-6" />
                                    <Skeleton className="h-full w-full rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
