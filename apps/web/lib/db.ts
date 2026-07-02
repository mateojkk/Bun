import { MongoClient } from "mongodb"
import { randomUUID } from "crypto"

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

export async function updateAccountByPartyId(partyId: string, update: Record<string, unknown>) {
  const db = await getDb()
  return db.collection("accounts").updateOne({ partyId }, { $set: update })
}

export type BunSubscription = {
  id: string
  providerId: string
  providerName: string
  callbackUrl?: string
  appName: string
  subscriber: string
  maxSpend: number
  unitPrice: number
  unitName: string
  flatRate: number
  usage: number
  usedAmount: number
  remainingAmount: number
  status: "active" | "pending_chain" | "settled" | "failed"
  chainStatus: "pending" | "confirmed" | "failed"
  contractId?: string
  chainMessage?: string
  idempotencyKey?: string
  serviceName?: string
  createdAt: Date
  updatedAt: Date
}

export type UsageEvent = {
  id: string
  subscriptionId: string
  providerId: string
  subscriber: string
  quantity: number
  amount: number
  idempotencyKey?: string
  createdAt: Date
}

export async function ensureIndexes() {
  const db = await getDb()
  await Promise.all([
    db.collection<BunSubscription>("subscriptions").createIndex({ subscriber: 1, createdAt: -1 }),
    db.collection<BunSubscription>("subscriptions").createIndex({ providerId: 1, createdAt: -1 }),
    db.collection<UsageEvent>("usage_events").createIndex(
      { subscriptionId: 1, idempotencyKey: 1 },
      {
        unique: true,
        partialFilterExpression: { idempotencyKey: { $exists: true } },
      }
    ),
    db.collection<BunSubscription>("subscriptions").createIndex(
      { idempotencyKey: 1 },
      {
        unique: true,
        partialFilterExpression: { idempotencyKey: { $exists: true } },
      }
    ),
    db.collection<BunSubscription>("subscriptions").createIndex(
      { subscriber: 1, providerId: 1 },
      {
        unique: true,
        partialFilterExpression: { status: { $in: ["active", "pending_chain"] } },
      }
    ),
  ])
}

export async function createSubscription(data: {
  providerId?: string
  providerName: string
  callbackUrl?: string
  appName: string
  subscriber: string
  maxSpend: number
  unitPrice: number
  unitName: string
  flatRate?: number
  contractId?: string
  chainStatus?: BunSubscription["chainStatus"]
  chainMessage?: string
  idempotencyKey?: string
  serviceName?: string
}) {
  const db = await getDb()
  const now = new Date()
  await ensureIndexes()
  const subscription: BunSubscription = {
    id: randomUUID(),
    providerId: data.providerId || "bun-testnet-provider",
    providerName: data.providerName,
    callbackUrl: data.callbackUrl,
    appName: data.appName,
    subscriber: data.subscriber,
    maxSpend: data.maxSpend,
    unitPrice: data.unitPrice,
    unitName: data.unitName,
    flatRate: data.flatRate || 0,
    usage: 0,
    usedAmount: 0,
    remainingAmount: data.maxSpend,
    status: data.chainStatus === "confirmed" ? "active" : "pending_chain",
    chainStatus: data.chainStatus || "pending",
    contractId: data.contractId,
    chainMessage: data.chainMessage,
    idempotencyKey: data.idempotencyKey,
    serviceName: data.serviceName,
    createdAt: now,
    updatedAt: now,
  }
  try {
    await db.collection<BunSubscription>("subscriptions").insertOne(subscription)
  } catch (error: unknown) {
    const code = (error as { code?: number })?.code
    if (code === 11000) {
      const existing =
        (data.idempotencyKey
          ? await findSubscriptionByIdempotencyKey(data.idempotencyKey)
          : null) ||
        (await findOpenSubscription(data.subscriber, subscription.providerId))
      if (existing) return existing
    }
    throw error
  }
  return subscription
}

export async function findSubscriptionByIdempotencyKey(idempotencyKey: string) {
  const db = await getDb()
  return db.collection<BunSubscription>("subscriptions").findOne({ idempotencyKey })
}

export async function findOpenSubscription(subscriber: string, providerId: string) {
  const db = await getDb()
  return db
    .collection<BunSubscription>("subscriptions")
    .find({ subscriber, providerId, status: { $in: ["active", "pending_chain"] } })
    .sort({ createdAt: -1 })
    .limit(1)
    .next()
}

export async function listSubscriptionsBySubscriber(subscriber: string) {
  const db = await getDb()
  return db
    .collection<BunSubscription>("subscriptions")
    .find({ subscriber })
    .sort({ createdAt: -1 })
    .toArray()
}

export async function listProviderSubscriptions(providerId = "bun-testnet-provider") {
  const db = await getDb()
  return db
    .collection<BunSubscription>("subscriptions")
    .find({ providerId })
    .sort({ createdAt: -1 })
    .toArray()
}

export async function findSubscription(id: string) {
  const db = await getDb()
  return db.collection<BunSubscription>("subscriptions").findOne({ id })
}

export async function updateSubscriptionChainState(
  id: string,
  update: Pick<Partial<BunSubscription>, "contractId" | "chainStatus" | "chainMessage" | "status" | "serviceName">
) {
  const db = await getDb()
  await db.collection<BunSubscription>("subscriptions").updateOne(
    { id },
    { $set: { ...update, updatedAt: new Date() } }
  )
  return findSubscription(id)
}

export async function recordUsageEvent(data: {
  subscriptionId: string
  providerId?: string
  quantity: number
  idempotencyKey?: string
  allowPendingChain?: boolean
}) {
  const db = await getDb()
  const subscription = await findSubscription(data.subscriptionId)
  if (!subscription) {
    throw new Error("Subscription not found")
  }
  if (subscription.status !== "active" && !(data.allowPendingChain && subscription.status === "pending_chain")) {
    throw new Error(`Subscription is ${subscription.status}; usage requires an active authorization`)
  }
  if (data.providerId && data.providerId !== subscription.providerId) {
    throw new Error("Provider does not own this subscription")
  }

  if (!data.idempotencyKey) {
    throw new Error("idempotencyKey is required")
  }

  if (data.quantity > 1_000_000) {
    throw new Error("Usage quantity exceeds per-event limit")
  }

  if (data.idempotencyKey) {
    const existing = await db.collection<UsageEvent>("usage_events").findOne({
      subscriptionId: data.subscriptionId,
      idempotencyKey: data.idempotencyKey,
    })
    if (existing) return { subscription, event: existing, duplicate: true }
  }

  const amount = Math.min(data.quantity * subscription.unitPrice, subscription.remainingAmount)
  const event: UsageEvent = {
    id: randomUUID(),
    subscriptionId: data.subscriptionId,
    providerId: subscription.providerId,
    subscriber: subscription.subscriber,
    quantity: data.quantity,
    amount,
    idempotencyKey: data.idempotencyKey,
    createdAt: new Date(),
  }

  await db.collection<UsageEvent>("usage_events").insertOne(event)
  await db.collection<BunSubscription>("subscriptions").updateOne(
    { id: data.subscriptionId },
    {
      $inc: {
        usage: data.quantity,
        usedAmount: amount,
        remainingAmount: -amount,
      },
      $set: { updatedAt: new Date() },
    }
  )

  const updated = await findSubscription(data.subscriptionId)
  return { subscription: updated || subscription, event, duplicate: false }
}

export async function listUsageEventsBySubscriber(subscriber: string) {
  const db = await getDb()
  return db
    .collection<UsageEvent>("usage_events")
    .find({ subscriber })
    .sort({ createdAt: -1 })
    .toArray()
}

export const DAILY_LIMIT = 5    // max USDC a user can receive per day
export const PER_REQUEST  = 2.5 // USDC dispensed per single request

/** Returns how many USDC the user has already received today (UTC day). */
export async function getDailyDisbursed(partyId: string): Promise<number> {
  const db = await getDb()
  const today = new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"
  const doc = await db.collection("disbursements").findOne({ partyId, date: today })
  return (doc?.total as number) ?? 0
}

/** Atomically records a disbursement for today. */
export async function recordDisbursement(partyId: string, amount: number): Promise<void> {
  const db = await getDb()
  const today = new Date().toISOString().slice(0, 10)
  await db.collection("disbursements").updateOne(
    { partyId, date: today },
    { $inc: { total: amount }, $setOnInsert: { partyId, date: today } },
    { upsert: true }
  )
}
