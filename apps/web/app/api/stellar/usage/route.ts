import { NextResponse } from "next/server"
import { escrowRecordUsage } from "@/lib/stellar"

export async function POST(request: Request) {
  const { contractId, subscriber, serviceName, additional } = await request.json()

  if (!contractId || !subscriber || !serviceName || !additional) {
    return NextResponse.json(
      { error: "contractId, subscriber, serviceName, and additional required" },
      { status: 400 }
    )
  }

  const result = await escrowRecordUsage(
    contractId,
    String(subscriber),
    String(serviceName),
    Number(additional)
  )
  return NextResponse.json(result)
}
