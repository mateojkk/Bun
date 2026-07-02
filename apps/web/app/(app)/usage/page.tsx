import { getPartyId } from "@/lib/auth"
import { listSubscriptionsBySubscriber, listUsageEventsBySubscriber } from "@/lib/db"
import { redirect } from "next/navigation"

export default async function UsagePage() {
  const partyId = await getPartyId()
  if (!partyId) redirect("/login")

  const [subscriptions, events] = await Promise.all([
    listSubscriptionsBySubscriber(partyId).catch(() => []),
    listUsageEventsBySubscriber(partyId).catch(() => []),
  ])

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-geist text-black tracking-tight">Usage History</h1>
        <p className="text-black/50 text-sm mt-2">
          A log of metered events reported by your integrated applications.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-geist text-black mb-3">Recent Events</h2>
        {events.length === 0 ? (
          <div className="p-8 text-center text-black/40 border-2 border-dashed border-black/10 rounded-2xl">
            No usage has been reported yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {events.map((event) => {
              const sub = subscriptions.find((item) => item.id === event.subscriptionId)
              return (
                <div key={event.id} className="p-5 border border-black/10 rounded-2xl bg-white shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div>
                        <div className="font-medium text-black">{sub?.appName || "Unknown app"}</div>
                        <div className="text-xs text-black/40 font-mono mt-1 break-all">{event.subscriptionId}</div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right mt-1 sm:mt-0 pl-5 sm:pl-0">
                      <div className="text-sm font-medium text-black">{event.amount.toFixed(2)} USDC</div>
                      <div className="text-xs text-black/50 mt-1">
                        {event.quantity} {sub?.unitName || "units"}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
