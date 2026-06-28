export default function TermsPage() {
  return (
    <div className="min-h-screen bg-oc-black">
      <div className="px-6 py-12 max-w-3xl mx-auto">
        <article>
          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-oc-muted text-sm mb-10">
            Last updated: June 2026 · Testnet Demo
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">1. Testnet Demo Only</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              Bun (分) is a <strong className="text-white">hackathon / testnet demonstration project</strong>.
              It operates exclusively on the Stellar testnet. All USDC and testnet tokens used within
              Bun have <strong className="text-white">no real monetary value</strong> and cannot be
              exchanged for real currency.
            </p>
            <p className="text-oc-gray leading-relaxed mb-3">
              Bun is <strong className="text-white">not</strong> a regulated financial service,
              payment processor, or money transmitter. It must not be used for real financial
              transactions, and no real assets should be at risk when using this service.
            </p>
            <p className="text-oc-gray leading-relaxed">
              By using Bun you acknowledge that you are participating in a technology demonstration
              and accept the associated risks, including the possibility of bugs, downtime, and
              testnet resets.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">2. Stellar Keypair and Account</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              On your first login, Bun generates a Stellar keypair for your account:
            </p>
            <ul className="text-oc-gray leading-relaxed space-y-2 list-disc list-inside mb-3">
              <li>
                Your <strong className="text-white">Stellar public key</strong> (partyId) is stored
                in our MongoDB database and used to identify your account.
              </li>
              <li>
                Your <strong className="text-white">Stellar secret key (private key)</strong> is
                generated in-memory in your browser and is <strong className="text-white">never
                transmitted to or stored by Bun</strong>.
              </li>
              <li>
                You are solely responsible for saving your private key if you require access to your
                Stellar account outside of an active browser session. Bun cannot recover your private
                key for you.
              </li>
            </ul>
            <p className="text-oc-gray leading-relaxed">
              Loss of your private key means loss of access to any testnet funds associated with
              your Stellar address. Bun accepts no liability for lost keypairs.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">3. Escrow Mechanics</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              When you subscribe to a service on Bun, your approved maximum spend is locked in a
              Soroban escrow smart contract on the Stellar testnet. By initiating a subscription you
              are authorising this lock and agreeing to be bound by the rules of the escrow contract.
            </p>
            <p className="text-oc-gray leading-relaxed mb-3">
              The escrow contract, not Bun, governs the conditions under which your funds are
              released. Once funds are escrowed, the smart contract logic determines all outcomes.
              Bun cannot unilaterally retrieve or redirect escrowed funds.
            </p>
            <p className="text-oc-gray leading-relaxed">
              Escrow contracts are deployed on the Stellar testnet and are subject to the behaviour
              of that network, including potential network resets.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">4. Auto-Settlement</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              At the end of a subscription cycle, Bun&apos;s settlement agent automatically invokes
              the <code className="text-oc-lighter bg-white/5 px-1 rounded">settle()</code> function
              on the relevant escrow contract. Settlement distributes funds as follows:
            </p>
            <ul className="text-oc-gray leading-relaxed space-y-2 list-disc list-inside mb-3">
              <li>
                Funds corresponding to recorded usage are transferred to the provider.
              </li>
              <li>
                Any remaining unused funds (up to the approved maxSpend) are returned to the
                subscriber.
              </li>
            </ul>
            <p className="text-oc-gray leading-relaxed">
              Settlement is fully automated and on-chain. There is no manual dispute or
              chargeback process. If you believe a settlement was incorrect, you may inspect the
              on-chain transaction record directly on the Stellar testnet explorer.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">5. Provider Usage Reporting</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              Providers are responsible for reporting usage to the escrow contract via the{" "}
              <code className="text-oc-lighter bg-white/5 px-1 rounded">record_usage()</code>{" "}
              function. Payments at settlement are calculated based on this reported usage.
            </p>
            <p className="text-oc-gray leading-relaxed mb-3">
              The escrow contract enforces a hard cap: the total settlement amount paid to a provider
              can <strong className="text-white">never exceed the subscriber&apos;s approved maxSpend</strong>{" "}
              (the <code className="text-oc-lighter bg-white/5 px-1 rounded">amount</code> parameter
              specified when the escrow was initialised). Providers cannot charge subscribers more
              than their explicitly authorised limit regardless of usage reported.
            </p>
            <p className="text-oc-gray leading-relaxed">
              Bun does not independently verify the accuracy of provider usage reports. Disputes
              about usage accuracy are between subscribers and providers and are outside Bun&apos;s
              scope for this testnet demo.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">6. Anti-Scam Design</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              Bun&apos;s escrow model is designed to protect subscribers:
            </p>
            <ul className="text-oc-gray leading-relaxed space-y-2 list-disc list-inside mb-3">
              <li>
                Subscriber funds are held in a Soroban smart contract, not by Bun. Bun does not
                have custody of or access to escrowed tokens.
              </li>
              <li>
                The contract enforces the maxSpend cap on-chain — providers are technically
                prevented from withdrawing more than the subscriber approved.
              </li>
              <li>
                Any amount not consumed by usage is automatically returned to the subscriber at
                settlement.
              </li>
            </ul>
            <p className="text-oc-gray leading-relaxed">
              While this design minimises certain risks, it does not eliminate all risks. Smart
              contracts can contain bugs. This is a testnet demo and should not be used with assets
              of real value.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">7. No Warranties</h2>
            <p className="text-oc-gray leading-relaxed mb-3">
              Bun is provided <strong className="text-white">&quot;as is&quot;</strong> and{" "}
              <strong className="text-white">&quot;as available&quot;</strong> without any warranties,
              express or implied. We make no representations about:
            </p>
            <ul className="text-oc-gray leading-relaxed space-y-2 list-disc list-inside mb-3">
              <li>Uptime, availability, or reliability of the service</li>
              <li>The correctness or security of the smart contract code</li>
              <li>Persistence of testnet data across network resets</li>
              <li>Compatibility with future versions of the Stellar testnet</li>
            </ul>
            <p className="text-oc-gray leading-relaxed">
              To the fullest extent permitted by law, Bun and its contributors disclaim all
              liability for any loss or damage arising from your use of this testnet demo, including
              loss of testnet tokens.
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
              We may update these Terms of Service from time to time to reflect changes in the
              product, applicable law, or operational requirements. When we do, we will update the
              &quot;Last updated&quot; date at the top of this page.
            </p>
            <p className="text-oc-gray leading-relaxed">
              Your continued use of Bun after any changes to these terms constitutes your acceptance
              of the revised terms. If you do not agree to the updated terms, you should stop using
              the service.
            </p>
          </section>
        </article>
      </div>
    </div>
  )
}
