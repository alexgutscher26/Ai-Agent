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
  CalendarDays,
  Plus,
  TrendingUp,
  Lightbulb,
  Star,
  Code2,
  Sparkles,
  Database
} from "lucide-react"

export default function SkillsPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login")
    }
  }, [isPending, session, router])
  if (isPending) {
    return <div className="container py-12">Loading...</div>
  }
  if (!session) return null

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
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" href="/dashboard">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" href="/sessions">
              <History size={18} />
              <span>My Sessions</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium" href="/skills">
              <BarChart3 size={18} />
              <span>Skills</span>
            </Link>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" href="#">
              <Map size={18} />
              <span>Roadmap</span>
            </a>
            <div className="my-4 border-t border-muted/40" />
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" href="#">
              <Settings size={18} />
              <span>Settings</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" href="#">
              <HelpCircle size={18} />
              <span>Help & Feedback</span>
            </a>
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
                <span>Skills</span>
              </nav>
              <div className="relative w-full max-w-md hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-muted-foreground" size={18} />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm transition-all"
                  placeholder="Search skills, tags..."
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
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Skills & Mastery</h1>
                  <p className="text-muted-foreground mt-1">Visualize your knowledge growth and active learning patterns.</p>
                </div>
                <div className="flex gap-3">
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-muted/40 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                    <CalendarDays className="h-4 w-4" />
                    History
                  </button>
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium shadow-sm transition-colors">
                    <Plus className="h-4 w-4" />
                    Add Skill Goal
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card rounded-xl border border-muted/40 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <TrendingUp className="text-primary" />
                        Learning Momentum
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">14 active days in the last 30 days</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-muted" />
                      <span className="text-xs text-muted-foreground">Less</span>
                      <span className="flex h-2 w-2 rounded-full bg-primary" />
                      <span className="text-xs text-muted-foreground">More</span>
                    </div>
                  </div>
                  <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(14, 1fr)" }}>
                    {[
                      "bg-muted",
                      "bg-muted",
                      "bg-primary/20",
                      "bg-primary/40",
                      "bg-muted",
                      "bg-primary/70",
                      "bg-primary/30",
                      "bg-muted",
                      "bg-primary",
                      "bg-primary/50",
                      "bg-muted",
                      "bg-muted",
                      "bg-primary/20",
                      "bg-primary/40",
                      "bg-muted",
                      "bg-primary/30",
                      "bg-muted",
                      "bg-primary/70",
                      "bg-primary", // today (will get border)
                      "placeholder",
                      "placeholder",
                      "placeholder",
                      "placeholder",
                      "placeholder",
                      "placeholder",
                      "placeholder",
                      "placeholder",
                      "placeholder"
                    ].map((cls, i) => {
                      const today = i === 18
                      if (cls === "placeholder") {
                        return (
                          <div
                            key={i}
                            className="aspect-square rounded bg-transparent opacity-60 border border-dashed border-muted"
                          />
                        )
                      }
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded ${cls} ${today ? "border-2 border-muted-foreground" : ""}`}
                          title={today ? "Today" : undefined}
                        />
                      )
                    })}
                  </div>
                  <div className="mt-4 flex gap-8 border-t border-muted/40 pt-4">
                    <div>
                      <p className="text-2xl font-bold">124</p>
                      <p className="text-xs text-muted-foreground">Total Explanations</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">8</p>
                      <p className="text-xs text-muted-foreground">Active Skills</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">3 Days</p>
                      <p className="text-xs text-muted-foreground">Current Streak</p>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-1 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Lightbulb size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-white/20 p-1.5 rounded-lg">
                        <Sparkles className="text-white" size={16} />
                      </span>
                      <h3 className="font-bold text-lg">Recommended Focus</h3>
                    </div>
                    <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                      We've noticed you're looking up <strong>React Hooks</strong> frequently. Solidify your knowledge with a quick review.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-start gap-3 border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                        <Star className="text-yellow-300" size={18} />
                        <div>
                          <p className="text-sm font-semibold">Master useEffect Dependencies</p>
                          <p className="text-xs text-indigo-200 mt-0.5">5 min explanation review</p>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-start gap-3 border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                        <Code2 className="text-green-300" size={18} />
                        <div>
                          <p className="text-sm font-semibold">Async/Await Pattern</p>
                          <p className="text-xs text-indigo-200 mt-0.5">Practice with 2 snippets</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="relative z-10 mt-6 w-full py-2 bg-white text-indigo-600 font-semibold rounded-lg text-sm hover:bg-indigo-50 transition-colors shadow-sm">
                    Start Learning Session
                  </button>
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                <h2 className="text-lg font-bold">Your Skills</h2>
                <div className="flex items-center gap-3">
                  <select className="block w-40 pl-3 pr-10 py-2 text-sm border-muted/40 bg-card text-foreground rounded-lg focus:ring-primary/50 shadow-sm">
                    <option>All Categories</option>
                    <option>Languages</option>
                    <option>Frameworks</option>
                    <option>Tools</option>
                  </select>
                  <select className="block w-40 pl-3 pr-10 py-2 text-sm border-muted/40 bg-card text-foreground rounded-lg focus:ring-primary/50 shadow-sm">
                    <option>Sort by Confidence</option>
                    <option>Most Active</option>
                    <option>Name (A-Z)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                <div className="bg-card rounded-xl border border-muted/40 p-5 hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                      TS
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                      High Confidence
                    </span>
                  </div>
                  <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">TypeScript</h3>
                  <p className="text-xs text-muted-foreground mb-4">42 explanations • 15 sessions</p>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: "85%" }} />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-medium text-muted-foreground">
                    <span>Proficiency</span>
                    <span className="text-foreground">85%</span>
                  </div>
                </div>
                <div className="bg-card rounded-xl border border-muted/40 p-5 hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 bg-sky-100 rounded-lg flex items-center justify-center text-sky-500 font-bold text-xs border border-sky-200">
                      <Code2 />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-700">
                      Learning
                    </span>
                  </div>
                  <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">React</h3>
                  <p className="text-xs text-muted-foreground mb-4">28 explanations • 8 sessions</p>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full rounded-full" style={{ width: "45%" }} />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-medium text-muted-foreground">
                    <span>Proficiency</span>
                    <span className="text-foreground">45%</span>
                  </div>
                </div>
                <div className="bg-card rounded-xl border border-muted/40 p-5 hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 font-bold text-xs border border-yellow-200">
                      PY
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                      High Confidence
                    </span>
                  </div>
                  <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">Python</h3>
                  <p className="text-xs text-muted-foreground mb-4">35 explanations • 12 sessions</p>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: "78%" }} />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-medium text-muted-foreground">
                    <span>Proficiency</span>
                    <span className="text-foreground">78%</span>
                  </div>
                </div>
                <div className="bg-card rounded-xl border border-muted/40 p-5 hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-xs border border-orange-200">
                      JV
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-muted text-foreground">
                      Needs Practice
                    </span>
                  </div>
                  <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">Java</h3>
                  <p className="text-xs text-muted-foreground mb-4">12 explanations • 3 sessions</p>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div className="bg-orange-400 h-full rounded-full" style={{ width: "30%" }} />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-medium text-muted-foreground">
                    <span>Proficiency</span>
                    <span className="text-foreground">30%</span>
                  </div>
                </div>
                <div className="bg-card rounded-xl border border-muted/40 p-5 hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground font-bold text-xs border border-muted/40">
                      <Database />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                      High Confidence
                    </span>
                  </div>
                  <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">SQL</h3>
                  <p className="text-xs text-muted-foreground mb-4">18 explanations • 6 sessions</p>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: "90%" }} />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-medium text-muted-foreground">
                    <span>Proficiency</span>
                    <span className="text-foreground">90%</span>
                  </div>
                </div>
                <div className="bg-muted rounded-xl border border-dashed border-muted/40 p-5 flex flex-col items-center justify-center text-center hover:bg-card transition-colors cursor-pointer group">
                  <div className="h-12 w-12 rounded-full bg-card shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Plus className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">Explore New Skill</h3>
                  <p className="text-xs text-muted-foreground mt-1 px-4">Browse our library to start learning something new</p>
                </div>
              </div>
              <footer className="mt-auto py-4 text-center text-xs text-muted-foreground bg-background">
                <p>© 2023 FlowPilot Inc. All rights reserved.</p>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
