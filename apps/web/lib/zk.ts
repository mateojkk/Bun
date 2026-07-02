import { createHash, randomBytes } from "crypto"

export const ZK_SALT_BYTES = 32
export const ZK_BALANCE_BYTES = 8
export const ZK_PREIMAGE_BYTES = ZK_BALANCE_BYTES + ZK_SALT_BYTES

export function toStroops(amount: number) {
  return BigInt(Math.round(amount * 10_000_000))
}

export function stroopsToUsdc(stroops: bigint) {
  return Number(stroops) / 10_000_000
}

export function createBalanceCommitment(balanceUsdc: number) {
  const stroops = toStroops(balanceUsdc)
  const salt = randomBytes(ZK_SALT_BYTES)
  const preimage = buildPreimage(stroops, salt)
  const hashHex = createHash("sha256").update(preimage).digest("hex")

  return {
    salt: salt.toString("hex"),
    preimageHex: preimage.toString("hex"),
    hashHex,
    stroops: stroops.toString(),
    balanceUsdc,
  }
}

export function buildPreimage(stroops: bigint, salt: Buffer) {
  const balanceBuf = Buffer.alloc(ZK_BALANCE_BYTES)
  balanceBuf.writeBigInt64BE(stroops)
  return Buffer.concat([balanceBuf, salt])
}

export function buildPreimageHex(stroops: bigint, saltHex: string) {
  return buildPreimage(stroops, Buffer.from(saltHex, "hex")).toString("hex")
}

export function hashPreimageHex(preimageHex: string) {
  return createHash("sha256").update(Buffer.from(preimageHex, "hex")).digest("hex")
}
