import { getPartyId } from "@/lib/auth"
import { listSubscriptionsBySubscriber } from "@/lib/db"
import {
  findDuplicateOpenGroups,
  isSupersededSubscription,
} from "@/lib/subscription-duplicates"
import { redirect } from "next/navigation"

export default async function SubscriptionsPage() {
  const partyId = await getPartyId()
  if (!partyId) redirect("/login")
  const subscriptions = await listSubscriptionsBySubscriber(partyId).catch(() => [])
  const duplicateGroups = findDuplicateOpenGroups(subscriptions)

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1400px] mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black font-geist">Subscriptions</h1>
          <p className="text-black/50 text-sm mt-1">
            Apps you authorized to bill usage through Bun.
          </p>
        </div>
        <a 
          href="/merchant/sandbox"
          className="px-5 py-2.5 bg-white border border-black/10 text-black rounded-full hover:bg-neutral-50 transition-colors font-medium text-sm shadow-sm text-center sm:w-auto w-full"
        >
          Try Pay with Bun
        </a>
      </div>



      {subscriptions.length === 0 ? (
        <div className="border border-dashed border-black/10 rounded-2xl p-10 text-center">
          <h2 className="text-lg font-semibold text-black mb-2 font-geist">No subscriptions yet</h2>
          <p className="text-sm text-black/50 mb-6 max-w-md mx-auto">
            Bun does not provide the service catalog. Teams integrate Bun into their apps as a subscription method.
          </p>
          <a
            href="/merchant/sandbox"
            className="inline-flex px-5 py-2.5 border border-black/10 bg-white text-black rounded-full hover:bg-neutral-50 transition-colors text-sm shadow-sm font-medium"
          >
            Open integrated app fixture
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {subscriptions.map((sub) => {
            const usagePercent = sub.maxSpend > 0
              ? Math.min((sub.usedAmount / sub.maxSpend) * 100, 100)
              : 0
            const usageColor = usagePercent >= 100 ? "bg-red-500" : usagePercent >= 80 ? "bg-amber-500" : "bg-[#3de23d]"
            const statusColor = sub.status === "active" ? "bg-blue-100 text-blue-800" : sub.status === "pending_chain" ? "bg-amber-100 text-amber-800" : "bg-black/5 text-black/70"
            const superseded = isSupersededSubscription(sub, duplicateGroups)
            const canonical = duplicateGroups.find((group) => group.canonicalId === sub.id)

            return (
              <div
                key={sub.id}
                className={`p-5 border rounded-lg ${
                  superseded
                    ? "border-amber-300 bg-amber-50 opacity-80"
                    : canonical
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-black/10 bg-white shadow-sm"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-black font-geist">{sub.appName}</h2>
                    <p className="text-sm text-black/50">{sub.providerName}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {canonical && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                        active authorization
                      </span>
                    )}
                    {superseded && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">
                        superseded
                      </span>
                    )}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor}`}>
                      {sub.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-5">
                  <div>
                    <div className="text-black/40 text-[10px] sm:text-xs mb-1 uppercase tracking-wider font-mono">Max spend</div>
                    <div className="text-black font-medium">{sub.maxSpend.toFixed(2)} USDC</div>
                  </div>
                  <div>
                    <div className="text-black/40 text-[10px] sm:text-xs mb-1 uppercase tracking-wider font-mono">Used</div>
                    <div className="text-black font-medium">{sub.usedAmount.toFixed(2)} USDC</div>
                  </div>
                  <div>
                    <div className="text-black/40 text-[10px] sm:text-xs mb-1 uppercase tracking-wider font-mono">Remaining</div>
                    <div className="text-black font-medium">{sub.remainingAmount.toFixed(2)} USDC</div>
                  </div>
                  <div>
                    <div className="text-black/40 text-[10px] sm:text-xs mb-1 uppercase tracking-wider font-mono">Meter</div>
                    <div className="text-black font-medium">
                      {sub.unitPrice} USDC / {sub.unitName}
                    </div>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-black/5 overflow-hidden mb-4">
                  <div className={`h-full ${usageColor} transition-all duration-500`} style={{ width: `${usagePercent}%` }} />
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-black/40">
                  <span>Usage: {sub.usage} {sub.unitName}</span>
                  <span>Chain: {sub.chainStatus}</span>
                  {sub.contractId && (
                    <span className="font-mono">
                      Contract: {sub.contractId.slice(0, 12)}...
                    </span>
                  )}
                  <span className="font-mono">ID: {sub.id}</span>
                </div>
                {superseded && (
                  <p className="mt-3 text-xs text-amber-700">
                    This authorization was replaced by a newer checkout. It will not receive new usage.
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
