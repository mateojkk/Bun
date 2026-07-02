"use client"

import { useState } from "react"

export default function SorobanSettleButton({
  subscriptionId,
  chainStatus,
}: {
  subscriptionId: string
  chainStatus: string
}) {
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  if (chainStatus !== "confirmed") return null

  async function settle() {
    setLoading(true)
    setStatus("Calling Soroban escrow.settle()...")
    try {
      const res = await fetch("/api/soroban/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || data.chain?.raw || "Settle failed")
      setStatus("Soroban settlement confirmed on testnet.")
      setTimeout(() => window.location.reload(), 1500)
    } catch (error: any) {
      setStatus(error?.message || "Settlement failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={settle}
        disabled={loading}
        className="text-xs px-4 py-2 rounded-lg bg-black text-white hover:bg-neutral-800 transition font-medium shadow-sm disabled:opacity-50"
      >
        {loading ? "Settling..." : "Settle on Soroban"}
      </button>
      {status && <p className="text-xs text-black/50 mt-3">{status}</p>}
      <p className="text-xs text-black/40 mt-1">Available after escrow cycle ends (demo: 15 min).</p>
    </div>
  )
}
