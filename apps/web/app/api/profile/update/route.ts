import { NextResponse } from "next/server"
import { getPartyId, setAuth } from "@/lib/auth"
import { updateAccountByPartyId } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const partyId = await getPartyId()
    if (!partyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username, emailNotifications, avatarUrl } = await request.json()

    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 })
    }

    const trimmedUsername = username.trim()

    // Update DB
    await updateAccountByPartyId(partyId, { 
      username: trimmedUsername,
      emailNotifications: !!emailNotifications,
      avatarUrl: avatarUrl?.trim() || null
    })

    // Update cookie
    await setAuth(partyId, trimmedUsername)

    return NextResponse.json({ ok: true, username: trimmedUsername })
  } catch (error: any) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
