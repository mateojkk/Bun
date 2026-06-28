import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = process.env.MONGODB_DB || "bun"

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

function getClient(): Promise<MongoClient> {
  if (clientPromise) return clientPromise
  client = new MongoClient(uri)
  clientPromise = client.connect()
  return clientPromise
}

export async function getDb() {
  const c = await getClient()
  return c.db(dbName)
}

export async function findAccount(privyUserId: string) {
  const db = await getDb()
  return db.collection("accounts").findOne({ privyUserId })
}

export async function findAccountByPartyId(partyId: string) {
  const db = await getDb()
  return db.collection("accounts").findOne({ partyId })
}

export async function createAccount(data: {
  privyUserId: string
  partyId: string
  secretKey: string
  username: string
}) {
  const db = await getDb()
  return db.collection("accounts").insertOne({
    ...data,
    createdAt: new Date(),
  })
}

export async function updateAccount(privyUserId: string, update: Record<string, unknown>) {
  const db = await getDb()
  return db.collection("accounts").updateOne({ privyUserId }, { $set: update })
}
