"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/Layout/DashboardLayout"
import { ProfileCard } from "@/components/Dashboard/ProfileCard"
import { getUserProfile, type UserProfileData } from "@/lib/api"

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfileData | null>(null)

  useEffect(() => {
    getUserProfile().then(setProfile).catch(console.error)
  }, [])
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        {profile ? (
          <ProfileCard profile={{
            name: profile.Name,
            email: profile.Email,
            phone: profile.MobilePhone,
            bankAccountId: profile.BankAccountId ?? "",
            bankAccountNumber: profile.BankAccountNumber ?? "",
          }} />
        ) : (
          <p className="text-muted-foreground text-sm">Loading profile...</p>
        )}
      </div>
    </DashboardLayout>
  )
}
