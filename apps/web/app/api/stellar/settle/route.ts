import { NextResponse } from "next/server"
import { escrowSettle } from "@/lib/stellar"

export async function POST(request: Request) {
  const { contractId } = await request.json()

  if (!contractId) {
    return NextResponse.json(
      { error: "contractId required" },
      { status: 400 }
    )
  }

  const result = await escrowSettle(contractId)
  return NextResponse.json(result)
}
