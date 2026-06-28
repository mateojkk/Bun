"use client"

import { useState } from "react"

export default function TopUpForm({
  publicKey,
  balance,
}: {
  publicKey: string
  balance: string
}) {
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)

  async function handleFund() {
    setLoading(true)
    setStatus("Requesting 2.5 testnet USDC...")
    try {
      const res = await fetch("/api/stellar/fund", { method: "POST" })
      const data = await res.json()
      if (data.ok) {
        setRemaining(data.remaining)
        setStatus(`2.5 USDC received! ${data.remaining > 0 ? `You can request ${data.remaining} more today.` : "Daily limit reached."}`)
        setTimeout(() => window.location.reload(), 2500)
      } else {
        setStatus(data.error || "Could not transfer USDC. Please try again later.")
      }
    } catch (e: any) {
      setStatus(`Error: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const hasBalance = Number(balance) > 0

  return (
    <div className="p-4 bg-white/5 border border-white/5 rounded-lg">
      <h2 className="font-semibold mb-1 text-white">Fund Account</h2>
      <p className="text-xs text-oc-muted mb-3">
        2.5 USDC per request &middot; 5 USDC daily limit
      </p>
      {hasBalance && (
        <p className="text-sm text-oc-lighter mb-3">
          Current balance: {Number(balance).toFixed(2)} USDC
        </p>
      )}
      <button
        onClick={handleFund}
        disabled={loading}
        className="px-4 py-2 bg-white text-oc-black rounded text-sm hover:bg-oc-lightest transition disabled:opacity-50"
      >
        {loading ? "Funding..." : "Get 2.5 USDC"}
      </button>
      {status && (
        <p className="text-xs text-oc-gray mt-2">{status}</p>
      )}
    </div>
  )
}
