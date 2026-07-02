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

export function createBunCheckoutUrl(baseUrl: string, params: BunCheckoutParams): string

export class BunProviderClient {
  constructor(options: BunClientOptions)
  checkoutUrl(params: BunCheckoutParams): string
  recordUsage(params: RecordUsageParams): Promise<BunUsageResponse>
}
