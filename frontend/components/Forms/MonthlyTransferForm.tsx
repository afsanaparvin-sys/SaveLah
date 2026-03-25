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
import { RefreshCw, Plus } from "lucide-react"

interface Goal {
  id: string
  title: string
}

interface MonthlyTransferFormProps {
  goals: Goal[]
}

export function MonthlyTransferForm({ goals }: MonthlyTransferFormProps) {
  const [selectedGoal, setSelectedGoal] = useState("")
  const [transferAmount, setTransferAmount] = useState("")

  const handleSubmit = () => {
    if (selectedGoal && transferAmount) {
      console.log("Create transfer:", {
        goalId: selectedGoal,
        amount: parseFloat(transferAmount),
      })
      // This would connect to OutSystems backend
      setSelectedGoal("")
      setTransferAmount("")
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Create Monthly Transfer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Goal</label>
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
          <label className="text-sm font-medium">Monthly Amount</label>
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
          disabled={!selectedGoal || !transferAmount}
        >
          <RefreshCw className="h-4 w-4" />
          Set Up Monthly Transfer
        </Button>
      </CardContent>
    </Card>
  )
}
