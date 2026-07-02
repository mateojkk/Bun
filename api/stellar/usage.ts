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
    escrowContractId?: string
    additionalUsage?: string | number
    subscriberSecret?: string
  }>,
  res: JsonResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" })
  }

  const { escrowContractId, additionalUsage, subscriberSecret } = req.body

  if (!escrowContractId || !additionalUsage || !subscriberSecret) {
    return res.status(400).json({
      error: "escrowContractId, additionalUsage, and subscriberSecret required",
    })
  }

  try {
    const keypair = Keypair.fromSecret(subscriberSecret)
    const source = await server.getAccount(keypair.publicKey())
    const contract = new Contract(escrowContractId)

    const tx = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call("record_usage", nativeToScVal(String(additionalUsage)))
      )
      .setTimeout(30)
      .build()

    const prepared = await server.prepareTransaction(tx)
    prepared.sign(keypair)

    const result = await server.sendTransaction(prepared)

    res.status(200).json({
      status: "usage_recorded",
      hash: result.hash,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
