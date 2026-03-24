"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Mail, Phone, Building2, CreditCard, Pencil, Check, X } from "lucide-react"
import { updateUserProfile } from "@/lib/api"
import { toast } from "sonner"

interface UserProfile {
  name: string
  email: string
  phone: string
  bankAccountId: string
  bankAccountNumber: string
}

function InfoRow({
  icon: Icon,
  label,
  value,
  field,
  isEditing,
  editedProfile,
  onChange,
}: {
  icon: React.ElementType
  label: string
  value: string
  field: keyof UserProfile
  isEditing: boolean
  editedProfile: UserProfile
  onChange: (field: keyof UserProfile, value: string) => void
}) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        {isEditing && field !== "bankAccountId" ? (
          <Input
            value={editedProfile[field]}
            onChange={(e) => onChange(field, e.target.value)}
            className="mt-1 h-8"
          />
        ) : (
          <p className="font-medium">{value}</p>
        )}
      </div>
    </div>
  )
}

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

interface ProfileCardProps {
  profile: UserProfile
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState(profile)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  const handleChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    const hasChanges =
      editedProfile.name !== profile.name ||
      editedProfile.email !== profile.email ||
      editedProfile.phone !== profile.phone ||
      editedProfile.bankAccountNumber !== profile.bankAccountNumber

    if (!hasChanges) {
      setIsEditing(false)
      return
    }
    setSaving(true)
    setSaveError("")
    try {
      await updateUserProfile({
        Name: editedProfile.name,
        Email: editedProfile.email,
        MobilePhone: editedProfile.phone,
        BankAccountId: editedProfile.bankAccountId,
        BankAccountNumber: editedProfile.bankAccountNumber,
      })
      setIsEditing(false)
      toast.success("Profile updated successfully.")
    } catch {
      setSaveError("Failed to save changes.")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile.name}</h2>
            </div>
            {!isEditing ? (
              <Button variant="outline" className="gap-2" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={handleCancel} disabled={saving}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="icon" onClick={handleSave} disabled={saving}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
                {saveError && <p className="text-xs text-red-500">{saveError}</p>}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <InfoRow icon={User} label="Full Name" value={editedProfile.name} field="name" isEditing={isEditing} editedProfile={editedProfile} onChange={handleChange} />
          <InfoRow icon={Mail} label="Email Address" value={editedProfile.email} field="email" isEditing={isEditing} editedProfile={editedProfile} onChange={handleChange} />
          <InfoRow icon={Phone} label="Mobile Phone" value={editedProfile.phone} field="phone" isEditing={isEditing} editedProfile={editedProfile} onChange={handleChange} />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Bank Information</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <InfoRow icon={Building2} label="Bank Account ID" value={editedProfile.bankAccountId} field="bankAccountId" isEditing={isEditing} editedProfile={editedProfile} onChange={handleChange} />
          <InfoRow icon={CreditCard} label="Account Number" value={editedProfile.bankAccountNumber} field="bankAccountNumber" isEditing={isEditing} editedProfile={editedProfile} onChange={handleChange} />
        </CardContent>
      </Card>
    </div>
  )
}
