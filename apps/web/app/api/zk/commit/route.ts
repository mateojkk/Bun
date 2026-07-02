import { NextResponse } from "next/server"
import { getPartyId } from "@/lib/auth"
import { findAccountByPartyId, updateAccountByPartyId } from "@/lib/db"
import { getBalance, zkCommitBalance } from "@/lib/stellar"
import { createBalanceCommitment } from "@/lib/zk"

export async function POST() {
  const partyId = await getPartyId()
  if (!partyId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const account = await findAccountByPartyId(partyId)
  if (!account?.secretKey) {
    return NextResponse.json({ error: "Account not found" }, { status: 400 })
  }

  const balanceUsdc = Number(await getBalance(partyId).catch(() => "0"))
  if (balanceUsdc <= 0) {
    return NextResponse.json(
      { error: "Fund your account with USDC before committing a private balance proof." },
      { status: 400 }
    )
  }

  const commitment = createBalanceCommitment(balanceUsdc)
  const chain = await zkCommitBalance({
    subscriber: partyId,
    subscriberSecret: account.secretKey,
    balanceHashHex: commitment.hashHex,
  })

  await updateAccountByPartyId(partyId, {
    zkSalt: commitment.salt,
    zkBalanceStroops: commitment.stroops,
    zkHashHex: commitment.hashHex,
    zkChainStatus: chain.ok ? "confirmed" : "failed",
    zkChainMessage: chain.raw,
    zkCommittedAt: new Date(),
  })

  if (!chain.ok) {
    return NextResponse.json(
      { error: "On-chain ZK commitment failed", chain },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    committedUsdc: commitment.balanceUsdc,
    hashPreview: `${commitment.hashHex.slice(0, 12)}...`,
    chain,
  })
}
