import { redirect } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  History,
  BarChart3,
  Map,
  Settings,
  HelpCircle,
  Rocket,
  Flame,
  Play,
  ListChecks,
  Clock,
  Code2,
  FileCode,
  TrendingUp,
} from "lucide-react"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { RecentSessions } from "@/components/dashboard/RecentSessions"
import { TipOfTheDay } from "@/components/dashboard/TipOfTheDay"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"

// Server Component
export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login")
  }

  // Ensure user logic (Server Side)
  // We can just rely on the session existence here, or trigger a background sync if strictly needed.
  // For 'instant' load, we shouldn't block on a sync unless it's critical.
  // The client-side hook was doing this: fetch("/api/user/ensure")
  // Let's omit the blocking ensure call for speed, as the session implies existence.

  const user = session.user;

  return (
    <div className="bg-background min-h-screen text-foreground">
      <div className="flex h-screen w-full">
        <aside className="hidden md:flex flex-col w-64 bg-card border-r border-muted/40 h-full flex-shrink-0">
          <div className="p-6 flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <Code2 size={18} />
            </div>
            <h1 className="text-lg font-bold tracking-tight">FlowPilot</h1>
          </div>
          <nav className="flex-1 flex flex-col px-4 gap-1 overflow-y-auto">
            <a
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium"
              href="#"
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </a>
            <Link
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              href="/sessions"
            >
              <History size={18} />
              <span>My Sessions</span>
            </Link>
            <Link
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              href="/skills"
            >
              <BarChart3 size={18} />
              <span>Skills</span>
            </Link>
            <Link
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              href="/roadmap"
            >
              <Map size={18} />
              <span>Roadmap</span>
            </Link>
            <div className="my-4 border-t border-muted/40" />
            <Link
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              href="/settings"
            >
              <Settings size={18} />
              <span>Settings</span>
            </Link>
            <Link
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              href="/help"
            >
              <HelpCircle size={18} />
              <span>Help & Feedback</span>
            </Link>
          </nav>
          <div className="p-4 border-t border-muted/40">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="font-bold text-sm mb-1">Go Pro</p>
                <p className="text-xs text-indigo-100 mb-3">
                  Unlock advanced analytics and AI insights.
                </p>
                <button className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-1.5 px-3 rounded transition-colors">
                  Upgrade
                </button>
              </div>
              <div className="absolute -bottom-4 -right-4 text-white/20">
                <Rocket size={80} />
              </div>
            </div>
          </div>
        </aside>
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
          <DashboardHeader user={{
            name: user.name || "",
            email: user.email,
            image: user.image
          }} />
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto flex flex-col gap-6 md:gap-8">
              <div className="bg-card rounded-xl shadow-sm border border-muted/40 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                <div className="flex flex-col md:flex-row items-center p-6 md:p-8 gap-8">
                  <div className="flex-1 space-y-4 relative z-10">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wide">
                      <Flame className="mr-1" size={14} />5 Day Streak
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                      Welcome back, {user.name || user.email}!
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                      You're making great progress. Your consistency score is up
                      <span className="text-green-600 font-semibold"> 12% </span>
                      this week. Ready to tackle that Refactoring module?
                    </p>
                    <div className="pt-2 flex flex-wrap gap-4">
                      <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                        <Play />
                        Start New Session
                      </button>
                      <button className="bg-card border border-muted/40 text-foreground hover:bg-muted px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
                        <ListChecks />
                        View Roadmap
                      </button>
                    </div>
                  </div>
                  <div className="relative w-full max-w-xs flex-shrink-0 hidden md:block">
                    <div className="bg-muted rounded-xl p-4 border border-muted/40">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Daily Goal</h3>
                        <span className="text-xs font-medium text-muted-foreground">
                          85% Complete
                        </span>
                      </div>
                      <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-primary w-[85%] rounded-full" />
                      </div>
                      <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                        <div className="text-center">
                          <div className="font-bold text-foreground text-lg">45m</div>
                          <div>Coded</div>
                        </div>
                        <div className="text-center border-l border-muted/40 pl-4">
                          <div className="font-bold text-foreground text-lg">12</div>
                          <div>Snippets</div>
                        </div>
                        <div className="text-center border-l border-muted/40 pl-4">
                          <div className="font-bold text-green-500 text-lg">+15xp</div>
                          <div>Gained</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-xl border border-muted/40 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Hours Coded (Week)
                      </p>
                      <p className="text-3xl font-bold mt-2">12.5h</p>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Clock />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600 font-medium flex items-center">
                      <TrendingUp className="mr-1" size={16} />
                      15%
                    </span>
                    <span className="text-muted-foreground ml-2">vs last week</span>
                  </div>
                </div>
                <div className="bg-card p-6 rounded-xl border border-muted/40 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Snippets Analyzed</p>
                      <p className="text-3xl font-bold mt-2">142</p>
                    </div>
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-purple-600">
                      <FileCode />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600 font-medium flex items-center">
                      <TrendingUp className="mr-1" size={16} />
                      5%
                    </span>
                    <span className="text-muted-foreground ml-2">efficiency gain</span>
                  </div>
                </div>
                <div className="bg-card p-6 rounded-xl border border-muted/40 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Top Language</p>
                      <p className="text-3xl font-bold mt-2">TypeScript</p>
                    </div>
                    <div className="p-2 bg-sky-100 dark:bg-sky-900/20 rounded-lg text-sky-600">
                      <Code2 />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-muted-foreground">Most active in </span>
                    <span className="font-medium ml-1">frontend/core</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card rounded-xl border border-muted/40 shadow-sm flex flex-col">
                  <div className="p-6 border-b border-muted/40 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Skill Proficiency</h2>
                    <button className="text-sm text-primary hover:text-primary/80 font-medium">
                      View Detail
                    </button>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-center gap-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Refactoring & Clean Code</span>
                        <span className="text-sm font-bold">78%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: "78%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Security Best Practices</span>
                        <span className="text-sm font-bold">92%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "92%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Performance Optimization</span>
                        <span className="text-sm font-bold">64%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="bg-orange-400 h-2.5 rounded-full"
                          style={{ width: "64%" }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Testing & QA</span>
                        <span className="text-sm font-bold">45%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-slate-400 h-2.5 rounded-full" style={{ width: "45%" }} />
                      </div>
                    </div>
                  </div>
                </div>
                <RecentSessions />
              </div>
              <TipOfTheDay />
              <footer className="text-center text-xs text-muted-foreground pb-4">
                <p>© 2023 FlowPilot Inc. All rights reserved.</p>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
