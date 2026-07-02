"use client"

import { useRouter } from "next/navigation"

export default function SignOutButton() {
  const router = useRouter()

  function handleSignOut() {
    router.push("/logout")
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-red-500/80 hover:text-red-600 transition font-medium text-xs"
    >
      Sign Out
    </button>
  )
}
