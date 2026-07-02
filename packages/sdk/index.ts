export type BunCheckoutParams = {
  providerId: string
  appName: string
  providerName: string
  unitName: string
  unitPrice: number | string
  maxSpend: number | string
  callbackUrl: string
  flatRate?: number | string
}

export type BunClientOptions = {
  baseUrl: string
  apiKey?: string
}

export type RecordUsageParams = {
  subscriptionId: string
  quantity: number
  idempotencyKey?: string
  providerId?: string
}

export type BunUsageResponse = {
  ok: boolean
  error?: string
  event?: {
    id: string
    subscriptionId: string
    quantity: number
    amount: number
    createdAt: string
  }
  subscription?: {
    id: string
    appName: string
    usedAmount: number
    remainingAmount: number
    status: string
    chainStatus: string
  }
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "")
}

export function createBunCheckoutUrl(baseUrl: string, params: BunCheckoutParams) {
  const url = new URL("/checkout", trimTrailingSlash(baseUrl))
  url.searchParams.set("appName", params.appName)
  url.searchParams.set("providerId", params.providerId)
  url.searchParams.set("providerName", params.providerName)
  url.searchParams.set("unitName", params.unitName)
  url.searchParams.set("unitPrice", String(params.unitPrice))
  url.searchParams.set("maxSpend", String(params.maxSpend))
  url.searchParams.set("callbackUrl", params.callbackUrl)

  if (params.flatRate !== undefined) {
    url.searchParams.set("flatRate", String(params.flatRate))
  }

  return url.toString()
}

export class BunProviderClient {
  private readonly baseUrl: string
  private readonly apiKey?: string

  constructor(options: BunClientOptions) {
    this.baseUrl = trimTrailingSlash(options.baseUrl)
    this.apiKey = options.apiKey
  }

  checkoutUrl(params: BunCheckoutParams) {
    return createBunCheckoutUrl(this.baseUrl, params)
  }

  async recordUsage(params: RecordUsageParams): Promise<BunUsageResponse> {
    const response = await fetch(`${this.baseUrl}/api/bun/v1/usage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey ? { "x-bun-api-key": this.apiKey } : {}),
      },
      body: JSON.stringify(params),
    })

    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
      return {
        ok: false,
        error: body?.error || `Bun usage request failed with ${response.status}`,
      }
    }

    return body
  }
}
