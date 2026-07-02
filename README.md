# Bun: Pay with Usage Credits

> Bun is usage-based subscription infrastructure for teams. Providers add **Pay with Bun**, customers authorize a capped spend, providers report usage through an API/SDK, and Bun handles escrow, crediting, settlement, and refunds.

**Pre-launch on Stellar Testnet**

---

## The Pitch

Subscriptions are broken for both sides.

Customers pay flat monthly fees even when they barely use a product. Providers either leave money on the table with generous flat plans or risk customer distrust with opaque usage billing. Bun gives both sides a cleaner contract:

- Customers approve a hard spending cap before using a service.
- Providers get guaranteed payment for metered usage.
- Unused funds stay with, or return to, the customer.
- Usage billing becomes a checkout/API integration instead of a custom billing system every team has to build from scratch.

Think **Stripe Checkout for usage-based subscriptions**, backed by Stellar Soroban escrow.

## What Bun Is

Bun is not a marketplace and does not provide the services itself.

Bun is the payment rail:

1. A provider integrates a **Pay with Bun** button or SDK.
2. A customer signs in and authorizes a maximum spend.
3. Bun creates a subscription/authorization record and attempts Soroban escrow.
4. The provider tracks usage inside its own app.
5. The provider reports metered usage to Bun.
6. Bun shows the customer usage, remaining cap, provider payout, and settlement state.

## Why Now

AI tools, API platforms, compute products, and creator apps are all moving toward usage-based pricing. But metered billing is painful to implement and easy to make unfair.

Bun turns usage billing into an integration layer:

- **For providers:** no need to build billing caps, usage ledgers, settlement logic, or refund accounting from scratch.
- **For customers:** every app gets a visible cap, usage trail, and unused-balance story.
- **For the protocol:** escrow and settlement can be enforced on-chain instead of by platform policy.

## Demo Flow

The testnet build includes a neutral merchant fixture called **Sandbox AI**. It is not a real product; it is a reference merchant showing how any provider would integrate Bun.

```
1. Visit /
2. Launch the Bun app
3. Sign in with Privy email OTP
4. Request faucet funds on /account
5. Open /merchant/sandbox
6. Click "Pay with Bun"
7. Authorize a capped spend in hosted checkout
8. Return to Sandbox AI
9. Click a provider-side usage action such as "Code review"
10. View the resulting subscription, usage, and settlement records in Bun
```

In a real integration, the customer would not manually type or report usage. The provider app tracks usage internally and calls Bun’s usage API.

## What Is Real vs Fixture

| Area | Status |
|------|--------|
| Privy login | Real email OTP auth |
| Bun session | Real httpOnly app session |
| Faucet flow | Implemented testnet funding request |
| Hosted checkout | Real `/checkout` authorization UI |
| Provider API | Real `POST /api/bun/v1/usage` endpoint |
| Subscriptions dashboard | Real persisted records in MongoDB |
| Usage dashboard | Real persisted usage events |
| Settlement dashboard | Real payout/refund accounting view |
| Sandbox AI merchant | Fixture/reference app |
| Sandbox AI usage engine | Simulated provider-side actions |
| Soroban escrow | Contract path implemented; live success depends on testnet env, funding, deployed contract, and `/tmp/stellar` config |
| ZK verifier | SHA256 commit-reveal prototype |

## Integration Surface

Provider-facing routes:

- `/checkout` - hosted Pay with Bun authorization page
- `/docs` - integration docs
- `/merchant/sandbox` - reference merchant fixture

Provider-facing API:

- `POST /api/bun/v1/authorizations` - create a customer authorization and subscription record
- `POST /api/bun/v1/usage` - record metered usage against a subscription
- `GET /api/bun/v1/subscriptions` - list the authenticated customer’s subscriptions

## SDK Integration

During testnet development, teams can install the SDK directly from this repo into another app:

```bash
npm install ../Bun/packages/sdk
```

Once published, the intended install path is:

```bash
npm install @bun-protocol/sdk
```

### Register a provider API key

Bun admins issue provider keys out-of-band. The provider stores the raw key server-side. Bun stores only a SHA256 hash and callback allowlist in `BUN_PROVIDERS`.

Example:

```json
[
  {
    "id": "acme-ai",
    "name": "Acme AI",
    "apiKeyHash": "sha256-hash-of-provider-key",
    "allowedCallbackUrls": ["https://acme.example/bun/callback"]
  }
]
```

Create a provider client:

```ts
import { BunProviderClient } from "@bun-protocol/sdk"

const bun = new BunProviderClient({
  baseUrl: process.env.BUN_BASE_URL!,
  apiKey: process.env.BUN_PROVIDER_API_KEY,
})
```

Send the customer to Bun Checkout:

```ts
const checkout = bun.checkoutUrl({
  providerId: "your-provider-id",
  appName: "Your App",
  providerName: "Your Team",
  unitName: "token",
  unitPrice: "0.002",
  maxSpend: "5",
  callbackUrl: "https://provider.example/bun/callback",
})

window.location.href = checkout.toString()
```

After checkout, the provider stores the returned `bun_subscription_id` and reports usage:

```ts
await bun.recordUsage({
  subscriptionId: customer.bunSubscriptionId,
  providerId: "your-provider-id",
  quantity: 420,
  idempotencyKey: "usage-event-123",
})
```

The customer never reports usage manually. Your app tracks product usage internally and reports metered events from your backend.

## How It Works

```
 Provider app       Bun             Stellar/Soroban
 ┌───────────┐   ┌───────────┐      ┌──────────────┐
 │ Pay with  │──►│ Authorize │─────►│ Escrow cap   │
 │ Bun button│   │ max spend │      │ on Soroban   │
 └───────────┘   └─────┬─────┘      └──────────────┘
                       │
 Provider SDK/API ─────▼─────► Record usage ──► Settle credits
```

## Anti-Scam by Design

| Concern | Bun’s answer |
|---------|--------------|
| Customer uses a service then refuses to pay | Funds are escrowed or authorized before usage begins |
| Provider overcharges | Customer-approved `maxSpend` caps liability |
| Provider sees the customer’s other services | Provider only sees its own authorization and usage scope |
| Agent steals funds | Agent can only trigger settlement, not arbitrarily move escrow |
| Usage is under-reported | Provider owns metering and reports usage events |

## Privacy

The current ZK verifier is a SHA256 commit-reveal prototype:

1. Customer commits `sha256(balance + salt)`.
2. At verification time, the preimage can prove the committed balance meets a required minimum.
3. This keeps the demo simple while preserving the direction toward private balance checks.

Future privacy work can upgrade this to stronger ZK proofs if Bun needs private cross-provider balances at production scale.

## Tech Stack

| Layer | Tech | Purpose |
|-------|------|---------|
| Smart contracts | Soroban, Rust, WASM | Escrow, usage, settlement, ZK verifier |
| Frontend | Next.js 16 App Router, Tailwind | Checkout, dashboards, docs, merchant fixture |
| SDK | `packages/sdk` TypeScript client | Checkout URL builder, provider usage calls |
| Auth | Privy email OTP + httpOnly Bun cookies | Customer identity and protected app session |
| Database | MongoDB Atlas | Accounts, subscriptions, usage events |
| Agent | Vercel serverless TypeScript | Settlement trigger |
| Network | Stellar Testnet | Testnet escrow and settlement |

## Smart Contracts

| Contract | Testnet Address | Purpose |
|----------|----------------|---------|
| `EscrowContract` | `CCCYTFPBLSIM23DM3W5V6Q6RKFUBNTYKD3SZO22565NAMR54XYVRZK6F` | Holds escrow data, tracks usage, settles payments |
| `ZkVerifierContract` | `CCOBSM6WIWEJWF3PTB5TUUAF22UIE7DZB67F7XO27ARG5FHVWMVRXKXF` | SHA256 commit-reveal balance verification |

Escrow API:

- `init(provider, subscriber, agent, amount, unit_price, flat_rate, cycle_end, service_name)`
- `record_usage(additional)`
- `settle()`
- `get_escrow()`

ZK verifier API:

- `commit_balance(subscriber, balance_hash)`
- `verify(preimage, required_minimum)`

## Why Bun Wins

- **Clear buyer pain:** flat subscriptions charge for access instead of actual use.
- **Clear provider value:** teams can add usage billing without rebuilding caps, ledgers, and settlement.
- **Trust by construction:** customer caps and escrow reduce billing disputes.
- **Composable distribution:** any app can integrate Bun as a payment method.
- **Strong demo path:** the Sandbox AI fixture proves the exact integration loop end to end.
- **Crypto with purpose:** Stellar is used for escrow/settlement guarantees, not as decoration.

## Future Goals

- Publish a provider SDK for `createAuthorization`, `recordUsage`, `settle`, and webhook verification.
- Add hosted provider dashboards, API keys, webhooks, rate limits, and audit logs.
- Complete live USDC escrow transfers and end-to-end settlement hardening.
- Add stronger production-grade privacy proofs.
- Support real provider onboarding beyond the Sandbox AI fixture.
- Add provider-side usage adapters for AI tokens, API calls, compute minutes, streams, and jobs.

## Getting Started

```bash
# Contracts
cargo test
stellar contract build
stellar contract deploy --wasm escrow.wasm --network testnet

# Frontend
cd apps/web
npm install
npm run dev
```

Configure the environment variables below for the full testnet flow.

## Environment Variables

```
STELLAR_RPC=https://soroban-testnet.stellar.org
STELLAR_HORIZON=https://horizon-testnet.stellar.org
AGENT_SECRET=             # Stellar secret key
NEXT_PUBLIC_PRIVY_APP_ID= # Privy App ID
PRIVY_APP_SECRET=         # Privy App Secret
PRIVY_JWKS_URL=           # Privy JWKS URL for token verification
MONGODB_URI=              # MongoDB connection
ESCROW_CONTRACT_ID=       # Deployed escrow contract
ZK_VERIFIER_CONTRACT_ID=  # Deployed ZK verifier contract
USDC_CONTRACT_ID=         # Circle USDC Token Contract
BUN_PROVIDER_API_KEY=     # Optional provider metering API key
BUN_PROVIDERS=            # JSON provider registry with API key hashes and callback allowlists
```

## Architecture

```
apps/web/          - Next.js frontend, checkout, dashboards, docs
api/               - Vercel serverless functions, agent, ZK helpers
contracts/         - Soroban smart contracts
packages/sdk/      - Provider TypeScript SDK
packages/shared/   - Shared TypeScript types
```

---

Built on Stellar Soroban. Pre-launch testnet phase - June 2026.
