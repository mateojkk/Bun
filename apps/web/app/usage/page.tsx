"use client"

import { useState } from "react"
import { exercise } from "@/lib/daml"

export default function UsagePage() {
  const [subId, setSubId] = useState("")
  const [usage, setUsage] = useState("")
  const [status, setStatus] = useState("")

  const handleRecord = async () => {
    if (!subId || !usage) return
    setStatus("Recording...")
    try {
      const res = await fetch("/api/usage/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: subId,
          usage: Number(usage),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus(`Usage recorded. Contract: ${data.contractId}`)
      } else {
        setStatus(`Error: ${JSON.stringify(data)}`)
      }
    } catch (e: any) {
      setStatus(`Error: ${e.message}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Record Usage</h1>

      <div className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Subscription Contract ID
          </label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="#..."
            value={subId}
            onChange={(e) => setSubId(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Usage Amount
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="12.0"
            value={usage}
            onChange={(e) => setUsage(e.target.value)}
          />
        </div>

        <button
          onClick={handleRecord}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Record Usage
        </button>

        {status && (
          <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
            {status}
          </p>
        )}
      </div>
    </div>
  )
}
