import { getPartyId, getDisplayName } from "@/lib/auth"
import { getBalance } from "@/lib/stellar"
import { redirect } from "next/navigation"
import TopUpForm from "@/components/TopUpForm"

export default async function AccountPage() {
  const partyId = await getPartyId()
  if (!partyId) redirect("/login")

  const name = await getDisplayName()
  const balance = await getBalance(partyId).catch(() => "0")

  return (
    <div className="px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2 text-white">Bun Account</h1>
        <p className="text-oc-muted text-sm">
          {name ? `Signed in as ${name}` : ""} &middot; {partyId.slice(0, 12)}...
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-white/5 border border-white/5 rounded-lg">
          <div className="text-sm text-oc-muted mb-1">Balance</div>
          <div className="text-3xl font-bold text-oc-lighter">
            {Number(balance).toFixed(2)} USDC
          </div>
        </div>
        <div className="p-6 bg-white/5 border border-white/5 rounded-lg">
          <div className="text-sm text-oc-muted mb-1">Network</div>
          <div className="text-3xl font-bold text-oc-lighter">Testnet</div>
        </div>
      </div>

      <TopUpForm publicKey={partyId} balance={balance} />
    </div>
  )
}
