function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "")
}

function createBunCheckoutUrl(baseUrl, params) {
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

class BunProviderClient {
  constructor(options) {
    this.baseUrl = trimTrailingSlash(options.baseUrl)
    this.apiKey = options.apiKey
  }

  checkoutUrl(params) {
    return createBunCheckoutUrl(this.baseUrl, params)
  }

  async recordUsage(params) {
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

module.exports = {
  BunProviderClient,
  createBunCheckoutUrl,
}
