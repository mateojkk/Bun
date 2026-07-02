import "dotenv/config";
import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactStellarScheme } from "@x402/stellar/exact/server";

const NETWORK = process.env.STELLAR_NETWORK || "stellar:testnet";

if (!process.env.OZ_API_KEY) {
  console.error("OZ_API_KEY is required. Generate one at https://channels.openzeppelin.com/testnet/gen");
  process.exit(1);
}

const facilitator = new HTTPFacilitatorClient({
  url: process.env.FACILITATOR_URL ?? "https://channels.openzeppelin.com/x402/testnet",
  createAuthHeaders: async () => {
    const h = { Authorization: `Bearer ${process.env.OZ_API_KEY}` };
    return { verify: h, settle: h, supported: h };
  },
});

const resourceServer = new x402ResourceServer(facilitator)
  .register(NETWORK, new ExactStellarScheme());

const app = express();

app.use(
  paymentMiddleware(
    {
      "GET /agent-data": {
        accepts: {
          scheme: "exact",
          price: "$0.001", // auto-converts to 7-decimal USDC units
          network: NETWORK,
          payTo: process.env.STELLAR_RECIPIENT, // G... account from setup.js
        },
        description: "Premium API data for AI agents",
      },
    },
    resourceServer
  )
);

app.get("/agent-data", (_req, res) => {
  res.json({
    status: "success",
    message: "This data was purchased successfully by an AI agent using x402 micro-payments on Stellar!",
    timestamp: new Date().toISOString()
  });
});

app.listen(3001, () => {
  console.log(`x402 agent server running on http://localhost:3001 (${NETWORK})`);
  console.log(`Requires payment of $0.001 USDC to access /agent-data`);
});
