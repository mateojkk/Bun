import { Buffer } from "node:buffer"
import type { ApiRequest, JsonResponse } from "../types"
import {
  rpc,
  Contract,
  Keypair,
  TransactionBuilder,
  BASE_FEE,
  Networks,
  nativeToScVal,
} from "@stellar/stellar-sdk"

const server = new rpc.Server(
  process.env.STELLAR_RPC || "https://soroban-testnet.stellar.org"
)

export default async function handler(
  req: ApiRequest<{
    subscriberSecret?: string
    escrowContractId?: string
    zkVerifierContractId?: string
    preimageHex?: string
    requiredMinimumStroops?: string
  }>,
  res: JsonResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" })
  }

  const {
    subscriberSecret,
    escrowContractId,
    zkVerifierContractId,
    preimageHex,
    requiredMinimumStroops,
  } = req.body

  if (!subscriberSecret || !escrowContractId || !zkVerifierContractId) {
    return res.status(400).json({
      error: "subscriberSecret, escrowContractId, and zkVerifierContractId required",
    })
  }

  try {
    const keypair = Keypair.fromSecret(subscriberSecret)
    const source = await server.getAccount(keypair.publicKey())

    const escrow = new Contract(escrowContractId)
    const zk = new Contract(zkVerifierContractId)

    const txBuilder = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    }).addOperation(escrow.call("settle"))

    if (preimageHex && requiredMinimumStroops) {
      txBuilder.addOperation(
        zk.call(
          "verify",
          nativeToScVal(Buffer.from(preimageHex, "hex")),
          nativeToScVal(requiredMinimumStroops)
        )
      )
    }

    const tx = txBuilder.setTimeout(30).build()
    const prepared = await server.prepareTransaction(tx)
    prepared.sign(keypair)

    const result = await server.sendTransaction(prepared)

    res.status(200).json({
      status: "settled",
      hash: result.hash,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
