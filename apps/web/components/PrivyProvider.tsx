"use client"

import { PrivyProvider as Privy } from "@privy-io/react-auth"

export default function PrivyProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

  if (!appId) {
    return (
      <div className="min-h-screen bg-oc-black flex items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold text-white mb-2">Privy is not configured</h1>
          <p className="text-sm text-oc-muted">
            Set NEXT_PUBLIC_PRIVY_APP_ID before using authentication.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Privy
      appId={appId}
      config={{
        loginMethods: ["email"],
        appearance: {
          theme: "dark",
          accentColor: "#8E8B8B",
        },
        embeddedWallets: {
          createOnLogin: "off",
        },
      }}
    >
      {children}
    </Privy>
  )
}
