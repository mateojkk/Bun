import { NextResponse } from "next/server"
import { fundTestnet } from "@/lib/stellar"

export async function POST(request: Request) {
  const { publicKey } = await request.json()
  if (!publicKey) {
    return NextResponse.json({ error: "No public key" }, { status: 400 })
  }
  const result = await fundTestnet(publicKey)
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error || "Transfer failed. The agent account may be out of USDC." }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
