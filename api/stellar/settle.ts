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

  const { subscriberSecret, escrowContractId, zkVerifierContractId } =
    req.body

  try {
    const keypair = Keypair.fromSecret(subscriberSecret)
    const source = await rpc.getAccount(keypair.publicKey())

    const escrow = new Contract(escrowContractId)
    const zk = new Contract(zkVerifierContractId)

    const tx = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(escrow.call("settle"))
      .addOperation(
        zk.call(
          "verify_balance",
          keypair.publicKey(),
          "1000000",
          Buffer.from("salt").toString("hex"),
          "500000"
        )
      )
      .setTimeout(30)
      .build()

    const prepared = await rpc.prepareTransaction(tx)
    prepared.sign(keypair)

    const result = await rpc.sendTransaction(prepared)

    res.status(200).json({
      status: "settled",
      hash: result.hash,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
