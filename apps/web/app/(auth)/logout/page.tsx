"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePrivy } from "@privy-io/react-auth"

export default function LogoutPage() {
  const router = useRouter()
  const { ready, logout } = usePrivy()

  useEffect(() => {
    if (!ready) return

    let cancelled = false

    async function signOut() {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => null)
      await logout().catch(() => null)

      if (!cancelled) {
        router.push("/")
        router.refresh()
      }
    }

    signOut()

    return () => {
      cancelled = true
    }
  }, [ready, logout, router])

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <p className="text-black/50">Signing out...</p>
    </div>
  )
}
