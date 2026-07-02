import { MongoClient } from "mongodb";
import { zkVerifyBalance } from "./lib/stellar";
import { buildPreimageHex } from "./lib/zk";

async function run() {
  const uri = "mongodb+srv://thesaintszn_db_user:PIDAz5Ok5nOFVusF@cluster0.v1wqtda.mongodb.net/?appName=Cluster0";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('bun');
  
  const account = await db.collection('accounts').findOne({ username: "saint" }) || 
                  await db.collection('accounts').find({}).sort({zkCommittedAt: -1}).limit(1).next();
  
  if (!account) {
    console.log("No account found");
    return;
  }
  
  console.log("Found account:", account.partyId);
  console.log("zkChainStatus:", account.zkChainStatus);
  console.log("zkBalanceStroops:", account.zkBalanceStroops);
  console.log("zkSalt:", account.zkSalt);
  
  if (!account.zkSalt || !account.zkBalanceStroops) {
    console.log("Account missing ZK data");
    return;
  }
  
  const preimageHex = buildPreimageHex(BigInt(account.zkBalanceStroops), account.zkSalt);
  console.log("preimageHex:", preimageHex);
  
  const requiredMinimumStroops = BigInt(10000000); // 1 USDC
  console.log("requiredMinimumStroops:", requiredMinimumStroops);
  
  try {
    const res = await zkVerifyBalance({
      subscriber: account.partyId,
      subscriberSecret: account.secretKey,
      preimageHex,
      requiredMinimumStroops
    });
    console.log("zkVerifyBalance result:", res);
  } catch (e: any) {
    console.log("Error running zkVerifyBalance:", e.message);
  }
  
  await client.close();
}

run().catch(console.error);
