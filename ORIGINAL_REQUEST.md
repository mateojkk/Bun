# Original User Request

## Initial Request — 2026-06-28T10:06:28+01:00

Bun (分) is a usage-based payment system on Stellar/Soroban testnet. The codebase is partially implemented with XLM placeholders everywhere. The task is to make it production-complete on testnet: switch everything to USDC, fix the fund/subscribe/settle flows end-to-end, wire the escrow contract to real USDC token transfers, and make the frontend accurate.

Working directory: /home/mateo/basement/Bun
Integrity mode: development

---

## Current State (from codebase scan)

### What's broken / incomplete

| File | Issue |
|------|-------|
| `lib/stellar.ts` `getBalance()` | Reads XLM native balance — needs to read USDC from the token contract |
| `lib/stellar.ts` `fundTestnet()` | Calls Friendbot (XLM only) — needs to transfer USDC from agent account via CLI |
| `api/stellar/fund/route.ts` | Calls Friendbot — needs USDC transfer from `AGENT_SECRET` keypair |
| `api/stellar/subscribe/route.ts` | `provider: subscriber` (same address!), subscriber sent as empty `""` |
| `app/(app)/subscriptions/create/page.tsx` | Sends `subscriber: ""` empty string in POST body |
| `contracts/escrow/src/lib.rs` | No token transfer calls — state-only, amounts are pure i128 |
| All frontend pages | Display "XLM" — should display "USDC" |
| `components/TopUpForm.tsx` | Says "Get Testnet XLM from Friendbot" — needs USDC language |
| `app/(app)/settlements/page.tsx` | Imports `ESCROW_CONTRACT_ID` which is NOT exported from stellar.ts |
| `lib/auth.ts` | Contains dead DAML JSON API code (`getAccount`, `createAccount` using DAML) — confusing |
| `app/(app)/subscriptions/create/page.tsx` | Hardcoded cycle_end of 24h — should let user pick |
| `escrowInit` in stellar.ts | `--agent ${params.provider}` uses provider as agent — should use `AGENT_SECRET` public key |

### What works
- Privy auth flow (OTP email → JWT verify → MongoDB store → cookie)
- Stellar keypair generation on first login
- CLI-based escrow `record_usage` and `settle` invocations via `/tmp/stellar`
- MongoDB account storage
- Nav layout, dark theme, PrivacyBadge component

---

## Requirements

### R1. USDC Token Integration
Find the correct Circle USDC token contract on Stellar testnet (search stellar.expert or Circle docs). Update `lib/stellar.ts` so that `getBalance(publicKey)` reads the USDC trustline balance (or Soroban token balance) for that address. All balance displays must show "USDC" (not XLM). All amount inputs/labels must say "USDC". The escrow contract should store amounts as i128 in USDC micro-units (1 USDC = 10,000,000 stroops equivalent — match whatever denomination Stellar USDC uses on testnet, likely 7 decimal places).

### R2. Fix the Fund Flow
Rewrite `/api/stellar/fund` so it transfers USDC from the agent account (`AGENT_SECRET`) to the user's Stellar public key using the `/tmp/stellar` CLI. Use `transfer` on the USDC token contract. The fund amount should be configurable (default: 10 USDC for testnet demo). The agent account must have been pre-funded with testnet USDC. Update `TopUpForm.tsx` to show accurate messaging ("Get 10 testnet USDC"). If the CLI transfer fails (e.g. agent out of funds), return a clear error.

### R3. Fix the Subscribe Flow — Real Subscriber + Provider Separation
The subscribe route must:
1. Read the subscriber's actual Stellar public key from the `bun_party` cookie (server-side, don't accept it from the client body for security)
2. Use a hardcoded demo provider address (can be the agent's own public key for demo purposes, just not the subscriber's)
3. Pass the agent's public key as the `--agent` parameter (derive from `AGENT_SECRET`)
4. Forward the correct subscriber pubkey to `escrowInit`
The `create/page.tsx` form should not send `subscriber` at all — that's server-side.

### R4. Escrow Contract — Token Transfers on Settle
Update the Soroban escrow contract (`contracts/escrow/src/lib.rs`) to:
- Store the USDC token contract address in escrow state
- On `settle()`: call the USDC token contract's `transfer` function to send `used_amount` to the provider and return `(amount - used_amount)` to the subscriber (using `token::Client`)
- On `init()`: call `token::transfer_from` or require caller has approved the contract — OR simpler: accept a `token_contract` address and use it during settle only (amounts are already "locked" by convention for the demo)
- Re-deploy the updated contract and update `ESCROW_CONTRACT_ID` in `.env.local`

> **Note on AGENTS.md**: The AGENTS.md says "Stellar SDK v13 build.sign is broken — use `/tmp/stellar` CLI for contract invocations." Stick to CLI for all contract calls. The Soroban contract itself can use the token SDK for on-chain transfers within the contract logic.

### R5. End-to-End Flow Verification
Make the full demo flow work without errors:
1. Sign up with Privy email OTP → keypair generated → stored in MongoDB
2. Click "Fund Account" → 10 USDC transferred from agent → user sees "10.00 USDC"
3. Browse services → Subscribe (Netflix, Claude AI, etc.) → escrow created on-chain
4. Usage page → Record usage (e.g. 5 units) → on-chain usage updated
5. Settlements page → Trigger settle → USDC distributed provider/subscriber
6. Dashboard shows correct USDC balance after each step

### R7. Legal Pages — Privacy Policy & Terms of Service
Create two new pages in the Next.js app:

**Privacy Policy** (`/privacy`) — must cover, accurately for this product:
- What data Bun collects: email (via Privy OTP), Stellar public key, username, usage records stored in MongoDB
- What Bun does NOT collect: private keys are never stored server-side (generated client-side / in memory only)
- On-chain data: all escrow amounts, usage records, and settlement transactions are permanently public on the Stellar testnet ledger
- ZK privacy: how SHA256 commit-reveal protects balance information from providers
- Cookies: two httpOnly cookies (`bun_party`, `bun_name`) used for session auth
- Third-party services used: Privy (email auth), MongoDB Atlas (account storage), Stellar testnet (blockchain)
- Data retention: testnet data may be reset; no guarantees of persistence
- No advertising, no data selling, this is a hackathon demo
- Contact / questions: include a placeholder email

**Terms of Service** (`/terms`) — must cover:
- This is a testnet demo / hackathon project — not for real financial transactions
- Testnet USDC has no real monetary value
- Users are responsible for keeping their Stellar public key safe
- Escrow is enforced by Soroban smart contract — once funds are escrowed, the contract governs settlement, not Bun
- Agent auto-settlement is automated — no manual dispute process
- Provider usage reporting: providers report usage; the contract caps payment at `maxSpend`
- Anti-scam design: escrow prevents providers from charging more than subscriber approved
- No warranties — testnet software, may have bugs
- Governing law: placeholder (e.g. "laws of England and Wales")

Both pages must:
- Match the existing dark theme / design system (Tailwind, dark background, same font)
- Be linked from the landing page footer and the authenticated app layout footer
- Be accessible without login (public routes, not behind `proxy.ts` auth)
- Use proper semantic HTML (`<article>`, `<section>`, `<h1>`, `<h2>`) for SEO

### R6. Frontend Polish — Accuracy
- Remove all "XLM" references, replace with "USDC"
- Fix `settlements/page.tsx` broken import (`ESCROW_CONTRACT_ID` not exported)
- Clean up dead DAML code in `lib/auth.ts` (the `getAccount`/`createAccount` functions that call DAML JSON API)
- The subscriptions list should show prices in USDC (e.g. "0.26 USDC per hour")
- `create/page.tsx` button should say "Subscribe — Lock 10.00 USDC"
- Add a "Fund with USDC" button that shows current USDC balance
- Dashboard "Get Started" instructions should mention USDC not XLM

---

## Acceptance Criteria

### USDC Balance
- [ ] `GET /api/stellar/balance?pubkey=<key>` (or dashboard page load) shows USDC balance, not XLM
- [ ] After funding, dashboard balance shows ≥ 10.00 USDC (not XLM)
- [ ] No page in the app displays "XLM" anywhere visible

### Fund Flow
- [ ] POST `/api/stellar/fund` returns `{ ok: true }` and the user's USDC balance increases
- [ ] If agent has no USDC, returns a meaningful error (not a crash)
- [ ] TopUpForm shows "Get 10 testnet USDC" and success message references USDC

### Subscribe Flow
- [ ] POST `/api/stellar/subscribe` uses the server-side cookie pubkey (not client body)
- [ ] Provider and subscriber are different addresses
- [ ] Escrow `init()` on-chain succeeds and returns success in the response

### Escrow Contract
- [ ] `contracts/escrow/src/lib.rs` compiles: `cargo build --target wasm32v1-none --release`
- [ ] `cargo test` passes in `contracts/escrow/`
- [ ] Contract deployed to testnet, new contract ID stored in `.env.local`
- [ ] `settle()` triggers actual USDC token transfers (visible on stellar.expert)

### End-to-End
- [ ] Full flow (fund → subscribe → record usage → settle) completable without console errors
- [ ] `npm run build` in `apps/web/` succeeds with zero TypeScript errors
- [ ] No broken imports (the `ESCROW_CONTRACT_ID` import error in settlements page is fixed)

### Legal Pages
- [ ] `/privacy` page renders without login, matches dark theme
- [ ] `/terms` page renders without login, matches dark theme
- [ ] Both pages linked in landing page footer and app layout footer
- [ ] Privacy policy accurately describes: Privy email, MongoDB storage, on-chain public data, ZK privacy, cookies
- [ ] Terms accurately describes: testnet-only, no real value, escrow mechanics, auto-settlement
- [ ] Both pages excluded from `proxy.ts` auth middleware (public routes)

### Code Quality
- [ ] Dead DAML code removed from `lib/auth.ts`
- [ ] `escrowInit` passes correct agent pubkey (not provider pubkey) as `--agent`
- [ ] All hardcoded amounts use correct USDC decimal precision (7 decimal places)

---

## Key Files to Touch

```
contracts/escrow/src/lib.rs          ← add token transfers on settle
contracts/escrow/src/test.rs         ← update tests
apps/web/lib/stellar.ts              ← getBalance → USDC, fundTestnet → USDC transfer
apps/web/lib/auth.ts                 ← remove dead DAML code
apps/web/app/api/stellar/fund/route.ts      ← rewrite to use USDC CLI transfer
apps/web/app/api/stellar/subscribe/route.ts  ← fix subscriber from cookie, fix provider
apps/web/app/(app)/dashboard/page.tsx        ← XLM → USDC
apps/web/app/(app)/account/page.tsx          ← XLM → USDC
apps/web/app/(app)/subscriptions/page.tsx    ← XLM → USDC prices
apps/web/app/(app)/subscriptions/create/page.tsx  ← remove subscriber from body, XLM → USDC
apps/web/app/(app)/settlements/page.tsx      ← fix broken import
apps/web/components/TopUpForm.tsx            ← USDC messaging
apps/web/components/SubscriptionCard.tsx     ← USDC display
apps/web/app/(app)/layout.tsx               ← add footer with Privacy / Terms links
apps/web/app/privacy/page.tsx               ← [NEW] Privacy Policy page
apps/web/app/terms/page.tsx                 ← [NEW] Terms of Service page
apps/web/proxy.ts                           ← ensure /privacy and /terms are public routes
```

## Environment Context

- `/tmp/stellar` CLI binary — proven working for all contract interactions
- `AGENT_SECRET` env var — agent Stellar secret key (derive pubkey with `stellar keys address`)
- USDC testnet contract: find via `https://stellar.expert/explorer/testnet` or Circle testnet docs
- Stellar testnet RPC: `https://soroban-testnet.stellar.org`
- Horizon testnet: `https://horizon-testnet.stellar.org`
- `.env.local` is at both `/home/mateo/basement/Bun/.env.local` and `/home/mateo/basement/Bun/apps/web/.env.local` (same file symlinked)
- `npm run dev` from `apps/web/` starts the Next.js dev server
- Read the AGENTS.md at `/home/mateo/basement/Bun/AGENTS.md` for full architecture context before starting

## Follow-up — 2026-06-28T09:44:02Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Finish the Bun (分) Production Upgrade

The Bun (分) production upgrade was partially completed but stopped due to a server restart. The codebase has been mostly updated from XLM to USDC, but a few critical finishing steps remain to get it fully functional on the Stellar testnet.

Working directory: /home/mateo/basement/Bun
Integrity mode: development

## Requirements

### R1. Re-install Stellar CLI
The `stellar` CLI binary in `/tmp/stellar` was lost during the server restart. You must reinstall it or download the pre-compiled linux binary and place it in `/tmp/stellar` so that `lib/stellar.ts` and your deploy scripts can function. Ensure it has execute permissions. 
*(Hint: `curl -sL https://github.com/stellar/stellar-cli/releases/latest/download/stellar-cli-linux-amd64.tar.gz | tar -xz -C /tmp && mv /tmp/stellar-cli* /tmp/stellar && chmod +x /tmp/stellar`)*

### R2. Deploy Escrow Contract
The `contracts/escrow` contract has been updated to transfer USDC tokens during `settle()` and the tests are passing. You must deploy this updated contract to the testnet using the `AGENT_SECRET` from `.env.local` as the source account. 

### R3. Update Environment
Update the `ESCROW_CONTRACT_ID` in `.env.local` with the newly deployed contract address. Also ensure the frontend `ESCROW_CONTRACT_ID` constant in `apps/web/lib/stellar.ts` is updated if it is hardcoded there (it currently falls back to a hardcoded string if the env var is missing, update the hardcoded fallback as well).

### R4. End-to-End Flow Verification
Make the full demo flow work without errors:
1. Sign up with Privy email OTP → keypair generated → funded with XLM via Friendbot → stored in MongoDB
2. Click "Fund Account" → 10 USDC transferred from agent → user sees "10.00 USDC"
3. Browse services → Subscribe (Netflix, Claude AI, etc.) → escrow created on-chain using the subscriber's securely stored secret key.
4. Usage page → Record usage (e.g. 5 units) → on-chain usage updated
5. Settlements page → Trigger settle → USDC distributed provider/subscriber
6. Dashboard shows correct USDC balance after each step

## Acceptance Criteria

### Infrastructure
- [ ] `/tmp/stellar` exists and is executable
- [ ] Contract deployed to testnet successfully

### End-to-End
- [ ] Full flow (fund → subscribe → record usage → settle) completable without errors
- [ ] Settle correctly transfers USDC on-chain

