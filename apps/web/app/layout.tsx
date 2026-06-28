import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "分 Bun. Pay only for what you use.",
  description:
    "Privacy-preserving usage-based commerce on Stellar. Escrowed. Automated. ZK-verified.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark h-full">
      <body
        className="font-sans bg-oc-black text-oc-light antialiased min-h-screen"
      >
        {children}
      </body>
    </html>
  )
}
