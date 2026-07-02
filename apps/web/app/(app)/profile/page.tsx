import { getPartyId, getDisplayName } from "@/lib/auth"
import { findAccountByPartyId } from "@/lib/db"
import { redirect } from "next/navigation"
import CopyAddress from "@/components/CopyAddress"
import ProfileForm from "@/components/ProfileForm"

export default async function ProfilePage() {
  const partyId = await getPartyId()
  if (!partyId) redirect("/login")

  const name = await getDisplayName() || ""
  const account = await findAccountByPartyId(partyId)
  const emailNotifications = account?.emailNotifications ?? false
  const avatarUrl = account?.avatarUrl || ""

  return (
    <div className="px-4 sm:px-6 py-8 max-w-[1400px] mx-auto space-y-8">
      <div>
        <h1 className="text-3xl tracking-tight text-black mb-2 font-geist">Profile</h1>
        <p className="text-black/50 text-sm">
          Manage your account preferences and view your public address.
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-6 border border-black/10 rounded-3xl bg-white shadow-sm">
          <h2 className="text-lg text-black mb-6 font-geist">Public Address</h2>
          <div className="space-y-2">
            <p className="text-xs text-black/40 font-medium uppercase tracking-wider">Your Stellar testnet address</p>
            <CopyAddress address={partyId} />
          </div>
        </div>

        <div className="p-6 border border-black/10 rounded-3xl bg-white shadow-sm">
          <h2 className="text-lg text-black mb-6 font-geist">Preferences</h2>
          <ProfileForm 
            initialUsername={name} 
            initialEmailNotifications={emailNotifications} 
            initialAvatarUrl={avatarUrl}
          />
        </div>
      </div>
    </div>
  )
}
