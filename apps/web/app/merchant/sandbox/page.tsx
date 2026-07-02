"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

type LinkedSub = {
  id: string
  chainStatus: string
  status: string
}

function MerchantApp() {
  const params = useSearchParams() || new URLSearchParams()
  const urlSubscriptionId = params.get("bun_subscription_id") || ""
  const urlChainStatus = params.get("bun_status") || ""
  const [linkedSub, setLinkedSub] = useState<LinkedSub | null>(null)
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  const subscriptionId = urlSubscriptionId || linkedSub?.id || ""
  const chainStatus = urlChainStatus || linkedSub?.chainStatus || ""

  const checkoutUrl = useMemo(() => {
    const query = new URLSearchParams({
      appName: "Sandbox AI",
      providerId: "sandbox-ai",
      providerName: "Bun Integration Labs",
      unitName: "token",
      unitPrice: "0.002",
      flatRate: "20",
      maxSpend: "2",
      callbackUrl: "/merchant/sandbox",
    })
    return `/checkout?${query.toString()}`
  }, [])

  useEffect(() => {
    if (urlSubscriptionId) return

    fetch("/api/bun/v1/subscriptions")
      .then((res) => res.json())
      .then((data) => {
        if (!data.ok || !Array.isArray(data.subscriptions)) return
        const open = data.subscriptions.find(
          (sub: LinkedSub & { providerId: string }) =>
            sub.providerId === "sandbox-ai" &&
            (sub.status === "active" || sub.status === "pending_chain")
        )
        if (open) setLinkedSub({ id: open.id, chainStatus: open.chainStatus, status: open.status })
      })
      .catch(() => {})
  }, [urlSubscriptionId])

  async function recordUsage(quantity: number, label: string) {
    if (!subscriptionId || !quantity) return
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 40000)
    setLoading(true)
    setStatus(`Running ${label} and sending metered usage to Bun...`)

    try {
      const res = await fetch("/api/bun/v1/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          subscriptionId,
          providerId: "sandbox-ai",
          quantity,
          idempotencyKey: `sandbox-${subscriptionId}-${Date.now()}`,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || "Usage failed")
      setStatus(
        `${label} complete. Sandbox AI reported ${quantity.toLocaleString()} tokens; Bun charged ${data.event.amount.toFixed(2)} USDC.`
      )
    } catch (error: any) {
      if (error?.name === "AbortError") {
        setStatus("Usage request timed out. Check server logs and MongoDB, then retry.")
      } else {
        setStatus(error?.message || "Usage failed")
      }
    } finally {
      window.clearTimeout(timeout)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-black">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <nav className="flex items-center justify-between mb-12">
          <div className="font-mono font-bold text-black">Sandbox AI</div>
          <a href="/dashboard" className="text-sm text-black/50 hover:text-black transition">
            Bun dashboard
          </a>
        </nav>

        <section className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div>
            <p className="text-sm text-black/50 mb-3 font-medium uppercase tracking-wider">Reference merchant · integrates Bun as payment rail</p>
            <h1 className="text-4xl font-geist font-[460] tracking-[-0.03em] text-black mb-4">
              AI sessions billed by actual token usage.
            </h1>
            <p className="text-black/60 max-w-xl mb-8">
              Any product can add Pay with Bun in four steps: SDK, checkout redirect, store subscription id, report usage.
              Bun handles authorization, caps, ledger, escrow, and settlement.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-4 border border-black/10 rounded-2xl bg-white shadow-sm">
                <div className="text-xs text-black/50 uppercase tracking-wider font-medium mb-1">Meter</div>
                <div className="font-semibold text-black">0.002 USDC / token</div>
              </div>
              <div className="p-4 border border-black/10 rounded-2xl bg-white shadow-sm">
                <div className="text-xs text-black/50 uppercase tracking-wider font-medium mb-1">Flat plan replaced</div>
                <div className="font-semibold text-black/40 line-through">20 USDC/mo</div>
              </div>
              <div className="p-4 border border-black/10 rounded-2xl bg-white shadow-sm">
                <div className="text-xs text-black/50 uppercase tracking-wider font-medium mb-1">Payment rail</div>
                <div className="font-semibold text-black">Pay with Bun</div>
              </div>
            </div>
          </div>

          <div className="p-6 border border-black/10 rounded-3xl bg-white shadow-sm">
            {!subscriptionId ? (
              <>
                <h2 className="font-semibold text-black mb-2 font-geist text-lg">Connect Bun billing</h2>
                <p className="text-sm text-black/60 mb-6">
                  Redirect customers to Bun checkout. They authorize a spend cap and return with a subscription id.
                </p>
                <a
                  href={checkoutUrl}
                  className="block text-center px-4 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition shadow-sm"
                >
                  分 Pay with Bun
                </a>
              </>
            ) : (
              <>
                <h2 className="font-semibold text-black mb-2 font-geist text-lg">Bun connected</h2>
                <p className="text-xs text-black/50 font-mono break-all mb-2">{subscriptionId}</p>
                <p className="text-xs text-black/60 mb-4">
                  Authorization: <span className="font-medium text-black">{linkedSub?.status || "active"}</span> &middot; Chain: <span className="font-medium text-black">{chainStatus || "recorded"}</span>
                </p>
                {chainStatus === "failed" && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                    Ledger and caps are active in Bun. Soroban escrow is pending, metered usage still respects the customer cap.
                  </p>
                )}
                <div className="text-sm font-medium text-black/50 mb-3 uppercase tracking-wider text-xs">Provider-side usage meter</div>
                <div className="grid gap-2">
                  {[
                    { label: "Short prompt", tokens: 120 },
                    { label: "Code review", tokens: 420 },
                    { label: "Refactor task", tokens: 950 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => recordUsage(item.tokens, item.label)}
                      disabled={loading}
                      className="flex items-center justify-between px-4 py-3 rounded-xl bg-black/5 border border-black/5 hover:bg-black/10 transition text-left disabled:opacity-50 text-black font-medium text-sm"
                    >
                      <span>{item.label}</span>
                      <span className="text-xs text-black/50 font-mono">{item.tokens.toLocaleString()} tokens</span>
                    </button>
                  ))}
                </div>
                {status && <p className="text-sm text-black/60 mt-4 leading-relaxed">{status}</p>}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default function SandboxMerchantPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa] text-black/50 flex items-center justify-center p-6">Loading...</div>}>
      <MerchantApp />
    </Suspense>
  )
}
