import type { Metadata } from "next"
import { IBM_Plex_Mono } from "next/font/google"
import "./globals.css"

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-mono",
})

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
        className={`${mono.variable} font-sans bg-oc-black text-oc-light antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  )
}
