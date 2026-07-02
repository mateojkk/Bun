import { NextResponse } from "next/server"
import { getPartyId } from "@/lib/auth"
import { findAccountByPartyId } from "@/lib/db"
import {
  ESCROW_CONTRACT_ID,
  ZK_VERIFIER_CONTRACT_ID,
  escrowGetData,
} from "@/lib/stellar"

export async function GET(request: Request) {
  const partyId = await getPartyId()
  if (!partyId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const serviceName = searchParams.get("serviceName") || ""
  const account = await findAccountByPartyId(partyId)

  let escrow = null
  if (serviceName) {
    escrow = await escrowGetData(ESCROW_CONTRACT_ID, partyId, serviceName)
  }

  return NextResponse.json({
    ok: true,
    network: "stellar-testnet",
    contracts: {
      escrow: ESCROW_CONTRACT_ID,
      zkVerifier: ZK_VERIFIER_CONTRACT_ID,
    },
    zk: {
      committed: account?.zkChainStatus === "confirmed",
      chainStatus: account?.zkChainStatus || "none",
      hashPreview: account?.zkHashHex ? `${account.zkHashHex.slice(0, 16)}...` : null,
      committedUsdc: account?.zkBalanceStroops
        ? Number(account.zkBalanceStroops) / 10_000_000
        : 0,
    },
    escrow: serviceName ? { serviceName, data: escrow } : null,
  })
}
