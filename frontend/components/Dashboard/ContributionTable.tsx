"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ProgressBar } from "./ProgressBar"
import { cn } from "@/lib/utils"

export interface Member {
  id: string
  name: string
  contributionTarget: number
  currentContribution: number
  currency: string
}

interface ContributionTableProps {
  members: Member[]
  className?: string
}

export function ContributionTable({ members, className }: ContributionTableProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Member</TableHead>
            <TableHead className="font-semibold">Target</TableHead>
            <TableHead className="font-semibold">Current</TableHead>
            <TableHead className="font-semibold">Progress</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const percentage = Math.round(
              (member.currentContribution / member.contributionTarget) * 100
            )

            return (
              <TableRow key={member.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{member.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatCurrency(member.contributionTarget, member.currency)}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(member.currentContribution, member.currency)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <ProgressBar
                      value={member.currentContribution}
                      max={member.contributionTarget}
                      size="sm"
                      className="w-24"
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      {percentage}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
