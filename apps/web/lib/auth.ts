import { cookies } from "next/headers"
import { findAccountByPartyId } from "./db"

const PARTY_COOKIE = "bun_party"
const NAME_COOKIE = "bun_name"

export async function getPartyId(): Promise<string | null> {
  const c = await cookies()
  return c.get(PARTY_COOKIE)?.value || null
}

export async function getDisplayName(): Promise<string | null> {
  const c = await cookies()
  return c.get(NAME_COOKIE)?.value || null
}

export async function getAvatarUrl(): Promise<string | null> {
  const partyId = await getPartyId()
  if (!partyId) return null
  const account = await findAccountByPartyId(partyId)
  return account?.avatarUrl || null
}

export async function setAuth(partyId: string, displayName: string) {
  const c = await cookies()
  c.set(PARTY_COOKIE, partyId, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  c.set(NAME_COOKIE, displayName, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearAuth() {
  const c = await cookies()
  c.delete(PARTY_COOKIE)
  c.delete(NAME_COOKIE)
}
