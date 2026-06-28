import type { EscrowData } from "@bun/shared"

export default function SubscriptionCard({
  contractId,
  payload,
}: {
  contractId: string
  payload: EscrowData
}) {
  const statusColor =
    payload.status === "Active"
      ? "bg-white/10 text-white"
      : payload.status === "Settled"
        ? "bg-white/5 text-oc-gray"
        : "bg-white/5 text-oc-muted"

  const usageCost = Number(payload.usage) * Number(payload.unit_price)
  const flatRate = Number(payload.flat_rate)
  const savings = flatRate - usageCost

  return (
    <div className="p-4 border border-white/5 rounded-lg bg-white/[0.02]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-lg text-white">
          {payload.service_name}
        </h2>
        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>
          {payload.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-oc-gray">
        <div>
          <span className="text-oc-muted">Price:</span>{" "}
          {(Number(payload.unit_price) / 1e7).toFixed(4)} USDC / unit
        </div>
        <div>
          <span className="text-oc-muted">Usage:</span>{" "}
          {payload.usage} units
        </div>
        <div>
          <span className="text-oc-muted">Escrow:</span>{" "}
          {(Number(payload.amount) / 1e7).toFixed(2)} USDC
        </div>
        <div>
          <span className="text-oc-muted">Current:</span>{" "}
          {(usageCost / 1e14).toFixed(4)} USDC
        </div>
      </div>

      {flatRate > 0 && (
        <div className="mt-2 text-xs">
          <span className="text-oc-muted">Flat rate: </span>
          <span className="line-through">{(flatRate / 1e7).toFixed(2)} USDC/mo</span>
          {savings > 0 && (
            <span className="text-oc-lighter ml-1">
              saved {(savings / 1e7).toFixed(2)} USDC
            </span>
          )}
        </div>
      )}

      <div className="mt-2 text-xs text-oc-muted">
        Contract: {contractId.slice(0, 16)}...
      </div>
    </div>
  )
}
