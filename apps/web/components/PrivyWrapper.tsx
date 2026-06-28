"use client"

import PrivyProvider from "@/components/PrivyProvider"

export default function PrivyWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <PrivyProvider>{children}</PrivyProvider>
}
