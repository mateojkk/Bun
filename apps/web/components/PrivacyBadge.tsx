export default function PrivacyBadge() {
  return (
    <div className="p-4 bg-oc-black border border-white/5 rounded-lg">
      <h3 className="font-semibold text-oc-light mb-2">
        Privacy Status
      </h3>
      <ul className="space-y-1 text-sm text-oc-lighter">
        <li>
          <span className="mr-1">&#x2713;</span> Your other
          subscriptions: hidden from this provider
        </li>
        <li>
          <span className="mr-1">&#x2713;</span> Your total balance:
          hidden from agent
        </li>
        <li>
          <span className="mr-1">&#x2713;</span> This usage pattern:
          visible only to you and this provider
        </li>
        <li>
          <span className="mr-1">&#x2713;</span> Settlement amount:
          visible only to transaction parties
        </li>
        <li>
          <span className="mr-1">&#x2713;</span> Sub-transaction
          privacy enforced by Canton at the protocol level
        </li>
      </ul>
    </div>
  )
}
