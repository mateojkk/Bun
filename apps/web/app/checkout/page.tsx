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
  const [zkReady, setZkReady] = useState<boolean | null>(null)
  const [zkCommittedUsdc, setZkCommittedUsdc] = useState(0)
  const [zkStale, setZkStale] = useState(false)
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const submitting = useRef(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/account/balance").then((res) => res.json()),
      fetch("/api/zk/status").then((res) => res.json()),
    ])
      .then(([balanceData, zkData]) => {
        if (balanceData.ok) setWalletBalance(balanceData.balance)
        if (zkData.ok) {
          setZkReady(zkData.committed && !zkData.stale)
          setZkCommittedUsdc(zkData.committedUsdc || 0)
          setZkStale(Boolean(zkData.stale))
        }
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
      if (!zkReady || zkStale || Number(maxSpend) > zkCommittedUsdc) {
        setStatus("Syncing private balance proof to Soroban (this takes a few seconds)...")
        const zkRes = await fetch("/api/zk/commit", { method: "POST" })
        const zkData = await zkRes.json()
        if (!zkRes.ok || !zkData.ok) {
          throw new Error(zkData.error || "Failed to sync private balance proof")
        }
        setZkReady(true)
        setZkStale(false)
        setZkCommittedUsdc(zkData.committedUsdc)
      }

      setStatus("Authorizing Soroban escrow...")
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
    <main className="min-h-screen bg-oc-black text-oc-light flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <a href="/dashboard" className="text-xs text-oc-muted hover:text-white transition">
          ← Back to Bun
        </a>
        <div className="mt-6 p-6 border border-white/10 rounded-lg bg-white/[0.02]">
          <div className="font-mono font-bold text-xl text-white mb-1">分 Pay with Bun</div>
          <p className="text-sm text-oc-muted mb-2">
            Hosted checkout · authorize a capped spend for {appName}.
          </p>
          <p className="text-xs text-oc-muted mb-6">
            Bun verifies your balance privately via ZK, escrows USDC on Stellar, and returns unused cap at settlement. Providers never see your wallet balance.
          </p>

          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between gap-4">
              <span className="text-oc-muted">Provider</span>
              <span className="text-white">{providerName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-oc-muted">Usage price</span>
              <span className="text-white">{unitPrice} USDC / {unitName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-oc-muted">Old flat subscription</span>
              <span className="text-white line-through">{flatRate.toFixed(2)} USDC/mo</span>
            </div>
          </div>

          <label className="block text-sm text-oc-muted mb-1">
            Max spend cap (USDC)
          </label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={maxSpend}
            onChange={(event) => setMaxSpend(event.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm mb-2"
          />
          <p className="text-xs text-oc-muted mb-4">
            This covers roughly {estimatedUnits.toLocaleString()} {unitName}s. The provider cannot charge above this cap.
          </p>

          {walletBalance !== null && (
            <p className={`text-xs mb-4 ${insufficientFunds ? "text-amber-200" : "text-oc-muted"}`}>
              Wallet balance: {walletBalance.toFixed(2)} USDC
              {insufficientFunds && (
                <>
                  {" · "}
                  <a href="/dashboard" className="underline hover:text-white">
                    Fund account
                  </a>
                </>
              )}
            </p>
          )}

          <button
            onClick={authorize}
            disabled={!canAuthorize}
            className="w-full px-4 py-3 bg-white text-oc-black rounded-md hover:bg-oc-lightest transition font-medium text-sm disabled:opacity-50"
          >
            {loading ? "Authorizing..." : `Authorize ${Number(maxSpend || 0).toFixed(2)} USDC cap`}
          </button>

          {status && <p className="text-sm text-oc-gray mt-3">{status}</p>}
        </div>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-oc-black text-oc-muted p-6">Loading...</div>}>
      <Checkout />
    </Suspense>
  )
}
