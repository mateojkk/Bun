import { NextResponse } from "next/server"
import { escrowRecordUsage } from "@/lib/stellar"

export async function POST(request: Request) {
  const { contractId, additional } = await request.json()

  if (!contractId || !additional) {
    return NextResponse.json(
      { error: "contractId and additional required" },
      { status: 400 }
    )
  }

  const result = await escrowRecordUsage(contractId, Number(additional))
  return NextResponse.json(result)
}
