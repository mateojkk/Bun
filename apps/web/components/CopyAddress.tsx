"use client"

import { useState } from "react"

export default function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 mt-4 p-3 bg-white/5 border border-white/5 rounded-lg">
      <div className="flex-1 truncate text-sm text-oc-gray font-mono">
        {address}
      </div>
      <button
        onClick={handleCopy}
        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs transition whitespace-nowrap"
      >
        {copied ? "Copied!" : "Copy Address"}
      </button>
    </div>
  )
}
