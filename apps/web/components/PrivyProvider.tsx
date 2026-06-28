"use client"

import { PrivyProvider as Privy } from "@privy-io/react-auth"

export default function PrivyProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Privy
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
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
