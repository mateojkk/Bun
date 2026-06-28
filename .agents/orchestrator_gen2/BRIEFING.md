# BRIEFING — 2026-06-28T10:45:40+01:00

## Mission
Complete the Bun production upgrade by re-installing Stellar CLI, re-building and deploying the updated escrow contract, completing remaining frontend/backend fixes, and verifying end-to-end USDC flow.

## 🔒 My Identity
- Archetype: orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: /home/mateo/basement/Bun/.agents/orchestrator_gen2
- Original parent: parent
- Original parent conversation ID: e06ad41b-baae-46b3-9eea-31204d271127

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: /home/mateo/basement/Bun/PROJECT.md
1. **Decompose**: We have 4 milestones:
   - Milestone 1: Re-install Stellar CLI & Escrow Contract Deploy (R1, R2, R4).
   - Milestone 2: Frontend & API fixes, integrate USDC balance, fix fund/subscribe flows (R1, R2, R3, R5, R6).
   - Milestone 3: E2E flow verification & build check (R5, R6).
2. **Dispatch & Execute**:
   - **Delegate**: Spawn workers for each milestone.
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: at 16 spawns, write handoff.md, spawn successor.
- **Work items**:
  1. Stellar CLI & Escrow Contract Deploy [pending]
  2. Frontend & API fixes validation [pending]
  3. E2E flow verification & build check [pending]
- **Current phase**: 1
- **Current focus**: Re-installing Stellar CLI, building and deploying Escrow contract.

## 🔒 Key Constraints
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers to do so.
- You MAY use file-editing tools ONLY for metadata/state files (.md) in your .agents/ folder.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh

## Current Parent
- Conversation ID: e06ad41b-baae-46b3-9eea-31204d271127
- Updated: not yet

## Key Decisions Made
- Resuming work based on previous orchestrator's progress.md and state.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| worker_m1 | teamwork_preview_worker | Milestone 1: Re-install Stellar CLI & Escrow Contract Deploy | in-progress | f13cc150-7562-4675-8c9f-67287316f827 |

## Succession Status
- Succession required: no
- Spawn count: 1 / 16
- Pending subagents: f13cc150-7562-4675-8c9f-67287316f827
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: task-31
- Safety timer: none
- On succession: kill all timers before spawning successor
- On context truncation: run `manage_task(Action="list")` — re-create if missing

## Artifact Index
- /home/mateo/basement/Bun/.agents/orchestrator_gen2/progress.md — progress tracking
- /home/mateo/basement/Bun/PROJECT.md — project scope
