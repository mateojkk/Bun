import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { execSync } from "child_process"
import {
  createSubscription,
  findAccountByPartyId,
  findOpenSubscription,
  findSubscriptionByIdempotencyKey,
  updateSubscriptionChainState,
  type BunSubscription,
} from "@/lib/db"

import {
  CYCLE_SECONDS,
  escrowInit,
  ESCROW_CONTRACT_ID,
  getBalance,
  zkVerifyBalance,
} from "@/lib/stellar"
import { findProvider, isAllowedCallback, normalizeCallbackUrl } from "@/lib/providers"

const CLI = "/tmp/stellar"
const SECRET = process.env.AGENT_SECRET || ""

function toStroops(amount: number) {
  return Math.round(amount * 10_000_000)
}

function getAgentPublicKey(fallback: string) {
  try {
    if (!SECRET) return fallback
    return execSync(`${CLI} keys address ${SECRET}`, { encoding: "utf-8" }).trim()
  } catch {
    return fallback
  }
}

async function verifyZkAuthorization(
  account: NonNullable<Awaited<ReturnType<typeof findAccountByPartyId>>>,
  subscriber: string,
  maxSpend: number
) {
  const walletBalance = Number(await getBalance(subscriber).catch(() => "0"))
  if (walletBalance < maxSpend) {
    throw new Error(
      `Insufficient USDC balance (${walletBalance.toFixed(2)} USDC). Fund your account on /dashboard before authorizing ${maxSpend.toFixed(2)} USDC.`
    )
  }

  const currentStroops = BigInt(toStroops(walletBalance))
  const requiredStroops = BigInt(toStroops(maxSpend))

  const zk = await zkVerifyBalance({
    subscriber,
    subscriberSecret: account.secretKey,
    currentBalanceStroops: currentStroops,
    requiredMinimumStroops: requiredStroops,
  })

  if (!zk.ok) {
    throw new Error(`ZK balance verification failed on Soroban: ${zk.raw.slice(0, 50)}.`)
  }

  return zk
}

async function confirmOnChain(
  subscriptionId: string,
  params: {
    provider: string
    subscriber: string
    subscriberSecret: string
    maxSpend: number
    unitPrice: number
    flatRate: number
    serviceName: string
  }
) {
  const chainResult = await escrowInit({
    provider: params.provider,
    subscriber: params.subscriber,
    subscriberSecret: params.subscriberSecret,
    amount: toStroops(params.maxSpend),
    unitPrice: toStroops(params.unitPrice),
    flatRate: toStroops(params.flatRate),
    cycleEnd: Math.floor(Date.now() / 1000) + CYCLE_SECONDS,
    serviceName: params.serviceName,
  })

  const updated = await updateSubscriptionChainState(subscriptionId, {
    chainStatus: chainResult.ok ? "confirmed" : "failed",
    status: chainResult.ok ? "active" : "pending_chain",
    chainMessage: chainResult.raw,
    serviceName: params.serviceName,
    ...(chainResult.ok ? { contractId: ESCROW_CONTRACT_ID } : {}),
  })

  return { authorization: updated, chain: chainResult }
}

function isChainConfirmed(subscription: BunSubscription) {
  return subscription.status === "active" && subscription.chainStatus === "confirmed"
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const subscriber = cookieStore.get("bun_party")?.value

  if (!subscriber) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const requestOrigin = new URL(request.url).origin
  const providerId = String(body.providerId || "").trim()
  const callbackUrl = String(body.callbackUrl || "").trim()
  const appName = String(body.appName || "").trim()
  const unitName = String(body.unitName || "unit").trim()
  const maxSpend = Number(body.maxSpend)
  const unitPrice = Number(body.unitPrice)
  const flatRate = Number(body.flatRate || 0)
  const idempotencyKey = body.idempotencyKey ? String(body.idempotencyKey).trim() : undefined

  const providerConfig = findProvider(providerId)
  if (!providerConfig) {
    return NextResponse.json({ error: "Unknown providerId" }, { status: 400 })
  }

  if (!isAllowedCallback(providerConfig, callbackUrl, requestOrigin)) {
    return NextResponse.json({ error: "Callback URL is not registered for this provider" }, { status: 400 })
  }

  if (!appName || !Number.isFinite(maxSpend) || !Number.isFinite(unitPrice)) {
    return NextResponse.json(
      { error: "appName, maxSpend, and unitPrice are required" },
      { status: 400 }
    )
  }

  if (maxSpend <= 0 || unitPrice <= 0) {
    return NextResponse.json(
      { error: "maxSpend and unitPrice must be positive" },
      { status: 400 }
    )
  }

  const account = await findAccountByPartyId(subscriber)
  if (!account?.secretKey) {
    return NextResponse.json(
      { error: "Subscriber secret not found. Sign in again to recreate the account." },
      { status: 400 }
    )
  }

  let zk = null
  try {
    zk = await verifyZkAuthorization(account, subscriber, maxSpend)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "ZK verification failed" }, { status: 400 })
  }

  const provider = getAgentPublicKey(subscriber)
  const normalizedCallback = normalizeCallbackUrl(callbackUrl, requestOrigin)
  const serviceName =
    appName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 9) || "service"
  const chainParams = {
    provider,
    subscriber,
    subscriberSecret: account.secretKey,
    maxSpend,
    unitPrice,
    flatRate,
    serviceName,
  }

  let subscription: any =
    (idempotencyKey ? await findSubscriptionByIdempotencyKey(idempotencyKey) : null) ||
    (await findOpenSubscription(subscriber, providerConfig.id))
  const reused = Boolean(subscription)

  if (subscription && isChainConfirmed(subscription)) {
    return NextResponse.json({
      ok: true,
      authorization: subscription,
      callbackUrl: normalizedCallback,
      reused: true,
      zk: { verified: true },
    })
  }

  if (subscription) {
    const { authorization, chain } = await confirmOnChain(subscription.id, chainParams)
    return NextResponse.json({
      ok: true,
      authorization: authorization || subscription,
      callbackUrl: normalizedCallback,
      reused,
      retried: true,
      zk,
      chain,
    })
  }

  subscription = await createSubscription({
    providerId: providerConfig.id,
    providerName: providerConfig.name,
    callbackUrl: normalizedCallback,
    appName,
    subscriber,
    maxSpend,
    unitPrice,
    unitName,
    flatRate,
    chainStatus: "pending",
    idempotencyKey,
    serviceName,
  })

  const { authorization, chain } = await confirmOnChain(subscription.id, chainParams)

  return NextResponse.json({
    ok: true,
    authorization: authorization || subscription,
    callbackUrl: normalizedCallback,
    zk,
    chain,
  })
}
