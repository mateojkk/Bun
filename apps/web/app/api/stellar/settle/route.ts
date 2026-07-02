import { NextResponse } from "next/server"
import { escrowSettle } from "@/lib/stellar"

export async function POST(request: Request) {
  const { contractId, subscriber, serviceName } = await request.json()

  if (!contractId || !subscriber || !serviceName) {
    return NextResponse.json(
      { error: "contractId, subscriber, and serviceName required" },
      { status: 400 }
    )
  }

  const result = await escrowSettle(
    contractId,
    String(subscriber),
    String(serviceName)
  )
  return NextResponse.json(result)
}
