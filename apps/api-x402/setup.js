import fs from "fs/promises";
import {
  Keypair, Horizon, Networks, TransactionBuilder, Operation, Asset, BASE_FEE,
} from "@stellar/stellar-sdk";

// Circle's classic USDC issuer on Stellar testnet
const USDC_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");

const friendbot = (addr) => fetch(`https://friendbot.stellar.org?addr=${addr}`);

async function addTrustline(kp) {
  const acc = await horizon.loadAccount(kp.publicKey());
  const tx = new TransactionBuilder(acc, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
    .addOperation(Operation.changeTrust({ asset: new Asset("USDC", USDC_ISSUER) }))
    .setTimeout(60).build();
  tx.sign(kp);
  return horizon.submitTransaction(tx);
}

console.log("Generating keys and funding with testnet XLM...");
const recipient = Keypair.random();
const payer = Keypair.random();

await Promise.all([friendbot(recipient.publicKey()), friendbot(payer.publicKey())]);
await new Promise(r => setTimeout(r, 2000));

console.log("Adding USDC trustlines...");
await Promise.all([addTrustline(recipient), addTrustline(payer)]);

const envContent = `STELLAR_NETWORK=stellar:testnet
STELLAR_RECIPIENT=${recipient.publicKey()}
STELLAR_SECRET_KEY=${payer.secret()}
OZ_API_KEY=
FACILITATOR_URL=https://channels.openzeppelin.com/x402/testnet
`;

await fs.writeFile(".env", envContent);

console.log("\n✅ Setup complete! Created .env file.");
console.log("\n=======================================================");
console.log("1. IMPORTANT: Your payer needs testnet USDC to make payments.");
console.log(`   Go to: https://faucet.circle.com`);
console.log(`   Select 'Stellar' and paste this address: ${payer.publicKey()}`);
console.log("-------------------------------------------------------");
console.log("2. IMPORTANT: You need an OpenZeppelin API Key.");
console.log(`   Go to: https://channels.openzeppelin.com/testnet/gen`);
console.log(`   Paste the generated key into OZ_API_KEY in apps/api-x402/.env`);
console.log("=======================================================\n");
