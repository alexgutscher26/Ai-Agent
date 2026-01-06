import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Check, ArrowRight, ShieldCheck, GaugeCircle, LineChart, Download, Sparkles, Quote, CreditCard } from "lucide-react"

function Nav() {
  return (
    <div className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-md bg-primary"></div>
          <span className="text-lg font-semibold">Code Coach</span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a className="text-sm text-muted-foreground hover:text-foreground" href="#features">Features</a>
          <a className="text-sm text-muted-foreground hover:text-foreground" href="#how">How it works</a>
          <a className="text-sm text-muted-foreground hover:text-foreground" href="#pricing">Pricing</a>
        </div>
        <Button>Install Free</Button>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="hero-gradient border-b">
      <div className="container py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            FOR BEGINNERS & INTERMEDIATES
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
            Your AI Senior Developer, right inside VS Code.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Stop guessing and start learning faster. Get clear explanations, reviews, and fixes without leaving your editor.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button size="lg">Start free</Button>
            <Button variant="secondary" size="lg">
              Install in VS Code
            </Button>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="rounded-xl border bg-card shadow-2xl">
            <div className="grid grid-cols-2 overflow-hidden rounded-xl">
              <div className="bg-[#0B1220] p-6 text-[#D1D6E5]">
                <div className="mb-4 flex items-center gap-2 text-xs text-[#8A94A6]">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                </div>
                <pre className="text-sm leading-relaxed">
{`def bubblesort(arr):
  n = len(arr)
  for i in range(n):
    for j in range(0, n-i-1):
      if arr[j] > arr[j+1]:
        arr[j], arr[j+1] = arr[j+1], arr[j]
  return arr`}
                </pre>
              </div>
              <div className="bg-secondary p-6">
                <div className="rounded-lg border bg-card p-4">
                  <div className="text-sm font-semibold">Explanation</div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The outer loop walks the list, the inner loop compares neighbors and swaps when needed. After each pass, the largest item bubbles to the end.
                  </p>
                  <div className="mt-4 grid gap-2 text-sm">
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="h-4 w-4" />
                      Clear variable naming
                    </div>
                    <div className="flex items-center gap-2 text-amber-600">
                      <Sparkles className="h-4 w-4" />
                      Consider early-exit optimization
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-6 max-w-3xl text-center text-sm text-muted-foreground">
            Trusted by learners at bootcamps and universities
          </div>
          <div className="mt-3 flex justify-center gap-6 opacity-60">
            <div className="h-6 w-24 rounded bg-secondary" />
            <div className="h-6 w-24 rounded bg-secondary" />
            <div className="h-6 w-24 rounded bg-secondary" />
            <div className="h-6 w-24 rounded bg-secondary" />
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureBlocks() {
  return (
    <section id="features" className="container space-y-16 py-16">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-2xl font-semibold">Catch bad habits before they stick.</h3>
          <p className="mt-2 text-muted-foreground">Actionable reviews on performance, readability, and style.</p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Instant reviews</li>
            <li className="flex items-center gap-2"><GaugeCircle className="h-4 w-4 text-blue-600" /> Performance tips</li>
            <li className="flex items-center gap-2"><LineChart className="h-4 w-4 text-emerald-600" /> Progress tracking</li>
          </ul>
        </div>
        <Card className="bg-secondary">
          <CardContent className="p-6"> 
            <div className="h-40 rounded-lg border bg-card" />
          </CardContent>
        </Card>
      </div>
      <div className="grid items-center gap-8 md:grid-cols-2">
        <Card className="order-2 bg-secondary md:order-1">
          <CardContent className="p-6"> 
            <div className="h-40 rounded-lg border bg-card" />
          </CardContent>
        </Card>
        <div className="order-1 md:order-2">
          <h3 className="text-2xl font-semibold">Understand the ‘Why’, not just the ‘How’.</h3>
          <p className="mt-2 text-muted-foreground">Short, clear explanations with reflection prompts.</p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Beginner and intermediate modes</li>
            <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-pink-600" /> Guided learning</li>
          </ul>
        </div>
      </div>
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-2xl font-semibold">Refactor like a Senior Engineer.</h3>
          <p className="mt-2 text-muted-foreground">Smarter suggestions to improve structure and clarity.</p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Safe change proposals</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-sky-600" /> Privacy-conscious</li>
          </ul>
        </div>
        <Card className="bg-secondary">
          <CardContent className="p-6"> 
            <div className="h-40 rounded-lg border bg-card" />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how" className="border-y bg-secondary/50">
      <div className="container py-16">
        <h2 className="text-center text-3xl font-semibold">How Code Coach works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Install Extension</CardTitle>
              <CardDescription>Add the VS Code extension in one click.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Connect Account</CardTitle>
              <CardDescription>Sign in and set your learning level.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Start Coding</CardTitle>
              <CardDescription>Ask for explanations, reviews, and fixes anytime.</CardDescription>
            </CardHeader>
          </Card>
        </div>
        <div className="mx-auto mt-8 max-w-xl">
          <Card>
            <CardContent className="flex items-center gap-3 p-4 text-sm">
              <Quote className="h-5 w-5 text-primary" />
              We help devs solve their own problems with clear, actionable guidance.
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section id="pricing" className="container py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold">Simple, transparent pricing</h2>
        <p className="mt-2 text-muted-foreground">Monthly or yearly. Start free, upgrade when ready.</p>
        <div className="mx-auto mt-6 inline-flex rounded-md border bg-muted p-1 text-sm">
          <button className="rounded-sm bg-card px-3 py-1">Monthly</button>
          <button className="rounded-sm px-3 py-1 text-muted-foreground">Yearly</button>
        </div>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Free Tier</CardTitle>
            <CardDescription>Core features to get started.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Limited daily usage</div>
            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Explanations and reviews</div>
            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Privacy-friendly telemetry</div>
          </CardContent>
          <CardContent>
            <Button variant="secondary" className="w-full">Download Free</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pro Coach</CardTitle>
            <CardDescription>More history, faster responses, priority support.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Unlimited explanations</div>
            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Team features</div>
            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Billing portal</div>
          </CardContent>
          <CardContent>
            <Button className="w-full">Get Pro</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function FAQ() {
  return (
    <section className="container py-16">
      <h2 className="text-3xl font-semibold">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="mt-6 w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Does Code Coach store my code?</AccordionTrigger>
          <AccordionContent>
            Explanations are generated with privacy-first processing. Sensitive snippets can be excluded. Telemetry is opt-in.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is there a student discount?</AccordionTrigger>
          <AccordionContent>
            Yes. Students and educators can contact support to receive a discount for Pro.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>How do upgrades work?</AccordionTrigger>
          <AccordionContent>
            Upgrade or downgrade anytime. Billing proration is handled automatically.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
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
      <Pricing />
      <FAQ />
      <footer className="border-t">
        <div className="container flex items-center justify-between py-8">
          <div className="text-sm text-muted-foreground">© Code Coach</div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#status">Status</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
