import "dotenv/config";
import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { createEd25519Signer } from "@x402/stellar";
import { ExactStellarScheme } from "@x402/stellar/exact/client";

const NETWORK = process.env.STELLAR_NETWORK || "stellar:testnet";

if (!process.env.STELLAR_SECRET_KEY) {
  console.error("STELLAR_SECRET_KEY is required in .env");
  process.exit(1);
}

// createEd25519Signer handles Keypair wrapping and network passphrase internally
const signer = createEd25519Signer(process.env.STELLAR_SECRET_KEY, NETWORK);

const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
  schemes: [{ network: NETWORK, client: new ExactStellarScheme(signer) }],
});

console.log("🤖 Agent initiating request to Premium API...");
console.log("🤖 If a 402 is returned, the agent will automatically sign the micro-payment in the background.");

try {
  const res = await fetchWithPayment("http://localhost:3001/agent-data");
  const data = await res.json();
  
  console.log("✅ Request successful! Received data:");
  console.dir(data, { depth: null, colors: true });
} catch (error) {
  console.error("❌ Request failed:", error.message);
  if (error.response) {
    const text = await error.response.text();
    console.error("Response:", text);
  }
}
