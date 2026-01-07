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
  Download,
  Plus,
  Eye,
  Code2,
  Bug,
  GraduationCap,
  Gauge,
  Shield,
  TrendingUp
} from "lucide-react"

export default function SessionsPage() {
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
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium" href="/sessions">
              <History size={18} />
              <span>My Sessions</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" href="/skills">
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
                <span>My Sessions</span>
              </nav>
              <div className="relative w-full max-w-md hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-muted-foreground" size={18} />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm transition-all"
                  placeholder="Search sessions..."
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
                  <h1 className="text-2xl font-bold tracking-tight">Session History</h1>
                  <p className="text-muted-foreground mt-1">Review your past coding interactions, insights, and analysis.</p>
                </div>
                <div className="flex gap-3">
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-muted/40 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium shadow-sm transition-colors">
                    <Plus className="h-4 w-4" />
                    New Session
                  </button>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-muted/40 p-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="text-muted-foreground" />
                    </div>
                    <input
                      className="block w-full pl-10 pr-4 py-2 rounded-lg border border-muted/40 bg-muted text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 text-sm"
                      placeholder="Search by description or snippet content..."
                      type="text"
                    />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="w-full md:w-40">
                      <select className="block w-full pl-3 pr-10 py-2 text-sm border-muted/40 bg-muted text-foreground rounded-lg focus:ring-primary/50">
                        <option>All Types</option>
                        <option>Code Review</option>
                        <option>Explanation</option>
                        <option>Debugging</option>
                        <option>Refactoring</option>
                      </select>
                    </div>
                    <div className="w-full md:w-40">
                      <select className="block w-full pl-3 pr-10 py-2 text-sm border-muted/40 bg-muted text-foreground rounded-lg focus:ring-primary/50">
                        <option>All Languages</option>
                        <option>TypeScript</option>
                        <option>JavaScript</option>
                        <option>Python</option>
                        <option>Java</option>
                        <option>Rust</option>
                      </select>
                    </div>
                    <div className="w-full md:w-40">
                      <select className="block w-full pl-3 pr-10 py-2 text-sm border-muted/40 bg-muted text-foreground rounded-lg focus:ring-primary/50">
                        <option>Last 30 Days</option>
                        <option>Last 7 Days</option>
                        <option>This Month</option>
                        <option>Last Month</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-muted/40 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted border-b border-muted/40">
                      <tr>
                        <th className="px-6 py-4 font-semibold w-1/3">Session Description</th>
                        <th className="px-6 py-4 font-semibold">Interaction Type</th>
                        <th className="px-6 py-4 font-semibold">Language</th>
                        <th className="px-6 py-4 font-semibold">Date</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted/40">
                      <tr className="hover:bg-muted transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                              <Code2 />
                            </div>
                            <div>
                              <p className="font-medium group-hover:text-primary transition-colors">Refactoring Auth Middleware</p>
                              <p className="text-xs text-muted-foreground">auth_service.ts • 124 lines</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                            Code Review
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 flex items-center justify-center rounded bg-muted text-[10px] font-bold text-blue-600">TS</span>
                            <span>TypeScript</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          Oct 24, 2023 <span className="text-xs ml-1">14:30</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-muted">
                            <Eye />
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-muted transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                              <Bug />
                            </div>
                            <div>
                              <p className="font-medium group-hover:text-primary transition-colors">Null Pointer Analysis</p>
                              <p className="text-xs text-muted-foreground">payment_controller.java • Error trace</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Debugging
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 flex items-center justify-center rounded bg-muted text-[10px] font-bold text-orange-600">JV</span>
                            <span>Java</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          Oct 23, 2023 <span className="text-xs ml-1">09:15</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-muted">
                            <Eye />
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-muted transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
                              <GraduationCap />
                            </div>
                            <div>
                              <p className="font-medium group-hover:text-primary transition-colors">Understanding useEffect Dependencies</p>
                              <p className="text-xs text-muted-foreground">React Hook concept explanation</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                            Explanation
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 flex items-center justify-center rounded bg-muted text-[10px] font-bold text-yellow-500">JS</span>
                            <span>JavaScript</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          Oct 22, 2023 <span className="text-xs ml-1">16:45</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-muted">
                            <Eye />
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-muted transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                              <Gauge />
                            </div>
                            <div>
                              <p className="font-medium group-hover:text-primary transition-colors">SQL Query Optimization</p>
                              <p className="text-xs text-muted-foreground">user_stats_agg.sql • Performance check</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Performance
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 flex items-center justify-center rounded bg-muted text-[10px] font-bold text-slate-600">SQL</span>
                            <span>SQL</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          Oct 21, 2023 <span className="text-xs ml-1">11:20</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-muted">
                            <Eye />
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-muted transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                              <Shield />
                            </div>
                            <div>
                              <p className="font-medium group-hover:text-primary transition-colors">Security Audit: Login Flow</p>
                              <p className="text-xs text-muted-foreground">login_api.py • Vulnerability scan</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                            Security Audit
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 flex items-center justify-center rounded bg-muted text-[10px] font-bold text-yellow-600">PY</span>
                            <span>Python</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          Oct 19, 2023 <span className="text-xs ml-1">13:10</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-muted">
                            <Eye />
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-muted transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                              <Code2 />
                            </div>
                            <div>
                              <p className="font-medium group-hover:text-primary transition-colors">DRY Refactor on Utils</p>
                              <p className="text-xs text-muted-foreground">utils/formatters.ts • 45 lines</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                            Code Review
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 flex items-center justify-center rounded bg-muted text-[10px] font-bold text-blue-600">TS</span>
                            <span>TypeScript</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          Oct 18, 2023 <span className="text-xs ml-1">10:05</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-muted">
                            <Eye />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-muted/40 bg-muted flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">1-6</span> of <span className="font-medium text-foreground">42</span> results
                  </span>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border border-muted/40 rounded-md text-muted-foreground cursor-not-allowed opacity-50">Previous</button>
                    <button className="px-3 py-1 text-sm border border-muted/40 rounded-md hover:bg-card hover:text-primary transition-colors">Next</button>
                  </div>
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
