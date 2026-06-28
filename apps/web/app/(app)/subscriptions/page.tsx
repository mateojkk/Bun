import { getPartyId } from "@/lib/auth"
import { redirect } from "next/navigation"

const DEMO_SERVICES = [
  { name: "Netflix", unitType: "hour", unitPrice: "0.26", flatRate: "15.99" },
  { name: "Claude AI", unitType: "call", unitPrice: "0.03", flatRate: "20.00" },
  { name: "Spotify", unitType: "stream", unitPrice: "0.004", flatRate: "11.99" },
  { name: "AWS Lambda", unitType: "GB-sec", unitPrice: "0.000016", flatRate: "50.00" },
]

export default async function ServicesPage() {
  const partyId = await getPartyId()
  if (!partyId) redirect("/login")

  return (
    <div className="px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Browse Services</h1>
        <p className="text-oc-muted text-sm">
          Subscribe and pay only for what you use. Funds are escrowed on Stellar testnet.
        </p>
      </div>

      <div className="grid gap-4">
        {DEMO_SERVICES.map((svc) => (
          <div key={svc.name} className="p-5 border border-white/5 rounded-lg bg-white/[0.02]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">{svc.name}</h2>
                <p className="text-sm text-oc-muted mb-3">
                   {svc.unitPrice} USDC per {svc.unitType}
                </p>
                <div className="flex gap-4 text-xs text-oc-muted">
                  <div>Flat rate: <span className="line-through">{svc.flatRate} USDC/mo</span></div>
                </div>
              </div>
              <div className="text-right">
                <a
                  href={`/subscriptions/create?name=${svc.name}&unitType=${svc.unitType}&unitPrice=${svc.unitPrice}&flatRate=${svc.flatRate}`}
                  className="text-sm px-4 py-2 bg-white text-oc-black rounded-md hover:bg-oc-lightest transition font-medium inline-block"
                >
                  Subscribe
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
