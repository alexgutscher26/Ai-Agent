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
  Search,
  Bell,
  Code2,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from "lucide-react"

export default function RoadmapPage() {
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
            <Link
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              href="/dashboard"
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium transition-colors"
              href="/roadmap"
            >
              <Map size={18} />
              <span>Roadmap</span>
            </Link>
            <div className="my-4 border-t border-muted/40" />
            <a
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              href="#"
            >
              <Settings size={18} />
              <span>Settings</span>
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              href="#"
            >
              <HelpCircle size={18} />
              <span>Help & Feedback</span>
            </a>
          </nav>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
          <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-muted/40 flex-shrink-0 z-20">
            <button className="md:hidden p-2 text-muted-foreground hover:text-foreground">
              <Menu />
            </button>
            <div className="flex items-center gap-6 flex-1">
              <nav className="hidden md:flex text-sm font-medium text-muted-foreground">
                <a className="hover:text-primary transition-colors" href="#">
                  Home
                </a>
                <span className="mx-2">/</span>
                <span>Roadmap</span>
              </nav>
              <div className="relative w-full max-w-md hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-muted-foreground" size={18} />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm transition-all"
                  placeholder="Search features..."
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
                  style={{
                    backgroundImage: `url('${session.user.image || ""}')`,
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

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold tracking-tight">Public Roadmap</h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold uppercase tracking-wider">
                      Live
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    We believe in building in public. Here’s what we’re working on, what’s coming
                    next, and what we’re considering for the future. Have an idea?
                    <a className="text-primary hover:underline font-medium ml-1" href="#">
                      Let us know
                    </a>
                    .
                  </p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-muted/40 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    <MessageSquare size={16} />
                    Join Community
                  </button>
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium shadow-sm transition-colors">
                    <Sparkles size={16} />
                    Suggest Feature
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pb-10">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                      <h2 className="font-bold">Now</h2>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      In Progress
                    </span>
                  </div>
                  <div className="bg-card p-5 rounded-xl border-l-4 border-emerald-500 border-y border-r border-muted/40 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wide">
                        Feature
                      </span>
                      <ExternalLink
                        className="text-muted-foreground group-hover:text-primary transition-colors"
                        size={18}
                      />
                    </div>
                    <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">
                      Context-Aware Suggestions
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Using active file context to suggest more relevant learning resources directly
                      in the sidebar, filtering out noise from unrelated frameworks.
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-muted/40">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-xs font-medium">124</span>
                      </div>
                      <div className="flex -space-x-2">
                        <div className="h-6 w-6 rounded-full bg-muted border-2 border-card"></div>
                        <div className="h-6 w-6 rounded-full bg-muted/70 border-2 border-card"></div>
                        <div className="h-6 w-6 rounded-full bg-muted/50 border-2 border-card flex items-center justify-center text-[8px] text-foreground font-bold">
                          +3
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-5 rounded-xl border border-muted/40 shadow-sm hover:shadow-md transition-all group cursor-pointer hover:border-emerald-500/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wide">
                        Improvement
                      </span>
                    </div>
                    <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">
                      Dark Mode Refinement
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Fixing contrast issues in the dashboard charts and improving syntax
                      highlighting themes for dark mode users.
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-muted/40">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-xs font-medium">45</span>
                      </div>
                      <div className="h-6 w-6 rounded-full bg-muted border-2 border-card" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                      <h2 className="font-bold">Next</h2>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Planned
                    </span>
                  </div>
                  <div className="bg-card p-5 rounded-xl border border-muted/40 shadow-sm hover:shadow-md transition-all group cursor-pointer hover:border-blue-500/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wide">
                        Feature
                      </span>
                    </div>
                    <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">
                      Team Analytics Dashboard
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      View aggregate learning stats for your entire team. Identify knowledge gaps
                      and trending topics across the organization.
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-muted/40">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-xs font-medium">89</span>
                      </div>
                      <div className="flex -space-x-2">
                        <div className="h-6 w-6 rounded-full bg-muted border-2 border-card"></div>
                        <div className="h-6 w-6 rounded-full bg-muted/70 border-2 border-card"></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-5 rounded-xl border border-muted/40 shadow-sm hover:shadow-md transition-all group cursor-pointer hover:border-blue-500/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 rounded bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[10px] font-bold uppercase tracking-wide">
                        Integration
                      </span>
                    </div>
                    <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">
                      Jira Integration
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Link learning sessions to Jira tickets to track research time and skill
                      acquisition related to specific tasks.
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-muted/40">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-xs font-medium">62</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-5 rounded-xl border border-muted/40 shadow-sm hover:shadow-md transition-all group cursor-pointer hover:border-blue-500/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wide">
                        Feature
                      </span>
                    </div>
                    <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">
                      Custom Learning Paths
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create and share custom lists of skills and topics for onboarding new team
                      members.
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-muted/40">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-xs font-medium">156</span>
                      </div>
                      <div className="h-6 w-6 rounded-full border-2 border-card bg-primary text-primary-foreground flex items-center justify-center text-[8px] font-bold">
                        A
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-muted-foreground/40"></span>
                      <h2 className="font-bold">Later</h2>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Considering
                    </span>
                  </div>
                  <div className="bg-card p-5 rounded-xl border border-muted/40 shadow-sm hover:shadow-md transition-all group cursor-pointer hover:border-muted-foreground/40">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wide">
                        Platform
                      </span>
                    </div>
                    <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">
                      Mobile Companion App
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Review flashcards and short explanations on the go. Sync progress perfectly
                      with your desktop extension.
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-muted/40">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-xs font-medium">210</span>
                      </div>
                      <div className="flex -space-x-2">
                        <div className="h-6 w-6 rounded-full bg-muted border-2 border-card"></div>
                        <div className="h-6 w-6 rounded-full bg-muted/70 border-2 border-card"></div>
                        <div className="h-6 w-6 rounded-full bg-muted/50 border-2 border-card flex items-center justify-center text-[8px] text-foreground font-bold">
                          +12
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-5 rounded-xl border border-muted/40 shadow-sm hover:shadow-md transition-all group cursor-pointer hover:border-muted-foreground/40">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 rounded bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 text-[10px] font-bold uppercase tracking-wide">
                        AI
                      </span>
                    </div>
                    <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">
                      Interactive AI Pair Programmer
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      An AI that not only explains code but actively quizzes you on the logic you
                      just wrote to ensure comprehension.
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-muted/40">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-xs font-medium">342</span>
                      </div>
                      <div className="h-6 w-6 rounded-full bg-muted border-2 border-card" />
                    </div>
                  </div>
                  <div className="bg-card p-5 rounded-xl border border-muted/40 shadow-sm hover:shadow-md transition-all group cursor-pointer hover:border-muted-foreground/40">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 rounded bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wide">
                        Export
                      </span>
                    </div>
                    <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">
                      Certification Export
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate PDF certificates for skills you've mastered to share on LinkedIn or
                      with your employer.
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-muted/40">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-xs font-medium">128</span>
                      </div>
                      <div className="h-6 w-6 rounded-full bg-muted border-2 border-card" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
