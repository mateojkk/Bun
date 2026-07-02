"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ProfileForm({
  initialUsername,
  initialEmailNotifications,
  initialAvatarUrl,
}: {
  initialUsername: string
  initialEmailNotifications: boolean
  initialAvatarUrl: string
}) {
  const [username, setUsername] = useState(initialUsername)
  const [emailNotifications, setEmailNotifications] = useState(initialEmailNotifications)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus("")

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, emailNotifications, avatarUrl }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus("Profile updated successfully.")
        router.refresh()
      } else {
        setStatus(data.error || "Failed to update profile.")
      }
    } catch (err: any) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-black/50 mb-2">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full px-3 py-2 bg-[#fafafa] border border-black/10 rounded-lg text-black focus:border-black focus:ring-0 outline-none transition shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-black/50 mb-2">
          Profile Picture
        </label>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar Preview" className="w-10 h-10 rounded-full object-cover border border-black/10 shrink-0" />
          ) : (
             <div className="w-10 h-10 rounded-full bg-black/5 border border-black/10 flex items-center justify-center shrink-0">
               <span className="text-black/30 text-xs font-medium">?</span>
             </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onloadend = () => {
                  setAvatarUrl(reader.result as string)
                }
                reader.readAsDataURL(file)
              }
            }}
            className="w-full px-3 py-2 bg-[#fafafa] border border-black/10 rounded-lg text-black focus:border-black focus:ring-0 outline-none transition shadow-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-black/5 file:text-black hover:file:bg-black/10 cursor-pointer"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="w-4 h-4 rounded bg-[#fafafa] border-black/20 text-[#3de23d] focus:ring-0 focus:ring-offset-0"
          />
          <span className="text-sm font-medium text-black/60">
            Receive marketing and product updates via email
          </span>
        </label>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || !username.trim() || (username === initialUsername && emailNotifications === initialEmailNotifications && avatarUrl === initialAvatarUrl)}
          className="px-6 py-2.5 bg-black text-white rounded-full hover:bg-neutral-800 transition font-medium text-sm disabled:opacity-50 shadow-sm"
        >
          {loading ? "Saving..." : "Save Preferences"}
        </button>
      </div>

      {status && (
        <p className={`text-sm ${status.includes("successfully") ? "text-[#218c21]" : "text-red-500"}`}>
          {status}
        </p>
      )}
    </form>
  )
}
