"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"

export default function SignOutButton() {
  const router = useRouter()
  const { logout } = usePrivy()

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" })
    await logout()
    router.push("/")
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-oc-gray hover:text-white transition text-xs"
    >
      Sign Out
    </button>
  )
}
