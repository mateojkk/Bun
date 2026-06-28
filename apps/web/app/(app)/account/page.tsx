import { getPartyId, getDisplayName } from "@/lib/auth"
import { getBalance, ESCROW_CONTRACT_ID } from "@/lib/stellar"
import { redirect } from "next/navigation"
import TopUpForm from "@/components/TopUpForm"
import CopyAddress from "@/components/CopyAddress"

export default async function AccountPage() {
  const partyId = await getPartyId()
  if (!partyId) redirect("/login")

  const name = await getDisplayName()
  const balance = await getBalance(partyId).catch(() => "0")

  return (
    <div className="px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2 text-white">Bun Account</h1>
        {name && <p className="text-oc-muted text-sm mb-4">Signed in as {name}</p>}
        
        <div className="space-y-2 mt-4">
          <div>
            <div className="text-xs text-oc-muted uppercase tracking-wider font-semibold">Your Address</div>
            <CopyAddress address={partyId} />
          </div>
          <div className="pt-2">
            <div className="text-xs text-oc-muted uppercase tracking-wider font-semibold">Escrow Contract ID</div>
            <CopyAddress address={ESCROW_CONTRACT_ID} />
          </div>
        </div>
      </div>

      <div className="p-6 bg-white/5 border border-white/5 rounded-lg">
        <div className="text-sm text-oc-muted mb-1">Balance</div>
        <div className="text-3xl font-bold text-oc-lighter">
          {Number(balance).toFixed(2)} USDC
        </div>
      </div>

      <TopUpForm publicKey={partyId} balance={balance} />
    </div>
  )
}

