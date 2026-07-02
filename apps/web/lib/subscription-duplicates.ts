import type { BunSubscription } from "@/lib/db"

const OPEN_STATUSES: BunSubscription["status"][] = ["active", "pending_chain"]

export function subscriptionRank(sub: BunSubscription) {
  let score = 0
  if (sub.status === "active") score += 100
  if (sub.chainStatus === "confirmed") score += 50
  score += sub.usedAmount * 10
  score += sub.usage
  score += sub.createdAt.getTime() / 1_000_000_000_000
  return score
}

export function pickCanonicalSubscription(subs: BunSubscription[]) {
  return [...subs].sort((a, b) => subscriptionRank(b) - subscriptionRank(a))[0]
}

export type DuplicateSubscriptionGroup = {
  providerId: string
  appName: string
  providerName: string
  canonicalId: string
  supersededIds: string[]
  subscriptions: BunSubscription[]
}

export function findDuplicateOpenGroups(subscriptions: BunSubscription[]) {
  const groups = new Map<string, BunSubscription[]>()

  for (const sub of subscriptions) {
    if (!OPEN_STATUSES.includes(sub.status)) continue
    const list = groups.get(sub.providerId) || []
    list.push(sub)
    groups.set(sub.providerId, list)
  }

  const duplicates: DuplicateSubscriptionGroup[] = []

  for (const [providerId, subs] of groups) {
    if (subs.length < 2) continue
    const canonical = pickCanonicalSubscription(subs)
    duplicates.push({
      providerId,
      appName: canonical.appName,
      providerName: canonical.providerName,
      canonicalId: canonical.id,
      supersededIds: subs.filter((sub) => sub.id !== canonical.id).map((sub) => sub.id),
      subscriptions: subs,
    })
  }

  return duplicates
}

export function isSupersededSubscription(
  sub: BunSubscription,
  duplicates: DuplicateSubscriptionGroup[]
) {
  return duplicates.some((group) => group.supersededIds.includes(sub.id))
}
