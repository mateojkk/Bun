# AGENTS.md — Bun (分)

## Architecture

| Layer | Dir | Tech |
|-------|-----|------|
| Smart contracts | `daml/` | Daml — write/build/deploy via Seaport browser IDE |
| Frontend | `apps/web/` | Next.js 14 App Router + Tailwind |
| API proxy | `api/` | Vercel serverless functions (TS) |
| Agent | `api/agent/poll.ts` | TypeScript, replaces deprecated Daml Trigger |
| Shared types | `packages/shared/` | TS types mirroring Daml contracts |

## Key commands

- `npm run dev` — start Next.js dev server (from `apps/web/`)
- `npm run build` — production build (from `apps/web/`)

## Daml workflow (Seaport)

Write + build + deploy contracts entirely in the browser at `https://app.devnet.seaport.to/`. No local JDK/Daml SDK needed.
- `daml/daml.yaml` and `daml/src/Main.daml` are the source — copy into a Seaport project
- Build in Seaport → deploy to `5n sandbox` validator via org mode
- Use Seaport's Contract Factory UI to create contracts and exercise choices

## Agent (replaces Daml Trigger)

Daml Triggers are deprecated. The agent is `api/agent/poll.ts`:
- Queries all active subscriptions via JSON API `/v1/query`
- If cycleEnd reached: proposes settlement via `/v1/exercise` (ProposeSettlement)
- If autoApprove: immediately calls ApproveAndSettle
- Triggered manually or via Vercel cron (every 60s)

## API environment variables

- `DAML_JSON_API` — base URL of Canton JSON API (defaults to `http://localhost:7575`)
- `API_URL` — frontend-facing API base (for server components, defaults to `""` for same-origin)
- `SUBSCRIBER_PARTY` / `AGENT_PARTY` — party IDs used in queries

## Architecture constraints

- Canton sub-transaction privacy: per-contract party visibility is the core value prop
- The agent sees subscription metadata for coordination but never subscriber balances or cross-service usage
- Frontend uses `@c7/ledger` (Canton client SDK) for production — see Seaport guide for codegen
