import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createHash } from "crypto"

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" })
  }

  const { balance, salt } = req.body

  const preimage = Buffer.concat([
    Buffer.from(String(balance)),
    Buffer.from(salt || ""),
  ])

  const hash = createHash("sha256").update(preimage).digest("hex")

  res.status(200).json({
    hash,
    balance,
    salt,
  })
}
