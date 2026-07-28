import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { authSecret } from "@/auth/secret";

const protectedRoutes = ["/dashboard", "/editor", "/profile", "/admin"];

function isProtectedPath(pathname: string) {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: authSecret });
  const isLoggedIn = Boolean(token);

  if (isProtectedPath(pathname) && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === "/login" || pathname === "/signup" || pathname === "/register") && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*", "/profile/:path*", "/admin/:path*", "/login", "/signup", "/register"],
};
