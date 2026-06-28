# AGENTS.md — Bun (分) on Stellar

## Architecture

| Layer | Dir | Tech |
|-------|-----|------|
| Smart contracts | `contracts/` | Soroban (Rust + WASM) |
| Frontend | `apps/web/` | Next.js 16 App Router + Tailwind |
| API routes | `apps/web/app/api/` | Next.js route handlers (TS) |
| Route protection | `apps/web/proxy.ts` | Next.js middleware (proxy instead of middleware.ts) |
| Agent | `api/agent/poll.ts` | Vercel serverless function, calls Soroban settle |
| ZK Verifier | `contracts/zk-verifier/` | SHA256 commit-reveal on Soroban |
| Shared types | `packages/shared/` | TS types mirroring contract data |

## Key commands

- `npm run dev` — start Next.js dev server (from `apps/web/`)
- `npm run build` — production build (from `apps/web/`)
- `cargo test` — run Soroban contract tests (from any contract dir)
- `cargo build --target wasm32v1-none --release` — compile contracts to WASM
- `/tmp/stellar contract build` — build inside docker (alternative)
- `/tmp/stellar contract deploy --wasm <file> --network testnet` — deploy

## Escrow model

Subscriber funds are locked in a Soroban escrow contract at subscription time. Settlement is called by the agent at cycle end via `/tmp/stellar contract invoke -- settle`.

| Contract | Purpose | Key Functions |
|----------|---------|---------------|
| `EscrowContract` | Holds escrow data, tracks usage, settles payments | `init`, `record_usage`, `settle`, `get_escrow` |
| `ZkVerifierContract` | Privacy-preserving balance verification via SHA256 | `commit_balance`, `verify` |

## ZK Privacy (SHA256 commit-reveal)

The ZK verifier uses SHA256 commitment (not BLS12-381):
1. Subscriber commits `sha256(balance + salt)` on-chain via `commit_balance()`
2. At settlement, subscriber reveals balance + salt, contract calls `verify(preimage, required_minimum)` which checks `sha256(preimage) == committed_hash`
3. No actual BLS12-381 pairing math — SHA256 is sufficient for the commit-reveal pattern on Soroban

## Agent

The agent at `api/agent/poll.ts`:
- Calls `settle()` on individual escrow contracts via Soroban RPC
- Signs transactions with `AGENT_SECRET` keypair
- Uses `@stellar/stellar-sdk` v13 (SorobanRpc + TransactionBuilder)
- Deployed as a Vercel serverless function, triggered via POST

## Auth flow

1. User enters email → Privy sends OTP
2. Privy SDK returns a JWT
3. `/api/auth/privy` verifies JWT via `PRIVY_JWKS_URL` using `jose`
4. On first login: generates Stellar keypair (`Keypair.random()`), stores `{ privyUserId, partyId, username }` in MongoDB
5. Sets two httpOnly cookies: `bun_party` (public key) and `bun_name` (username)

## Environment variables (from `.env.local`)

- `STELLAR_RPC` — Soroban RPC URL (defaults to testnet)
- `STELLAR_HORIZON` — Horizon API URL
- `AGENT_SECRET` — Stellar secret key for agent transactions
- `NEXT_PUBLIC_PRIVY_APP_ID` — Privy app ID (public, used in frontend)
- `PRIVY_JWKS_URL` — Privy JWKS URL for token verification
- `MONGODB_URI` — MongoDB Atlas connection string
- `ESCROW_CONTRACT_ID` — Deployed escrow contract address
- `ZK_VERIFIER_CONTRACT_ID` — Deployed ZK verifier contract address

## Notes

- Stellar SDK v13 `build.sign` for Soroban contracts is broken — use `/tmp/stellar` CLI for contract invocations instead
- Route protection uses `proxy.ts` (renamed from `middleware.ts` for Next.js 16 compatibility)
- Escrow contract stores data only (no actual token transfers yet — amounts are i128)
- Friendbot gives 10k XLM once per address — used for initial funding
- Stellar CLI binary at `/tmp/stellar` — proven to work for all contract interactions
