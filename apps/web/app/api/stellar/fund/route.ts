import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { fundTestnet } from "@/lib/stellar"
import { findAccountByPartyId } from "@/lib/db"

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const publicKey = cookieStore.get("bun_party")?.value
  if (!publicKey) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Look up secret so we can create a USDC trustline on their behalf if needed
  const account = await findAccountByPartyId(publicKey)
  const secretKey = account?.secretKey

  const result = await fundTestnet(publicKey, secretKey)
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error || "Transfer failed. The agent account may be out of USDC." }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
