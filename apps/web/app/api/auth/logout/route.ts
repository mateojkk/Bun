import { NextResponse } from "next/server"
import { clearAuth } from "@/lib/auth"

export async function POST() {
  await clearAuth()
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_URL || "http://localhost:3000"))
}
