const BASE_URL = "https://ypw.outsystemscloud.com/UserAuth/rest/UserAuth";
const PROFILE_BASE_URL = "https://ypw.outsystemscloud.com/UserProfile/rest/UserProfile";
const DASHBOARD_BASE_URL = "https://ypw.outsystemscloud.com/Dashboard/rest/Dashboard";
const GOAL_BASE_URL = "https://personal-fhcnbshw.outsystemscloud.com/ManageGoalComposite/rest/ManageGoal";
const GOAL_ATOMIC_BASE_URL = "https://personal-ntek2wae.outsystemscloud.com/GoalAtomicService/rest/Goal";

const LEDGER_BASE_URL = "https://personal-s6qgwhkb.outsystemscloud.com/DBEALedger/rest/LedgerNew";
const PAYMENT_BASE_URL = "https://personal-8wlttpq2.outsystemscloud.com/PaymentAtomicService/rest/PaymentAPI";
const PAYMENT_GATEWAY_URL = "https://personal-39ukomme.outsystemscloud.com/PaymentGateway_CS/rest/PaymentGatewayAPI";


function getAuthToken(): string {
  if (typeof document === "undefined") return "";
  return (
    document.cookie
      .split("; ")
      .find((c) => c.startsWith("auth_token="))
      ?.split("=")[1] ?? ""
  );
}

// --- Dashboard ---

export interface KPICardData {
  TotalSavingsCard?: {
    CurrentTotalSavings?: number;
    DifferenceFromLastMonth?: number;
  };
  GoalOverviewCard?: {
    TotalActive?: number;
    TotalAddedThisMonth?: number;
    TotalCompleted?: number;
    TotalCompletedThisMonth?: number;
    TotalCancelled?: number;
    TotalCancelledThisMonth?: number;
  };
  RecurringTransfersCard?: {
    MonthlyAmount?: number;
    WeeklyAmount?: number;
  };
  DirectAndRoundUpSavingsCard?: {
    RoundUpSavingsThisMonth?: number;
    RoundUpSavingsDifferenceFromLastMonth?: number;
    DirectSavingsThisMonth?: number;
    DirectSavingsDifferenceFromLastMonth?: number;
  };
}

export async function getKPICardDetails(): Promise<KPICardData> {
  const res = await fetch(`${DASHBOARD_BASE_URL}/GetKPICardDetails`, {
    headers: { Authorization: getAuthToken() },
  });
  if (!res.ok) throw new Error("Failed to fetch KPI card details.");
  return res.json();
}

export async function getSavingsGrowth(): Promise<Array<{ month: string; savings: number }>> {
  const res = await fetch(`${DASHBOARD_BASE_URL}/GetSavingsGrowth`, {
    headers: { Authorization: getAuthToken() },
  });
  if (!res.ok) throw new Error("Failed to fetch savings growth.");
  const data = await res.json();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return data.MonthlyValueRecordList.map((item: { Month: number; Value: number }) => ({
    month: months[item.Month - 1] ?? String(item.Month),
    savings: item.Value,
  }));
}

// --- Goals ---

export interface CreateGoalContributor {
  UserId: number
  RoleEnumId: number
  TargetAmount: number
}

export interface CreateGoalRequest {
  Title: string
  Description: string
  TargetAmount: number
  Currency: string
  Deadline: string
  WithdrawalType: number
  CreateGoalAPIRequestContributors: CreateGoalContributor[]
}

export interface SavingsGoal {
  Id: number
  OwnerId: number
  Title: string
  Description: string
  TargetAmount: number
  CurrentAmount: number
  Currency: string
  Deadline: string
  Status: number
  CreatedAt: string
  UpdatedAt: string
  WithdrawalType?: number
}

export interface GoalContributionRecord {
  SavingsGoal: SavingsGoal
  GoalContributions: {
    Id: number
    GoalId: number
    UserId: number
    TargetAmount: number
    CurrentAmount: number
    CreatedAt: string
    UpdatedAt: string
    Role: number
  }
}

export interface GoalMember {
  Id: number
  GoalId: number
  UserId: number
  TargetAmount: number
  CurrentAmount: number
  CreatedAt: string
  UpdatedAt: string
  Name: string
}

export interface GoalWithMembers {
  Goal: SavingsGoal
  Members: GoalMember[]
}

export async function getAllGoalsByUser(userId: number): Promise<GoalContributionRecord[]> {
  const res = await fetch(`${GOAL_ATOMIC_BASE_URL}/goalContributions/user/${userId}`, {
    method: "GET",
    headers: { Authorization: getAuthToken() },
  });
  if (!res.ok) throw new Error("Failed to fetch goals.");
  return res.json();
}

export async function getGoal(goalId: number): Promise<GoalWithMembers> {
  const res = await fetch(`${GOAL_BASE_URL}/GetGoal?GoalId=${goalId}`, {
    method: "GET",
    headers: { Authorization: getAuthToken() },
  });
  if (!res.ok) throw new Error("Failed to fetch goal.");
  return res.json();
}

export async function createGoal(data: CreateGoalRequest): Promise<number> {
  const res = await fetch(`${GOAL_BASE_URL}/CreateGoal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthToken(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create goal.");
  return res.json();
}

// --- User / Auth ---

export async function signupUser(
  name: string,
  email: string,
  password: string,
  bankAccountId: string,
  bankAccountNumber: string
): Promise<void> {
  const res = await fetch(`${BASE_URL}/SignupNewUser`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Name: name,
      Email: email,
      Password: password,
      MobilePhone: "",
      External_Id: "",
      BankAccountId: bankAccountId,
      BankAccountNumber: Number(bankAccountNumber),
    }),
  });

  if (!res.ok) throw new Error("Failed to create account.");
}

export interface UserByEmailData {
  UserId: number
  Name: string
  Email: string
}

export async function getUserByEmail(email: string): Promise<UserByEmailData> {
  const res = await fetch(
    `${PROFILE_BASE_URL}/GetUserDetailsFromEmail?Email=${encodeURIComponent(email)}`,
    { method: "GET", headers: { Authorization: getAuthToken() } }
  );
  if (!res.ok) throw new Error("User not found.");
  return res.json();
}

export interface UserProfileData {
  Name: string;
  Email: string;
  MobilePhone: string;
  BankAccountId: string;
  BankAccountNumber: string;
}

export async function getUserProfile(): Promise<UserProfileData> {
  const res = await fetch(`${PROFILE_BASE_URL}/GetCurrentUserProfileDetails`, {
    headers: { Authorization: getAuthToken() },
  });
  if (!res.ok) throw new Error("Failed to fetch profile.");
  return res.json();
}

export async function updateUserProfile(data: UserProfileData): Promise<void> {
  const res = await fetch(`${PROFILE_BASE_URL}/UpdateCurrentUserProfileDetails`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: getAuthToken() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update profile.");
}

export interface Payment {
  PaymentId: number
  UserId: string
  ItemAmount: number
  SavingsAmount: number
  TotalAmount: number
  TransactionDate: string
  MerchantId: number
  Currency: string
}

export async function getPayments(): Promise<Payment[]> {
  const res = await fetch(`${PAYMENT_BASE_URL}/GetPaymentByUserId`, {
    headers: { Authorization: getAuthToken() },
  });
  if (!res.ok) throw new Error("Failed to fetch payments.");
  const data: Payment[] = await res.json();
  return [...data].reverse();
}

export interface ProcessPaymentRequest {
  UserId: number
  MerchantId: number
  ItemAmount: number
  SavingsAmount: number
  Currency: string
  GoalId: number
  BankTransferId: string
  MonthlyTransfersId: number
}

export async function processPayment(data: ProcessPaymentRequest): Promise<void> {
  const res = await fetch(`${PAYMENT_GATEWAY_URL}/ProcessMerchantPayment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: getAuthToken() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const result = await res.json();
  if (result.HasError) throw new Error(result.ErrorMessage || "Payment failed");
}

export interface LedgerTransaction {
  LedgerId: number
  UserId: number
  GoalId: number
  Type: string
  Amount: number
  Currency: string
  MonthlyTransfersId: number
  PaymentId: number
  BankTransferId: string
  CreatedOn: string
}

export async function getLedgerByUserId(userId: number): Promise<LedgerTransaction[]> {
  const res = await fetch(`${LEDGER_BASE_URL}/GetLedgerTransactionsByUserId?UserId=${userId}`, {
    headers: { Authorization: getAuthToken() },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getAllGoals(): Promise<SavingsGoal[]> {
  const res = await fetch(`${GOAL_ATOMIC_BASE_URL}/GetAllGoals`, {
    headers: { Authorization: getAuthToken() },
  });
  if (!res.ok) throw new Error("Failed to fetch goals.");
  return res.json();
}

export async function loginUser(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/Login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Email: email, Password: password }),
  });

  if (!res.ok) throw new Error("Invalid email or password.");

  const data = await res.json();
  if (!data.TokenString) throw new Error("No token received.");

  return data.TokenString;
}
