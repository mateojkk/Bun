# @bun-protocol/sdk

Provider SDK for integrating Pay with Bun checkout and usage metering.

```ts
import { BunProviderClient } from "@bun-protocol/sdk"

const bun = new BunProviderClient({
  baseUrl: "https://your-bun-deployment.vercel.app",
  apiKey: process.env.BUN_PROVIDER_API_KEY,
})

const checkoutUrl = bun.checkoutUrl({
  providerId: "acme-ai",
  appName: "Acme AI",
  providerName: "Acme Labs",
  unitName: "token",
  unitPrice: "0.002",
  maxSpend: "5",
  callbackUrl: "https://acme.example/bun/callback",
})

await bun.recordUsage({
  providerId: "acme-ai",
  subscriptionId: "bun_subscription_id",
  quantity: 420,
  idempotencyKey: "usage-event-123",
})
```
