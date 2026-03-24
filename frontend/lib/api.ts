const BASE_URL = "https://ypw.outsystemscloud.com/UserAuth/rest/UserAuth";
const PROFILE_BASE_URL = "https://ypw.outsystemscloud.com/UserProfile/rest/UserProfile";

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

export interface UserProfileData {
  Name: string;
  Email: string;
  MobilePhone: string;
  BankAccountId: string;
  BankAccountNumber: string;
}

export async function getUserProfile(): Promise<UserProfileData> {
  const token = document.cookie
    .split("; ")
    .find((c) => c.startsWith("auth_token="))
    ?.split("=")[1];

  const res = await fetch(`${PROFILE_BASE_URL}/GetCurrentUserProfileDetails`, {
    method: "GET",
    headers: { Authorization: token ?? "" },
  });

  if (!res.ok) throw new Error("Failed to fetch profile.");
  return res.json();
}
export async function updateUserProfile(data: UserProfileData): Promise<void> {
  const token = document.cookie
    .split("; ")
    .find((c) => c.startsWith("auth_token="))
    ?.split("=")[1];

  const res = await fetch(`${PROFILE_BASE_URL}/UpdateCurrentUserProfileDetails`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: token ?? "" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update profile.");
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
