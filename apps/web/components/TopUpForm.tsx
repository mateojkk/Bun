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

  async function handleFund() {
    setLoading(true)
    setStatus("Requesting 10 testnet USDC from agent...")
    try {
      const res = await fetch("/api/stellar/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey }),
      })
      const data = await res.json()
      if (data.ok) {
        setStatus("Funded with 10 USDC! Refreshing...")
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setStatus(
          `Could not transfer USDC — agent may be out of funds. Try again later.`
        )
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
      <h2 className="font-semibold mb-3 text-white">Fund Account</h2>
      {hasBalance ? (
        <p className="text-sm text-oc-lighter">
          Account funded: {Number(balance).toFixed(2)} USDC on testnet.
        </p>
      ) : (
        <>
          <p className="text-xs text-oc-muted mb-3">
            Get 10 free testnet USDC to start subscribing.
          </p>
          <button
            onClick={handleFund}
            disabled={loading}
            className="px-4 py-2 bg-white text-oc-black rounded text-sm hover:bg-oc-lightest transition disabled:opacity-50"
          >
            {loading ? "Funding..." : "Get 10 USDC"}
          </button>
        </>
      )}
      {status && (
        <p className="text-xs text-oc-gray mt-2">{status}</p>
      )}
    </div>
  )
}
