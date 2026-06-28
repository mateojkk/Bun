import { getPartyId, getDisplayName } from "@/lib/auth"
import { getBalance } from "@/lib/stellar"
import { redirect } from "next/navigation"
import PrivacyBadge from "@/components/PrivacyBadge"

export default async function Dashboard() {
  const partyId = await getPartyId()
  if (!partyId) redirect("/login")

  const name = await getDisplayName()
  const balance = await getBalance(partyId).catch(() => "0")

  return (
    <div className="px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">分 Bun</h1>
          <p className="text-oc-muted">Pay only for what you use</p>
          {name && <p className="text-oc-gray text-sm mt-1">Welcome back, {name}</p>}
        </div>
        <div className="text-right">
          <div className="text-sm text-oc-muted">Balance</div>
          <div className="text-2xl font-bold text-oc-lighter">
            {Number(balance).toFixed(2)} USDC
          </div>
        </div>
      </div>

      <div className="grid gap-4 mb-8">
        <div className="p-5 border border-white/5 rounded-lg bg-white/[0.02]">
          <h2 className="text-lg font-semibold text-white mb-2">Get Started</h2>
          <ol className="text-sm text-oc-gray space-y-1 mb-4">
            <li>1. Fund your account on the <b>Account</b> page with testnet USDC</li>
            <li>2. Browse <b>Services</b> and subscribe to one</li>
            <li>3. Record usage on the <b>Usage</b> page</li>
            <li>4. Settlement happens automatically at cycle end</li>
          </ol>
          <div className="flex gap-3">
            <a href="/account" className="px-4 py-2 bg-white text-oc-black rounded-md hover:bg-oc-lightest transition font-medium text-sm">
              Fund Account
            </a>
            <a href="/subscriptions" className="px-4 py-2 border border-white/10 text-white rounded-md hover:bg-white/5 transition text-sm">
              Browse Services
            </a>
          </div>
        </div>
      </div>

      <PrivacyBadge />
    </div>
  )
}
