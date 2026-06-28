import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-oc-black">
      {/* Header */}
      <header className="border-b border-white/5 sticky top-0 bg-oc-black/90 backdrop-blur z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <span className="font-mono font-bold text-white">分 Bun</span>
          <div className="flex items-center gap-6 text-sm text-oc-gray">
            <a href="/dashboard" className="hover:text-white transition">Launch App</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-24 pb-16">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold tracking-tight leading-tight mb-6 text-white">
            Pay only for<br />what you use.
          </h1>
          <p className="text-lg text-oc-gray leading-relaxed mb-8 max-w-xl">
            Bun is a privacy-first subscription platform built on Stellar.
            Your usage data stays fragmented no single party, not even us, sees
            your full consumption graph.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="px-6 py-3 bg-white text-oc-black rounded-md hover:bg-oc-lightest transition font-medium text-sm">
              Get Started
            </Link>
            <Link href="/subscriptions" className="text-sm text-oc-gray hover:text-white transition">
              Browse Services &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Dot Matrix */}
      <section className="px-6 pb-24">
        <DotMatrixIllustration />
      </section>

      {/* How it works */}
      <section className="border-t border-white/5">
        <div className="px-6 py-24">
          <div className="mb-12">
            <span className="text-xs font-medium text-oc-muted uppercase tracking-wider">How it works</span>
            <h2 className="text-3xl font-bold mt-3 text-white">Subscribe. Use. Settle. Keep your privacy.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Top up", body: "Deposit funds into your BunAccount. You control how much to load." },
              { step: "2", title: "Subscribe", body: "Browse services and subscribe. Your max spend is escrowed upfront, protecting the provider." },
              { step: "3", title: "Use the service", body: "The provider reports your usage. You're billed only for what you consume." },
              { step: "4", title: "Auto-settle", body: "At cycle end, the agent settles automatically. Used funds go to the provider, unused return to you." },
            ].map((item) => (
              <div key={item.step}>
                <div className="w-8 h-8 rounded-full bg-white text-oc-black flex items-center justify-center text-sm font-mono font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2 text-white">{item.title}</h3>
                <p className="text-sm text-oc-gray leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Escrow Security */}
      <section className="border-t border-white/5">
        <div className="px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-medium text-oc-muted uppercase tracking-wider">Anti-scam by design</span>
              <h2 className="text-3xl font-bold mt-3 mb-4 text-white">
                Your funds are escrowed,<br />not held by us.
              </h2>
              <p className="text-oc-gray leading-relaxed mb-6">
                When you subscribe, your max spend is locked in a Soroban Escrow contract.
                Neither Bun nor the provider can touch it without your authorization.
                At cycle end, the agent settles automatically no approval step, no chance to scam.
              </p>
              <div className="space-y-3 text-sm text-oc-light">
                <div className="flex items-start gap-2">
                  <span className="text-oc-lighter mt-0.5">&check;</span>
                  <span>Provider gets guaranteed payment for used services</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-oc-lighter mt-0.5">&check;</span>
                  <span>Subscriber gets automatic refund of unused escrow</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-oc-lighter mt-0.5">&check;</span>
                  <span> All enforced by Stellar smart contracts, not policy</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <EscrowDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="border-t border-white/5">
        <div className="px-6 py-24">
          <div className="mb-12">
            <span className="text-xs font-medium text-oc-muted uppercase tracking-wider">Privacy</span>
            <h2 className="text-3xl font-bold mt-3 mb-4 text-white">Built for privacy first</h2>
            <p className="text-oc-gray max-w-lg">
              Stellar&apos;s BLS12-381 ZK proofs keep your data private even on a public ledger.
              No single party sees the full picture not the provider, not the agent, not Bun.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "From providers", body: "Your other subscriptions and total balance are invisible to each provider. They only see their own usage and revenue." },
              { title: "From the agent", body: "The settlement agent coordinates cycles but never sees your BunAccount balance or spending across services." },
              { title: "From everyone else", body: "No central observer. ZK proofs via BLS12-381 verify settlement without revealing balances to the public ledger." },
            ].map((item) => (
              <div key={item.title} className="p-6 border border-white/5 rounded-lg">
                <h3 className="font-semibold mb-2 text-white">Hidden {item.title.toLowerCase()}</h3>
                <p className="text-sm text-oc-gray leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing comparison */}
      <section className="border-t border-white/5">
        <div className="px-6 py-24">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-oc-muted uppercase tracking-wider">Compare</span>
            <h2 className="text-3xl font-bold mt-3 mb-4 text-white">Pay for usage, not flat fees</h2>
            <p className="text-oc-gray max-w-lg mx-auto">
              Flat-rate subscriptions charge you the same whether you use a service twice or every day. Bun charges
              only for actual consumption.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { name: "Netflix", flat: "15.99", unit: "0.26", unitLabel: "/hour" },
              { name: "Claude AI", flat: "20.00", unit: "0.03", unitLabel: "/API call" },
              { name: "Spotify", flat: "11.99", unit: "0.004", unitLabel: "/stream" },
            ].map((svc) => (
              <div key={svc.name} className="border border-white/5 rounded-lg p-6 bg-white/[0.02]">
                <h3 className="font-semibold text-lg mb-3 text-white">{svc.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-oc-muted">Flat rate</span>
                    <span className="line-through text-oc-muted">${svc.flat}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-oc-gray">Bun</span>
                    <span className="font-semibold text-white font-mono">${svc.unit}{svc.unitLabel}</span>
                  </div>
                  <div className="pt-2 border-t border-white/5 mt-2 text-xs text-oc-muted">
                    Light users save up to 80%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/5">
        <div className="px-6 py-24">
          <div className="mb-12">
            <span className="text-xs font-medium text-oc-muted uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl font-bold mt-3 text-white">Frequently asked questions</h2>
          </div>
          <div className="max-w-2xl space-y-3">
            {[
              {
                q: "How is this different from normal subscriptions?",
                a: "Normal subscriptions charge a flat monthly fee regardless of use. Bun charges only for your actual consumption if you don't use it, you don't pay for it. Unused funds are automatically returned to your account.",
              },
              {
                q: "What prevents subscribers from scamming providers?",
                a: "When you subscribe, your max spend is locked in a Soroban escrow contract. The provider is guaranteed payment for your actual usage. Settlement runs on Stellar with 5-second finality.",
              },
              {
                q: "Who sees my usage data?",
                a: "Only you and the specific provider you're using. Stellar is a public ledger but ZK proofs via BLS12-381 mean other providers and even Bun itself cannot see your full consumption graph.",
              },
              {
                q: "What is Stellar?",
                a: "Stellar is a fast, low-cost layer-1 blockchain. It uses Soroban smart contracts (Rust + WASM) with 5-second finality. BLS12-381 curves enable ZK privacy without compromising performance.",
              },
              {
                q: "How does auto-settlement work?",
                a: "An agent monitors billing cycles. At cycle end, it calculates your usage cost, settles the escrow (pays the provider), and returns any unused funds to your account. No manual approval needed if you enable auto-approve.",
              },
            ].map((faq) => (
              <details key={faq.q} className="border border-white/5 rounded-lg group">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-white list-none">
                  <span>{faq.q}</span>
                  <span className="text-oc-gray text-lg group-open:hidden">+</span>
                  <span className="text-oc-gray text-lg hidden group-open:block">&minus;</span>
                </summary>
                <p className="px-5 pb-4 text-sm text-oc-gray leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5">
        <div className="px-6 py-24">
          <h2 className="text-3xl font-bold mb-4 text-white">Stop paying for what you don&apos;t use.</h2>
          <p className="text-oc-gray mb-8">
            Bun on Stellar. Usage-based billing with ZK privacy via BLS12-381.
          </p>
          <Link href="/dashboard" className="inline-block px-6 py-3 bg-white text-oc-black rounded-md hover:bg-oc-lightest transition font-medium text-sm">
            Launch App
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 text-oc-muted text-sm">
        <div className="px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-white font-bold font-mono">分 Bun</span>
            <a href="https://github.com/mateojkk/Bun" className="hover:text-oc-light transition">GitHub</a>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-oc-light transition">Privacy</Link>
            <Link href="/terms" className="hover:text-oc-light transition">Terms</Link>
            <span>Built on Stellar</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function DotMatrixIllustration() {
  const rows = 12
  const cols = 24
  const cells = Array.from({ length: rows * cols }, (_, i) => {
    const r = Math.floor(i / cols)
    const c = i % cols
    const dist = Math.sqrt(Math.pow(c - cols / 2, 2) + Math.pow(r - rows / 2, 2))
    const opacity = Math.max(0, 1 - dist / (cols / 1.8)) * (0.3 + Math.random() * 0.7)
    return { r, c, opacity }
  })

  return (
    <div className="flex justify-center">
      <svg width={cols * 12 + 24} height={rows * 12 + 24} viewBox={`0 0 ${cols * 12 + 24} ${rows * 12 + 24}`} className="max-w-full">
        {cells.map((cell, i) => (
          <rect key={i} x={12 + cell.c * 12} y={12 + cell.r * 12} width="6" height="6" fill="#8E8B8B" opacity={cell.opacity} rx="1" />
        ))}
      </svg>
    </div>
  )
}

function EscrowDiagram() {
  return (
    <svg width="260" height="200" viewBox="0 0 260 200" className="max-w-full">
      <rect x="20" y="60" width="70" height="40" rx="6" fill="none" stroke="#BCBBBB" strokeWidth="1" strokeDasharray="3 2" />
      <text x="55" y="78" textAnchor="middle" fill="#CFCECD" fontSize="9" fontWeight="600">Account</text>
      <text x="55" y="92" textAnchor="middle" fill="#8E8B8B" fontSize="7">$100</text>

      <line x1="90" y1="80" x2="130" y2="80" stroke="#8E8B8B" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <text x="110" y="74" textAnchor="middle" fill="#8E8B8B" fontSize="7">Lock</text>

      <rect x="140" y="50" width="80" height="60" rx="6" fill="none" stroke="#8E8B8B" strokeWidth="1" />
      <text x="180" y="70" textAnchor="middle" fill="#CFCECD" fontSize="9" fontWeight="600">Escrow</text>
      <text x="180" y="84" textAnchor="middle" fill="#8E8B8B" fontSize="7">$25 locked</text>
      <text x="180" y="98" textAnchor="middle" fill="#8E8B8B" fontSize="7">Cycle: 7 days</text>

      <line x1="220" y1="80" x2="200" y2="140" stroke="#8E8B8B" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <text x="195" y="115" fill="#8E8B8B" fontSize="7">Settle</text>

      <rect x="120" y="138" width="80" height="50" rx="6" fill="none" stroke="#6B6B6B" strokeWidth="1" />
      <text x="160" y="156" textAnchor="middle" fill="#CFCECD" fontSize="8" fontWeight="600">Payment</text>
      <text x="160" y="170" textAnchor="middle" fill="#8E8B8B" fontSize="7">$12.50 to provider</text>
      <text x="160" y="182" textAnchor="middle" fill="#8E8B8B" fontSize="7">$12.50 returned</text>

      <path d="M 140 70 Q 80 30 55 60" fill="none" stroke="#CFCECD" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arrow-light)" />
      <text x="80" y="42" textAnchor="middle" fill="#CFCECD" fontSize="7">Refund unused</text>

      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#8E8B8B" />
        </marker>
        <marker id="arrow-light" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#CFCECD" />
        </marker>
      </defs>
    </svg>
  )
}
