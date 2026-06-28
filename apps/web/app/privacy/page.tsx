export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-oc-black">
      <div className="px-6 py-12 max-w-3xl mx-auto">
        <article>
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-oc-muted text-sm mb-10">
            Last updated: June 2026 · Pre-Launch Testnet Phase
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">1. What We Collect</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              To operate the Bun service, we collect the following basic information:
            </p>
            <ul className="text-oc-gray leading-relaxed space-y-2 list-disc list-inside mb-3">
              <li>
                <strong className="text-white">Authentication Data</strong> — handled via Privy during passwordless OTP
                authentication. We receive a secure unique user ID from Privy, but we do not store your raw email
                address directly on our servers.
              </li>
              <li>
                <strong className="text-white">Stellar Public Key (partyId)</strong> — a cryptographic public address
                generated upon account creation to identify your account ledger and route payments.
              </li>
              <li>
                <strong className="text-white">Username</strong> — a display name of your choice, stored in our database
                alongside your public key to personalize the interface.
              </li>
            </ul>
            <p className="text-oc-gray leading-relaxed">
              We do not collect physical addresses, telephone numbers, governmental identification, or traditional
              credit/debit card information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">2. What We Do NOT Collect</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              <strong className="text-white">Your private keys are never stored on our servers.</strong> Your
              Stellar secret key is managed securely in-memory within your browser and is never transmitted to
              or accessible by Bun.
            </p>
            <p className="text-oc-gray leading-relaxed">
              All payment locking, tracking, and settlements are executed programmatically via smart contracts on the
              Stellar network. Bun does not intermediate the transfer of capital or hold custody of subscriber/provider tokens.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">3. On-Chain Transaction Public Visibility</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              Bun uses the public Stellar ledger to ensure secure, trustless payment guarantees. By design, certain
              transaction components are <strong className="text-white">permanently and publicly visible</strong> on-chain
              to any ledger auditor:
            </p>
            <ul className="text-oc-gray leading-relaxed space-y-2 list-disc list-inside mb-3">
              <li>Escrow limits locked upon active subscriptions</li>
              <li>Consumption metrics reported to the contract by service providers</li>
              <li>Cycle-end settlement distribution amounts between parties</li>
              <li>Associated Stellar public keys (partyIds)</li>
            </ul>
            <p className="text-oc-gray leading-relaxed">
              This public visibility is standard across public blockchain networks. We advise against conducting
              sensitive business transactions under public keys that you wish to keep entirely unlinkable to your real-world identity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">4. ZK Privacy (Balance Commitments)</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              To protect subscriber wallet balances from merchant tracking, Bun employs a SHA-256 commit-reveal pattern
              in its ZK Verifier contract:
            </p>
            <ol className="text-oc-gray leading-relaxed space-y-2 list-decimal list-inside mb-3">
              <li>
                Subscribers commit to their balance cryptographically on-chain: <code className="text-oc-lighter bg-white/5 px-1 rounded">sha256(balance + salt)</code>.
              </li>
              <li>
                During settlement verification, the contract verifies the commitment against the required amount.
              </li>
              <li>
                Providers verify that the subscriber has sufficient funds to settle their billing cap, but never
                learn the subscriber&apos;s actual wallet balance.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">5. Cookies</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              We set two secure, session-scoped <strong className="text-white">httpOnly</strong> cookies:
            </p>
            <ul className="text-oc-gray leading-relaxed space-y-2 list-disc list-inside mb-3">
              <li>
                <code className="text-oc-lighter bg-white/5 px-1 rounded">bun_party</code> — stores your public key to route your session securely.
              </li>
              <li>
                <code className="text-oc-lighter bg-white/5 px-1 rounded">bun_name</code> — stores your display username for UI personalization.
              </li>
            </ul>
            <p className="text-oc-gray leading-relaxed">
              These cookies contain no personal identifiers and are immediately destroyed when you log out. We do not run third-party tracker, advertising, or marketing pixels.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">6. Integrated Subprocessors</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              Bun integrates with standard developer infrastructure platforms to maintain its service:
            </p>
            <ul className="text-oc-gray leading-relaxed space-y-2 list-disc list-inside mb-3">
              <li>
                <strong className="text-white">Privy</strong> — handles secure email OTP user login.
                (See privacy details at <span className="text-oc-lighter">privy.io</span>).
              </li>
              <li>
                <strong className="text-white">MongoDB Atlas</strong> — hosts cloud database clusters storing account public keys and usernames.
                (See compliance details at <span className="text-oc-lighter">mongodb.com</span>).
              </li>
              <li>
                <strong className="text-white">Stellar Network</strong> — execution protocol where all escrow smart contracts are executed.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">7. Data Retention & Maintenance</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              During this pre-launch testnet phase, database environments are maintained to preserve staging profiles, though they remain subject to testnet network adjustments:
            </p>
            <ul className="text-oc-gray leading-relaxed space-y-2 list-disc list-inside mb-3">
              <li>
                MongoDB database profiles are retained for testing consistency but may undergo migrations as we optimize system structures.
              </li>
              <li>
                Stellar testnet ledger history is subject to periodic resets performed by the Stellar Development Foundation.
              </li>
              <li>
                Users can easily request profile deletion by contacting us at the support address below.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">8. Zero Monetization of Data</h2>
            <p className="text-oc-gray leading-relaxed">
              Bun is a utility payment protocol. We do not monetize your data. We do not sell, rent, lease, or share
              user profile logs or transaction details with third-party data brokers, marketers, or advertisers. Your data
              is used exclusively to facilitate your subscription transactions.
            </p>
          </section>

          <section className="mb-8 border-t border-white/5 pt-8 mt-8">
            <h2 className="text-xl font-semibold text-white mb-3">9. Contact & Support</h2>
            <p className="text-oc-gray leading-relaxed">
              For security compliance, data access requests, or privacy inquiries, contact our development desk at:{" "}
              <span className="text-oc-lighter">privacy@bun.finance</span>
            </p>
          </section>
        </article>
      </div>
    </div>
  )
}
