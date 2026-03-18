import type { Transaction } from "@/components/Dashboard/TransactionTable"
import type { Member } from "@/components/Dashboard/ContributionTable"

// Summary stats for dashboard
export const summaryStats = {
  totalSavings: 12450,
  activeGoals: 4,
  monthlyTransfer: 850,
  roundUpSavings: 124.65,
}

// Savings goals
export const goals = [
  {
    id: "1",
    title: "Vacation Fund",
    description: "Family trip to Hawaii",
    currentAmount: 2300,
    targetAmount: 5000,
    deadline: "2026-08-15",
    currency: "USD",
    status: "active",
  },
  {
    id: "2",
    title: "Emergency Fund",
    description: "6 months of expenses",
    currentAmount: 8500,
    targetAmount: 15000,
    deadline: "2027-01-01",
    currency: "USD",
    status: "active",
  },
  {
    id: "3",
    title: "New Car",
    description: "Down payment for Tesla Model 3",
    currentAmount: 1200,
    targetAmount: 8000,
    deadline: "2026-12-01",
    currency: "USD",
    status: "active",
  },
  {
    id: "4",
    title: "Home Renovation",
    description: "Kitchen remodel project",
    currentAmount: 450,
    targetAmount: 12000,
    deadline: "2027-06-30",
    currency: "USD",
    status: "active",
  },
]

// Savings growth chart data
export const savingsChartData = [
  { month: "Jan", savings: 4200 },
  { month: "Feb", savings: 5100 },
  { month: "Mar", savings: 6400 },
  { month: "Apr", savings: 7800 },
  { month: "May", savings: 9100 },
  { month: "Jun", savings: 10500 },
  { month: "Jul", savings: 11200 },
  { month: "Aug", savings: 12450 },
]

// Recent transactions
export const recentTransactions: Transaction[] = [
  {
    id: "t1",
    type: "round-up",
    goalName: "Vacation Fund",
    amount: 0.8,
    currency: "USD",
    date: "2026-03-13",
    user: "John Doe",
  },
  {
    id: "t2",
    type: "deposit",
    goalName: "Emergency Fund",
    amount: 200,
    currency: "USD",
    date: "2026-03-12",
    user: "John Doe",
  },
  {
    id: "t3",
    type: "withdrawal",
    goalName: "New Car",
    amount: 100,
    currency: "USD",
    date: "2026-03-11",
    user: "John Doe",
  },
  {
    id: "t4",
    type: "transfer",
    goalName: "Home Renovation",
    amount: 150,
    currency: "USD",
    date: "2026-03-10",
    user: "John Doe",
  },
  {
    id: "t5",
    type: "round-up",
    goalName: "Vacation Fund",
    amount: 0.45,
    currency: "USD",
    date: "2026-03-10",
    user: "John Doe",
  },
  {
    id: "t6",
    type: "deposit",
    goalName: "Vacation Fund",
    amount: 500,
    currency: "USD",
    date: "2026-03-09",
    user: "Sarah Doe",
  },
  {
    id: "t7",
    type: "round-up",
    goalName: "Emergency Fund",
    amount: 0.33,
    currency: "USD",
    date: "2026-03-08",
    user: "John Doe",
  },
  {
    id: "t8",
    type: "transfer",
    goalName: "New Car",
    amount: 200,
    currency: "USD",
    date: "2026-03-07",
    user: "John Doe",
  },
]

// Goal members
export const goalMembers: Record<string, Member[]> = {
  "1": [
    {
      id: "m1",
      name: "John Doe",
      contributionTarget: 3000,
      currentContribution: 1500,
      currency: "USD",
    },
    {
      id: "m2",
      name: "Sarah Doe",
      contributionTarget: 2000,
      currentContribution: 800,
      currency: "USD",
    },
  ],
  "2": [
    {
      id: "m1",
      name: "John Doe",
      contributionTarget: 15000,
      currentContribution: 8500,
      currency: "USD",
    },
  ],
  "3": [
    {
      id: "m1",
      name: "John Doe",
      contributionTarget: 8000,
      currentContribution: 1200,
      currency: "USD",
    },
  ],
  "4": [
    {
      id: "m1",
      name: "John Doe",
      contributionTarget: 6000,
      currentContribution: 250,
      currency: "USD",
    },
    {
      id: "m2",
      name: "Sarah Doe",
      contributionTarget: 6000,
      currentContribution: 200,
      currency: "USD",
    },
  ],
}

// Monthly transfers
export const monthlyTransfers = [
  { id: "mt1", goalId: "1", goalTitle: "Vacation Fund", amount: 250, currency: "USD", frequency: "monthly", nextTransferDate: "Apr 1" },
  { id: "mt2", goalId: "2", goalTitle: "Emergency Fund", amount: 400, currency: "USD", frequency: "weekly", nextTransferDate: "Mar 24" },
  { id: "mt3", goalId: "3", goalTitle: "New Car", amount: 150, currency: "USD", frequency: "monthly", nextTransferDate: "Apr 1" },
  { id: "mt4", goalId: "4", goalTitle: "Home Renovation", amount: 50, currency: "USD", frequency: "weekly", nextTransferDate: "Mar 24" },
]


// User profile
export const userProfile = {
  name: "John Doe",
  username: "johndoe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  bankAccountId: "BA-78542196",
  bankAccountNumber: "****4532",
  avatarUrl: "",
}
