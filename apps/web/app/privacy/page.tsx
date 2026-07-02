const sections = [
  {
    title: "What Bun collects",
    body: [
      "Privy handles email OTP authentication. Bun receives a Privy user id after successful login.",
      "Bun stores your display name, Stellar public key, generated account metadata, subscription authorizations, and usage events reported by integrated providers.",
      "Provider records include app name, provider name, unit price, max spend, quantity used, calculated amount, and settlement state.",
    ],
  },
  {
    title: "What providers see",
    body: [
      "A provider only sees the Bun subscription id and usage records for its own app.",
      "Providers do not receive your full Bun account graph, unrelated subscriptions, or global usage history.",
      "In the Sandbox AI fixture, usage is simulated. In a real integration, the provider tracks usage inside its own product and reports it to Bun.",
    ],
  },
  {
    title: "On-chain visibility",
    body: [
      "Stellar testnet transactions and Soroban contract state can be publicly visible.",
      "Escrow amounts, usage counts, settlement calls, and public keys may be inspectable by ledger observers.",
      "Do not use testnet keys or testnet behavior as a privacy guarantee for production assets.",
    ],
  },
  {
    title: "Balance privacy direction",
    body: [
      "The current ZK verifier is a SHA256 commit-reveal prototype.",
      "It is intended to demonstrate private balance verification direction, not full production anonymity.",
      "Future versions can upgrade this to stronger zero-knowledge proofs for private cross-provider balance checks.",
    ],
  },
  {
    title: "Cookies and sessions",
    body: [
      "Bun uses httpOnly cookies such as bun_party and bun_name to protect the app session.",
      "These cookies are used for routing authenticated dashboard requests and are cleared on logout.",
      "Bun does not use advertising pixels or third-party marketing trackers.",
    ],
  },
  {
    title: "Subprocessors",
    body: [
      "Privy provides authentication.",
      "MongoDB Atlas stores account, authorization, subscription, and usage records.",
      "Stellar testnet and Soroban execute the escrow and settlement contract path.",
    ],
  },
]

export default function PrivacyPage() {
  return (
    <main className="bun-shell min-h-screen">
      <div className="mx-auto max-w-4xl px-5 py-12">
        <a href="/" className="font-geist text-sm font-light text-white">Bun.</a>
        <div className="mt-10 mb-12">
          <div className="bun-chip mb-4">Pre-launch testnet policy</div>
          <h1 className="text-4xl font-semibold tracking-normal text-white">Privacy Policy</h1>
          <p className="mt-3 text-sm text-oc-muted">Last updated: June 2026</p>
        </div>

        <div className="space-y-5">
          {sections.map((section) => (
            <section key={section.title} className="bun-panel rounded-lg p-5">
              <h2 className="mb-3 text-xl font-semibold text-white">{section.title}</h2>
              <ul className="space-y-2 text-sm leading-6 text-oc-muted">
                {section.body.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}

          <section className="bun-panel rounded-lg p-5">
            <h2 className="mb-3 text-xl font-semibold text-white">Data retention and deletion</h2>
            <p className="text-sm leading-6 text-oc-muted">
              During testnet, Bun retains records for product testing and demo continuity. Stellar testnet data may reset independently. For deletion or privacy requests, contact <span className="text-oc-light">privacy@bun.finance</span>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
