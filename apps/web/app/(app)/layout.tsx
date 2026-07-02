import NavLinks from "@/components/NavLinks"
import Link from "next/link"
import SignOutButton from "@/components/SignOutButton"
import { getDisplayName, getAvatarUrl } from "@/lib/auth"
import { GeistSans } from "geist/font/sans"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const name = await getDisplayName()
  const avatarUrl = await getAvatarUrl()

  return (
    <>
      <nav className="border-b border-black/[0.06] bg-[#fafafa] backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-[1400px] px-3 sm:px-6 py-4 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex-1 flex items-center justify-start shrink-0">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-black font-geist">
              Bun.
            </Link>
          </div>
          <div className="flex-none flex justify-center max-w-[50%]">
            <NavLinks />
          </div>
          <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4 text-sm shrink-0">
            {name && (
              <div className="flex items-center gap-2">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-black/10 shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-black/5 border border-black/10 flex items-center justify-center text-[11px] font-medium text-black uppercase tracking-wider shrink-0">
                    {name.charAt(0)}
                  </div>
                )}
                <span className="hidden sm:inline text-black/60 font-medium truncate max-w-[120px]">{name}</span>
              </div>
            )}
            <SignOutButton />
          </div>
        </div>
      </nav>
      
      <main className="min-h-screen bg-[#fafafa] text-black">
        {children}
      </main>

      <footer className="border-t border-black/[0.04] bg-[#fafafa] py-8 mt-12">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-black/40">
          <div>&copy; {new Date().getFullYear()} Bun Protocol.</div>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/docs" className="hover:text-black transition-colors">API Docs</Link>
            <Link href="/merchant/sandbox" className="hover:text-black transition-colors">Sandbox</Link>
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
