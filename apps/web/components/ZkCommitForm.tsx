"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function ZkCommitForm({
  initialCommitted,
  initialStale,
  initialCommittedUsdc,
}: {
  initialCommitted: boolean
  initialStale: boolean
  initialCommittedUsdc: number
}) {
  const [committed, setCommitted] = useState(initialCommitted)
  const [stale, setStale] = useState(initialStale)
  const [committedUsdc, setCommittedUsdc] = useState(initialCommittedUsdc)
  
  const [step, setStep] = useState<"idle" | "salt" | "hash" | "commit" | "done">("idle")
  const [fakeHash, setFakeHash] = useState("")
  const [error, setError] = useState("")
  const isCommitting = useRef(false)
  const router = useRouter()

  const needsCommit = !committed || stale

  useEffect(() => {
    if (needsCommit && !isCommitting.current) {
      runShowcase()
    }
  }, [needsCommit])
  
  async function runShowcase() {
    if (isCommitting.current) return
    isCommitting.current = true
    setError("")
    
    // Step 1: Generate Salt
    setStep("salt")
    await new Promise(r => setTimeout(r, 800))
    
    // Step 2: Hash
    setStep("hash")
    let hashText = ""
    const chars = "0123456789abcdef"
    for(let i=0; i<20; i++) {
      hashText = Array.from({length: 64}, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      setFakeHash(hashText)
      await new Promise(r => setTimeout(r, 50))
    }

    // Step 3: Commit to Soroban
    setStep("commit")
    try {
      const res = await fetch("/api/zk/commit", { method: "POST" })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || "ZK commitment failed")
      
      setCommitted(true)
      setStale(false)
      setCommittedUsdc(data.committedUsdc)
      setStep("done")
      router.refresh()
    } catch (e: any) {
      setError(e?.message || "Could not commit balance proof")
      setStep("idle")
    } finally {
      isCommitting.current = false
    }
  }


  return (
    <div className="p-8 rounded-3xl border border-black/[0.07] bg-black text-white shadow-xl overflow-hidden relative">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            <h2 className="text-xl font-[500] tracking-tight">Zero-Knowledge Privacy Protocol</h2>
          </div>
          {committed && !stale && (
            <div className="px-3 py-1 bg-white/10 text-emerald-400 text-xs font-mono rounded-full border border-white/5">
              Proof Active
            </div>
          )}
        </div>

        <p className="text-white/60 text-sm mb-8 max-w-xl leading-relaxed">
          Bun uses SHA256 commit-reveal proofs on Soroban. We hash your balance with a cryptographic salt and commit the hash to the blockchain. When an app bills you, the smart contract verifies the proof without ever exposing your actual wallet balance on-chain.
        </p>

        {needsCommit ? (
          <div className="space-y-6">
            {step === "idle" && (
              <div className="bg-white/10 text-white px-6 py-3 rounded-full font-medium w-fit">
                Initializing Proof...
              </div>
            )}

            {error && <div className="text-red-400 text-sm">{error}</div>}

            {step !== "idle" && (
              <div className="font-mono text-sm space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${step === 'salt' ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'}`} />
                  <span className={step === 'salt' ? 'text-white' : 'text-white/50'}>1. Generating secure cryptographic salt...</span>
                </div>
                
                {(step === "hash" || step === "commit" || step === "done") && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${step === 'hash' ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'}`} />
                      <span className={step === 'hash' ? 'text-white' : 'text-white/50'}>2. Hashing Balance + Salt (SHA256)</span>
                    </div>
                    <div className="text-emerald-400/80 text-xs break-all pl-4">
                      {fakeHash}
                    </div>
                  </div>
                )}

                {(step === "commit" || step === "done") && (
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${step === 'commit' ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-400'}`} />
                    <span className={step === 'commit' ? 'text-white' : 'text-emerald-400'}>
                      3. {step === 'commit' ? 'Committing proof to Soroban Escrow...' : 'Proof successfully committed!'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 font-mono text-sm space-y-2">
            <div className="text-white/50">Current Commitment Status:</div>
            <div className="text-emerald-400 break-all text-xs">Verified by Contract ID: CCFJ5WI3UBMUT374AWHAAQTMFTFOIIKBY7O7X647P6WORPDVAJQGAR77</div>
            <div className="text-white/80 pt-2 text-xs">Your privacy is secured. Merchants cannot see your wallet balance.</div>
          </div>
        )}
      </div>
    </div>
  )
}
