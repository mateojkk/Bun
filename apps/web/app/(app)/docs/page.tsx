import { getPartyId } from "@/lib/auth"
import { findAccountByPartyId, listSubscriptionsBySubscriber } from "@/lib/db"
import {
  CYCLE_SECONDS,
  ESCROW_CONTRACT_ID,
  ZK_VERIFIER_CONTRACT_ID,
} from "@/lib/stellar"
import { redirect } from "next/navigation"

const FLOW = [
  { step: "1", title: "ZK commit", body: "Customer commits sha256(balance ‖ salt) to ZkVerifierContract on Soroban." },
  { step: "2", title: "ZK verify", body: "Checkout calls verify() which proves solvency ≥ cap without revealing balance." },
  { step: "3", title: "Escrow init", body: "EscrowContract locks USDC cap on-chain (per subscriber + service)." },
  { step: "4", title: "record_usage", body: "Each metered event syncs usage to Soroban escrow." },
  { step: "5", title: "settle", body: "Agent calls settle() so the provider is paid and unused USDC is refunded." },
]

export default async function DocsPage() {
  const partyId = await getPartyId()
  if (!partyId) redirect("/login")

  const [account, subscriptions] = await Promise.all([
    findAccountByPartyId(partyId),
    listSubscriptionsBySubscriber(partyId).catch(() => []),
  ])

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1400px] mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-geist tracking-tight text-black mb-2">Documentation</h1>
        <p className="text-sm text-black/50 max-w-3xl">
          Everything you need to integrate Bun as a payment rail for your app. Includes SDK examples, REST API specifications, Soroban smart contract IDs, and the on-chain settlement flow.
        </p>
      </div>

      <section>
        <h2 className="text-xl font-geist text-black mb-4 border-b border-black/10 pb-2">Quickstart (SDK)</h2>
        <div className="space-y-4">
          <div className="p-6 border border-black/10 rounded-2xl bg-white shadow-sm">
            <h3 className="font-medium text-black mb-2">1. Install</h3>
            <p className="text-sm text-black/50 mb-4">Install the Bun SDK in your backend server.</p>
            <div className="bg-black/5 p-4 rounded-xl text-xs font-mono text-black/70 overflow-x-auto">
              npm install @bun-protocol/sdk
            </div>
          </div>

          <div className="p-6 border border-black/10 rounded-2xl bg-white shadow-sm">
            <h3 className="font-medium text-black mb-2">2. Initialize Checkout</h3>
            <p className="text-sm text-black/50 mb-4">Generate a hosted checkout URL for your customer.</p>
            <pre className="bg-black/5 p-4 rounded-xl text-xs font-mono text-black/70 overflow-x-auto">
{`import { BunProviderClient } from "@bun-protocol/sdk"

const bun = new BunProviderClient({ apiKey: process.env.BUN_PROVIDER_API_KEY })

const checkoutUrl = bun.checkoutUrl({
  providerId: "your-provider-id",
  appName: "Your App",
  providerName: "Your Team",
  unitName: "token",
  unitPrice: "0.002",
  maxSpend: "5",
  callbackUrl: "https://your-app.com/bun/callback"
})

redirect(checkoutUrl)`}
            </pre>
          </div>

          <div className="p-6 border border-black/10 rounded-2xl bg-white shadow-sm">
            <h3 className="font-medium text-black mb-2">3. Report Usage</h3>
            <p className="text-sm text-black/50 mb-4">Your backend reports metered events. Bun handles the Soroban ledger sync.</p>
            <pre className="bg-black/5 p-4 rounded-xl text-xs font-mono text-black/70 overflow-x-auto">
{`await bun.recordUsage({
  subscriptionId: customer.bunSubscriptionId, // Returned to your callbackUrl
  providerId: "your-provider-id",
  quantity: 420,
  idempotencyKey: "usage-event-123"
})`}
            </pre>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-geist text-black mb-4 border-b border-black/10 pb-2">API Endpoints</h2>
        <div className="space-y-4">
          <div className="p-6 border border-black/10 rounded-2xl bg-white shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2 py-1 text-xs font-mono bg-emerald-100 text-emerald-800 font-medium rounded">POST</span>
              <span className="font-mono text-black text-sm font-medium">/api/bun/v1/authorizations</span>
            </div>
            <p className="text-sm text-black/50 mb-4">Creates a new Soroban escrow and authorizes a spend cap.</p>
            <div className="bg-black/5 p-4 rounded-xl text-xs font-mono text-black/70 overflow-x-auto">
              {`{ "appName": "AI Tool", "providerId": "tool-id", "unitName": "token", "unitPrice": 0.002, "maxSpend": 2, "callbackUrl": "https://..." }`}
            </div>
          </div>

          <div className="p-6 border border-black/10 rounded-2xl bg-white shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2 py-1 text-xs font-mono bg-blue-100 text-blue-800 font-medium rounded">POST</span>
              <span className="font-mono text-black text-sm font-medium">/api/bun/v1/usage</span>
            </div>
            <p className="text-sm text-black/50 mb-4">Records metered usage against an active subscription.</p>
            <div className="bg-black/5 p-4 rounded-xl text-xs font-mono text-black/70 overflow-x-auto">
              {`{ "subscriptionId": "sub_123", "quantity": 1500, "idempotencyKey": "req_123" }`}
            </div>
          </div>
        </div>
      </section>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1 p-6 border border-black/10 rounded-2xl bg-white shadow-sm">
          <h3 className="font-medium text-black mb-2">ZkVerifierContract</h3>
          <p className="text-xs font-mono break-all text-black/60 mb-3 bg-black/5 p-2 rounded">{ZK_VERIFIER_CONTRACT_ID}</p>
          <div className="text-sm space-y-1 text-black/50">
            <div>Status: {account?.zkChainStatus === "confirmed" ? "committed" : "not committed"}</div>
            {account?.zkBalanceStroops && (
              <div>
                Proof covers: {(Number(account.zkBalanceStroops) / 10_000_000).toFixed(2)} USDC
              </div>
            )}
          </div>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${ZK_VERIFIER_CONTRACT_ID}`}
            target="_blank"
            className="text-xs text-black underline mt-3 inline-block font-medium"
          >
            View on Stellar Expert →
          </a>
        </div>

        <div className="col-span-2 sm:col-span-1 p-6 border border-black/10 rounded-2xl bg-white shadow-sm">
          <h3 className="font-medium text-black mb-2">EscrowContract</h3>
          <p className="text-xs font-mono break-all text-black/60 mb-3 bg-black/5 p-2 rounded">{ESCROW_CONTRACT_ID}</p>
          <div className="text-sm space-y-1 text-black/50">
            <div>Billing cycle: {Math.round(CYCLE_SECONDS / 60)} minutes</div>
            <div>Active escrows: {subscriptions.filter((s) => s.chainStatus === "confirmed").length}</div>
          </div>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${ESCROW_CONTRACT_ID}`}
            target="_blank"
            className="text-xs text-black underline mt-3 inline-block font-medium"
          >
            View on Stellar Expert →
          </a>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-geist text-black mb-4 border-b border-black/10 pb-2">Soroban Architecture</h2>
        <div className="grid gap-4 sm:grid-cols-5">
          {FLOW.map((item) => (
            <div key={item.step} className="p-5 border border-black/10 rounded-2xl bg-white shadow-sm">
              <div className="font-mono text-xs text-black/50 mb-3 border border-black/10 inline-block px-2 py-1 rounded bg-black/5 font-medium">Step {item.step}</div>
              <div className="font-medium text-black text-sm mb-2">{item.title}</div>
              <p className="text-xs text-black/60 leading-5">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
