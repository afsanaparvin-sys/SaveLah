import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isTokenExpired(token: string): boolean {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (!payload.exp) return true;
    return Date.now() / 1000 > payload.exp;
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith("/Login");
  const isAuthenticated = token && !isTokenExpired(token);

  if (!isAuthenticated && !isLoginPage) {
    const response = NextResponse.redirect(new URL("/Login", request.url));
    // Clear the expired cookie if present
    if (token) response.cookies.delete("auth_token");
    return response;
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/Dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|icon|apple-icon).*)"],
};
