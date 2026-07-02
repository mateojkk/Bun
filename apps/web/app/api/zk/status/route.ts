import { NextResponse } from "next/server"
import { getPartyId } from "@/lib/auth"
import { findAccountByPartyId } from "@/lib/db"
import { getBalance } from "@/lib/stellar"

export async function GET() {
  const partyId = await getPartyId()
  if (!partyId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const account = await findAccountByPartyId(partyId)
  const walletBalance = Number(await getBalance(partyId).catch(() => "0"))
  const committedStroops = account?.zkBalanceStroops
    ? Number(account.zkBalanceStroops)
    : 0
  const committedUsdc = committedStroops / 10_000_000
  const stale =
    account?.zkChainStatus === "confirmed" &&
    walletBalance > committedUsdc + 0.000001

  return NextResponse.json({
    ok: true,
    walletBalance,
    committed: account?.zkChainStatus === "confirmed",
    chainStatus: account?.zkChainStatus || "none",
    committedUsdc,
    committedAt: account?.zkCommittedAt || null,
    stale,
    hashPreview: account?.zkHashHex ? `${account.zkHashHex.slice(0, 12)}...` : null,
  })
}
