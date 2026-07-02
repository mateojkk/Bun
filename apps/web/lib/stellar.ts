import { execSync } from "child_process"
import fs from "fs"

const CLI = "/tmp/stellar"
const RPC = process.env.STELLAR_RPC || "https://soroban-testnet.stellar.org"
const HORIZON = process.env.STELLAR_HORIZON || "https://horizon-testnet.stellar.org"
const SECRET = process.env.AGENT_SECRET || ""
export const ESCROW_CONTRACT_ID = requireEnv("ESCROW_CONTRACT_ID")
export const ZK_VERIFIER_CONTRACT_ID = requireEnv("ZK_VERIFIER_CONTRACT_ID")
const ESCROW = ESCROW_CONTRACT_ID
const ZK = ZK_VERIFIER_CONTRACT_ID
const USDC_CONTRACT = requireEnv("USDC_CONTRACT_ID")

function requireEnv(key: string): string {
  const v = process.env[key]
  if (!v) throw new Error(`Missing required env var: ${key}`)
  return v
}

/** Billing cycle duration in seconds; defaults to 900 (15 min) */
export const CYCLE_SECONDS = Number(process.env.CYCLE_SECONDS || 900)

function ensureCli() {
  if (fs.existsSync(CLI)) return;
  try {
    execSync(`curl -sL https://github.com/stellar/stellar-cli/releases/download/v22.0.1/stellar-cli-22.0.1-x86_64-unknown-linux-gnu.tar.gz | tar -xz -C /tmp && chmod +x /tmp/stellar`, {
      timeout: 60000,
      stdio: "pipe"
    });
  } catch (e: any) {
    console.error("Failed to download stellar CLI:", e?.stderr?.toString() || e?.message);
    throw new Error("Could not install stellar-cli: " + (e?.stderr?.toString() || e?.message));
  }
}

function cli(args: string): string {
  ensureCli();
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

function toHex48(decimalStr: string) {
  let hex = BigInt(decimalStr).toString(16);
  if (hex.length > 96) throw new Error("Value too large for 48 bytes");
  return hex.padStart(96, '0');
}

function formatG1(point: string[]) {
  return toHex48(point[0]) + toHex48(point[1]);
}

function formatG2(point: string[][]) {
  return toHex48(point[0][0]) + toHex48(point[0][1]) + toHex48(point[1][0]) + toHex48(point[1][1]);
}

export async function zkVerifyBalance(params: {
  subscriber: string
  subscriberSecret: string
  currentBalanceStroops: number | bigint
  requiredMinimumStroops: number | bigint
}) {
  const snarkjs = require("snarkjs");
  const path = require("path");

  const input = {
    balance: params.currentBalanceStroops.toString(),
    required_minimum: params.requiredMinimumStroops.toString()
  };

  const wasmPath = path.join(process.cwd(), "public", "zk_assets", "balance.wasm");
  const zkeyPath = path.join(process.cwd(), "public", "zk_assets", "balance.zkey");

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);

  const proofJson = JSON.stringify({
    a: formatG1(proof.pi_a),
    b: formatG2(proof.pi_b),
    c: formatG1(proof.pi_c)
  });

  const pubSignalsJson = JSON.stringify(publicSignals.map((s: string) => {
    let hex = BigInt(s).toString(16);
    return hex.padStart(64, '0');
  }));

  const out = cli(
    `contract invoke --id ${ZK} --network testnet --source-account ${params.subscriberSecret} -- verify_proof` +
    ` --subscriber ${params.subscriber}` +
    ` --proof '${proofJson}'` +
    ` --pub_signals '${pubSignalsJson}'`
  );

  const lowered = out.toLowerCase()
  const ok =
    lowered.includes("true") ||
    (out.includes("successfully") && !lowered.includes("false"))
  return { ok, raw: out.slice(0, 200) }
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

export async function escrowRecordUsage(
  contractId: string,
  subscriber: string,
  serviceName: string,
  additional: number
) {
  const out = cli(
    `contract invoke --id ${contractId || ESCROW} --network testnet --source-account ${SECRET} -- record_usage` +
    ` --subscriber ${subscriber}` +
    ` --service_name ${serviceName}` +
    ` --additional ${additional}`
  )
  return { ok: out.includes("successfully"), raw: out.slice(0, 200) }
}

export async function escrowSettle(
  contractId: string,
  subscriber: string,
  serviceName: string
) {
  const out = cli(
    `contract invoke --id ${contractId || ESCROW} --network testnet --source-account ${SECRET} -- settle` +
    ` --subscriber ${subscriber}` +
    ` --service_name ${serviceName}`
  )
  return { ok: out.includes("successfully"), raw: out.slice(0, 200) }
}

export async function escrowGetData(
  contractId: string,
  subscriber: string,
  serviceName: string
) {
  const out = cli(
    `contract invoke --id ${contractId || ESCROW} --network testnet --source-account ${SECRET} -- get_escrow` +
    ` --subscriber ${subscriber}` +
    ` --service_name ${serviceName}`
  )
  try {
    return JSON.parse(out)
  } catch {
    return { raw: out.slice(0, 400) }
  }
}

export async function getBalance(publicKey: string): Promise<string> {
  try {
    const res = await fetch(`${HORIZON}/accounts/${publicKey}`, { cache: "no-store" })
    const data = await res.json()
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

    const agentAccount = await server.loadAccount(agentKeypair.publicKey())
    const payTx = new TransactionBuilder(agentAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: recipientPublicKey,
          asset: usdcAsset,
          amount: "2.5",
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
