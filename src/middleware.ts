import { type NextRequest, NextResponse } from "next/server";
import { decodeJwtClaims } from "@/lib/session";
import type { SessionUser } from "@/types/session";

const PROTECTED_ROUTES = [
  "/home",
  "/admin",
  "/places",
  "/profile",
  "/feed",
  "/discover",
  "/community",
  "/pautas",
  "/visits",
  "/stats",
  "/favorites",
  "/achievements",
];
const AUTH_ROUTES = ["/login", "/register"];

const ACCESS_TOKEN_COOKIE = "soromaps_access_token";
const REFRESH_TOKEN_COOKIE = "soromaps_refresh_token";
const USER_COOKIE = "soromaps_user";

/**
 * Route protection and transparent token rotation middleware.
 * Intercepts expired access tokens to perform silent rotation against the API before forwarding navigation.
 */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const userCookie = request.cookies.get(USER_COOKIE)?.value;

  let sessionUser: SessionUser | null = null;
  if (userCookie) {
    try {
      sessionUser = JSON.parse(userCookie) as SessionUser;
    } catch {
      sessionUser = null;
    }
  }

  let validAccessToken = accessToken;
  let responseToModify: NextResponse | null = null;

  const claims = validAccessToken ? decodeJwtClaims(validAccessToken) : null;
  const isAccessTokenExpired = !claims?.exp || Date.now() >= claims.exp * 1000;

  /** Performs transparent token refresh when access token is expired but refresh token exists. */
  if (isAccessTokenExpired && refreshToken) {
    try {
      const apiUrl = process.env.API_URL ?? "http://localhost:5099";
      const refreshResponse = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        validAccessToken = refreshData.accessToken;
        const isProduction = process.env.NODE_ENV === "production";

        responseToModify = NextResponse.next();

        responseToModify.cookies.set(ACCESS_TOKEN_COOKIE, refreshData.accessToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          path: "/",
          maxAge: refreshData.expiresIn,
        });

        responseToModify.cookies.set(REFRESH_TOKEN_COOKIE, refreshData.refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
        });

        sessionUser = {
          id: refreshData.user.id,
          name: refreshData.user.name,
          email: refreshData.user.email,
          role: refreshData.user.role.toLowerCase() === "admin" ? "admin" : "explorer",
          avatarUrl: refreshData.user.avatarUrl,
          neighborhood: refreshData.user.neighborhood,
        };

        responseToModify.cookies.set(USER_COOKIE, JSON.stringify(sessionUser), {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
        });
      }
    } catch {
      validAccessToken = undefined;
    }
  }

  const isAuthenticated = Boolean(validAccessToken && sessionUser);
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => path.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => path.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.nextUrl.origin));
    redirectResponse.cookies.delete(ACCESS_TOKEN_COOKIE);
    redirectResponse.cookies.delete(REFRESH_TOKEN_COOKIE);
    redirectResponse.cookies.delete(USER_COOKIE);
    return redirectResponse;
  }

  if (isAuthRoute && isAuthenticated)
    return NextResponse.redirect(new URL("/home", request.nextUrl.origin));

  if (path.startsWith("/admin") && sessionUser?.role !== "admin")
    return NextResponse.redirect(new URL("/home", request.nextUrl.origin));

  return responseToModify ?? NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/admin/:path*",
    "/places/:path*",
    "/profile/:path*",
    "/feed/:path*",
    "/discover/:path*",
    "/community/:path*",
    "/pautas/:path*",
    "/visits/:path*",
    "/stats/:path*",
    "/favorites/:path*",
    "/achievements/:path*",
    "/login",
    "/register",
  ],
};
