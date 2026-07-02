import { NextResponse } from "next/server"
import { getPartyId } from "@/lib/auth"
import { listSubscriptionsBySubscriber } from "@/lib/db"

export async function GET() {
  const partyId = await getPartyId()
  if (!partyId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const subscriptions = await listSubscriptionsBySubscriber(partyId)
  return NextResponse.json({ ok: true, subscriptions })
}
