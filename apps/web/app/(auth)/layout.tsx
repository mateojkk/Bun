import PrivyWrapper from "@/components/PrivyWrapper"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PrivyWrapper>
      {children}
    </PrivyWrapper>
  )
}
