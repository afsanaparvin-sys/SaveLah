export function getTokenPayload(): Record<string, string | number> | null {
  if (typeof document === "undefined") return null;
  const token = document.cookie
    .split("; ")
    .find((c) => c.startsWith("auth_token="))
    ?.split("=")[1];
  if (!token) return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function getUserName(): string {
  const payload = getTokenPayload();
  return payload?.Name ?? "";
}

export function getUserId(): string {
  const payload = getTokenPayload();
  return payload?.UserId ?? "";
}
