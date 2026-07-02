export default function PrivacyBadge() {
  return (
    <div className="p-4 bg-oc-black border border-white/5 rounded-lg">
      <h3 className="font-semibold text-oc-light mb-2">
        Privacy &amp; Provider Isolation
      </h3>
      <ul className="space-y-1 text-sm text-oc-lighter">
        <li>
          <span className="mr-1">&#x2713;</span> Other subscriptions: hidden from each provider
        </li>
        <li>
          <span className="mr-1">&#x2713;</span> Wallet balance: not exposed to providers
        </li>
        <li>
          <span className="mr-1">&#x2713;</span> Usage trail: scoped to you and the authorized app
        </li>
        <li>
          <span className="mr-1">&#x2713;</span> Settlement: enforced by Soroban escrow rules
        </li>
        <li>
          <span className="mr-1">&#x2713;</span> ZK balance proofs: commit-reveal prototype on testnet
        </li>
      </ul>
    </div>
  )
}
