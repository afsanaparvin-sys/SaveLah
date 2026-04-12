"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RefreshCw, Plus, Loader2 } from "lucide-react"
import { createAutoTransfer } from "@/lib/api"
import { toast } from "sonner"

interface Goal {
  id: string
  title: string
}

interface AutoTransferFormProps {
  goals: Goal[]
  onTransferCreated?: () => void
}

export function AutoTransferForm({ goals, onTransferCreated }: AutoTransferFormProps) {
  const [selectedGoal, setSelectedGoal] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [frequency, setFrequency] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedGoal || !transferAmount || !frequency) return
    setLoading(true)
    try {
      await createAutoTransfer(Number(selectedGoal), parseFloat(transferAmount), frequency)
      toast.success("Auto transfer created successfully!")
      setSelectedGoal("")
      setTransferAmount("")
      setFrequency("")
      onTransferCreated?.()
    } catch {
      toast.error("Failed to create transfer. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          New Transfer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Goal</label>
          <Select value={selectedGoal} onValueChange={setSelectedGoal}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a savings goal" />
            </SelectTrigger>
            <SelectContent>
              {goals.map((goal) => (
                <SelectItem key={goal.id} value={goal.id}>
                  {goal.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Frequency</label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="How often?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="pl-7"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
            />
          </div>
        </div>

        <Button
          className="w-full gap-2"
          onClick={handleSubmit}
          disabled={!selectedGoal || !transferAmount || !frequency || loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {loading ? "Creating..." : "Set Up Transfer"}
        </Button>
      </CardContent>
    </Card>
  )
}