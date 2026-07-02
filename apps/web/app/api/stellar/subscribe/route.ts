import { NextResponse } from "next/server"
import { escrowInit } from "@/lib/stellar"
import { cookies } from "next/headers"
import { execSync } from "child_process"
import { createSubscription, findOpenSubscription, updateSubscriptionChainState } from "@/lib/db"

const CLI = "/tmp/stellar"
const SECRET = process.env.AGENT_SECRET || ""

export async function POST(request: Request) {
  // Read subscriber from server-side cookie (security: don't trust client body)
  const cookieStore = await cookies()
  const subscriber = cookieStore.get("bun_party")?.value

  if (!subscriber) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { findAccountByPartyId } = await import("@/lib/db")
  const account = await findAccountByPartyId(subscriber)
  if (!account || !account.secretKey) {
    return NextResponse.json({ error: "Subscriber secret not found in DB" }, { status: 400 })
  }
  const subscriberSecret = account.secretKey

  // Derive agent public key from AGENT_SECRET
  let agentPub: string
  try {
    agentPub = execSync(`${CLI} keys address ${SECRET}`, { encoding: "utf-8" }).trim()
  } catch {
    agentPub = subscriber // fallback
  }

  const { amount, unitPrice, flatRate, cycleEnd, serviceName, unitName } = await request.json()

  // Provider is the agent's public key (demo: agent acts as provider)
  // This ensures provider != subscriber
  const provider = agentPub
  const providerId = "bun-testnet-provider"
  const maxSpend = Number(amount || 100000000) / 10_000_000
  const parsedUnitPrice = Number(unitPrice || 250000) / 10_000_000
  const parsedFlatRate = Number(flatRate || 80000000) / 10_000_000
  const appName = serviceName || "service"

  let subscription: any = await findOpenSubscription(subscriber, providerId)
  let reused = Boolean(subscription)

  if (!subscription) {
    subscription = await createSubscription({
      providerId,
      providerName: "Bun Testnet Provider",
      appName,
      subscriber,
      maxSpend,
      unitPrice: parsedUnitPrice,
      flatRate: parsedFlatRate,
      unitName: unitName || "unit",
      chainStatus: "pending",
    })
  } else if (
    subscription.status === "active" &&
    subscription.chainStatus === "confirmed"
  ) {
    return NextResponse.json({
      ok: true,
      reused: true,
      subscription,
    })
  }

  const result = await escrowInit({
    provider,
    subscriber,
    subscriberSecret,
    amount: amount || 100000000, // default 10 USDC
    unitPrice: unitPrice || 250000, // default 0.025 USDC per unit
    flatRate: flatRate || 80000000, // default 8 USDC flat rate
    cycleEnd: cycleEnd || Math.floor(Date.now() / 1000) + 86400,
    serviceName: appName,
  })

  const updated = await updateSubscriptionChainState(subscription.id, {
    chainStatus: result.ok ? "confirmed" : "failed",
    status: result.ok ? "active" : "pending_chain",
    chainMessage: result.raw,
  })

  return NextResponse.json({
    ...result,
    reused,
    subscription: updated || subscription,
  })
}
