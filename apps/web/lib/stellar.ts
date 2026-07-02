import * as StellarSdk from "@stellar/stellar-sdk"

const RPC = process.env.STELLAR_RPC || "https://soroban-testnet.stellar.org"
const HORIZON = process.env.STELLAR_HORIZON || "https://horizon-testnet.stellar.org"
const SECRET = process.env.AGENT_SECRET || ""
export const ESCROW_CONTRACT_ID = requireEnv("ESCROW_CONTRACT_ID")
export const ZK_VERIFIER_CONTRACT_ID = requireEnv("ZK_VERIFIER_CONTRACT_ID")
const USDC_CONTRACT = requireEnv("USDC_CONTRACT_ID")

const rpc = new StellarSdk.rpc.Server(RPC)
const horizon = new StellarSdk.Horizon.Server(HORIZON)
const networkPassphrase = StellarSdk.Networks.TESTNET

function requireEnv(key: string): string {
  const v = process.env[key]
  if (!v) throw new Error(`Missing required env var: ${key}`)
  return v
}

export const CYCLE_SECONDS = Number(process.env.CYCLE_SECONDS || 900)

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

/**
 * Submits a Soroban transaction safely bypassing the need for a CLI.
 * Follows the simulate -> assemble -> sign -> send -> poll pattern.
 */
async function submitSorobanTransaction(
  sourceSecret: string,
  contractId: string,
  method: string,
  args: StellarSdk.xdr.ScVal[]
) {
  const keypair = StellarSdk.Keypair.fromSecret(sourceSecret)
  const account = await rpc.getAccount(keypair.publicKey())
  const contract = new StellarSdk.Contract(contractId)

  let tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(180)
    .build()

  const sim = await rpc.simulateTransaction(tx)
  if (StellarSdk.rpc.Api.isSimulationError(sim)) {
    return { ok: false, raw: `Simulation failed: ${sim.error}` }
  }

  tx = StellarSdk.rpc.assembleTransaction(tx, sim).build()
  tx.sign(keypair)

  const res = await rpc.sendTransaction(tx)
  if (res.status === "ERROR") {
    return { ok: false, raw: `Transaction failed: ${res.errorResult}` }
  }

  let getResponse = await rpc.getTransaction(res.hash)
  while (getResponse.status === "NOT_FOUND") {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    getResponse = await rpc.getTransaction(res.hash)
  }

  if (getResponse.status === "SUCCESS") {
    return { ok: true, raw: res.hash }
  }
  return { ok: false, raw: `Transaction failed: ${getResponse.status}` }
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

  // Convert Groth16 proof arrays into flat hex strings
  const aHex = formatG1(proof.pi_a);
  const bHex = formatG2(proof.pi_b);
  const cHex = formatG1(proof.pi_c);

  // Construct the ScVal for `Proof`
  // pub struct Proof { pub a: G1Affine, pub b: G2Affine, pub c: G1Affine }
  // Soroban maps are sorted alphabetically by key
  const proofScVal = StellarSdk.xdr.ScVal.scvMap([
    new StellarSdk.xdr.ScMapEntry({
      key: StellarSdk.nativeToScVal("a", { type: "symbol" }),
      val: StellarSdk.nativeToScVal(Buffer.from(aHex, "hex"))
    }),
    new StellarSdk.xdr.ScMapEntry({
      key: StellarSdk.nativeToScVal("b", { type: "symbol" }),
      val: StellarSdk.nativeToScVal(Buffer.from(bHex, "hex"))
    }),
    new StellarSdk.xdr.ScMapEntry({
      key: StellarSdk.nativeToScVal("c", { type: "symbol" }),
      val: StellarSdk.nativeToScVal(Buffer.from(cHex, "hex"))
    })
  ]);

  const pubSignalsScVals = publicSignals.map((s: string) => {
    return StellarSdk.nativeToScVal(BigInt(s), { type: "u256" });
  });
  const pubSignalsScVal = StellarSdk.xdr.ScVal.scvVec(pubSignalsScVals);

  return submitSorobanTransaction(
    params.subscriberSecret,
    ZK_VERIFIER_CONTRACT_ID,
    "verify_proof",
    [
      new StellarSdk.Address(params.subscriber).toScVal(),
      proofScVal,
      pubSignalsScVal
    ]
  );
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
  const agentKeypair = StellarSdk.Keypair.fromSecret(SECRET)
  
  return submitSorobanTransaction(
    params.subscriberSecret,
    ESCROW_CONTRACT_ID,
    "init",
    [
      new StellarSdk.Address(params.provider).toScVal(),
      new StellarSdk.Address(params.subscriber).toScVal(),
      new StellarSdk.Address(agentKeypair.publicKey()).toScVal(),
      new StellarSdk.Address(USDC_CONTRACT).toScVal(),
      StellarSdk.nativeToScVal(BigInt(params.amount), { type: "i128" }),
      StellarSdk.nativeToScVal(BigInt(params.unitPrice), { type: "i128" }),
      StellarSdk.nativeToScVal(BigInt(params.flatRate), { type: "i128" }),
      StellarSdk.nativeToScVal(BigInt(params.cycleEnd), { type: "u64" }),
      StellarSdk.nativeToScVal(params.serviceName, { type: "symbol" })
    ]
  )
}

export async function escrowRecordUsage(
  contractId: string,
  subscriber: string,
  serviceName: string,
  additional: number
) {
  return submitSorobanTransaction(
    SECRET, // The agent signs record_usage
    contractId || ESCROW_CONTRACT_ID,
    "record_usage",
    [
      new StellarSdk.Address(subscriber).toScVal(),
      StellarSdk.nativeToScVal(serviceName, { type: "symbol" }),
      StellarSdk.nativeToScVal(BigInt(additional), { type: "i128" })
    ]
  )
}

export async function escrowSettle(
  contractId: string,
  subscriber: string,
  serviceName: string
) {
  return submitSorobanTransaction(
    SECRET, // The agent signs settle
    contractId || ESCROW_CONTRACT_ID,
    "settle",
    [
      new StellarSdk.Address(subscriber).toScVal(),
      StellarSdk.nativeToScVal(serviceName, { type: "symbol" })
    ]
  )
}

export async function escrowGetData(
  contractId: string,
  subscriber: string,
  serviceName: string
) {
  const contract = new StellarSdk.Contract(contractId || ESCROW_CONTRACT_ID)
  
  let tx = new StellarSdk.TransactionBuilder(await rpc.getAccount(StellarSdk.Keypair.fromSecret(SECRET).publicKey()), {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      contract.call(
        "get_escrow",
        new StellarSdk.Address(subscriber).toScVal(),
        StellarSdk.nativeToScVal(serviceName, { type: "symbol" })
      )
    )
    .setTimeout(180)
    .build()

  const sim = await rpc.simulateTransaction(tx)
  if (StellarSdk.rpc.Api.isSimulationError(sim)) {
    return { raw: `Simulation failed: ${sim.error}` }
  }
  
  if (StellarSdk.rpc.Api.isSimulationSuccess(sim) && sim.result?.retval) {
    return StellarSdk.scValToNative(sim.result.retval)
  }
  
  return { raw: "Simulation did not succeed" }
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
    } = await import("@stellar/stellar-sdk")

    const agentKeypair = Keypair.fromSecret(SECRET)
    const usdcAsset = new Asset(
      "USDC",
      "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
    )

    const recipientAccountData = await horizon.loadAccount(recipientPublicKey)
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
      await horizon.submitTransaction(trustTx)
    }

    const agentAccount = await horizon.loadAccount(agentKeypair.publicKey())
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
    await horizon.submitTransaction(payTx)

    return { ok: true }
  } catch (e: any) {
    const detail =
      e?.response?.data?.extras?.result_codes ||
      e?.message ||
      "unknown error"
    return { ok: false, error: typeof detail === "object" ? JSON.stringify(detail) : detail }
  }
}
