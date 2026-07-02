"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { usePrivy, useLoginWithEmail } from "@privy-io/react-auth"
import { GeistSans } from "geist/font/sans"
import Image from "next/image"

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

  let content = null

  if (!ready) {
    content = <p className="text-white/70 lg:text-black/50 text-center">Loading...</p>
  } else if (authenticated && !needsUsername && completeAuthCalled.current) {
    content = <p className="text-white/70 lg:text-black/50 text-center">Signing in...</p>
  } else if (needsUsername) {
    content = (
      <div className="space-y-4">
        <div className="text-center mb-8">
          <div className={`${GeistSans.className} font-medium text-3xl text-white lg:text-black mb-2`}>Bun.</div>
          <p className="text-sm text-white/70 lg:text-black/50">Choose your username</p>
        </div>
        <input type="text" placeholder="Username" value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 rounded-md text-sm border border-white/20 lg:border-black/10 focus:border-white lg:focus:border-black outline-none transition shadow-sm bg-black/40 lg:bg-transparent text-white lg:text-black placeholder-white/40 lg:placeholder-black/40" autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleCompleteSetup()} />
        {error && <p className="text-sm text-red-400 lg:text-red-500 bg-red-500/10 lg:bg-red-50 rounded p-2">{error}</p>}
        <button onClick={handleCompleteSetup}
          disabled={loading || !username.trim()}
          className="w-full px-4 py-3 bg-white lg:bg-black text-black lg:text-white rounded-md hover:bg-white/90 lg:hover:bg-neutral-800 transition font-medium text-sm disabled:opacity-50 mt-2">
          {loading ? "Creating..." : "Create Account"}
        </button>
      </div>
    )
  } else {
    content = (
      <div className="space-y-4">
        <div className="text-center mb-8">
          <div className={`${GeistSans.className} font-medium text-3xl text-white lg:text-black mb-2`}>Bun.</div>
          <p className="text-sm text-white/70 lg:text-black/50">Welcome back. Log in to your account.</p>
        </div>

        {!sent ? (
          <>
            <input type="email" placeholder="Enter your email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-md text-sm border border-white/20 lg:border-black/10 focus:border-white lg:focus:border-black outline-none transition shadow-sm bg-black/40 lg:bg-transparent text-white lg:text-black placeholder-white/40 lg:placeholder-black/40" autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSendCode()} />
            {error && <p className="text-sm text-red-400 lg:text-red-500 bg-red-500/10 lg:bg-red-50 rounded p-2">{error}</p>}
            <button onClick={handleSendCode}
              disabled={loading || !email.trim()}
              className="w-full px-4 py-3 bg-white lg:bg-black text-black lg:text-white rounded-md hover:bg-white/90 lg:hover:bg-neutral-800 transition font-medium text-sm disabled:opacity-50 mt-2">
              {loading ? "Sending..." : "Send Code"}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-white/70 lg:text-black/50 text-center mb-4">
              Code sent to <span className="text-white lg:text-black font-medium">{email}</span>
            </p>
            <input type="text" placeholder="6-digit code" value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 rounded-md text-sm text-center tracking-widest border border-white/20 lg:border-black/10 focus:border-white lg:focus:border-black outline-none transition shadow-sm bg-black/40 lg:bg-transparent text-white lg:text-black placeholder-white/40 lg:placeholder-black/40" autoFocus
              maxLength={6}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()} />
            {error && <p className="text-sm text-red-400 lg:text-red-500 bg-red-500/10 lg:bg-red-50 rounded p-2">{error}</p>}
            <button onClick={handleVerifyCode}
              disabled={loading || code.length < 6}
              className="w-full px-4 py-3 bg-white lg:bg-black text-black lg:text-white rounded-md hover:bg-white/90 lg:hover:bg-neutral-800 transition font-medium text-sm disabled:opacity-50 mt-2">
              {loading ? "Verifying..." : "Sign In"}
            </button>
            <button onClick={() => { setSent(false); setCode(""); setError("") }}
              className="w-full text-sm text-white/70 lg:text-black/50 hover:text-white lg:hover:text-black transition mt-4">
              Try a different email
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen relative bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 lg:w-1/2 z-0">
        <Image src="/hero-bg-anime.jpg" alt="Background" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-black/50 lg:bg-gradient-to-r lg:from-black/80 lg:via-black/30 lg:to-transparent" />
      </div>

      {/* Form Area */}
      <div className="w-full lg:w-1/2 lg:ml-auto flex items-center justify-center p-6 sm:p-8 relative z-10 lg:bg-[#fafafa]">
        <div className="w-full max-w-sm">
          {content}
        </div>
      </div>
    </div>
  )
}
