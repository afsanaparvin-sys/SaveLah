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
import { CreditCard, Coins, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { getUserId } from "@/lib/auth"

interface Goal {
  id: string
  title: string
}

interface PaymentFormProps {
  goals: Goal[]
  onPaymentSuccess?: () => void
}

export function PaymentForm({ goals, onPaymentSuccess }: PaymentFormProps) {
  const [merchantName, setMerchantName] = useState("")
  const [purchaseAmount, setPurchaseAmount] = useState("")
  const [selectedGoal, setSelectedGoal] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleSimulatePayment = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      const userId = Number(getUserId())
      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("auth_token="))
        ?.split("=")[1]

      const res = await fetch(
        "https://personal-39ukomme.outsystemscloud.com/PaymentGateway_CS/rest/PaymentGatewayAPI/ProcessMerchantPayment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ?? ""
          },
          body: JSON.stringify({
            UserId: userId,
            MerchantId: 1,
            ItemAmount: roundUpData.purchaseAmount,
            SavingsAmount: roundUpData.roundUpSavings,
            Currency: "SGD",
            GoalId: 1,
            BankTransferId: "",
            MonthlyTransfersId: 0
          })
        }
      )

      const raw = await res.text()
      console.log("Raw response:", raw)

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = JSON.parse(raw)

      if (data.HasError) {
        throw new Error(data.ErrorMessage || "Payment failed")
      }

      setSuccess(true)
      setMerchantName("")
      setPurchaseAmount("")
      setSelectedGoal("")
      onPaymentSuccess?.()

    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: "SGD",
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

      {/* Success */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700">
          <CheckCircle className="h-4 w-4" />
          <p className="text-sm font-medium">Payment simulated successfully!</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={handleSimulatePayment}
        disabled={!merchantName || !purchaseAmount || !selectedGoal || loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Simulate Payment"
        )}
      </Button>
    </div>
  )
}