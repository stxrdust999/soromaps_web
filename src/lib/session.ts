import { cookies } from "next/headers";
import type { SessionPayload, SessionUser } from "@/types/session";

const ACCESS_TOKEN_COOKIE = "soromaps_access_token";
const REFRESH_TOKEN_COOKIE = "soromaps_refresh_token";
const USER_COOKIE = "soromaps_user";

function base64UrlDecode(input: string): string {
  const base64 = input
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(input.length + ((4 - (input.length % 4)) % 4), "=");
  return atob(base64);
}

/**
 * Decodes standard JWT claims without cryptographic verification.
 * Used for reading expiration timestamp and roles in Edge middleware and server components.
 */
export function decodeJwtClaims(
  token: string,
): { sub?: string; email?: string; role?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadJson = base64UrlDecode(parts[1]);
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}

/**
 * Stores authentication tokens and basic profile information in secure httpOnly cookies.
 */
export async function setAuthCookies(authData: {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
    neighborhood?: string | null;
  };
}): Promise<void> {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set(ACCESS_TOKEN_COOKIE, authData.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: authData.expiresIn,
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, authData.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  const sessionUser: SessionUser = {
    id: authData.user.id,
    name: authData.user.name,
    email: authData.user.email,
    role: authData.user.role.toLowerCase() === "admin" ? "admin" : "explorer",
    avatarUrl: authData.user.avatarUrl,
    neighborhood: authData.user.neighborhood,
  };

  cookieStore.set(USER_COOKIE, JSON.stringify(sessionUser), {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

/**
 * Removes all authentication and session identity cookies.
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(USER_COOKIE);
}

/**
 * Reads the active Bearer access token from incoming request cookies.
 */
export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

/**
 * Reads the active refresh token from incoming request cookies.
 */
export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}

/**
 * Resolves current session payload combining profile metadata and token expiration.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(USER_COOKIE)?.value;
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!userCookie) return null;

  try {
    const user = JSON.parse(userCookie) as SessionUser;
    const claims = token ? decodeJwtClaims(token) : null;

    return {
      ...user,
      exp: claims?.exp ? claims.exp * 1000 : undefined,
    };
  } catch {
    return null;
  }
}
