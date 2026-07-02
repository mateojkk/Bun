import { getPartyId } from "@/lib/auth"
import { listSubscriptionsBySubscriber } from "@/lib/db"
import { ESCROW_CONTRACT_ID, ZK_VERIFIER_CONTRACT_ID } from "@/lib/stellar"
import { redirect } from "next/navigation"
import SorobanSettleButton from "@/components/SorobanSettleButton"

export default async function SettlementsPage() {
  const partyId = await getPartyId()
  if (!partyId) redirect("/login")

  const subscriptions = await listSubscriptionsBySubscriber(partyId).catch(() => [])
  const providerPayout = subscriptions.reduce((sum, sub) => sum + sub.usedAmount, 0)
  const refundable = subscriptions.reduce((sum, sub) => sum + sub.remainingAmount, 0)

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1400px] mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black font-geist">Settlements</h1>
        <p className="text-sm text-black/50">
          Bun settles usage to providers and returns unused caps to customers.
        </p>
        <p className="text-xs text-black/40 mt-2 max-w-2xl">
          Settlement executes on Soroban: <span className="font-mono bg-black/5 px-1 rounded">escrow.settle()</span> pays the provider and refunds unused USDC.
          ZK verification runs at authorization via <span className="font-mono bg-black/5 px-1 rounded">zk.verify()</span>.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-6 border border-black/10 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <div className="text-xs text-black/40 font-medium uppercase tracking-wider">Provider payout</div>
          </div>
          <div className="text-3xl font-bold text-black">{providerPayout.toFixed(2)}</div>
          <div className="text-xs text-black/50 mt-1">USDC accrued</div>
        </div>
        <div className="p-6 border border-black/10 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#3de23d]" />
            <div className="text-xs text-black/40 font-medium uppercase tracking-wider">Unused caps</div>
          </div>
          <div className="text-3xl font-bold text-black">{refundable.toFixed(2)}</div>
          <div className="text-xs text-black/50 mt-1">USDC refundable</div>
        </div>
        <div className="p-6 border border-black/10 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <div className="text-xs text-black/40 font-medium uppercase tracking-wider">Escrows</div>
          </div>
          <div className="text-3xl font-bold text-black">{subscriptions.length}</div>
          <div className="text-xs text-black/50 mt-1">authorized apps</div>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3 text-black font-geist">Soroban Contracts</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-6 border border-black/10 rounded-2xl bg-white shadow-sm">
            <div className="text-sm text-black/50 mb-2">EscrowContract</div>
            <div className="text-xs text-black/60 font-mono break-all mb-4 bg-black/5 p-2 rounded">{ESCROW_CONTRACT_ID}</div>
            <a href={`https://stellar.expert/explorer/testnet/contract/${ESCROW_CONTRACT_ID}`} target="_blank" className="text-xs text-black font-medium hover:underline">Stellar Expert →</a>
          </div>
          <div className="p-6 border border-black/10 rounded-2xl bg-white shadow-sm">
            <div className="text-sm text-black/50 mb-2">ZkVerifierContract</div>
            <div className="text-xs text-black/60 font-mono break-all mb-4 bg-black/5 p-2 rounded">{ZK_VERIFIER_CONTRACT_ID}</div>
            <a href={`https://stellar.expert/explorer/testnet/contract/${ZK_VERIFIER_CONTRACT_ID}`} target="_blank" className="text-xs text-black font-medium hover:underline">Stellar Expert →</a>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3 text-black font-geist">Settlement Queue</h2>
        {subscriptions.length === 0 ? (
          <div className="p-10 text-center text-black/40 border-2 border-dashed border-black/10 rounded-2xl">
            No active settlement records yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="p-5 border border-black/10 rounded-2xl bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-black font-geist">{sub.appName}</div>
                    <div className="text-xs text-black/50">{sub.providerName}</div>
                  </div>
                  <div className="text-left sm:text-right text-sm">
                    <div className="text-black font-medium">{sub.usedAmount.toFixed(2)} USDC payout</div>
                    <div className="text-black/40">{sub.remainingAmount.toFixed(2)} USDC unused</div>
                  </div>
                </div>
                <div className="mt-4 mb-4 text-xs text-black/40 flex flex-wrap items-center gap-y-2 gap-x-1">
                  Soroban: 
                  <span className={`px-2 py-0.5 rounded-full font-medium ml-1 ${sub.chainStatus === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {sub.chainStatus}
                  </span>
                  {sub.serviceName && <><span className="mx-1">&middot;</span> service <span className="font-mono bg-black/5 px-1 rounded ml-1">{sub.serviceName}</span></>}
                </div>
                <SorobanSettleButton subscriptionId={sub.id} chainStatus={sub.chainStatus} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
