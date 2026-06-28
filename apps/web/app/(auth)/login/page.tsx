"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { usePrivy, useLoginWithEmail } from "@privy-io/react-auth"

export default function LoginPage() {
  const router = useRouter()
  const { ready, authenticated, user, getAccessToken } = usePrivy()
  const { sendCode, loginWithCode } = useLoginWithEmail()

  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [sent, setSent] = useState(false)
  const [username, setUsername] = useState("")
  const [needsUsername, setNeedsUsername] = useState(false)
  const [privyToken, setPrivyToken] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const completeAuthCalled = useRef(false)

  async function handleSendCode() {
    if (!email.trim()) return
    setLoading(true)
    setError("")
    try {
      await sendCode({ email: email.trim() })
      setSent(true)
    } catch (e: any) {
      setError(e.message || "Failed to send code")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode() {
    if (!code.trim()) return
    setLoading(true)
    setError("")
    try {
      await loginWithCode({ code: code.trim() })
    } catch (e: any) {
      setError(e.message || "Invalid code")
      setLoading(false)
    }
  }

  async function completeAuth() {
    setLoading(true)
    setError("")
    try {
      const token = await getAccessToken()
      if (!token) throw new Error("No token")

      const res = await fetch("/api/auth/privy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      })
      const data = await res.json()

      if (data.needsUsername) {
        setNeedsUsername(true)
        setPrivyToken(token)
      } else if (data.ok) {
        router.push("/dashboard")
        router.refresh()
      } else {
        setError(data.error || "Something went wrong")
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCompleteSetup() {
    if (!username.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/privy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${privyToken}`,
        },
        body: JSON.stringify({ username }),
      })
      const data = await res.json()
      if (data.ok) {
        router.push("/dashboard")
        router.refresh()
      } else {
        setError(data.error || "Setup failed")
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (ready && authenticated && user && !needsUsername && !completeAuthCalled.current) {
      completeAuthCalled.current = true
      completeAuth()
    }
  }, [ready, authenticated, user])

  if (!ready) {
    return (
      <div className="min-h-screen bg-oc-black flex items-center justify-center">
        <p className="text-oc-muted">Loading...</p>
      </div>
    )
  }

  if (authenticated && !needsUsername && completeAuthCalled.current) {
    return (
      <div className="min-h-screen bg-oc-black flex items-center justify-center">
        <p className="text-oc-muted">Signing in...</p>
      </div>
    )
  }

  if (needsUsername) {
    return (
      <div className="min-h-screen bg-oc-black flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center mb-6">
            <div className="font-mono font-bold text-xl text-white mb-1">分 Bun</div>
            <p className="text-sm text-oc-muted">Choose your username</p>
          </div>
          <input type="text" placeholder="Username" value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-md text-sm" autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCompleteSetup()} />
          {error && <p className="text-sm text-oc-light bg-white/5 rounded p-2">{error}</p>}
          <button onClick={handleCompleteSetup}
            disabled={loading || !username.trim()}
            className="w-full px-4 py-3 bg-white text-oc-black rounded-md hover:bg-oc-lightest transition font-medium text-sm disabled:opacity-50">
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-oc-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center mb-6">
          <div className="font-mono font-bold text-2xl text-white mb-2">分 Bun</div>
          <p className="text-sm text-oc-muted">Pay only for what you use</p>
        </div>

        {!sent ? (
          <>
            <input type="email" placeholder="Enter your email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-md text-sm" autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSendCode()} />
            {error && <p className="text-sm text-oc-light bg-white/5 rounded p-2">{error}</p>}
            <button onClick={handleSendCode}
              disabled={loading || !email.trim()}
              className="w-full px-4 py-3 bg-white text-oc-black rounded-md hover:bg-oc-lightest transition font-medium text-sm disabled:opacity-50">
              {loading ? "Sending..." : "Send Code"}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-oc-gray text-center">
              Code sent to <span className="text-white">{email}</span>
            </p>
            <input type="text" placeholder="6-digit code" value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 rounded-md text-sm text-center tracking-widest" autoFocus
              maxLength={6}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()} />
            {error && <p className="text-sm text-oc-light bg-white/5 rounded p-2">{error}</p>}
            <button onClick={handleVerifyCode}
              disabled={loading || code.length < 6}
              className="w-full px-4 py-3 bg-white text-oc-black rounded-md hover:bg-oc-lightest transition font-medium text-sm disabled:opacity-50">
              {loading ? "Verifying..." : "Sign In"}
            </button>
            <button onClick={() => { setSent(false); setCode(""); setError("") }}
              className="w-full text-sm text-oc-gray hover:text-white transition">
              Try a different email
            </button>
          </>
        )}
      </div>
    </div>
  )
}
