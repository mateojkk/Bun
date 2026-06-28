import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { fundTestnet } from "@/lib/stellar"
import { findAccountByPartyId, getDailyDisbursed, recordDisbursement, DAILY_LIMIT, PER_REQUEST } from "@/lib/db"

export async function POST() {
  const cookieStore = await cookies()
  const publicKey = cookieStore.get("bun_party")?.value
  if (!publicKey) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Rate limit: check how much this user has already received today
  const disbursed = await getDailyDisbursed(publicKey)
  if (disbursed >= DAILY_LIMIT) {
    return NextResponse.json(
      { ok: false, error: `Daily limit reached. You can receive up to ${DAILY_LIMIT} USDC per day.` },
      { status: 429 }
    )
  }

  const account = await findAccountByPartyId(publicKey)
  const secretKey = account?.secretKey

  const result = await fundTestnet(publicKey, secretKey)
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || "Transfer failed. The agent account may be out of USDC." },
      { status: 500 }
    )
  }

  // Record successful disbursement
  await recordDisbursement(publicKey, PER_REQUEST)

  return NextResponse.json({ ok: true, amount: PER_REQUEST, remaining: DAILY_LIMIT - disbursed - PER_REQUEST })
}
