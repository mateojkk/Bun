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
const agentKeypair = Keypair.fromSecret(
  process.env.AGENT_SECRET || Keypair.random().secret()
)

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" })
  }

  const { escrowContractId } = req.body
  if (!escrowContractId) {
    return res.status(400).json({ error: "escrowContractId required" })
  }

  const settled: string[] = []

  try {
    const source = await rpc.getAccount(
      agentKeypair.publicKey()
    )
    const contract = new Contract(escrowContractId)
    const tx = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(contract.call("settle"))
      .setTimeout(30)
      .build()

    const prepared = await rpc.prepareTransaction(tx)
    prepared.sign(agentKeypair)

    const result = await rpc.sendTransaction(prepared)
    settled.push(escrowContractId)

    res.status(200).json({
      status: "agent_cycle_complete",
      settled,
      hash: result.hash,
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
