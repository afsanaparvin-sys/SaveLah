"use client"

import { useState, useEffect } from "react"
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
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Target, Plus, X, User, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getUserName, getUserId } from "@/lib/auth"
import { createGoal, getUserByEmail } from "@/lib/api"

interface CreateGoalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGoalCreated?: () => void
}

interface GoalFormData {
  title: string
  description: string
  targetAmount: string
  currency: string
  deadline: string
  withdrawalType: string
}

interface Contributor {
  id: string
  displayName: string
  userId: number
  roleEnumId: number  // 1 = owner/admin, 2 = member
  allocationRaw: string
  otherPct: string
}

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "SGD", label: "SGD - Singapore Dollar" },
]

const QUICK_PCTS = [10, 30, 50]

export function CreateGoalModal({
  open,
  onOpenChange,
  onGoalCreated,
}: CreateGoalModalProps) {
  const [formData, setFormData] = useState<GoalFormData>({
    title: "",
    description: "",
    targetAmount: "",
    currency: "USD",
    deadline: "",
    withdrawalType: "1",
  })
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [emailInput, setEmailInput] = useState("")
  const [emailError, setEmailError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAddingMember, setIsAddingMember] = useState(false)

  // Reset form and initialise owner row every time modal opens
  useEffect(() => {
    if (!open) return
    setFormData({ title: "", description: "", targetAmount: "", currency: "USD", deadline: "", withdrawalType: "1" })
    setEmailInput("")
    setEmailError("")
    setContributors([{
      id: "owner",
      displayName: getUserName() || "You",
      userId: parseInt(getUserId(), 10) || 0,
      roleEnumId: 1,
      allocationRaw: "",
      otherPct: "",
    }])
  }, [open])

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleAddEmail = async () => {
    if (!emailInput) return
    if (!isValidEmail(emailInput)) {
      setEmailError("Please enter a valid email address.")
      return
    }
    const alreadyAdded = contributors.some(c => c.displayName === emailInput)
    if (alreadyAdded) {
      setEmailError("This email has already been added.")
      return
    }
    setIsAddingMember(true)
    setEmailError("")
    try {
      const user = await getUserByEmail(emailInput)
      setContributors(prev => [...prev, {
        id: crypto.randomUUID(),
        displayName: user.Name,
        userId: user.UserId,
        roleEnumId: 2,
        allocationRaw: "",
        otherPct: "",
      }])
      setEmailInput("")
    } catch {
      setEmailError("No account found with this email address.")
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleRemoveContributor = (id: string) =>
    setContributors(prev => prev.filter(c => c.id !== id))

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      void handleAddEmail()
    }
  }

  const updateContributor = (id: string, patch: Partial<Contributor>) =>
    setContributors(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))

  const handleQuickPercent = (id: string, pct: number) => {
    const target = parseFloat(formData.targetAmount)
    if (isNaN(target) || target <= 0) return
    const amount = ((pct / 100) * target).toFixed(2)
    updateContributor(id, { allocationRaw: amount })
  }

  const handleOtherPctCommit = (id: string) => {
    const c = contributors.find(c => c.id === id)
    if (!c) return
    const pct = parseFloat(c.otherPct)
    const target = parseFloat(formData.targetAmount)
    if (isNaN(pct) || isNaN(target) || target <= 0) return
    const amount = ((pct / 100) * target).toFixed(2)
    updateContributor(id, { allocationRaw: amount, otherPct: "" })
  }

  const computePctDisplay = (allocationRaw: string): string | null => {
    const amt = parseFloat(allocationRaw)
    const target = parseFloat(formData.targetAmount)
    if (!allocationRaw || isNaN(amt) || isNaN(target) || target <= 0) return null
    return `= ${((amt / target) * 100).toFixed(1)}%`
  }

  const totalAllocated = contributors.reduce(
    (sum, c) => sum + (parseFloat(c.allocationRaw) || 0),
    0
  )
  const targetNum = parseFloat(formData.targetAmount) || 0
  const totalPct = targetNum > 0 ? ((totalAllocated / targetNum) * 100).toFixed(1) : "0"
  const totalIsExact = targetNum > 0 && Math.abs(totalAllocated - targetNum) <= 0.01

  const validateContributors = (): boolean => {
    const hasEmpty = contributors.some(
      c => !c.allocationRaw || isNaN(parseFloat(c.allocationRaw))
    )
    if (hasEmpty) {
      toast.error("Please enter an allocation amount for every contributor.")
      return false
    }
    if (!totalIsExact) {
      toast.error(
        `Contributor allocations must total 100% of the target amount. Currently at ${totalPct}%.`
      )
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateContributors()) return
    setIsSubmitting(true)
    try {
      await createGoal({
        Title: formData.title,
        Description: formData.description,
        TargetAmount: parseFloat(formData.targetAmount),
        Currency: formData.currency,
        Deadline: formData.deadline,
        WithdrawalType: parseInt(formData.withdrawalType, 10),
        CreateGoalAPIRequestContributors: contributors.map(c => ({
          UserId: c.userId,
          RoleEnumId: c.roleEnumId,
          TargetAmount: parseFloat(c.allocationRaw),
        })),
      })
      toast.success("Goal created successfully!")
      onGoalCreated?.()
      onOpenChange(false)
    } catch {
      toast.error("Failed to create goal. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid =
    formData.title && formData.targetAmount && formData.currency && formData.deadline && formData.withdrawalType

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
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

        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-4 py-4">
            {/* Goal details */}
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
                rows={2}
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

            <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Withdrawal Type</label>
                <Select
                  value={formData.withdrawalType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, withdrawalType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Host-Only</SelectItem>
                    <SelectItem value="2">Split</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contributors */}
            <Separator />

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Contributors</p>
                <p className="text-xs text-muted-foreground">
                  Allocate how much each person will contribute. Must total 100%.
                </p>
              </div>

              {contributors.map((c) => {
                const pctDisplay = computePctDisplay(c.allocationRaw)
                return (
                  <div key={c.id} className="rounded-lg border bg-muted/30 p-3 space-y-2">
                    {/* Row: name + allocation input */}
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="flex-1 text-sm font-medium truncate">
                        {c.displayName}
                        {c.id === "owner" && (
                          <span className="ml-1 text-xs text-muted-foreground font-normal">(You)</span>
                        )}
                      </span>
                      {c.id !== "owner" && (
                        <Select
                          value={String(c.roleEnumId)}
                          onValueChange={(val) =>
                            updateContributor(c.id, { roleEnumId: parseInt(val, 10) })
                          }
                        >
                          <SelectTrigger className="h-8 w-28 text-xs shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Admin</SelectItem>
                            <SelectItem value="2">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-5 w-24 h-8 text-sm"
                            value={c.allocationRaw}
                            onChange={(e) =>
                              updateContributor(c.id, { allocationRaw: e.target.value })
                            }
                          />
                        </div>
                        {pctDisplay && (
                          <span className="text-xs text-muted-foreground w-14 shrink-0">
                            {pctDisplay}
                          </span>
                        )}
                        {c.id !== "owner" && (
                          <button
                            type="button"
                            onClick={() => handleRemoveContributor(c.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick % buttons */}
                    <div className="flex items-center gap-2 pl-9">
                      {QUICK_PCTS.map((pct) => (
                        <Button
                          key={pct}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 px-3 text-xs"
                          onClick={() => handleQuickPercent(c.id, pct)}
                          title={
                            !formData.targetAmount
                              ? "Enter a target amount first"
                              : undefined
                          }
                        >
                          {pct}%
                        </Button>
                      ))}
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Other"
                          className="h-7 w-20 text-xs px-2"
                          value={c.otherPct}
                          onChange={(e) =>
                            updateContributor(c.id, { otherPct: e.target.value })
                          }
                          onBlur={() => handleOtherPctCommit(c.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleOtherPctCommit(c.id)
                            }
                          }}
                          title={
                            !formData.targetAmount
                              ? "Enter a target amount first"
                              : undefined
                          }
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Total allocated */}
              {targetNum > 0 && (
                <div className={`text-xs font-medium ${totalIsExact ? "text-green-600" : "text-destructive"}`}>
                  Total allocated: ${totalAllocated.toFixed(2)} ({totalPct}%)
                  {totalIsExact ? " ✓" : ` — needs to be 100%`}
                </div>
              )}
            </div>

            {/* Invite Members */}
            <Separator />

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
                  onKeyDown={handleEmailKeyDown}
                />
                <Button type="button" variant="outline" size="icon" onClick={handleAddEmail} disabled={isAddingMember}>
                  {isAddingMember ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
              {emailError && (
                <p className="text-xs text-destructive">{emailError}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
