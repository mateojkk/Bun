export default function TermsPage() {
  return (
    <div className="min-h-screen bg-oc-black">
      <div className="px-6 py-12 max-w-3xl mx-auto">
        <article>
          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-oc-muted text-sm mb-10">
            Last updated: June 2026 · Pre-Launch Testnet Phase
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">1. Pre-Launch Testnet Staging & Funding</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              Bun (分) is a usage-based payment protocol. This current deployment operates on the <strong className="text-white">Stellar Testnet</strong> as a pre-launch staging environment. The project is currently preparing for its commercial <strong className="text-white">Stellar Mainnet</strong> deployment and is actively seeking funding and capital investment to support this transition.
            </p>
            <p className="text-oc-gray leading-relaxed mb-3">
              All USDC and other network assets utilized in this pre-launch deployment are testnet tokens. They have <strong className="text-white">no real-world monetary value</strong>, cannot be exchanged for real currency, and are used solely to demonstrate the system&apos;s utility and production readiness.
            </p>
            <p className="text-oc-gray leading-relaxed">
              By using Bun, you acknowledge that you are participating in a staging/pre-launch phase designed to showcase our payment infrastructure for potential investors and early partners, and you accept the associated risks of a testnet environment.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">2. Stellar Keypair and Account</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              Upon account creation, Bun generates a standard cryptographic Stellar keypair for your session:
            </p>
            <ul className="text-oc-gray leading-relaxed space-y-2 list-disc list-inside mb-3">
              <li>
                Your <strong className="text-white">Stellar public key</strong> (partyId) is stored
                in our database and used to identify your account records.
              </li>
              <li>
                Your <strong className="text-white">Stellar secret key (private key)</strong> is
                stored securely to sign smart contract initializations and transaction proofs.
              </li>
              <li>
                You are solely responsible for maintaining the security of your account credentials.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">3. Escrow Mechanics</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              When subscribing to a service on Bun, your approved maximum spend is locked in a
              Soroban escrow smart contract. By initiating a subscription, you authorize this programmatic lock
              and agree to be bound by the rules encoded in the escrow contract.
            </p>
            <p className="text-oc-gray leading-relaxed">
              The smart contract logic governs the release of funds. Once escrowed, the transaction rules cannot
              be unilaterally modified, bypassed, or reversed by Bun or any external party, ensuring a trustless
              payment settlement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">4. Auto-Settlement</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              At the end of each billing cycle, Bun&apos;s automated settlement agent invokes the
              on-chain <code className="text-oc-lighter bg-white/5 px-1 rounded">settle()</code> function.
              This distributes the escrowed funds:
            </p>
            <ul className="text-oc-gray leading-relaxed space-y-2 list-disc list-inside mb-3">
              <li>
                Funds corresponding to verified consumption are transferred directly to the provider.
              </li>
              <li>
                Any remaining unused balance is immediately returned to the subscriber.
              </li>
            </ul>
            <p className="text-oc-gray leading-relaxed">
              Settlement is fully automated and settled on-chain with finality. If you believe a settlement
              was incorrect, the on-chain transaction history is permanently auditable on the Stellar ledger.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">5. Provider Usage Reporting</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              Providers are responsible for reporting accurate usage metrics to the escrow contract.
              Payments are calculated programmatically based on these reports.
            </p>
            <p className="text-oc-gray leading-relaxed mb-3">
              The smart contract enforces a hard cap: the total payment to a provider
              can <strong className="text-white">never exceed the subscriber&apos;s approved maxSpend</strong>
              specified during escrow initialization. Providers cannot overcharge subscribers.
            </p>
            <p className="text-oc-gray leading-relaxed">
              Disputes regarding consumption metrics are governed by the service agreement between the subscriber
              and the provider, outside the scope of the payment protocol during this testnet staging phase.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">6. Cryptographic Protection & Risks</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              Bun&apos;s protocol is architected to eliminate merchant/client fraud:
            </p>
            <ul className="text-oc-gray leading-relaxed space-y-2 list-disc list-inside mb-3">
              <li>
                Tokens are held in a secure Soroban contract, completely eliminating custody risks.
              </li>
              <li>
                The maxSpend cap is enforced on-chain at the execution level.
              </li>
              <li>
                Subscribers are guaranteed refunds for unused services via programmatic settlement.
              </li>
            </ul>
            <p className="text-oc-gray leading-relaxed">
              While designed to production-grade security specifications, you acknowledge that during this
              pre-launch phase, code optimizations and network adjustments are ongoing. Do not utilize real production
              assets in this testnet environment.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">7. Disclaimers & Warranties</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              During this pre-launch staging phase, Bun is provided <strong className="text-white">&quot;as is&quot;</strong>
              without express or implied warranties. We make no representations about:
            </p>
            <ul className="text-oc-gray leading-relaxed space-y-2 list-disc list-inside mb-3">
              <li>Continuous runtime availability of the testnet platform</li>
              <li>Stellar testnet-level data persistence across ledger resets</li>
            </ul>
            <p className="text-oc-gray leading-relaxed">
              To the maximum extent permitted by law, Bun disclaims liability for any loss arising from your
              participation in this pre-launch staging environment.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">8. Governing Law</h2>
            <p className="text-oc-gray leading-relaxed">
              These Terms of Service are governed by and construed in accordance with the laws of
              England and Wales. Any disputes arising from or in connection with these terms shall
              be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section className="mb-8 border-t border-white/5 pt-8 mt-8">
            <h2 className="text-xl font-semibold text-white mb-3">9. Changes to These Terms</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              We reserve the right to update these Terms of Service as our protocol matures towards its mainnet launch.
              Updates will be indicated by the &quot;Last updated&quot; date at the top of this page.
            </p>
            <p className="text-oc-gray leading-relaxed">
              Your continued use of Bun after changes are posted constitutes acceptance of the updated terms.
            </p>
          </section>
        </article>
      </div>
    </div>
  )
}
