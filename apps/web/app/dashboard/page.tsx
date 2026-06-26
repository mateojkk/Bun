import { query } from "@/lib/daml"
import SubscriptionCard from "@/components/SubscriptionCard"
import PrivacyBadge from "@/components/PrivacyBadge"

const SUBSCRIBER_PARTY = process.env.SUBSCRIBER_PARTY || "subscriber1"

export default async function Dashboard() {
  let subscriptions: any[] = []
  try {
    const data = await query("Main:Subscription", {
      subscriber: SUBSCRIBER_PARTY,
    })
    subscriptions = data.result || []
  } catch (e) {
    console.error("Daml query failed:", e)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">分 Bun</h1>
      <p className="text-gray-500 mb-8">
        Pay only for what you use
      </p>

      <div className="grid gap-4 mb-8">
        {subscriptions.length === 0 ? (
          <div className="p-8 text-center text-gray-400 border-2 border-dashed rounded-lg">
            No active subscriptions. Create one in the{" "}
            <a
              href="/subscriptions"
              className="text-blue-600 underline"
            >
              Subscriptions
            </a>{" "}
            tab.
          </div>
        ) : (
          subscriptions.map((sub) => (
            <SubscriptionCard
              key={sub.contractId}
              contractId={sub.contractId}
              payload={sub.payload}
            />
          ))
        )}
      </div>

      <PrivacyBadge />
    </div>
  )
}
