import { getPartyId } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ESCROW_CONTRACT_ID } from "@/lib/stellar"

export default async function SettlementsPage() {
  const partyId = await getPartyId()
  if (!partyId) redirect("/login")

  return (
    <div className="px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Settlements</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-white">Escrow Contract</h2>
        <div className="p-5 border border-white/5 rounded-lg bg-white/[0.02]">
          <div className="text-sm text-oc-muted mb-1">Contract ID</div>
          <div className="text-xs text-oc-light font-mono break-all mb-3">
            {ESCROW_CONTRACT_ID}
          </div>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${ESCROW_CONTRACT_ID}`}
            target="_blank"
            className="text-xs text-oc-light hover:text-white underline"
          >
            View on Stellar Expert →
          </a>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3 text-white">Active Escrows</h2>
        <div className="p-8 text-center text-oc-gray border-2 border-dashed border-white/5 rounded-lg">
          Active escrows for your account will appear here once services are subscribed.
        </div>
      </section>
    </div>
  )
}
