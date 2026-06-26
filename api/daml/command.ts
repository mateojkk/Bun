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

  const { commandType, templateId, contractId, choice, argument } =
    req.body

  let endpoint = "/v1/create"
  let body: Record<string, unknown> = {
    templateId,
    payload: argument,
  }

  if (commandType === "exercise") {
    endpoint = "/v1/exercise"
    body = { templateId, contractId, choice, argument }
  }

  const response = await fetch(`${DAML_JSON_API}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const data = await response.json()
  res.status(200).json(data)
}
