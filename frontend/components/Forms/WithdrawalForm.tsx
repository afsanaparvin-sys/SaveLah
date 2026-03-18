"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowDownCircle, AlertCircle, Wallet } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Goal {
  id: string
  title: string
  currentAmount: number
  currency: string
}

interface WithdrawalFormProps {
  goals: Goal[]
}

export function WithdrawalForm({ goals }: WithdrawalFormProps) {
  const [selectedGoalId, setSelectedGoalId] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")

  const selectedGoal = goals.find((g) => g.id === selectedGoalId)
  const amount = parseFloat(withdrawAmount) || 0
  const isValidAmount = amount > 0 && selectedGoal && amount <= selectedGoal.currentAmount

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleSubmit = () => {
    if (selectedGoalId && isValidAmount) {
      // This would connect to OutSystems backend
      console.log("Withdraw:", { goalId: selectedGoalId, amount })
      setSelectedGoalId("")
      setWithdrawAmount("")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5 text-primary" />
            Withdraw Funds
          </CardTitle>
          <CardDescription>
            Transfer funds from your savings goal to your bank account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Goal</label>
            <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a savings goal" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    <div className="flex items-center justify-between gap-4">
                      <span>{goal.title}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(goal.currentAmount, goal.currency)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedGoal && (
            <Card className="bg-muted/50 border-0">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(selectedGoal.currentAmount, selectedGoal.currency)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Withdrawal Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
          </div>

          {selectedGoal && amount > selectedGoal.currentAmount && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Withdrawal amount exceeds available balance
              </AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleSubmit}
            disabled={!isValidAmount}
          >
            <ArrowDownCircle className="h-4 w-4" />
            Withdraw Funds
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
