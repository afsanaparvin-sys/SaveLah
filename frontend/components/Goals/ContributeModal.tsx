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
import { PiggyBank } from "lucide-react"
import { toast } from "sonner"
import { makeContribution } from "@/lib/api"

interface ContributeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goalId: number
  currency: string
  maxAmount: number   // contributionTarget - currentContribution
  onSuccess: () => void
}

const QUICK_PCTS = [25, 50, 75, 100]

export function ContributeModal({
  open,
  onOpenChange,
  goalId,
  currency,
  maxAmount,
  onSuccess,
}: ContributeModalProps) {
  const [amountRaw, setAmountRaw] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const amount = parseFloat(amountRaw)
  const isValid = !isNaN(amount) && amount > 0 && amount <= maxAmount

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-SG", { style: "currency", currency }).format(n)

  const handleQuick = (pct: number) => {
    const val = ((pct / 100) * maxAmount).toFixed(2)
    setAmountRaw(val)
  }

  const handleSubmit = async () => {
    if (!isValid) return
    setSubmitting(true)
    try {
      await makeContribution(goalId, amount)
      toast.success(`${fmt(amount)} contributed successfully!`)
      onSuccess()
      onOpenChange(false)
      setAmountRaw("")
    } catch {
      toast.error("Failed to make contribution. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <PiggyBank className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Make a Contribution</DialogTitle>
              <DialogDescription>
                Max you can contribute: {fmt(maxAmount)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quick % buttons */}
          <div className="flex gap-2">
            {QUICK_PCTS.map((pct) => (
              <Button
                key={pct}
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleQuick(pct)}
                disabled={maxAmount <= 0}
              >
                {pct}%
              </Button>
            ))}
          </div>

          {/* Amount input */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              $
            </span>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="pl-7"
              value={amountRaw}
              onChange={(e) => setAmountRaw(e.target.value)}
            />
          </div>

          {/* Validation hint */}
          {amountRaw && !isNaN(amount) && amount > maxAmount && (
            <p className="text-xs text-destructive">
              Amount exceeds your remaining target of {fmt(maxAmount)}.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || submitting}>
            {submitting ? "Contributing..." : "Contribute"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
