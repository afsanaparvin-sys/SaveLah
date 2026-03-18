"use client"

import { useState, useMemo } from "react"
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
import { CreditCard, Coins } from "lucide-react"

interface Goal {
  id: string
  title: string
}

interface PaymentFormProps {
  goals: Goal[]
}

export function PaymentForm({ goals }: PaymentFormProps) {
  const [merchantName, setMerchantName] = useState("")
  const [purchaseAmount, setPurchaseAmount] = useState("")
  const [selectedGoal, setSelectedGoal] = useState("")

  const roundUpData = useMemo(() => {
    const amount = parseFloat(purchaseAmount) || 0
    const roundedAmount = Math.ceil(amount)
    const roundUpSavings = roundedAmount - amount

    return {
      purchaseAmount: amount,
      roundedAmount,
      roundUpSavings: Math.round(roundUpSavings * 100) / 100,
    }
  }, [purchaseAmount])

  const handleSimulatePayment = () => {
    // This would connect to OutSystems backend
    console.log({
      merchantName,
      purchaseAmount: roundUpData.purchaseAmount,
      roundUpSavings: roundUpData.roundUpSavings,
      goalId: selectedGoal,
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Merchant Name</label>
            <Input
              placeholder="Enter merchant name"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Purchase Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Savings Goal</label>
            <Select value={selectedGoal} onValueChange={setSelectedGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Select a goal" />
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
        </CardContent>
      </Card>

      {/* Round-Up Preview */}
      {roundUpData.purchaseAmount > 0 && (
        <Card className="border-0 bg-gradient-to-br from-primary/5 to-accent/5 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Coins className="h-5 w-5 text-accent" />
              Round-Up Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Purchase Amount</span>
                <span className="font-medium">
                  {formatCurrency(roundUpData.purchaseAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rounded Amount</span>
                <span className="font-medium">
                  {formatCurrency(roundUpData.roundedAmount)}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary">
                    Round-Up Savings
                  </span>
                  <span className="text-xl font-bold text-success">
                    +{formatCurrency(roundUpData.roundUpSavings)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={handleSimulatePayment}
        disabled={!merchantName || !purchaseAmount || !selectedGoal}
      >
        Simulate Payment
      </Button>
    </div>
  )
}
