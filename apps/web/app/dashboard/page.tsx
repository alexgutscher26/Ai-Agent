"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import {
  Menu,
  LayoutDashboard,
  History,
  BarChart3,
  Map,
  Settings,
  HelpCircle,
  Rocket,
  Search,
  Bell,
  Flame,
  Play,
  ListChecks,
  Clock,
  Code2,
  FileCode,
  TrendingUp,
  ChevronRight,
  Lightbulb
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login")
    }
  }, [isPending, session, router])
  useEffect(() => {
    if (!isPending && session) {
      const payload = {
        id: (session.user as any).id || session.user.email,
        email: session.user.email,
        name: session.user.name || null,
        image: session.user.image || null
      }
      fetch("/api/user/ensure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(() => {})
    }
  }, [isPending, session])
  if (isPending) {
    return <div className="container py-12">Loading...</div>
  }
  if (!session) {
    return null
  }
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
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium" href="#">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </a>
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" href="/sessions">
              <History size={18} />
              <span>My Sessions</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" href="/skills">
              <BarChart3 size={18} />
              <span>Skills</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" href="/roadmap">
              <Map size={18} />
              <span>Roadmap</span>
            </Link>
            <div className="my-4 border-t border-muted/40" />
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" href="/settings">
              <Settings size={18} />
              <span>Settings</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" href="/help">
              <HelpCircle size={18} />
              <span>Help & Feedback</span>
            </Link>
          </nav>
          <div className="p-4 border-t border-muted/40">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="font-bold text-sm mb-1">Go Pro</p>
                <p className="text-xs text-indigo-100 mb-3">Unlock advanced analytics and AI insights.</p>
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
          <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-muted/40 flex-shrink-0 z-20">
            <button className="md:hidden p-2 text-muted-foreground hover:text-foreground">
              <Menu />
            </button>
            <div className="flex items-center gap-6 flex-1">
              <nav className="hidden md:flex text-sm font-medium text-muted-foreground">
                <a className="hover:text-primary transition-colors" href="#">Home</a>
                <span className="mx-2">/</span>
                <span>Dashboard</span>
              </nav>
              <div className="relative w-full max-w-md hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-muted-foreground" size={18} />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm transition-all"
                  placeholder="Search sessions, snippets, or docs..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 ml-4">
              <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
                <Bell />
                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-muted/40">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{session.user.name || session.user.email}</p>
                  <p className="text-xs text-muted-foreground">Pro Plan</p>
                </div>
                <div
                  className="h-10 w-10 rounded-full bg-muted overflow-hidden ring-2 ring-background cursor-pointer"
                  style={{ backgroundImage: `url('${session.user.image || ""}')`, backgroundSize: "cover" }}
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
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto flex flex-col gap-6 md:gap-8">
              <div className="bg-card rounded-xl shadow-sm border border-muted/40 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                <div className="flex flex-col md:flex-row items-center p-6 md:p-8 gap-8">
                  <div className="flex-1 space-y-4 relative z-10">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wide">
                      <Flame className="mr-1" size={14} />
                      5 Day Streak
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                      Welcome back, {session.user.name || session.user.email}!
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
                        <span className="text-xs font-medium text-muted-foreground">85% Complete</span>
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
                      <p className="text-sm font-medium text-muted-foreground">Hours Coded (Week)</p>
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
                    <button className="text-sm text-primary hover:text-primary/80 font-medium">View Detail</button>
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
                        <div className="bg-orange-400 h-2.5 rounded-full" style={{ width: "64%" }} />
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
                <div className="bg-card rounded-xl border border-muted/40 shadow-sm flex flex-col h-full">
                  <div className="p-6 border-b border-muted/40">
                    <h2 className="text-lg font-bold">Recent Sessions</h2>
                  </div>
                  <div className="p-0 overflow-y-auto max-h-[400px]">
                    <div className="p-4 hover:bg-muted transition-colors border-b border-muted/40 cursor-pointer group">
                      <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-xs">TS</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">Refactoring auth.ts</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Authentication Module • 2h ago</p>
                        </div>
                        <div className="flex items-center text-muted-foreground group-hover:text-primary">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-muted transition-colors border-b border-muted/40 cursor-pointer group">
                      <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-lg bg-yellow-100 text-yellow-700 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-xs">JS</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">Debugging cart_logic.js</p>
                          <p className="text-xs text-muted-foreground mt-0.5">E-commerce Flow • 5h ago</p>
                        </div>
                        <div className="flex items-center text-muted-foreground group-hover:text-primary">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-muted transition-colors border-b border-muted/40 cursor-pointer group">
                      <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-xs">PY</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">API Optimization</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Backend Services • Yesterday</p>
                        </div>
                        <div className="flex items-center text-muted-foreground group-hover:text-primary">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-muted transition-colors border-b border-muted/40 cursor-pointer group">
                      <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-xs">CS</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">Unit Testing</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Test Suite • 2 days ago</p>
                        </div>
                        <div className="flex items-center text-muted-foreground group-hover:text-primary">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-muted/40 mt-auto">
                    <button className="w-full text-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                      View All History
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 shadow-lg text-white flex flex-col sm:flex-row gap-6 items-center">
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="text-yellow-300" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-lg mb-1">Tip of the Day</h3>
                  <p className="text-slate-300 text-sm">Use optional chaining (?.) to simplify accessing nested object properties. It makes your code cleaner and prevents runtime errors.</p>
                </div>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
                  Learn More
                </button>
              </div>
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
