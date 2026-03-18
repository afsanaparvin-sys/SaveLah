"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight, RefreshCw, Coins } from "lucide-react"

export interface Transaction {
  id: string
  type: "deposit" | "withdrawal" | "round-up" | "transfer"
  goalName: string
  amount: number
  currency: string
  date: string
  user?: string
}

interface TransactionTableProps {
  transactions: Transaction[]
  showUser?: boolean
  className?: string
}

const typeConfig = {
  deposit: {
    label: "Deposit",
    icon: ArrowDownRight,
    color: "bg-success/10 text-success",
  },
  withdrawal: {
    label: "Withdrawal",
    icon: ArrowUpRight,
    color: "bg-destructive/10 text-destructive",
  },
  "round-up": {
    label: "Round-Up",
    icon: Coins,
    color: "bg-accent/10 text-accent",
  },
  transfer: {
    label: "Transfer",
    icon: RefreshCw,
    color: "bg-primary/10 text-primary",
  },
}

export function TransactionTable({
  transactions,
  showUser = false,
  className,
}: TransactionTableProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(Math.abs(amount))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Date</TableHead>
            {showUser && <TableHead className="font-semibold">User</TableHead>}
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Goal</TableHead>
            <TableHead className="text-right font-semibold">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const config = typeConfig[transaction.type]
            const Icon = config.icon
            const isNegative = transaction.type === "withdrawal"

            return (
              <TableRow key={transaction.id} className="hover:bg-muted/30">
                <TableCell className="text-muted-foreground">
                  {formatDate(transaction.date)}
                </TableCell>
                {showUser && (
                  <TableCell className="font-medium">
                    {transaction.user}
                  </TableCell>
                )}
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("gap-1 font-medium", config.color)}
                  >
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {transaction.goalName}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-semibold",
                    isNegative ? "text-destructive" : "text-success"
                  )}
                >
                  {isNegative ? "-" : "+"}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
