export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-oc-black">
      <div className="px-6 py-12 max-w-3xl mx-auto">
        <article>
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-oc-muted text-sm mb-10">
            Last updated: June 2026 · Testnet Demo
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">1. What We Collect</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              When you sign up for Bun, we collect the following information:
            </p>
            <ul className="text-oc-gray leading-relaxed space-y-2 list-disc list-inside mb-3">
              <li>
                <strong className="text-white">Email address</strong> — provided to Privy during OTP
                authentication. We receive a Privy user ID derived from this but do not store your
                raw email ourselves.
              </li>
              <li>
                <strong className="text-white">Stellar public key (partyId)</strong> — a keypair is
                generated the first time you log in. Only the public key is stored in our database.
              </li>
              <li>
                <strong className="text-white">Username</strong> — a display name you set at account
                creation, stored in MongoDB Atlas alongside your Privy user ID and Stellar public key.
              </li>
            </ul>
            <p className="text-oc-gray leading-relaxed">
              We do not collect payment card information, home addresses, phone numbers, or any
              government-issued identification.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">2. What We Do NOT Collect</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              <strong className="text-white">Private keys are never stored server-side.</strong> Your
              Stellar secret key is generated in-memory in your browser session and is never
              transmitted to our servers. You are solely responsible for saving your private key if
              you need to recover your account outside of a session.
            </p>
            <p className="text-oc-gray leading-relaxed">
              Payments and settlement are executed directly between users and Soroban smart contracts
              on the Stellar testnet. Bun does not intermediate the movement of funds and does not
              hold custody of your tokens.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">3. On-Chain Data</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              Bun is built on the Stellar testnet, a public blockchain. By its nature, certain data
              is <strong className="text-white">permanently and publicly visible</strong> on the
              ledger to anyone:
            </p>
            <ul className="text-oc-gray leading-relaxed space-y-2 list-disc list-inside mb-3">
              <li>Escrow amounts locked at subscription time</li>
              <li>Usage records reported by providers</li>
              <li>Settlement transaction details (amounts sent to providers, amounts returned)</li>
              <li>Stellar public keys (partyIds) of all participants</li>
            </ul>
            <p className="text-oc-gray leading-relaxed">
              This is an inherent property of public blockchains and is not within Bun&apos;s control.
              Do not conduct transactions you wish to keep entirely private on a public ledger.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">4. ZK Privacy (Balance Commitments)</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              Bun uses a SHA-256 commit-reveal scheme in its ZK Verifier contract to protect
              sensitive balance information during settlement:
            </p>
            <ol className="text-oc-gray leading-relaxed space-y-2 list-decimal list-inside mb-3">
              <li>
                A subscriber commits <code className="text-oc-lighter bg-white/5 px-1 rounded">sha256(balance + salt)</code> to
                the contract on-chain. The actual balance is not stored on-chain.
              </li>
              <li>
                At settlement, the subscriber reveals their balance and salt. The contract verifies
                the hash matches the original commitment before proceeding.
              </li>
              <li>
                Providers see only the commitment hash — not the subscriber&apos;s actual balance.
              </li>
            </ol>
            <p className="text-oc-gray leading-relaxed">
              This mechanism ensures that providers cannot learn a subscriber&apos;s wallet balance, only
              that the subscriber meets the minimum threshold required by the subscription.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">5. Cookies</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              We set two <strong className="text-white">httpOnly</strong> cookies on your browser
              after successful authentication:
            </p>
            <ul className="text-oc-gray leading-relaxed space-y-2 list-disc list-inside mb-3">
              <li>
                <code className="text-oc-lighter bg-white/5 px-1 rounded">bun_party</code> — your
                Stellar public key, used to identify your session and route you to the correct
                account state.
              </li>
              <li>
                <code className="text-oc-lighter bg-white/5 px-1 rounded">bun_name</code> — your
                display username, used to personalise the UI.
              </li>
            </ul>
            <p className="text-oc-gray leading-relaxed">
              Both cookies are session-scoped and are cleared when you sign out. We do not use
              tracking, advertising, or analytics cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">6. Third-Party Services</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              Bun relies on the following third-party services, each of which has its own privacy
              policy:
            </p>
            <ul className="text-oc-gray leading-relaxed space-y-2 list-disc list-inside mb-3">
              <li>
                <strong className="text-white">Privy</strong> — handles email OTP authentication.
                Your email is processed by Privy to send the one-time passcode. See{" "}
                <span className="text-oc-lighter">privy.io/legal/privacy</span> for details.
              </li>
              <li>
                <strong className="text-white">MongoDB Atlas</strong> — stores your account record
                (Privy user ID, Stellar public key, username). Data is stored in MongoDB Atlas
                cloud infrastructure. See{" "}
                <span className="text-oc-lighter">mongodb.com/legal/privacy-policy</span> for details.
              </li>
              <li>
                <strong className="text-white">Stellar testnet</strong> — the blockchain
                infrastructure on which all smart contract interactions occur. All on-chain data is
                publicly visible on the Stellar testnet ledger.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">7. Data Retention</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              This is a testnet demo project. Data retention is best-effort and not guaranteed:
            </p>
            <ul className="text-oc-gray leading-relaxed space-y-2 list-disc list-inside mb-3">
              <li>
                MongoDB Atlas records (account data) may be cleared periodically for demo and
                maintenance purposes without notice.
              </li>
              <li>
                Stellar testnet ledger data is maintained by the Stellar Development Foundation and
                may be reset at their discretion.
              </li>
              <li>
                We do not currently offer a formal data deletion request process for this demo.
                If you wish to have your account record removed from MongoDB, contact us at the
                email below.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">8. No Advertising — No Data Selling</h2>
            <p className="text-oc-gray leading-relaxed">
              Bun is a hackathon demo project. We do not sell, rent, or share your personal data
              with advertisers, data brokers, or any third parties for marketing purposes. Your data
              is used solely to operate the Bun service.
            </p>
          </section>

          <section className="mb-8 border-t border-white/5 pt-8 mt-8">
            <h2 className="text-xl font-semibold text-white mb-3">9. Contact</h2>
            <p className="text-oc-gray leading-relaxed">
              For privacy-related questions or data removal requests, contact us at:{" "}
              <span className="text-oc-lighter">privacy@bun.finance</span>
            </p>
          </section>
        </article>
      </div>
    </div>
  )
}
