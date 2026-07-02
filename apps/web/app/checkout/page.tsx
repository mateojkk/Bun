"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function authIdempotencyKey(providerId: string) {
  const storageKey = `bun-auth-${providerId}`
  if (typeof window === "undefined") return ""
  let key = sessionStorage.getItem(storageKey)
  if (!key) {
    key = crypto.randomUUID()
    sessionStorage.setItem(storageKey, key)
  }
  return key
}

function Checkout() {
  const params = useSearchParams() || new URLSearchParams()
  const router = useRouter()

  const appName = params.get("appName") || "Sandbox AI"
  const providerName = params.get("providerName") || "Bun Integration Labs"
  const providerId = params.get("providerId") || "sandbox-ai"
  const unitName = params.get("unitName") || "token"
  const unitPrice = Number(params.get("unitPrice") || "0.002")
  const flatRate = Number(params.get("flatRate") || "20")
  const callbackUrl = params.get("callbackUrl") || "/subscriptions"

  const [maxSpend, setMaxSpend] = useState(params.get("maxSpend") || "2")
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const submitting = useRef(false)

  useEffect(() => {
    fetch("/api/account/balance")
      .then((res) => res.json())
      .then((balanceData) => {
        if (balanceData.ok) setWalletBalance(balanceData.balance)
      })
      .catch(() => {})
  }, [])

  const insufficientFunds =
    walletBalance !== null && Number(maxSpend) > walletBalance
  const canAuthorize =
    !loading &&
    Number(maxSpend) > 0 &&
    !insufficientFunds

  async function authorize() {
    if (submitting.current || loading) return
    submitting.current = true
    setLoading(true)

    try {
      setStatus("Generating ZK proof and authorizing Soroban escrow...")
      const res = await fetch("/api/bun/v1/authorizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appName,
          providerId,
          providerName,
          unitName,
          unitPrice,
          flatRate,
          maxSpend: Number(maxSpend),
          callbackUrl,
          idempotencyKey: authIdempotencyKey(providerId),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Authorization failed")
      }

      sessionStorage.removeItem(`bun-auth-${providerId}`)
      const next = new URL(data.callbackUrl || callbackUrl, window.location.origin)
      next.searchParams.set("bun_subscription_id", data.authorization.id)
      next.searchParams.set("bun_status", data.authorization.chainStatus)
      router.push(next.pathname + next.search)
      router.refresh()
    } catch (error: any) {
      setStatus(error?.message || "Authorization failed")
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  const estimatedUnits = unitPrice > 0 ? Math.floor(Number(maxSpend || 0) / unitPrice) : 0

  return (
    <main className="min-h-screen bg-[#fafafa] text-black flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <a href="/dashboard" className="text-sm text-black/50 hover:text-black transition flex items-center gap-2 mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Bun
        </a>
        <div className="p-8 border border-black/[0.07] rounded-3xl bg-white shadow-sm">
          <div className="font-geist font-[460] text-2xl tracking-[-0.03em] text-black mb-2">分 Pay with Bun</div>
          <p className="text-sm text-black/60 mb-2">
            Hosted checkout &middot; authorize a capped spend for {appName}.
          </p>
          <p className="text-sm text-black/50 mb-8 leading-relaxed">
            Bun verifies your balance privately via ZK, escrows USDC on Stellar, and returns unused cap at settlement. Providers never see your wallet balance.
          </p>

          <div className="space-y-4 text-sm mb-8">
            <div className="flex justify-between gap-4 border-b border-black/[0.04] pb-4">
              <span className="text-black/50">Provider</span>
              <span className="text-black font-medium">{providerName}</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-black/[0.04] pb-4">
              <span className="text-black/50">Usage price</span>
              <span className="text-black font-medium">{unitPrice} USDC / {unitName}</span>
            </div>
            <div className="flex justify-between gap-4 pb-2">
              <span className="text-black/50">Old flat subscription</span>
              <span className="text-black/40 line-through font-medium">{flatRate.toFixed(2)} USDC/mo</span>
            </div>
          </div>

          <label className="block text-sm font-medium text-black/70 mb-2">
            Max spend cap (USDC)
          </label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={maxSpend}
            onChange={(event) => setMaxSpend(event.target.value)}
            className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-black/5"
          />
          <p className="text-xs text-black/50 mb-6">
            This covers roughly {estimatedUnits.toLocaleString()} {unitName}s. The provider cannot charge above this cap.
          </p>

          {walletBalance !== null && (
            <div className={`p-4 rounded-xl mb-6 text-sm border ${insufficientFunds ? "bg-red-50 border-red-100 text-red-800" : "bg-black/5 border-transparent text-black/70"}`}>
              Wallet balance: <span className="font-medium">{walletBalance.toFixed(2)} USDC</span>
              {insufficientFunds && (
                <div className="mt-2">
                  <a href="/dashboard" className="text-red-600 underline font-medium">
                    Fund account to continue
                  </a>
                </div>
              )}
            </div>
          )}

          <button
            onClick={authorize}
            disabled={!canAuthorize}
            className="w-full px-4 py-4 bg-black text-white rounded-xl hover:bg-black/90 transition font-medium text-sm disabled:opacity-50 shadow-md"
          >
            {loading ? "Authorizing..." : `Authorize ${Number(maxSpend || 0).toFixed(2)} USDC cap`}
          </button>

          {status && <p className="text-sm text-black/60 mt-4 text-center">{status}</p>}
        </div>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 text-black/50">Loading...</div>}>
      <Checkout />
    </Suspense>
  )
}
