import { query } from "@/lib/daml"

const AGENT_PARTY = process.env.AGENT_PARTY || "agent"

async function getServices() {
  try {
    const data = await query("Main:ServiceTemplate", {})
    return data.result || []
  } catch {
    return []
  }
}

export default async function SubscriptionsPage() {
  const services = await getServices()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Available Services</h1>

      <div className="grid gap-4">
        {services.length === 0 ? (
          <p className="text-gray-400">
            No services published yet. Create one via the Daml
            Contract Factory in Seaport.
          </p>
        ) : (
          services.map((svc: any) => (
            <div
              key={svc.contractId}
              className="p-4 border rounded-lg bg-white"
            >
              <h2 className="text-lg font-semibold">
                {svc.payload.serviceName}
              </h2>
              <p className="text-sm text-gray-500">
                {svc.payload.unitPrice} per{" "}
                {svc.payload.unitType} &middot; billed{" "}
                {svc.payload.billingCycle}
              </p>
              <div className="mt-3">
                <a
                  href={`/subscriptions/create?serviceCid=${svc.contractId}`}
                  className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Subscribe
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
