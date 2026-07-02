import { getPartyId, getDisplayName } from "@/lib/auth"
import { getBalance } from "@/lib/stellar"
import { listSubscriptionsBySubscriber, findAccountByPartyId } from "@/lib/db"
import { redirect } from "next/navigation"
import TopUpForm from "@/components/TopUpForm"
import ZkCommitForm from "@/components/ZkCommitForm"
import CopyAddress from "@/components/CopyAddress"

export default async function Dashboard() {
  const partyId = await getPartyId()
  if (!partyId) redirect("/login")

  const name = await getDisplayName()
  const balance = await getBalance(partyId).catch(() => "0")
  const subscriptions = await listSubscriptionsBySubscriber(partyId).catch(() => [])
  
  const active = subscriptions.filter((sub) => sub.status === "active")
  const used = subscriptions.reduce((sum, sub) => sum + sub.usedAmount, 0)
  const remaining = subscriptions.reduce((sum, sub) => sum + sub.remainingAmount, 0)

  const account = await findAccountByPartyId(partyId)
  const walletBalance = Number(balance)
  const committedUsdc = account?.zkBalanceStroops
    ? Number(account.zkBalanceStroops) / 10_000_000
    : 0
  const committed = account?.zkChainStatus === "confirmed"
  const stale = committed && walletBalance > committedUsdc + 0.000001



  return (
    <div className="px-4 sm:px-6 py-12 max-w-[1400px] mx-auto space-y-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-4 border-b border-black/[0.05]">
        <div>
          <div className="text-xs text-black/40 uppercase tracking-widest font-mono mb-3">Network Overview</div>
          <h1 className="text-[clamp(2rem,4vw,2.5rem)] font-geist font-[460] tracking-[-0.03em] text-black leading-none">
            {name ? `Welcome back, ${name}.` : "Dashboard."}
          </h1>
        </div>
        <div className="flex flex-col sm:items-end">
          <div className="text-xs text-black/40 uppercase tracking-widest font-mono mb-2">Wallet Balance</div>
          <div className="text-4xl font-geist font-[440] text-black tracking-tight flex items-baseline">
            <span className="text-2xl text-black/30 font-light mr-1">$</span>{walletBalance.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid sm:grid-cols-3 gap-5">
        <div className="p-8 rounded-3xl border border-black/[0.07] bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <div className="text-sm text-black/50 font-medium">Active Apps</div>
          </div>
          <div className="text-4xl font-geist font-[440] text-black tracking-tight">{active.length}</div>
        </div>
        <div className="p-8 rounded-3xl border border-black/[0.07] bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <div className="text-sm text-black/50 font-medium">Used Credits</div>
          </div>
          <div className="flex items-baseline">
            <div className="text-xl font-geist text-black/30 mr-1">$</div>
            <div className="text-4xl font-geist font-[440] text-black tracking-tight">{used.toFixed(2)}</div>
          </div>
        </div>
        <div className="p-8 rounded-3xl border border-black/[0.07] bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#3de23d]" />
            <div className="text-sm text-black/50 font-medium">Remaining Caps</div>
          </div>
          <div className="flex items-baseline">
            <div className="text-xl font-geist text-black/30 mr-1">$</div>
            <div className="text-4xl font-geist font-[440] text-black tracking-tight">{remaining.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl border border-black/[0.07] bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-[#3de23d]" />
            <h2 className="text-lg font-[500] text-black tracking-tight">Fund Subscriptions</h2>
          </div>
          <TopUpForm publicKey={partyId} balance={balance} />
        </div>
      </div>

      <div className="pt-4">
        <ZkCommitForm
          initialCommitted={committed}
          initialStale={stale}
          initialCommittedUsdc={committedUsdc}
        />
      </div>
    </div>
  )
}
