import { NextResponse } from "next/server"
import { getDb, BunSubscription, updateSubscriptionChainState } from "@/lib/db"
import { CYCLE_SECONDS, escrowSettle } from "@/lib/stellar"

export async function GET(request: Request) {
  // Protect the cron route if needed, Vercel sets an auth header
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const db = await getDb()
    const activeSubs = await db
      .collection<BunSubscription>("subscriptions")
      .find({ status: "active" })
      .toArray()

    const now = new Date()
    let settledCount = 0

    for (const sub of activeSubs) {
      // Check if CYCLE_SECONDS has passed since createdAt
      const cycleEnd = new Date(sub.createdAt.getTime() + CYCLE_SECONDS * 1000)
      
      if (now >= cycleEnd) {
        if (sub.contractId && sub.serviceName) {
          try {
            await escrowSettle(sub.contractId, sub.subscriber, sub.serviceName)
            await updateSubscriptionChainState(sub.id, {
              status: "settled",
              chainStatus: "confirmed"
            })
            settledCount++
          } catch (e) {
            console.error(`Failed to auto-settle ${sub.id}:`, e)
          }
        }
      }
    }

    return NextResponse.json({ 
      ok: true, 
      message: `Cron execution completed. Settled ${settledCount} expired subscriptions.` 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Cron failed" }, { status: 500 })
  }
}
