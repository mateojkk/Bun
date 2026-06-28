import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedPaths = [
  "/dashboard",
  "/account",
  "/subscriptions",
  "/usage",
  "/settlements",
]

export function proxy(request: NextRequest) {
  const partyId = request.cookies.get("bun_party")?.value
  const path = request.nextUrl.pathname

  const isProtected = protectedPaths.some(
    (p) => path === p || path.startsWith(p + "/")
  )

  if (isProtected && !partyId) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (path === "/login" && partyId) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/account/:path*",
    "/subscriptions/:path*",
    "/usage/:path*",
    "/settlements/:path*",
    "/login",
  ],
}
