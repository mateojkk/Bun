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
    <div>
      <h3 className="font-medium text-black mb-1">Testnet Faucet</h3>
      <p className="text-sm text-black/50 mb-4">
        2.5 USDC per request &middot; 5 USDC daily limit
      </p>
      {hasBalance && (
        <p className="text-sm text-black/70 mb-3 font-medium">
          Current balance: {Number(balance).toFixed(2)} USDC
        </p>
      )}
      <button
        onClick={handleFund}
        disabled={loading}
        className="px-6 py-2.5 bg-black text-white rounded-full hover:bg-neutral-800 transition-colors text-sm disabled:opacity-50 font-medium mt-1 shadow-sm"
      >
        {loading ? "Funding..." : "Get 2.5 USDC"}
      </button>
      {status && (
        <p className="text-xs text-black/40 mt-3">{status}</p>
      )}
    </div>
  )
}
