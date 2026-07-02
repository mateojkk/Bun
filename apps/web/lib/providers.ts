import { createHash, timingSafeEqual } from "crypto"

export type BunProvider = {
  id: string
  name: string
  allowedCallbackUrls: string[]
  apiKeyHash?: string
  sandbox?: boolean
}

const sandboxProvider: BunProvider = {
  id: "sandbox-ai",
  name: "Bun Integration Labs",
  allowedCallbackUrls: ["/merchant/sandbox"],
  sandbox: true,
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex")
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

function configuredProviders(): BunProvider[] {
  const raw = process.env.BUN_PROVIDERS
  const legacyKey = process.env.BUN_PROVIDER_API_KEY
  const legacyCallback = process.env.BUN_PROVIDER_CALLBACK_URL

  const providers: BunProvider[] = [sandboxProvider]

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Array<{
        id: string
        name: string
        apiKey?: string
        apiKeyHash?: string
        allowedCallbackUrls?: string[]
      }>
      for (const provider of parsed) {
        if (!provider.id || !provider.name) continue
        providers.push({
          id: provider.id,
          name: provider.name,
          allowedCallbackUrls: provider.allowedCallbackUrls || [],
          apiKeyHash: provider.apiKeyHash || (provider.apiKey ? sha256(provider.apiKey) : undefined),
        })
      }
    } catch {
      // Ignore invalid provider config so the app can still boot; requests will fail validation.
    }
  }

  if (legacyKey) {
    providers.push({
      id: "bun-testnet-provider",
      name: "Bun Testnet Provider",
      allowedCallbackUrls: legacyCallback ? [legacyCallback] : [],
      apiKeyHash: sha256(legacyKey),
    })
  }

  return providers
}

export function listProviders() {
  return configuredProviders()
}

export function findProvider(providerId: string) {
  return configuredProviders().find((provider) => provider.id === providerId) || null
}

export function authenticateProvider(apiKey: string | null) {
  if (!apiKey) return null
  const keyHash = sha256(apiKey)
  return configuredProviders().find((provider) => {
    if (!provider.apiKeyHash) return false
    return safeEqual(provider.apiKeyHash, keyHash)
  }) || null
}

export function isAllowedCallback(provider: BunProvider, callbackUrl: string, requestOrigin: string) {
  if (!callbackUrl) return false

  let parsed: URL
  try {
    parsed = new URL(callbackUrl, requestOrigin)
  } catch {
    return false
  }

  return provider.allowedCallbackUrls.some((allowed) => {
    const allowedUrl = new URL(allowed, requestOrigin)
    return parsed.origin === allowedUrl.origin && parsed.pathname === allowedUrl.pathname
  })
}

export function normalizeCallbackUrl(callbackUrl: string, requestOrigin: string) {
  const parsed = new URL(callbackUrl, requestOrigin)
  if (parsed.origin === requestOrigin) {
    return parsed.pathname + parsed.search
  }
  return parsed.toString()
}
