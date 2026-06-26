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

  const { subscriptionId, usage } = req.body

  const response = await fetch(`${DAML_JSON_API}/v1/exercise`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      templateId: "Main:Subscription",
      contractId: subscriptionId,
      choice: "RecordUsage",
      argument: { additionalUsage: String(usage) },
    }),
  })

  const data = await response.json()
  res.status(200).json(data)
}
