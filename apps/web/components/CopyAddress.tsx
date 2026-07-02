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
    <div className="flex items-center gap-2 mt-4 p-3 bg-black/5 border border-black/5 rounded-xl">
      <div className="flex-1 truncate text-sm text-black/60 font-mono">
        {address}
      </div>
      <button
        onClick={handleCopy}
        className="px-4 py-2 bg-white hover:bg-neutral-50 text-black border border-black/10 rounded-lg text-xs font-medium transition whitespace-nowrap shadow-sm"
      >
        {copied ? "Copied!" : "Copy Address"}
      </button>
    </div>
  )
}
