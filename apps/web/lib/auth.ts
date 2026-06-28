import { cookies } from "next/headers"

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
