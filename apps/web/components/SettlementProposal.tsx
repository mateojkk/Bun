import type { SettlementProposal as SP } from "@bun/shared"

export default function SettlementProposal({
  contractId,
  payload,
}: {
  contractId: string
  payload: SP
}) {
  const isPending = payload.status === "Pending"

  return (
    <div
      className={`p-4 border rounded-lg bg-white shadow-sm ${
        isPending ? "border-blue-300" : "border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">{payload.serviceName}</h2>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            payload.status === "Pending"
              ? "bg-blue-100 text-blue-800"
              : payload.status === "Approved"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {payload.status}
        </span>
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <div>
          Amount:{" "}
          <span className="font-mono font-semibold">
            {payload.calculatedAmount}
          </span>
        </div>
        <div>
          Usage: {payload.usage} &middot; Period:{" "}
          {new Date(payload.periodStart).toLocaleDateString()}{" "}
          &rarr;{" "}
          {new Date(payload.periodEnd).toLocaleDateString()}
        </div>
      </div>

      {isPending && (
        <div className="mt-3 flex gap-2">
          <a
            href={`/api/daml/command`}
            onClick={async (e) => {
              e.preventDefault()
              const res = await fetch("/api/daml/command", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  commandType: "exercise",
                  templateId: "Main:SettlementProposal",
                  contractId,
                  choice: "ApproveAndSettle",
                  argument: {},
                }),
              })
              const data = await res.json()
              alert(
                data.result
                  ? "Settlement approved!"
                  : `Error: ${JSON.stringify(data)}`
              )
            }}
            className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Approve &amp; Settle
          </a>
          <a
            href={`/api/daml/command`}
            onClick={async (e) => {
              e.preventDefault()
              const res = await fetch("/api/daml/command", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  commandType: "exercise",
                  templateId: "Main:SettlementProposal",
                  contractId,
                  choice: "Reject",
                  argument: {},
                }),
              })
              const data = await res.json()
              alert(
                data.result
                  ? "Proposal rejected."
                  : `Error: ${JSON.stringify(data)}`
              )
            }}
            className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Reject
          </a>
        </div>
      )}
    </div>
  )
}
