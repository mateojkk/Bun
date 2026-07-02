import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  return (
    <main className="bg-white font-sans antialiased">

      {/* ══════════════════════════════════════════
          HERO — Full bleed cinematic background
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen w-full overflow-hidden">

        {/* Background image */}
        <Image
          src="/hero-bg-anime.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />
        {/* Dark scrim — heavier on left where text sits */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

        {/* ── Nav ── */}
        <header className="absolute top-0 inset-x-0 z-20">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white font-geist">
              Bun.
            </Link>

            {/* Center nav */}
            <nav className="hidden md:flex items-center gap-7 text-sm text-white/70">
              <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
              <Link href="/merchant/sandbox" className="hover:text-white transition-colors">Sandbox</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Network</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Company</Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <button className="text-white/60 hover:text-white transition-colors p-1">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.2"/>
                  <ellipse cx="10" cy="10" rx="4" ry="8.5" stroke="currentColor" strokeWidth="1.2"/>
                  <line x1="1.5" y1="10" x2="18.5" y2="10" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
              </button>
              <Link
                href="/dashboard"
                className="rounded-full bg-white text-black text-sm font-medium px-5 py-2 hover:bg-white/90 transition-colors"
              >
                Log in
              </Link>
            </div>
          </div>
        </header>

        {/* ── Hero text — left aligned, bottom-ish ── */}
        <div className="absolute inset-0 flex flex-col justify-end pb-20 px-6">
          <div className="mx-auto w-full max-w-[1400px]">
            <h1 className="font-geist text-[clamp(2.4rem,6vw,5rem)] font-[440] leading-[1.07] tracking-[-0.03em] text-white max-w-xl mb-5">
              The next gen payment rail for the new economy.
            </h1>
            <p className="text-white/60 text-sm max-w-xs leading-relaxed mb-8">
              Any app adds Pay with Bun: customers authorize a cap, providers meter real usage, and Soroban escrow enforces settlement.
            </p>

            {/* Pill CTA */}
            <Link
              href="/merchant/sandbox"
              className="inline-flex items-center rounded-full bg-white text-black text-sm font-medium px-7 py-3.5 hover:bg-white/90 transition-colors mb-10"
            >
              Try the merchant flow
            </Link>

            {/* Trust pills bottom */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/50 text-xs">
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1"/>
                  <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Cap enforced on-chain
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1"/>
                  <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Soroban escrow
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1"/>
                  <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Add to any app
              </span>
            </div>
          </div>
        </div>


      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — White centered CTA (Plasma scroll)
      ══════════════════════════════════════════ */}
      <section className="bg-[#f7f7f5] flex flex-col items-center justify-center text-center px-6 py-36">
        <div className="flex items-center gap-2 mb-6 text-sm text-black/40 font-mono uppercase tracking-widest">
          Bun Protocol
        </div>
        <h2 className="font-geist text-[clamp(2.8rem,8vw,6rem)] font-[460] leading-[1.03] tracking-[-0.04em] text-black max-w-2xl mb-10">
          A billing flow teams can integrate today.
        </h2>
        <Link
          href="/merchant/sandbox"
          className="inline-flex items-center gap-2 rounded-full bg-[#3de23d] text-black text-sm font-medium px-8 py-4 hover:bg-[#2fcf2f] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="5" width="16" height="12" rx="2" stroke="black" strokeWidth="1.4"/>
            <path d="M6 5V4a4 4 0 018 0v1" stroke="black" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Try the merchant flow
        </Link>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — Features with floating stats
      ══════════════════════════════════════════ */}
      <section className="bg-[#efefed] px-6 py-28 overflow-hidden">
        <div className="mx-auto max-w-[1400px] text-center mb-16">
          <div className="text-xs text-black/35 uppercase tracking-widest mb-4 font-mono">Built different</div>
          <h2 className="font-geist text-[clamp(2rem,5vw,3.8rem)] font-[460] tracking-[-0.04em] text-black">
            Soroban escrow + ZK verifier.
          </h2>
        </div>
        <div className="mx-auto max-w-[1400px] relative flex justify-center">
          {/* Left stats */}
          <div className="hidden lg:flex flex-col gap-5 justify-center mr-10 w-44">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="text-[2.2rem] font-geist font-[460] tracking-tight text-black leading-none">$0</div>
              <div className="text-xs text-black/45 mt-2 leading-snug">Billing stack to maintain</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="text-[2.2rem] font-geist font-[460] tracking-tight text-black leading-none">100%</div>
              <div className="text-xs text-black/45 mt-2 leading-snug">Cap enforced by contract</div>
            </div>
          </div>

          {/* Central mock phone/card */}
          <div className="w-72 shrink-0">
            <div className="bg-black rounded-[2.5rem] p-6 shadow-2xl shadow-black/30">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Pay with Bun</div>
                  <div className="text-white/60 text-xs mt-0.5">Soroban escrow</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3de23d]"/>
                  <span className="text-[#3de23d] text-[10px]">Active</span>
                </div>
              </div>
              <div className="text-xs text-white/35 mb-1">Total authorized</div>
              <div className="text-[2.5rem] font-geist font-[400] tracking-tight text-white mb-5">$5.00</div>
              <div className="space-y-2.5 mb-5">
                {[
                  { label: "Used", value: "$0.84", color: "text-white" },
                  { label: "Remaining", value: "$4.16", color: "text-[#3de23d]" },
                  { label: "Provider", value: "AI Service Co.", color: "text-white/60" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-white/[0.07]">
                    <span className="text-xs text-white/35">{item.label}</span>
                    <span className={`text-xs font-mono ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[17%] bg-[#3de23d] rounded-full"/>
              </div>
              <div className="mt-3 flex justify-between text-[10px] text-white/25">
                <span>420k tokens</span>
                <span>17% of cap</span>
              </div>
            </div>
          </div>

          {/* Right stats */}
          <div className="hidden lg:flex flex-col gap-5 justify-center ml-10 w-44">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="text-[2.2rem] font-geist font-[460] tracking-tight text-black leading-none">3</div>
              <div className="text-xs text-black/45 mt-2 leading-snug">API calls to go live</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="text-[2.2rem] font-geist font-[460] tracking-tight text-black leading-none">180+</div>
              <div className="text-xs text-black/45 mt-2 leading-snug">Countries via Stellar</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — How it works
      ══════════════════════════════════════════ */}
      <section className="bg-white px-6 py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-16">
            <div className="text-xs text-black/35 uppercase tracking-widest mb-4 font-mono">Integration</div>
            <h2 className="font-geist text-[clamp(2rem,5vw,3.5rem)] font-[460] tracking-[-0.04em] text-black">
              Four steps. Zero billing stack.
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {[
              { n: "01", title: "Install", body: "Add the Bun SDK or call the REST API from your backend." },
              { n: "02", title: "Authorize", body: "Redirect customers to hosted Pay with Bun checkout." },
              { n: "03", title: "Meter", body: "Report usage events from inside your app via one API call." },
              { n: "04", title: "Settle", body: "Soroban calculates payout and returns unused balance on-chain." },
            ].map((step) => (
              <div key={step.n} className="bg-[#f5f5f3] rounded-3xl p-7 hover:bg-[#efefed] transition-colors">
                <div className="text-xs font-mono text-black/25 mb-6">{step.n}</div>
                <h3 className="text-lg font-[500] text-black mb-2 tracking-[-0.02em]">{step.title}</h3>
                <p className="text-sm text-black/50 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5 — CTA band
      ══════════════════════════════════════════ */}
      <section className="bg-white px-6 pb-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="bg-black rounded-3xl px-10 py-16 text-center">
            <h2 className="font-geist text-[clamp(2rem,5vw,3.5rem)] font-[460] tracking-[-0.03em] text-white mb-4">
              Integrate Bun into your app.
            </h2>
            <p className="text-white/40 text-sm mb-8 max-w-md mx-auto leading-relaxed">
              SDK, hosted checkout, and a usage API. Go live in an afternoon.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/docs"
                className="rounded-full bg-[#3de23d] text-black text-sm font-medium px-7 py-3.5 hover:bg-[#2fcf2f] transition-colors"
              >
                Start building
              </Link>
              <Link
                href="/merchant/sandbox"
                className="rounded-full border border-white/15 text-white text-sm font-medium px-7 py-3.5 hover:border-white/30 transition-colors"
              >
                Try the sandbox
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER — dark multi-column
      ══════════════════════════════════════════ */}
      <footer className="bg-[#0d0d0b] px-6 py-16">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-12 mb-16">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white shrink-0 font-geist">
              Bun.
            </Link>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
              {[
                { heading: "Products", links: [{ label: "Dashboard", href: "/dashboard" }, { label: "Sandbox", href: "/merchant/sandbox" }, { label: "Checkout", href: "/checkout" }] },
                { heading: "Developers", links: [{ label: "Docs", href: "/docs" }, { label: "SDK", href: "/docs#sdk" }, { label: "Contracts", href: "/docs#contracts" }] },
                { heading: "Network", links: [{ label: "Stellar", href: "https://stellar.org" }, { label: "Explorer", href: "https://stellar.expert/explorer/testnet" }] },
                { heading: "Company", links: [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }] },
              ].map((col) => (
                <div key={col.heading}>
                  <div className="text-white/25 mb-4 text-xs uppercase tracking-widest">{col.heading}</div>
                  <ul className="space-y-3 text-white/50">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href} className="hover:text-white transition-colors">{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/[0.07] pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-white/20">
            <span>&copy; {new Date().getFullYear()} Bun Protocol.</span>
          </div>
        </div>
      </footer>

    </main>
  )
}
