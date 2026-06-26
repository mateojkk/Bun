import { query } from "@/lib/daml"
import SettlementProposal from "@/components/SettlementProposal"

export default async function SettlementsPage() {
  let proposals: any[] = []
  try {
    const data = await query("Main:SettlementProposal", {})
    proposals = data.result || []
  } catch {
    // ledger may not be running
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Settlement Proposals
      </h1>

      <div className="grid gap-4">
        {proposals.length === 0 ? (
          <p className="text-gray-400">
            No pending settlements.
          </p>
        ) : (
          proposals.map((proposal: any) => (
            <SettlementProposal
              key={proposal.contractId}
              contractId={proposal.contractId}
              payload={proposal.payload}
            />
          ))
        )}
      </div>
    </div>
  )
}
