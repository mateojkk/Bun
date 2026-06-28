"use client"

import { useState } from "react"

export default function UsagePage() {
  const [contractId, setContractId] = useState("")
  const [usage, setUsage] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleRecord() {
    if (!contractId || !usage) return
    setLoading(true)
    setStatus("Recording usage on-chain...")
    try {
      const res = await fetch("/api/stellar/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          additional: Number(usage),
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setStatus(`Usage recorded on-chain. Tx: ${data.hash?.slice(0, 16)}...`)
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
    <div className="px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-bold mb-2 text-white">Record Usage</h1>
      <p className="text-oc-muted text-sm mb-6">
        Usage is reported by the service provider via a Soroban transaction.
      </p>

      <div className="max-w-md space-y-4">
        <div>
          <label className="block text-sm text-oc-muted mb-1">Escrow Contract ID</label>
          <input className="w-full px-3 py-2 rounded-md text-sm" placeholder="CCC..."
            value={contractId} onChange={(e) => setContractId(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm text-oc-muted mb-1">Usage Amount (units)</label>
          <input type="number" min="0" className="w-full px-3 py-2 rounded-md text-sm"
            placeholder="12" value={usage} onChange={(e) => setUsage(e.target.value)} />
        </div>

        <button onClick={handleRecord}
          disabled={loading}
          className="px-4 py-2 bg-white text-oc-black rounded-md hover:bg-oc-lightest transition font-medium text-sm disabled:opacity-50">
          {loading ? "Broadcasting..." : "Record Usage"}
        </button>

        {status && <p className="text-sm text-oc-gray bg-white/5 rounded p-2">{status}</p>}
      </div>
    </div>
  )
}
