import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { findSubscription, recordUsageEvent, updateSubscriptionChainState } from "@/lib/db"
import { escrowRecordUsage, escrowSettle } from "@/lib/stellar"
import { authenticateProvider, findProvider } from "@/lib/providers"

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const subscriptionId = String(body.subscriptionId || "").trim()
  const quantity = Number(body.quantity)
  const requestedProviderId = body.providerId ? String(body.providerId) : ""
  const idempotencyKey = body.idempotencyKey ? String(body.idempotencyKey) : undefined
  const apiKeyProvider = authenticateProvider(request.headers.get("x-bun-api-key"))
  const sandboxProvider = requestedProviderId ? findProvider(requestedProviderId) : null
  const provider = apiKeyProvider || (sandboxProvider?.sandbox ? sandboxProvider : null)

  if (!provider) {
    return NextResponse.json({ error: "Valid provider API key required" }, { status: 401 })
  }

  if (!subscriptionId || !Number.isFinite(quantity) || quantity <= 0 || !idempotencyKey) {
    return NextResponse.json(
      { error: "subscriptionId, positive quantity, and idempotencyKey are required" },
      { status: 400 }
    )
  }

  try {
    if (provider.sandbox && !apiKeyProvider) {
      const cookieStore = await cookies()
      const subscriber = cookieStore.get("bun_party")?.value
      const subscription = await findSubscription(subscriptionId)

      if (!subscriber || !subscription || subscription.subscriber !== subscriber) {
        return NextResponse.json(
          { error: "Sandbox usage requires the authenticated subscription owner" },
          { status: 401 }
        )
      }
    }

    const result = await recordUsageEvent({
      subscriptionId,
      providerId: provider.id,
      quantity,
      idempotencyKey,
      allowPendingChain: provider.sandbox,
    })

    let chain = null
    if (result.subscription.contractId && result.subscription.serviceName) {
      chain = await escrowRecordUsage(
        result.subscription.contractId,
        result.subscription.subscriber,
        result.subscription.serviceName,
        Math.round(quantity)
      )

      // Hackathon Feature: Immediate early settlement if credits are exhausted
      if (result.subscription.remainingAmount <= 0) {
        try {
          await escrowSettle(
            result.subscription.contractId,
            result.subscription.subscriber,
            result.subscription.serviceName
          )
          await updateSubscriptionChainState(result.subscription.id, {
            status: "settled",
            chainStatus: "confirmed"
          })
        } catch (e) {
          console.error("Early settlement failed:", e)
        }
      }
    }

    return NextResponse.json({ ok: true, ...result, chain })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Could not record usage" },
      { status: 400 }
    )
  }
}
