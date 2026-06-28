import NavLinks from "@/components/NavLinks"
import Link from "next/link"
import SignOutButton from "@/components/SignOutButton"
import { getDisplayName } from "@/lib/auth"
import PrivyWrapper from "@/components/PrivyWrapper"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const name = await getDisplayName()

  return (
    <PrivyWrapper>
      <nav className="border-b border-white/5 bg-oc-black sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="font-bold shrink-0">
              分 Bun
            </Link>
            <NavLinks />
          </div>
          <div className="flex items-center gap-3 text-sm shrink-0">
            {name && (
              <span className="text-oc-muted hidden sm:inline">{name}</span>
            )}
            <SignOutButton />
          </div>
        </div>
      </nav>
      <main className="min-h-screen bg-oc-black">{children}</main>
      <footer className="border-t border-white/5 text-xs text-oc-muted">
        <div className="px-4 sm:px-6 py-4 flex items-center gap-6">
          <Link href="/privacy" className="hover:text-oc-light transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-oc-light transition">Terms of Service</Link>
          <span>分 Bun — Stellar Testnet</span>
        </div>
      </footer>
    </PrivyWrapper>
  )
}
