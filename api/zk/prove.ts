import { createHash, randomBytes } from "node:crypto"
import type { ApiRequest, JsonResponse } from "../types"

const ZK_SALT_BYTES = 32
const ZK_BALANCE_BYTES = 8

function toStroops(amount: number) {
  return BigInt(Math.round(amount * 10_000_000))
}

function buildPreimage(stroops: bigint, salt: Buffer) {
  const balanceBuf = Buffer.alloc(ZK_BALANCE_BYTES)
  balanceBuf.writeBigInt64BE(stroops)
  return Buffer.concat([balanceBuf, salt])
}

export default async function handler(
  req: ApiRequest<{ balance?: unknown; salt?: string }>,
  res: JsonResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" })
  }

  const balance = Number(req.body.balance)
  if (!Number.isFinite(balance) || balance < 0) {
    return res.status(400).json({ error: "balance must be a non-negative number" })
  }

  const saltHex = req.body.salt || randomBytes(ZK_SALT_BYTES).toString("hex")
  const stroops = toStroops(balance)
  const preimage = buildPreimage(stroops, Buffer.from(saltHex, "hex"))
  const hash = createHash("sha256").update(preimage).digest("hex")

  res.status(200).json({
    hash,
    preimageHex: preimage.toString("hex"),
    salt: saltHex,
    stroops: stroops.toString(),
    balance,
    format: `${ZK_BALANCE_BYTES}-byte stroops BE + ${ZK_SALT_BYTES}-byte salt`,
  })
}
