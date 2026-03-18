"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, Building2, CreditCard, Pencil, Check, X } from "lucide-react"

interface UserProfile {
  name: string
  username: string
  email: string
  phone: string
  bankAccountId: string
  bankAccountNumber: string
  avatarUrl?: string
}

interface ProfileCardProps {
  profile: UserProfile
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState(profile)

  const handleSave = () => {
    // This would connect to OutSystems backend
    console.log("Save profile:", editedProfile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    field,
  }: {
    icon: React.ElementType
    label: string
    value: string
    field: keyof UserProfile
  }) => (
    <div className="flex items-center gap-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        {isEditing && field !== "bankAccountId" ? (
          <Input
            value={editedProfile[field]}
            onChange={(e) =>
              setEditedProfile({ ...editedProfile, [field]: e.target.value })
            }
            className="mt-1 h-8"
          />
        ) : (
          <p className="font-medium">{value}</p>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground">@{profile.username}</p>
            </div>
            {!isEditing ? (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
                <Button size="icon" onClick={handleSave}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Information */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <InfoRow
            icon={User}
            label="Full Name"
            value={editedProfile.name}
            field="name"
          />
          <InfoRow
            icon={User}
            label="Username"
            value={editedProfile.username}
            field="username"
          />
          <InfoRow
            icon={Mail}
            label="Email Address"
            value={editedProfile.email}
            field="email"
          />
          <InfoRow
            icon={Phone}
            label="Mobile Phone"
            value={editedProfile.phone}
            field="phone"
          />
        </CardContent>
      </Card>

      {/* Bank Information */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Bank Information</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <InfoRow
            icon={Building2}
            label="Bank Account ID"
            value={editedProfile.bankAccountId}
            field="bankAccountId"
          />
          <InfoRow
            icon={CreditCard}
            label="Account Number"
            value={editedProfile.bankAccountNumber}
            field="bankAccountNumber"
          />
        </CardContent>
      </Card>
    </div>
  )
}
