"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Github, Mail, Lock, Chrome } from "lucide-react"
import { authClient } from "@/lib/auth-client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [error, setError] = useState<string | null>(null)
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const normEmail = email.trim().toLowerCase()
      if (mode === "signin") {
        try {
          await authClient.signIn.email({
            email: normEmail,
            password,
            callbackURL: "/dashboard"
          })
        } catch (err: any) {
          const msg = err?.message || ""
          if (msg.toLowerCase().includes("user not found")) {
            try {
              await authClient.signUp.email({
                email: normEmail,
                password,
                name: normEmail.split("@")[0],
                callbackURL: "/dashboard"
              })
            } catch (signupErr: any) {
              setError(signupErr?.message || "Unable to create account")
            }
          } else {
            setError(msg || "Sign in failed")
          }
        }
      } else {
        await authClient.signUp.email({
          email: normEmail,
          password,
          name: normEmail.split("@")[0],
          callbackURL: "/dashboard"
        })
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="container max-w-md py-16">
      <h1 className="text-2xl font-bold mb-6">Sign in</h1>
      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
      <div className="flex flex-col gap-3 mb-6">
        <Button onClick={() => authClient.signIn.social({ provider: "github", callbackURL: "/dashboard" })} className="w-full h-11">
          <Github className="mr-2 h-4 w-4" /> Continue with GitHub
        </Button>
        <Button onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })} className="w-full h-11">
          <Chrome className="mr-2 h-4 w-4" /> Continue with Google
        </Button>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
            required
          />
        </div>
        <Button type="submit" className="w-full h-11" disabled={loading}>
          {loading ? (mode === "signin" ? "Signing in..." : "Creating account...") : (mode === "signin" ? "Sign in with Email" : "Create account")}
        </Button>
        <div className="text-xs text-muted-foreground text-center">
          {mode === "signin" ? (
            <button type="button" className="underline" onClick={() => setMode("signup")}>Create account</button>
          ) : (
            <button type="button" className="underline" onClick={() => setMode("signin")}>Have an account? Sign in</button>
          )}
        </div>
      </form>
    </div>
  )
}
