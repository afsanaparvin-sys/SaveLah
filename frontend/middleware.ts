import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith("/Login");

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/Login", request.url));
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/Dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|icon|apple-icon).*)"],
};
