"use client"
import { useEffect } from "react"

function getStoredTheme(): "light" | "dark" | "system" {
  const raw = localStorage.getItem("fp_theme")
  if (raw === "light" || raw === "dark" || raw === "system") return raw
  return "system"
}

function applyTheme(theme: "light" | "dark" | "system") {
  const root = document.documentElement
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  const effective = theme === "system" ? (prefersDark ? "dark" : "light") : theme
  const isDark = effective === "dark"
  const hasDark = root.classList.contains("dark")
  if (isDark && !hasDark) {
    root.classList.add("dark")
  } else if (!isDark && hasDark) {
    root.classList.remove("dark")
  }
  ;(root.style as any).colorScheme = isDark ? "dark" : "light"
}

export default function ThemeClient() {
  useEffect(() => {
    applyTheme(getStoredTheme())
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const handleMedia = () => {
      if (getStoredTheme() === "system") applyTheme("system")
    }
    media.addEventListener("change", handleMedia)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "fp_theme") applyTheme(getStoredTheme())
    }
    window.addEventListener("storage", handleStorage)
    return () => {
      media.removeEventListener("change", handleMedia)
      window.removeEventListener("storage", handleStorage)
    }
  }, [])
  return null
}
