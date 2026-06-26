import type { VercelRequest, VercelResponse } from "@vercel/node"

const DAML_JSON_API =
  process.env.DAML_JSON_API || "http://localhost:7575"

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" })
  }

  const activeSubs = await fetch(`${DAML_JSON_API}/v1/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      templateIds: ["Main:Subscription"],
      query: {},
    }),
  }).then((r) => r.json())

  const now = new Date().toISOString()
  const settled: string[] = []
  const proposed: string[] = []

  for (const { contractId, payload } of activeSubs.result || []) {
    if (payload.status !== "Active") continue

    const cycleEnded = new Date(payload.cycleEnd) <= new Date()
    if (!cycleEnded) continue

    try {
      const proposalRes = await fetch(
        `${DAML_JSON_API}/v1/exercise`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId: "Main:Subscription",
            contractId,
            choice: "ProposeSettlement",
            argument: {
              calculatedAmount: String(
                Number(payload.usage) * Number(payload.unitPrice)
              ),
              periodStart: payload.lastSettled,
              periodEnd: payload.cycleEnd,
            },
          }),
        }
      )
      const proposal = await proposalRes.json()

      if (proposal.result?.contractId) {
        const proposalCid = proposal.result.contractId

        if (payload.autoApprove) {
          await fetch(`${DAML_JSON_API}/v1/exercise`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              templateId: "Main:SettlementProposal",
              contractId: proposalCid,
              choice: "ApproveAndSettle",
              argument: {},
            }),
          })
          settled.push(contractId)
        } else {
          proposed.push(contractId)
        }
      }
    } catch (err) {
      console.error(`Agent error for ${contractId}:`, err)
    }
  }

  res.status(200).json({
    status: "agent_cycle_complete",
    settled,
    proposed,
    timestamp: now,
  })
}
