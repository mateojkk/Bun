import { zkCommitBalance, fundTestnet } from "./lib/stellar";
import { createBalanceCommitment } from "./lib/zk";
import { Keypair } from "@stellar/stellar-sdk";

async function run() {
  const kp = Keypair.random();
  console.log("Keypair generated:", kp.publicKey());
  console.log("Funding via friendbot...");
  await fetch(`https://friendbot.stellar.org?addr=${kp.publicKey()}`);
  
  console.log("Funding USDC...");
  await fundTestnet(kp.publicKey(), kp.secret());

  console.log("Creating commitment...");
  const commitment = createBalanceCommitment(2.5);
  
  console.log("Committing on chain...");
  const chain = await zkCommitBalance({
    subscriber: kp.publicKey(),
    subscriberSecret: kp.secret(),
    balanceHashHex: commitment.hashHex
  });
  
  console.log("Result:");
  console.log(JSON.stringify(chain, null, 2));
}

run().catch(console.error);
