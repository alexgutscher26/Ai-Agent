import { Button } from "@/components/ui/button"
import {
  Check,
  ArrowRight,
  Cog,
  MapPin,
  Type,
  Globe,
  ExternalLink,
  ChevronDown,
} from "lucide-react"

function Nav() {
  return (
    <div className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">FlowPilot</span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a className="text-sm text-muted-foreground hover:text-foreground" href="#features">
            Features
          </a>
          <a className="text-sm text-muted-foreground hover:text-foreground" href="#how">
            How it works
          </a>
          <a className="text-sm text-muted-foreground hover:text-foreground" href="#pricing">
            Pricing
          </a>
        </div>
        <Button asChild>
          <a href="/login">Sign in</a>
        </Button>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="hero-gradient border-b">
      <div className="container py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-[11px] font-semibold text-primary">
            NOW IN BETA
          </div>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Your AI Senior Developer,{" "}
            <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              right inside VS Code.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Stop getting stuck on tutorials. Get instant feedback, refactoring tips, and mentorship
            directly in your IDE while you code.
          </p>
          <div className="mx-auto mt-8 flex max-w-xl items-center justify-between rounded-xl border bg-card p-2 shadow-sm">
            <input
              type="text"
              inputMode="email"
              placeholder="Enter your email address"
              className="w-full appearance-none rounded-lg bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="ml-2 h-11 px-6">Join Waitlist</Button>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Join 2,000+ developers on the waitlist.
          </div>
        </div>
        <div className="mx-auto mt-14 w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-[#0f172a] relative">
          <div
            className="w-full aspect-[16/9] bg-cover bg-center bg-no-repeat relative"
            data-alt="VS Code interface showing code suggestions and AI chat panel"
            style={{ backgroundImage: "linear-gradient(to bottom right, #1e293b, #0f172a)" }}
          >
            <div className="absolute top-0 w-full h-8 bg-[#1e293b] flex items-center px-4 gap-2 border-b border-gray-700">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="absolute inset-0 top-8 flex">
              <div className="w-16 h-full border-r border-gray-700 bg-[#1e293b] hidden sm:block"></div>
              <div className="flex-1 p-8 font-mono text-sm text-blue-300 opacity-80 leading-loose">
                {"import "} <span className="text-purple-400">React</span> {" from "}{" "}
                <span className="text-green-400">'react'</span>;<br />
                <br />
                <span className="text-purple-400">const</span>{" "}
                <span className="text-yellow-300">App</span> {" = () => {"}
                <br />
                &nbsp;&nbsp;
                <span className="text-gray-400">
                  // FlowPilot Suggestion: Consider memoizing this value
                </span>
                <br />
                &nbsp;&nbsp;<span className="text-purple-400">const</span>{" "}
                <span className="text-blue-200">value</span> {" = "}
                {"expensiveCalculation();"}
                <br />
                &nbsp;&nbsp;{"return "} <span className="text-blue-200">&lt;div&gt;</span>
                {"Hello World"}
                <span className="text-blue-200">&lt;/div&gt;</span>;<br />
                {"}"}
              </div>
              <div className="w-80 h-full border-l border-gray-700 bg-[#1e293b] p-4 hidden md:flex flex-col gap-4">
                <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded text-xs text-blue-200">
                  <strong>FlowPilot:</strong>{" "}
                  {
                    "You're re-calculating `value` on every render. Use `useMemo` here to improve performance."
                  }
                </div>
                <div className="h-2 w-3/4 bg-gray-700 rounded opacity-20"></div>
                <div className="h-2 w-1/2 bg-gray-700 rounded opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureBlocks() {
  return (
    <section id="features" className="py-20 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-10 flex flex-col gap-24 md:gap-32">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full md:w-1/2 flex flex-col gap-6">
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary mb-2">
              <Cog className="h-6 w-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Catch bad habits before they stick.
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Don't wait for a code review that might never come. FlowPilot analyzes your syntax and
              patterns in real-time, nudging you towards industry best practices as you type.
            </p>
            <ul className="flex flex-col gap-3 mt-2">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span>Instant linting and style checks</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span>Security vulnerability detection</span>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-1/2">
            <div className="rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800 bg-card p-2 rotate-1 hover:rotate-0 transition-transform duration-500">
              <div
                className="w-full aspect-[4/3] bg-cover bg-center rounded-lg"
                style={{ backgroundImage: "linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%)" }}
              >
                <div className="h-full w-full flex items-center justify-center relative">
                  <div className="absolute inset-x-8 top-12 h-4 bg-red-400/20 rounded"></div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg absolute right-12 top-20 w-48 text-xs z-10">
                    <div className="font-bold text-red-500 mb-1">Warning</div>
                    <div className="text-gray-600 dark:text-gray-300">
                      Possible infinite loop detected in this block.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
          <div className="w-full md:w-1/2 flex flex-col gap-6">
            <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mb-2">
              <MapPin className="h-6 w-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Understand the 'Why', not just the 'How'.
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Copy‑pasting from Stack Overflow teaches you nothing. Highlight any block of code to
              get a plain‑English explanation of what it does and why it works that way.
            </p>
            <button className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all mt-2 group">
              See explainer demo{" "}
              <ArrowRight className="text-sm group-hover:translate-x-1 transition-transform h-4 w-4" />
            </button>
          </div>
          <div className="w-full md:w-1/2">
            <div className="rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800 bg-card p-2 -rotate-1 hover:rotate-0 transition-transform duration-500">
              <div
                className="w-full aspect-[4/3] bg-cover bg-center rounded-lg"
                style={{ backgroundImage: "linear-gradient(135deg, #f3e8ff 0%, #f3f4f6 100%)" }}
              >
                <div className="h-full w-full p-8 flex gap-4">
                  <div className="w-1/2 bg-gray-200 dark:bg-gray-700 rounded h-3/4"></div>
                  <div className="w-1/2 bg-white dark:bg-gray-800 rounded h-full shadow p-4 flex flex-col gap-2">
                    <div className="h-2 w-1/3 bg-purple-500 rounded"></div>
                    <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <div className="h-2 w-2/3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full md:w-1/2 flex flex-col gap-6">
            <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-2">
              <Type className="h-6 w-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Refactor like a Senior Engineer.
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Identify "code smells" instantly. FlowPilot suggests cleaner, more efficient ways to
              write your functions, helping you learn design patterns naturally.
            </p>
          </div>
          <div className="w-full md:w-1/2">
            <div className="rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800 bg-card p-2 rotate-1 hover:rotate-0 transition-transform duration-500">
              <div
                className="w-full aspect-[4/3] bg-cover bg-center rounded-lg"
                style={{ backgroundImage: "linear-gradient(135deg, #dcfce7 0%, #f3f4f6 100%)" }}
              >
                <div className="h-full w-full flex flex-col items-center justify-center gap-4 p-6">
                  <div className="w-full bg-red-100 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800 opacity-70">
                    <div className="h-2 w-3/4 bg-red-400 rounded"></div>
                  </div>
                  <span className="text-gray-400">↓</span>
                  <div className="w-full bg-green-100 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800 shadow-md transform scale-105">
                    <div className="h-2 w-1/2 bg-green-500 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How FlowPilot works</h2>
          <p className="text-muted-foreground">
            Get setup in less than 2 minutes. No complicated configuration required.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-gray-200 via-primary/30 to-gray-200 dark:from-gray-700 dark:to-gray-700 z-0"></div>
          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-card border-4 border-gray-100 dark:border-gray-700 flex items-center justify-center text-xl font-bold text-primary shadow-sm">
              1
            </div>
            <h3 className="text-xl font-bold mt-2">Install Extension</h3>
            <p className="text-sm leading-relaxed px-4 text-muted-foreground">
              Find "FlowPilot" in the VS Code marketplace and click install. It's lightweight and
              fast.
            </p>
          </div>
          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-card border-4 border-gray-100 dark:border-gray-700 flex items-center justify-center text-xl font-bold text-primary shadow-sm">
              2
            </div>
            <h3 className="text-xl font-bold mt-2">Connect Account</h3>
            <p className="text-sm leading-relaxed px-4 text-muted-foreground">
              Sign in with GitHub to sync your settings and learning progress across devices.
            </p>
          </div>
          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-card border-4 border-gray-100 dark:border-gray-700 flex items-center justify-center text-xl font-bold text-primary shadow-sm">
              3
            </div>
            <h3 className="text-xl font-bold mt-2">Start Coding</h3>
            <p className="text-sm leading-relaxed px-4 text-muted-foreground">
              Open any file. The coach will immediately start analyzing your context and offering
              help.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground">Free for learners, powerful for professionals.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="p-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-background flex flex-col h-full hover:shadow-lg transition-shadow">
            <div className="mb-6">
              <h3 className="text-xl font-bold">Free Tier</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/ forever</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Perfect for beginners just starting their journey.
              </p>
            </div>
            <ul className="flex flex-col gap-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-green-500" />
                Basic Syntax Checking
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-green-500" />
                10 AI Explanations / day
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-green-500" />
                Community Support
              </li>
            </ul>
            <button className="w-full py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Download Free
            </button>
          </div>

          <div className="p-8 rounded-2xl border-2 border-primary bg-white dark:bg-surface-dark shadow-xl relative flex flex-col h-full transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Most Popular
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold">Pro Coach</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">$9</span>
                <span className="text-muted-foreground">/ month</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                For serious learners who want to grow faster.
              </p>
            </div>
            <ul className="flex flex-col gap-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-primary" />
                <strong>Real-time Refactoring Tips</strong>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-primary" />
                Unlimited AI Explanations
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-primary" />
                Security Analysis
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-primary" />
                Custom Learning Path
              </li>
            </ul>
            <button className="w-full py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">
              Get Early Access
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function FAQ() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 md:px-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-4">
          <details className="group bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all duration-300">
            <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-semibold">
              <span>Does this replace a human mentor?</span>
              <ChevronDown className="h-5 w-5 transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <div className="px-5 pb-5 leading-relaxed text-sm text-muted-foreground">
              No, and it's not trying to. FlowPilot is designed to unblock you instantly when a
              human mentor isn't available (like at 2 AM). It handles the "how" and "what", so you
              can spend your valuable mentor time discussing high-level architecture and career
              advice.
            </div>
          </details>
          <details className="group bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all duration-300">
            <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-semibold">
              <span>Which languages do you support?</span>
              <ChevronDown className="h-5 w-5 transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <div className="px-5 pb-5 leading-relaxed text-sm text-muted-foreground">
              Currently, we are optimized for JavaScript, TypeScript, Python, and React. We are
              actively working on adding support for Java, Go, and Ruby in the coming months.
            </div>
          </details>
          <details className="group bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all duration-300">
            <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-semibold">
              <span>Is my code safe?</span>
              <ChevronDown className="h-5 w-5 transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <div className="px-5 pb-5 leading-relaxed text-sm text-muted-foreground">
              Absolutely. We process snippets locally where possible, and any code sent to the cloud
              for analysis is encrypted in transit and never stored permanently on our servers.
            </div>
          </details>
        </div>
      </div>
    </section>
  )
}

function BuildingInPublic() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-4xl px-4 md:px-10">
        <div className="bg-gradient-to-r from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm">
          <div className="flex-1 flex flex-col gap-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-bold text-sm uppercase tracking-wide mb-1">
              <Globe className="h-4 w-4" />
              Building in Public
            </div>
            <h3 className="text-2xl font-bold">We're indie devs solving our own problem.</h3>
            <p className="text-muted-foreground">
              FlowPilot was born because we couldn't afford mentorship when we were learning. We
              share our revenue numbers, roadmap, and challenges openly.
            </p>
          </div>
          <div className="shrink-0">
            <a
              className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              href="#"
            >
              <span>Follow on X</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Page() {
  return (
    <main>
      <Nav />
      <Hero />
      <FeatureBlocks />
      <HowItWorks />
      <BuildingInPublic />
      <Pricing />
      <FAQ />
      <footer className="bg-card border-t pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <span className="text-primary text-2xl">›_</span>
                <span className="text-xl font-bold">FlowPilot</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                The AI mentor that helps you write better code, faster.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-lg font-bold">Ready to level up?</p>
              <Button className="px-6 py-3">Join Waitlist</Button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t text-sm text-muted-foreground">
            <p>© 2026 FlowPilot. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a className="hover:text-primary transition-colors" href="#">
                Privacy
              </a>
              <a className="hover:text-primary transition-colors" href="#">
                Terms
              </a>
              <a className="hover:text-primary transition-colors" href="#">
                Twitter
              </a>
              <a className="hover:text-primary transition-colors" href="#">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
