import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "分 Bun — Pay only for what you use",
  description:
    "Privacy-preserving usage-based agentic commerce on Canton Network",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <nav className="border-b bg-white">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
            <a
              href="/dashboard"
              className="text-xl font-bold tracking-tight"
            >
              分 Bun
            </a>
            <div className="flex gap-4 text-sm">
              <a
                href="/dashboard"
                className="hover:text-blue-600 transition"
              >
                Dashboard
              </a>
              <a
                href="/subscriptions"
                className="hover:text-blue-600 transition"
              >
                Subscriptions
              </a>
              <a
                href="/usage"
                className="hover:text-blue-600 transition"
              >
                Usage
              </a>
              <a
                href="/settlements"
                className="hover:text-blue-600 transition"
              >
                Settlements
              </a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
