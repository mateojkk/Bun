import type { Subscription } from "@bun/shared"

export default function SubscriptionCard({
  contractId,
  payload,
}: {
  contractId: string
  payload: Subscription
}) {
  const statusColor =
    payload.status === "Active"
      ? "bg-green-100 text-green-800"
      : payload.status === "Paused"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-gray-100 text-gray-800"

  const usageCost =
    Number(payload.usage) * Number(payload.unitPrice)

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-lg">
          {payload.serviceName}
        </h2>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}
        >
          {payload.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
        <div>
          <span className="text-gray-400">Price:</span>{" "}
          {payload.unitPrice} / {payload.unitType}
        </div>
        <div>
          <span className="text-gray-400">Usage:</span>{" "}
          {payload.usage} {payload.unitType}
        </div>
        <div>
          <span className="text-gray-400">Max spend:</span>{" "}
          {payload.maxSpend}
        </div>
        <div>
          <span className="text-gray-400">Current:</span>{" "}
          {usageCost.toFixed(2)}
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        Contract: {contractId.slice(0, 16)}...
      </div>
    </div>
  )
}
