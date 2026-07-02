import { NextResponse } from "next/server"
import { getPartyId } from "@/lib/auth"
import { getBalance } from "@/lib/stellar"

export async function GET() {
  const partyId = await getPartyId()
  if (!partyId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const balance = await getBalance(partyId).catch(() => "0")
  return NextResponse.json({ ok: true, balance: Number(balance) })
}
