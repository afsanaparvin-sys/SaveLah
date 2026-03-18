"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Target, Plus, X } from "lucide-react"

interface CreateGoalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface GoalFormData {
  title: string
  description: string
  targetAmount: string
  currency: string
  deadline: string
  memberEmails: string[]
}

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
]

export function CreateGoalModal({
  open,
  onOpenChange,
}: CreateGoalModalProps) {
  const [formData, setFormData] = useState<GoalFormData>({
    title: "",
    description: "",
    targetAmount: "",
    currency: "USD",
    deadline: "",
    memberEmails: [],
  })
  const [emailInput, setEmailInput] = useState("")
  const [emailError, setEmailError] = useState("")

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleAddEmail = () => {
    if (!emailInput) return
    if (!isValidEmail(emailInput)) {
      setEmailError("Please enter a valid email address.")
      return
    }
    if (formData.memberEmails.includes(emailInput)) {
      setEmailError("This email has already been added.")
      return
    }
    setFormData({ ...formData, memberEmails: [...formData.memberEmails, emailInput] })
    setEmailInput("")
    setEmailError("")
  }

  const handleRemoveEmail = (email: string) => {
    setFormData({
      ...formData,
      memberEmails: formData.memberEmails.filter((e) => e !== email),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddEmail()
    }
  }

  const handleSubmit = () => {
    console.log("Create goal:", formData)
    // This would connect to OutSystems backend
    setFormData({
      title: "",
      description: "",
      targetAmount: "",
      currency: "USD",
      deadline: "",
      memberEmails: [],
    })
    setEmailInput("")
    setEmailError("")
    onOpenChange(false)
  }

  const isValid =
    formData.title && formData.targetAmount && formData.currency && formData.deadline

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set up a new savings goal to start tracking your progress.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Goal Title</label>
            <Input
              placeholder="e.g., Vacation Fund"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="What are you saving for?"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-7"
                  value={formData.targetAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, targetAmount: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Deadline</label>
            <Input
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
            />
          </div>

          {/* Member invite */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Invite Members{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="member@email.com"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value)
                  setEmailError("")
                }}
                onKeyDown={handleKeyDown}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddEmail}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {emailError && (
              <p className="text-xs text-destructive">{emailError}</p>
            )}
            {formData.memberEmails.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.memberEmails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center gap-1 rounded-full border bg-muted px-3 py-1 text-sm"
                  >
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Create Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}