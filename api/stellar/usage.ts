import type { VercelRequest, VercelResponse } from "@vercel/node"
import {
  SorobanRpc,
  Contract,
  Keypair,
  TransactionBuilder,
  BASE_FEE,
  Networks,
} from "@stellar/stellar-sdk"

const rpc = new SorobanRpc.Server(
  process.env.STELLAR_RPC || "https://soroban-testnet.stellar.org"
)

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" })
  }

  const { escrowContractId, additionalUsage, subscriberSecret } = req.body

  try {
    const keypair = Keypair.fromSecret(subscriberSecret)
    const source = await rpc.getAccount(keypair.publicKey())
    const contract = new Contract(escrowContractId)

    const tx = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call("record_usage", additionalUsage.toString())
      )
      .setTimeout(30)
      .build()

    const prepared = await rpc.prepareTransaction(tx)
    prepared.sign(keypair)

    const result = await rpc.sendTransaction(prepared)

    res.status(200).json({
      status: "usage_recorded",
      hash: result.hash,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
