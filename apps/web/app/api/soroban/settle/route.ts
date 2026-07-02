import { NextResponse } from "next/server"
import { getPartyId } from "@/lib/auth"
import { findSubscription, updateSubscriptionChainState } from "@/lib/db"
import { escrowSettle } from "@/lib/stellar"

export async function POST(request: Request) {
  const partyId = await getPartyId()
  if (!partyId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { subscriptionId } = await request.json().catch(() => ({}))
  if (!subscriptionId) {
    return NextResponse.json({ error: "subscriptionId required" }, { status: 400 })
  }

  const subscription = await findSubscription(String(subscriptionId))
  if (!subscription || subscription.subscriber !== partyId) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
  }

  if (!subscription.contractId || !subscription.serviceName) {
    return NextResponse.json({ error: "No Soroban escrow linked to this subscription" }, { status: 400 })
  }

  const result = await escrowSettle(
    subscription.contractId,
    subscription.subscriber,
    subscription.serviceName
  )

  if (result.ok) {
    await updateSubscriptionChainState(subscription.id, { status: "settled" })
  }

  return NextResponse.json({ ok: result.ok, chain: result })
}
