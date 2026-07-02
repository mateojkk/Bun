const terms = [
  {
    title: "Testnet status",
    body: "Bun currently runs as a pre-launch Stellar testnet product. Testnet USDC and testnet assets have no real-world monetary value. Do not use this deployment for production funds.",
  },
  {
    title: "Bun is the billing rail",
    body: "Bun does not provide the merchant service. Providers integrate Pay with Bun into their own apps, track their own usage, and report metered usage events to Bun.",
  },
  {
    title: "Customer authorizations",
    body: "When a customer authorizes Pay with Bun, they approve a maximum spend cap for a specific provider/app. Providers cannot bill above that cap through Bun.",
  },
  {
    title: "Provider usage reporting",
    body: "Providers are responsible for accurate product metering. Bun records submitted usage events and calculates used amount, remaining cap, and provider payout from those events.",
  },
  {
    title: "Escrow and settlement",
    body: "The Soroban escrow path is implemented for testnet settlement. Live on-chain success depends on network state, faucet funding, deployed contract configuration, and signing environment.",
  },
  {
    title: "Sandbox AI fixture",
    body: "Sandbox AI is a reference merchant fixture. It demonstrates the integration loop but does not represent a production third-party service.",
  },
  {
    title: "No warranty",
    body: "Bun is provided as-is during pre-launch testing. Testnet records, contracts, accounts, and ledgers may change or reset.",
  },
]

export default function TermsPage() {
  return (
    <main className="bun-shell min-h-screen">
      <div className="mx-auto max-w-4xl px-5 py-12">
        <a href="/" className="font-geist text-sm font-light text-white">Bun.</a>
        <div className="mt-10 mb-12">
          <div className="bun-chip mb-4">Pre-launch testnet terms</div>
          <h1 className="text-4xl font-semibold tracking-normal text-white">Terms of Service</h1>
          <p className="mt-3 text-sm text-oc-muted">Last updated: June 2026</p>
        </div>

        <div className="space-y-5">
          {terms.map((term, index) => (
            <section key={term.title} className="bun-panel rounded-lg p-5">
              <div className="mb-2 font-mono text-xs text-oc-green">0{index + 1}</div>
              <h2 className="mb-3 text-xl font-semibold text-white">{term.title}</h2>
              <p className="text-sm leading-6 text-oc-muted">{term.body}</p>
            </section>
          ))}

          <section className="bun-panel rounded-lg p-5">
            <h2 className="mb-3 text-xl font-semibold text-white">Contact</h2>
            <p className="text-sm leading-6 text-oc-muted">
              Questions about these terms can be sent to <span className="text-oc-light">support@bun.finance</span>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
