import { execSync } from "child_process"
import type { ApiRequest, JsonResponse } from "../types"

const CLI = "stellar"
const SECRET = process.env.AGENT_SECRET || ""

function cli(args: string): string {
  try {
    return execSync(`${CLI} ${args} 2>&1`, { encoding: "utf-8", timeout: 60000 })
  } catch (e: any) {
    if (e.stdout) return e.stdout
    return JSON.stringify({ error: e.message?.slice?.(0, 200) || "cli failed" })
  }
}

export default async function handler(
  req: ApiRequest<{ subscriber?: string; serviceName?: string }>,
  res: JsonResponse
) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" })

  const { subscriber, serviceName } = req.body
  if (!subscriber || !serviceName) {
    return res.status(400).json({ error: "subscriber and serviceName required" })
  }

  const escrowId = process.env.ESCROW_CONTRACT_ID
  if (!escrowId) return res.status(500).json({ error: "Missing ESCROW_CONTRACT_ID" })

  try {
    const out = cli(
      `contract invoke --id ${escrowId} --network testnet --source-account ${SECRET} -- settle` +
      ` --subscriber ${subscriber}` +
      ` --service_name ${serviceName}`
    )
    
    if (!out.includes("successfully")) {
      throw new Error(out.slice(0, 200))
    }

    res.status(200).json({
      status: "agent_cycle_complete",
      settled: [subscriber],
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
