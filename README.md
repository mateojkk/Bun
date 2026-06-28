# Bun: Pay Only for What You Use

> A privacy-preserving, usage-based payment protocol built on Stellar Soroban.

**Pre-Launch - Stellar Testnet · Seeking Mainnet Funding**

---

## The Problem

Every month, you pay $15.99 for Netflix, $20 for Claude, $11.99 for Spotify - regardless of whether you used them twice or every day. The subscription economy charges you for access, not usage. And every provider learns your consumption patterns.

**Bun fixes both.** You pay only for what you actually consume. And your data stays fragmented across providers - enforced cryptographically, not by policy.

## How It Works

```
     ┌──────────┐       ┌──────────┐       ┌──────────┐
     │  Top Up  │  ───► │Subscribe │  ───► │   Use    │
     │ Bun Acct │       │ (escrow) │       │ (track)  │
     └──────────┘       └──────────┘       └──────────┘
                                               │
                                          ┌────▼────┐
                                          │  Settle  │
                                          │ (agent)  │
                                          └──────────┘
```

1. **Top up** your Bun account with USDC
2. **Subscribe** to a service - your max spend is locked in an escrow contract
3. **Use** the service - the provider reports your usage
4. **Auto-settle** - an agent settles payments at cycle end. Used funds go to the provider, unused funds return to you.

## Anti-Scam by Design

| Concern | How Bun Handles It |
|---------|--------------------|
| Subscriber uses service then refuses to pay | Funds already escrowed at subscription time |
| Provider overcharges | Capped at `maxSpend` set by subscriber |
| Agent steals funds | Agent can only call `settle()` - never access escrow |
| Provider sees subscriber's other services | Canton-grade privacy via ZK on Stellar |
| Subscriber under-reports usage | Provider (or oracle) controls `RecordUsage` |

**Funds are locked in a Soroban escrow contract before usage begins.** Settlement is automatic - no approval step, no dispute, no scam.

## Privacy via ZK (BLS12-381)

Stellar is a public ledger. Privacy comes from cryptographic commitments:

1. Subscriber commits `sha256(balance + salt)` to the ZK Verifier contract
2. Provider sees only the escrow amount - never the subscriber's total balance
3. At settlement, the subscriber reveals the preimage; the contract verifies `balance ≥ required`
4. Provider receives payment but never learns the subscriber's full financial picture

All verification runs natively on Soroban using BLS12-381 curves. No external prover needed.

## Tech Stack

| Layer | Tech | Purpose |
|-------|------|---------|
| Smart Contracts | **Soroban** (Rust + WASM) | Escrow, ZK Verifier |
| Frontend | Next.js 16 (Turbopack) + Tailwind | Dashboard, subscriptions, settlements |
| Auth | Privy (email OTP) | Passwordless sign-in |
| Agent | Vercel serverless (TypeScript) | Auto-settlement at cycle end |
| Database | MongoDB Atlas | User identity mapping |
| Network | Stellar Testnet | 5-second finality |

## Smart Contracts

| Contract | Testnet Address | Purpose |
|----------|----------------|---------|
| `EscrowContract` | `CCCYTFPBLSIM23DM3W5V6Q6RKFUBNTYKD3SZO22565NAMR54XYVRZK6F` | Holds escrow, tracks usage, settles payments |
| `ZkVerifierContract` | `CCOBSM6WIWEJWF3PTB5TUUAF22UIE7DZB67F7XO27ARG5FHVWMVRXKXF` | BLS12-381 commit-reveal balance verification |

**Escrow Contract API:**
- `init(provider, subscriber, agent, amount, unit_price, flat_rate, cycle_end, service_name)` - create escrow
- `record_usage(additional)` - provider reports usage
- `settle()` - agent settles at cycle end
- `get_escrow()` - read escrow state

**ZK Verifier API:**
- `commit_balance(subscriber, balance_hash)` - subscriber commits to balance
- `verify(preimage, required_minimum)` - verifies preimage + minimum balance

## Demo Flow

```
1. Visit / → landing page
2. Click "Launch App" → sign in with email (Privy OTP)
3. First login: choose username → BunAccount created on Stellar
4. Dashboard: see balance (0 USDC)
5. Account page: Top Up with testnet USDC
6. Browse Services → Subscribe (funds escrowed)
7. Record Usage (provider reports consumption)
8. Agent auto-settles at cycle end
9. Settlements page: view payment history
10. Unused escrow automatically returned
```

## Why Bun Wins

- Bun solves a **real economic problem**: the subscription economy charges consumers for access, not usage.
- The protocol is **anti-scam by design**: escrow is enforced on-chain by Soroban, not by policy or trust.
- **Privacy is preserved on a public ledger** through ZK balance commitments natively on Soroban.
- Settlement is **fully automated**: the agent handles cycle-end payments with zero manual intervention.
- The UX is **production-ready**: dark mode, responsive design, passwordless auth, with no blockchain complexity exposed to users.
- Transactions confirm in **under 5 seconds** on Stellar.
- The architecture is **mainnet-ready**: built to production specifications, currently running on testnet for staged rollout.

## Getting Started

```bash
# Contracts
cargo test
stellar contract build
stellar contract deploy --wasm escrow.wasm --network testnet

# Frontend
cd apps/web
npm install
cp ../.env.example ../.env.local  # fill in env vars
npm run dev
```

## Environment Variables

```
STELLAR_RPC=https://soroban-testnet.stellar.org
STELLAR_HORIZON=https://horizon-testnet.stellar.org
AGENT_SECRET=            # Stellar secret key
NEXT_PUBLIC_PRIVY_APP_ID= # Privy App ID
PRIVY_APP_SECRET=         # Privy App Secret
PRIVY_JWKS_URL=           # Privy JWKS URL for token verification
MONGODB_URI=              # MongoDB connection
ESCROW_CONTRACT_ID=       # Deployed escrow contract
ZK_VERIFIER_CONTRACT_ID=  # Deployed ZK verifier contract
USDC_CONTRACT_ID=         # Circle USDC Token Contract
```

## Architecture

```
apps/web/          - Next.js 16 frontend (App Router, Turbopack)
api/               - Vercel serverless functions (agent, ZK proofs, Stellar RPC)
contracts/         - Soroban smart contracts (Rust + WASM)
packages/shared/   - TypeScript types
```

---

Built on Stellar Soroban. Pre-launch testnet phase - June 2026. Seeking mainnet funding.
