# Project: Bun (分) Production Upgrade

## Architecture
- Escrow model: subscriber funds locked in EscrowContract. On-chain usage recorded by provider. Settle called by agent (api/agent/poll.ts) to distribute funds using Circle USDC token contract.
- ZK Privacy: SHA256 commit-reveal pattern.
- Frontend: Next.js 16 + Tailwind, Privy Auth, Stellar SDK / CLI.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Re-install Stellar CLI & Escrow Contract Deploy | Reinstall CLI to /tmp/stellar, build contract, run cargo tests, deploy to testnet, update .env.local | none | PLANNED |
| 2 | Frontend & API USDC integration | Complete remaining frontend/backend fixes for USDC integration, balance check, and routing fixes | M1 | PLANNED |
| 3 | Verification | Run full E2E flow (fund -> subscribe -> record -> settle) and build check | M2 | PLANNED |

## Interface Contracts
### EscrowContract ↔ USDC Token Contract
- `settle` calls USDC token `transfer` function using `token::Client` to distribute funds.
- `init` takes `token_contract: Address` and stores it in state.

## Code Layout
- `contracts/escrow/src/lib.rs` - smart contract implementation
- `apps/web/lib/stellar.ts` - stellar helper functions
- `apps/web/app/api/stellar/...` - API handlers
- `apps/web/app/...` - Next.js pages
