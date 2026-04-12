"use client"

import { useState, useMemo, useEffect } from "react"
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
import { getGoalsByCurrentUser, processPayment, type SavingsGoal } from "@/lib/api"

type RoundMode = 'cent' | 'dollar' | '5' | '10' | 'custom'

interface PaymentFormProps {
  onPaymentSuccess?: () => void
}

export function PaymentForm({ onPaymentSuccess }: PaymentFormProps) {
  const [merchantName, setMerchantName] = useState("")
  const [purchaseAmount, setPurchaseAmount] = useState("")
  const [selectedGoal, setSelectedGoal] = useState("")
  const [roundMode, setRoundMode] = useState<RoundMode>('cent')
  const [customAmount, setCustomAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [goalsLoading, setGoalsLoading] = useState(true)

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const data = await getGoalsByCurrentUser()
        setGoals(data)
      } catch (err) {
        console.error("Failed to fetch goals:", err)
      } finally {
        setGoalsLoading(false)
      }
    }
    fetchGoals()
  }, [])

  const roundUpData = useMemo(() => {
    const amount = parseFloat(purchaseAmount) || 0
    if (amount <= 0) return { purchaseAmount: 0, roundedAmount: 0, roundUpSavings: 0 }

    let rounded: number
    if (roundMode === 'cent') rounded = Math.ceil(amount * 100) / 100
    else if (roundMode === 'dollar') rounded = Math.ceil(amount)
    else if (roundMode === '5') rounded = Math.ceil(amount / 5) * 5
    else if (roundMode === '10') rounded = Math.ceil(amount / 10) * 10
    else rounded = amount + (parseFloat(customAmount) || 0)

    return {
      purchaseAmount: amount,
      roundedAmount: Math.round(rounded * 100) / 100,
      roundUpSavings: Math.round((rounded - amount) * 100) / 100,
    }
  }, [purchaseAmount, roundMode, customAmount])

  const roundModeLabel = (m: RoundMode) => {
    if (m === 'cent') return 'Nearest cent'
    if (m === 'dollar') return 'Nearest dollar'
    if (m === '5') return 'Nearest $5'
    if (m === '10') return 'Nearest $10'
    return 'Custom amount'
  }

  const roundModeDesc = (m: RoundMode) => {
    if (m === 'cent') return 'Rounds up to the nearest cent'
    if (m === 'dollar') return 'Rounds up to the nearest whole dollar'
    if (m === '5') return 'Rounds up to the nearest $5'
    if (m === '10') return 'Rounds up to the nearest $10'
    return `Saves a fixed SGD ${parseFloat(customAmount || '0').toFixed(2)} per transaction`
  }

  const handleSimulatePayment = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      const userId = Number(getUserId())
      await processPayment({
        UserId: userId,
        MerchantId: 1,
        ItemAmount: roundUpData.purchaseAmount,
        SavingsAmount: roundUpData.roundUpSavings,
        Currency: "SGD",
        GoalId: Number(selectedGoal),
        BankTransferId: "",
        MonthlyTransfersId: 0,
      })
      setSuccess(true)
      setMerchantName("")
      setPurchaseAmount("")
      setSelectedGoal("")
      setCustomAmount("")
      setRoundMode('cent')
      onPaymentSuccess?.()
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(amount)

  const roundModes: RoundMode[] = ['cent', 'dollar', '5', '10', 'custom']

  const isDisabled =
    !merchantName ||
    !purchaseAmount ||
    !selectedGoal ||
    loading ||
    goalsLoading ||
    roundUpData.roundUpSavings <= 0 ||
    (roundMode === 'custom' && !customAmount)

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
            <label className="text-sm font-medium">Purchase Amount (SGD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
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
            <label className="text-sm font-medium">Round-up mode</label>
            <div className="flex flex-wrap gap-2">
              {roundModes.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setRoundMode(m)}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    roundMode === m
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {roundModeLabel(m)}
                </button>
              ))}
            </div>
            {roundMode === 'custom' && (
              <Input
                type="number"
                step="0.01"
                placeholder="Fixed save amount e.g. 2.50"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Savings Goal</label>
            <Select value={selectedGoal} onValueChange={setSelectedGoal}>
              <SelectTrigger>
                <SelectValue placeholder={goalsLoading ? "Loading goals..." : "Select a goal"} />
              </SelectTrigger>
              <SelectContent>
                {goals.length === 0 && !goalsLoading && (
                  <SelectItem value="none" disabled>No goals found</SelectItem>
                )}
                {goals.map((goal) => (
                  <SelectItem key={goal.Id} value={String(goal.Id)}>
                    {goal.Title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {roundUpData.purchaseAmount > 0 && roundUpData.roundUpSavings >= 0 && (
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
                <span className="text-muted-foreground">Purchase amount</span>
                <span className="font-medium">{formatCurrency(roundUpData.purchaseAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rounded to</span>
                <span className="font-medium">{formatCurrency(roundUpData.roundedAmount)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary">Round-up savings</span>
                  <span className="text-xl font-bold text-success">
                    +{formatCurrency(roundUpData.roundUpSavings)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{roundModeDesc(roundMode)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700">
          <CheckCircle className="h-4 w-4" />
          <p className="text-sm font-medium">Payment simulated successfully!</p>
        </div>
      )}

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
        disabled={isDisabled}
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