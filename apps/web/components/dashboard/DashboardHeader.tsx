"use client"

import { Bell, Menu, Search } from "lucide-react"
import { authClient } from "@/lib/auth-client"

type DashboardHeaderProps = {
    user: {
        name: string
        email: string
        image: string | null | undefined
    }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
    return (
        <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-muted/40 flex-shrink-0 z-20">
            <button className="md:hidden p-2 text-muted-foreground hover:text-foreground">
                <Menu />
            </button>
            <div className="flex items-center gap-6 flex-1">
                <nav className="hidden md:flex text-sm font-medium text-muted-foreground">
                    <a className="hover:text-primary transition-colors" href="#">
                        Home
                    </a>
                    <input
                        className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm transition-all"
                        placeholder="Search sessions, snippets, or docs..."
                        type="text"
                    />
                </nav>
            </div>
            <div className="flex items-center gap-4 ml-4">
                <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
                    <Bell />
                    <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                </button>
                <div className="flex items-center gap-3 pl-4 border-l border-muted/40">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">{user.name || user.email}</p>
                        <p className="text-xs text-muted-foreground">Pro Plan</p>
                    </div>
                    <div
                        className="h-10 w-10 rounded-full bg-muted overflow-hidden ring-2 ring-background cursor-pointer"
                        style={{
                            backgroundImage: `url('${user.image || ""}')`,
                            backgroundSize: "cover",
                        }}
                    />
                    <button
                        className="text-xs font-semibold px-3 py-1.5 rounded bg-muted hover:bg-muted/70"
                        onClick={() => authClient.signOut()}
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </header>
    )
}
