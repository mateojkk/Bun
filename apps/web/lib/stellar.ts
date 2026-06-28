import { execSync } from "child_process"

const CLI = "/tmp/stellar"
const RPC = process.env.STELLAR_RPC || "https://soroban-testnet.stellar.org"
const HORIZON = process.env.STELLAR_HORIZON || "https://horizon-testnet.stellar.org"
const SECRET = process.env.AGENT_SECRET || ""
export const ESCROW_CONTRACT_ID = process.env.ESCROW_CONTRACT_ID || "CASIRVAC6X7WNOWLUYUE32DS3HS5DOTLCA7NBPSTM2U2QD6BO27A4FDH"
const ESCROW = ESCROW_CONTRACT_ID
const ZK = process.env.ZK_VERIFIER_CONTRACT_ID || "CCOBSM6WIWEJWF3PTB5TUUAF22UIE7DZB67F7XO27ARG5FHVWMVRXKXF"
const USDC_CONTRACT = process.env.USDC_CONTRACT_ID || "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA"

function cli(args: string): string {
  try {
    return execSync(`${CLI} ${args} 2>&1`, {
      encoding: "utf-8",
      timeout: 60000,
    })
  } catch (e: any) {
    if (e.stdout) return e.stdout
    return JSON.stringify({ error: e.message?.slice?.(0, 200) || "cli failed" })
  }
}

export async function escrowInit(params: {
  provider: string
  subscriber: string
  subscriberSecret: string
  amount: number
  unitPrice: number
  flatRate: number
  cycleEnd: number
  serviceName: string
}) {
  // Derive agent public key from AGENT_SECRET
  const agentPub = cli(`keys address ${SECRET}`).trim()

  const out = cli(
    `contract invoke --id ${ESCROW} --network testnet --source-account ${params.subscriberSecret} -- init` +
    ` --provider ${params.provider}` +
    ` --subscriber ${params.subscriber}` +
    ` --agent ${agentPub}` +
    ` --token_contract ${USDC_CONTRACT}` +
    ` --amount ${params.amount}` +
    ` --unit_price ${params.unitPrice}` +
    ` --flat_rate ${params.flatRate}` +
    ` --cycle_end ${params.cycleEnd}` +
    ` --service_name ${params.serviceName}`
  )
  return { ok: out.includes("successfully"), raw: out.slice(0, 200) }
}

export async function escrowRecordUsage(contractId: string, additional: number) {
  const out = cli(
    `contract invoke --id ${contractId || ESCROW} --network testnet --source-account ${SECRET} -- record_usage --additional ${additional}`
  )
  return { ok: out.includes("successfully"), raw: out.slice(0, 200) }
}

export async function escrowSettle(contractId: string) {
  const out = cli(
    `contract invoke --id ${contractId || ESCROW} --network testnet --source-account ${SECRET} -- settle`
  )
  return { ok: out.includes("successfully"), raw: out.slice(0, 200) }
}

export async function escrowGetData(contractId: string) {
  const out = cli(
    `contract invoke --id ${contractId || ESCROW} --network testnet --source-account ${SECRET} -- get_escrow`
  )
  try {
    return JSON.parse(out)
  } catch {
    return null
  }
}

export async function getBalance(publicKey: string): Promise<string> {
  try {
    const res = await fetch(`${HORIZON}/accounts/${publicKey}`)
    const data = await res.json()
    // Look for USDC trustline balance (Circle USDC on testnet)
    const usdc = data.balances?.find(
      (b: any) =>
        b.asset_code === "USDC" &&
        b.asset_issuer === "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
    )
    return usdc?.balance || "0"
  } catch {
    return "0"
  }
}

export async function fundTestnet(recipientPublicKey: string, recipientSecret?: string) {
  try {
    const {
      Keypair,
      Networks,
      TransactionBuilder,
      Asset,
      Operation,
      BASE_FEE,
      Horizon,
    } = await import("@stellar/stellar-sdk")

    const server = new Horizon.Server(HORIZON)
    const agentKeypair = Keypair.fromSecret(SECRET)
    const usdcAsset = new Asset(
      "USDC",
      "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
    )

    // Step 1: ensure recipient has a USDC trustline; create one if not
    const recipientAccountData = await server.loadAccount(recipientPublicKey)
    const hasTrustline = recipientAccountData.balances.some(
      (b: any) =>
        b.asset_code === "USDC" &&
        b.asset_issuer === "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
    )

    if (!hasTrustline && recipientSecret) {
      const recipientKeypair = Keypair.fromSecret(recipientSecret)
      const trustTx = new TransactionBuilder(recipientAccountData, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.changeTrust({ asset: usdcAsset, limit: "1000000" }))
        .setTimeout(30)
        .build()
      trustTx.sign(recipientKeypair)
      await server.submitTransaction(trustTx)
    }

    // Step 2: send 10 USDC from agent to recipient
    const agentAccount = await server.loadAccount(agentKeypair.publicKey())
    const payTx = new TransactionBuilder(agentAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: recipientPublicKey,
          asset: usdcAsset,
          amount: "10",
        })
      )
      .setTimeout(30)
      .build()
    payTx.sign(agentKeypair)
    await server.submitTransaction(payTx)

    return { ok: true }
  } catch (e: any) {
    const detail =
      e?.response?.data?.extras?.result_codes ||
      e?.message ||
      "unknown error"
    return { ok: false, error: typeof detail === "object" ? JSON.stringify(detail) : detail }
  }
}
