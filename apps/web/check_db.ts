import { MongoClient } from "mongodb";
async function run() {
  const uri = "mongodb+srv://thesaintszn_db_user:PIDAz5Ok5nOFVusF@cluster0.v1wqtda.mongodb.net/?appName=Cluster0";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('bun');
  const account = await db.collection('accounts').find({}).sort({zkCommittedAt: -1}).limit(1).next();
  console.log("zkChainStatus:", account?.zkChainStatus);
  console.log("zkChainMessage:", account?.zkChainMessage);
  await client.close();
}
run();
