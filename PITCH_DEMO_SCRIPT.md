# Bun — Pitch + Demo Script (2-in-1)

**Total runtime:** ~4:00  
**Format:** Talk over live app — production flow, not a shortcut demo  
**One-liner:** Bun is the next-gen PSP for usage-based products — ZK-verified caps, Pay with Bun checkout, Soroban escrow on Stellar.

---

## Pre-demo checklist

- [ ] `MONGODB_URI`, Privy vars, `AGENT_SECRET`, `ZK_VERIFIER_CONTRACT_ID`, `ESCROW_CONTRACT_ID` set
- [ ] `/tmp/stellar` CLI configured for testnet; agent wallet funded (USDC + XLM)
- [ ] Fresh browser / logged out
- [ ] `npm run dev` running

---

## Production demo flow (exact order)

```
Login → Fund USDC → Commit ZK balance → Sandbox AI → Pay with Bun → Authorize cap
→ Code review (usage) → Subscriptions → Usage → Settlements
```

---

## ACT 1 — PITCH (0:00 – 0:45)

**Screen:** `/`

| Time | Say |
|------|-----|
| 0:00 | "Flat subscriptions fail for AI and APIs. Customers overpay. Providers rebuild billing from scratch." |
| 0:12 | "**Bun is the next-gen payment service provider.** Any app adds Pay with Bun. Customers authorize a cap. Providers meter usage. Soroban escrow settles on Stellar." |
| 0:28 | "Privacy matters: providers never see wallet balances. Bun verifies solvency with a ZK commitment on-chain before escrow." |
| 0:40 | Click **Try the merchant flow** — "Here's the production path." |

---

## ACT 2 — CUSTOMER SETUP (0:45 – 1:40)

**Screen:** Login → Dashboard → Account

| Time | Action | Say |
|------|--------|-----|
| 0:45 | `/login` — email OTP | "Privy auth. Bun provisions a Stellar account." |
| 1:00 | `/dashboard` | "Customer dashboard — caps and usage across every integrated app." |
| 1:08 | **Account** | "Step one: fund USDC." |
| 1:12 | **Get 2.5 USDC** | "Testnet USDC. Production: deposit or connect wallet." |
| 1:22 | **Commit private balance** | "Step two — **required in production**. Customer commits sha256(balance + salt) to the ZK verifier contract. Providers never see the balance." |
| 1:35 | Success message | "On-chain commitment confirmed. Now they can authorize spend caps." |

---

## ACT 3 — PROVIDER CHECKOUT (1:40 – 2:50)

**Screen:** Sandbox AI → Checkout → Sandbox

| Time | Action | Say |
|------|--------|-----|
| 1:40 | `/merchant/sandbox` | "Sandbox AI is any provider integrating Bun as their PSP." |
| 1:48 | **Pay with Bun** | "Hosted checkout — same as Stripe Checkout redirect." |
| 1:53 | `/checkout` | "Customer sets a cap. Bun verifies the ZK proof on Soroban — solvency without revealing balance — then escrows USDC." |
| 2:02 | **Authorize 2 USDC** | "One authorization. One escrow. Provider gets a subscription id in the callback." |
| 2:12 | Back to Sandbox | "Provider stores `bun_subscription_id`. They only see their scope — not other apps." |
| 2:20 | **Code review** (420 tokens) | "Provider meters internally, reports usage to Bun with an idempotency key." |
| 2:30 | Success (0.84 USDC) | "Bun debits the cap. Escrow records usage on-chain. Fair billing — not a flat fee." |

---

## ACT 4 — PSP LEDGER (2:50 – 3:30)

| Time | Screen | Say |
|------|--------|-----|
| 2:50 | `/subscriptions` | "Customer transparency — cap, used, remaining." |
| 2:58 | `/usage` | "Audit trail of provider-reported events." |
| 3:05 | `/settlements` | "Provider payout + unused cap. Agent settles on Soroban at cycle end." |
| 3:12 | Stellar Expert (optional) | "Escrow + ZK contracts on testnet." |
| 3:18 | `/docs` | "Providers integrate in four steps: SDK, API key, checkout, usage API." |

---

## ACT 5 — CLOSE (3:30 – 4:00)

| Say |
|-----|
| "**Bun is the PSP for usage-based products.** ZK-verified solvency. Hosted checkout. Metered API. Soroban escrow. Any app integrates in an afternoon." |

---

## 30-second elevator pitch

> Bun is the next-gen PSP for usage-based billing. Providers add Pay with Bun. Customers commit a private balance proof, authorize a cap, and providers report metered usage. Bun handles checkout, ledger, ZK verification, and Soroban escrow settlement on Stellar. We're the rail — not the product.

---

## If something breaks

| Issue | Say |
|-------|-----|
| ZK commit fails | "Needs stellar CLI + deployed ZK verifier on testnet — commitment step is required before checkout, same as prod." |
| Checkout blocked | "Customer must fund USDC and commit ZK balance first — that's intentional." |
| Chain `failed` | "Ledger and caps still enforce in Bun; escrow env needs contract redeploy if singleton is consumed." |
