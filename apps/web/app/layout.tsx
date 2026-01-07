import type { Metadata } from "next"
import "./globals.css"
import ThemeClient from "@/components/ThemeClient"

export const metadata: Metadata = {
  title: "FlowPilot",
  description: "Your AI Senior Developer, right inside VS Code.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeClient />
        {children}
      </body>
    </html>
  )
}
