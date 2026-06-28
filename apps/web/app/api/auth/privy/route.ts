import { NextResponse } from "next/server"
import * as jose from "jose"
import { Keypair } from "@stellar/stellar-sdk"
import { setAuth } from "@/lib/auth"
import { findAccount, createAccount as storeAccount } from "@/lib/db"

const JWKS = jose.createRemoteJWKSet(
  new URL(process.env.PRIVY_JWKS_URL!)
)

async function verifyPrivyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: "privy.io",
      audience: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    })
    return (payload.sub as string) || null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 401 })
  }

  const { username } = await request.json().catch(() => ({}))

  const privyUserId = await verifyPrivyToken(token)
  if (!privyUserId) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  let account = await findAccount(privyUserId)

  if (account) {
    await setAuth(account.partyId, account.username)
    return NextResponse.json({ ok: true, partyId: account.partyId })
  }

  if (!username?.trim()) {
    return NextResponse.json({ needsUsername: true, privyUserId }, { status: 200 })
  }

  const keypair = generateStellarKeypair()
  const partyId = keypair.publicKey
  const secretKey = keypair.secret()

  // Fund with Friendbot to ensure account exists and can pay gas
  try {
    await fetch(`https://friendbot.stellar.org?addr=${partyId}`)
  } catch (e) {
    console.error("Friendbot funding failed", e)
  }

  await storeAccount({ privyUserId, partyId, secretKey, username: username.trim() })
  await setAuth(partyId, username.trim())

  return NextResponse.json({ ok: true, partyId })
}

function generateStellarKeypair() {
  return Keypair.random()
}
