import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Bun. Pay only for what you use.",
  description:
    "Privacy-preserving usage-based commerce on Stellar. Escrowed. Automated. ZK-verified.",
}

import { GeistSans } from "geist/font/sans"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark h-full ${GeistSans.variable} ${inter.variable}`}>
      <body
        className="font-sans bg-[#fafafa] text-oc-black antialiased min-h-screen"
      >
        {children}
      </body>
    </html>
  )
}
