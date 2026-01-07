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
  MessageSquare,
  Bug,
  BookOpen,
  ExternalLink,
  Mail,
  Send,
  Users,
  Map as MapIcon,
  LifeBuoy
} from "lucide-react"

export default function HelpPage() {
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
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" href="/dashboard">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
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
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium transition-colors" href="/help">
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
                <span>Help & Feedback</span>
              </nav>
              <div className="relative w-full max-w-md hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-muted-foreground" size={18} />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm transition-all"
                  placeholder="Search for answers..."
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
            <div className="max-w-6xl mx-auto flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Help Center & Feedback</h1>
                  <p className="text-muted-foreground mt-1">Find answers, get support, and help us improve FlowPilot.</p>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-card border border-muted/40 hover:bg-muted text-foreground rounded-lg text-sm font-medium transition-colors">
                    <MessageSquare size={18} />
                    Community Forum
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium shadow-sm transition-colors">
                    <Bug size={18} />
                    Report a Bug
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a className="group flex flex-col p-6 bg-card rounded-xl border border-muted/40 hover:border-primary/50 transition-all shadow-sm" href="#">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen />
                  </div>
                  <h3 className="text-base font-semibold mb-2">Documentation</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">Explore detailed guides, API references, and configuration options.</p>
                  <span className="text-sm font-medium text-primary flex items-center gap-1">
                    Read Docs <ExternalLink size={16} />
                  </span>
                </a>
                <a className="group flex flex-col p-6 bg-card rounded-xl border border-muted/40 hover:border-purple-500/50 transition-all shadow-sm" href="#">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users />
                  </div>
                  <h3 className="text-base font-semibold mb-2">Community</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">Join our Discord server to chat with other developers and the team.</p>
                  <span className="text-sm font-medium text-purple-600 flex items-center gap-1">
                    Join Discord <ExternalLink size={16} />
                  </span>
                </a>
                <a className="group flex flex-col p-6 bg-card rounded-xl border border-muted/40 hover:border-green-500/50 transition-all shadow-sm" href="#">
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MapIcon />
                  </div>
                  <h3 className="text-base font-semibold mb-2">Public Roadmap</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">See what we're working on and vote for the features you want next.</p>
                  <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                    View Roadmap <ExternalLink size={16} />
                  </span>
                </a>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                  <section className="bg-card rounded-xl border border-muted/40 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-muted/40">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="text-muted-foreground" size={18} />
                        <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
                      </div>
                    </div>
                    <div>
                      <details className="group p-5 border-b border-muted/30 cursor-pointer">
                        <summary className="flex justify-between items-center font-medium list-none">
                          <span>How does FlowPilot analyze my code?</span>
                          <span className="transition-transform duration-300 group-open:rotate-180">
                            <ExternalLink className="text-muted-foreground" size={16} />
                          </span>
                        </summary>
                        <div className="text-muted-foreground mt-3 text-sm leading-relaxed pr-8">
                          FlowPilot runs locally for static analysis. Some snippets may be sent securely for AI insights and are not stored.
                        </div>
                      </details>
                      <details className="group p-5 border-b border-muted/30 cursor-pointer">
                        <summary className="flex justify-between items-center font-medium list-none">
                          <span>Can I use FlowPilot offline?</span>
                          <span className="transition-transform duration-300 group-open:rotate-180">
                            <ExternalLink className="text-muted-foreground" size={16} />
                          </span>
                        </summary>
                        <div className="text-muted-foreground mt-3 text-sm leading-relaxed pr-8">
                          Basic linting works offline; AI coaching and roadmap features require internet connectivity.
                        </div>
                      </details>
                      <details className="group p-5 border-b border-muted/30 cursor-pointer">
                        <summary className="flex justify-between items-center font-medium list-none">
                          <span>Which programming languages are supported?</span>
                          <span className="transition-transform duration-300 group-open:rotate-180">
                            <ExternalLink className="text-muted-foreground" size={16} />
                          </span>
                        </summary>
                        <div className="text-muted-foreground mt-3 text-sm leading-relaxed pr-8">
                          Full support: JS/TS/Python/Java. Beta: Go/Rust/C# with more coming based on votes.
                        </div>
                      </details>
                      <details className="group p-5 cursor-pointer">
                        <summary className="flex justify-between items-center font-medium list-none">
                          <span>Where can I find the public roadmap?</span>
                          <span className="transition-transform duration-300 group-open:rotate-180">
                            <ExternalLink className="text-muted-foreground" size={16} />
                          </span>
                        </summary>
                        <div className="text-muted-foreground mt-3 text-sm leading-relaxed pr-8">
                          You can view our public roadmap and vote on features.
                        </div>
                      </details>
                    </div>
                  </section>

                  <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg text-blue-600 dark:text-blue-400 flex-shrink-0">
                      <LifeBuoy />
                    </div>
                    <div>
                      <h4 className="font-semibold">Still need help?</h4>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">Our support team is available Mon–Fri to assist you.</p>
                      <a className="text-sm font-medium text-primary hover:text-primary/80 transition-colors" href="mailto:support@codecoach.dev">
                        Contact Support →
                      </a>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <section className="bg-card rounded-xl border border-muted/40 shadow-sm overflow-hidden sticky top-6">
                    <div className="p-6 border-b border-muted/40">
                      <div className="flex items-center gap-2">
                        <Mail className="text-muted-foreground" size={18} />
                        <h2 className="text-lg font-semibold">Send Feedback</h2>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Found a bug or have a feature request?</p>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Type</label>
                        <div className="relative">
                          <select className="block w-full pl-3 pr-10 py-2 border border-muted/40 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-card text-foreground appearance-none">
                            <option>Feature Request</option>
                            <option>Bug Report</option>
                            <option>General Feedback</option>
                            <option>Billing Question</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                            <Search size={16} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Subject</label>
                        <input className="w-full px-3 py-2 border border-muted/40 rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder-muted-foreground sm:text-sm" placeholder="Brief summary of your feedback" type="text" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Message</label>
                        <textarea className="w-full px-3 py-2 border border-muted/40 rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder-muted-foreground sm:text-sm" placeholder="Describe your issue or idea in detail..." rows={4} />
                      </div>
                      <div className="pt-2">
                        <button className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                          <span>Submit Feedback</span>
                          <Send size={18} />
                        </button>
                      </div>
                      <p className="text-xs text-center text-muted-foreground mt-4">
                        By submitting, you agree to share your feedback with the FlowPilot team.
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
