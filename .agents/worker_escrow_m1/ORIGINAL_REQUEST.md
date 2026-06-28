## 2026-06-28T09:47:33Z
You are the worker responsible for Milestone 1: Re-install Stellar CLI & Escrow Contract Deploy.
Your working directory is /home/mateo/basement/Bun/.agents/worker_escrow_m1.
Please perform the following steps:
1. Re-install the Stellar CLI to /tmp/stellar. Run this exact command:
   curl -sL https://github.com/stellar/stellar-cli/releases/latest/download/stellar-cli-linux-amd64.tar.gz | tar -xz -C /tmp && mv /tmp/stellar-cli* /tmp/stellar && chmod +x /tmp/stellar
2. Build the Soroban escrow contract located at contracts/escrow/ by running:
   cargo build --target wasm32v1-none --release
3. Run contract unit tests by running:
   cargo test
   in the contracts/escrow directory, and verify that they pass.
4. Deploy the compiled WASM contract (target/wasm32v1-none/release/escrow.wasm) to Stellar testnet using /tmp/stellar:
   /tmp/stellar contract deploy --wasm target/wasm32v1-none/release/escrow.wasm --network testnet --source-key SC4TBTOFAFXWAU52CJMIA57GGXM42RSQM2Y4EU3RSIMMW7NAWOU27L66
   Make sure you capture the deployed Contract ID from the output!
5. Update the ESCROW_CONTRACT_ID value in /home/mateo/basement/Bun/.env.local and update the hardcoded fallback in /home/mateo/basement/Bun/apps/web/lib/stellar.ts line 7.
6. Create progress.md in your working directory and write a handoff.md report summarizing:
   - Command outputs for installation, build, test, and deploy.
   - The newly deployed Escrow Contract ID.
   - Any issues encountered and how they were resolved.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT
hardcode test results, create dummy/facade implementations, or
circumvent the intended task. A Forensic Auditor will independently
verify your work. Integrity violations WILL be detected and your
work WILL be rejected.
