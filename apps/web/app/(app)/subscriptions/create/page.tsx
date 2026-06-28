"use client"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

function SubscribeForm() {
  const params = useSearchParams() || new URLSearchParams()
  const serviceName = params.get("name") || "netflix"
  const unitPrice = params.get("unitPrice") || "0.26"
  const flatRate = params.get("flatRate") || "15.99"
  const unitType = params.get("unitType") || "hour"
  const router = useRouter()

  const [amount, setAmount] = useState("10")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState("")

  async function handleSubscribe() {
    if (!amount || Number(amount) <= 0) return
    setLoading(true)
    setStatus("Simulating transaction...")
    try {
      const res = await fetch("/api/stellar/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount) * 1_0000000,
          unitPrice: Number(unitPrice) * 1_0000000,
          flatRate: Number(flatRate) * 1_0000000,
          cycleEnd: Math.floor(Date.now() / 1000) + 86400,
          serviceName,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setTxHash(data.hash || "")
        setStatus("Escrow created! Redirecting to dashboard...")
        setTimeout(() => router.push("/dashboard"), 2000)
      } else {
        setStatus(`Error: ${data.error || JSON.stringify(data)}`)
      }
    } catch (e: any) {
      setStatus(`Error: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Subscribe to {serviceName}
      </h1>

      <div className="p-4 bg-white/5 border border-white/5 rounded-lg mb-6 text-sm space-y-1">
        <div>
          <span className="text-oc-muted">Price:</span> {unitPrice} USDC per {unitType}
        </div>
        <div>
          <span className="text-oc-muted">Flat rate:</span> {flatRate} USDC/mo
        </div>
        <div>
          <span className="text-oc-muted">
            Max spend is escrowed upfront. Unused USDC returned at cycle end.
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-oc-muted mb-1">
            Max Spend (USDC, escrowed upfront)
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            className="w-full px-3 py-2 rounded-md text-sm"
            placeholder="10.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <p className="text-xs text-oc-muted mt-1">
            Locked in a Soroban escrow contract. Unused portion refunded at cycle end.
          </p>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full px-4 py-3 bg-white text-oc-black rounded-md hover:bg-oc-lightest transition font-medium text-sm disabled:opacity-50"
        >
          {loading ? "Creating escrow..." : `Subscribe — Lock ${amount || "0"} USDC`}
        </button>

        {status && (
          <div className="p-3 bg-white/5 rounded text-sm text-oc-gray">
            {status}
            {txHash && (
              <div className="mt-1 text-xs text-oc-muted">
                Tx: {txHash.slice(0, 20)}...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CreateSubscriptionPage() {
  return (
    <Suspense fallback={<div className="p-6 text-oc-muted">Loading...</div>}>
      <SubscribeForm />
    </Suspense>
  )
}
