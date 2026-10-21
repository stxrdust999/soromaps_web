export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

/**
 * Custom fetch client mutator used by Orval-generated endpoints.
 * Injects session authorization on server components and routes browser calls through /api/proxy.
 */
export async function http<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const isServer = typeof window === "undefined";
  const baseUrl = isServer ? (process.env.API_URL ?? "") : "/api/proxy";
  const normalizedPath = isServer
    ? path
    : path.replace(/^\/api(?=\/|$)/, "");

  const requestHeaders = new Headers(options.headers);

  /** Injects Bearer token from httpOnly cookies during server-side execution. */
  if (isServer) {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token = cookieStore.get("soromaps_access_token")?.value;
      if (token && !requestHeaders.has("Authorization")) {
        requestHeaders.set("Authorization", `Bearer ${token}`);
      }
    } catch {
      // In Client Component SSR, cookies() cannot be invoked
    }
  }

  const response = await fetch(`${baseUrl}${normalizedPath}`, {
    ...options,
    headers: requestHeaders,
  });

  if (response.status === 204)
    return {
      data: undefined,
      status: response.status,
      headers: response.headers,
    } as T;

  const contentType = response.headers.get("content-type") ?? "";
  const isJson =
    contentType.includes("application/json") ||
    contentType.includes("application/problem+json");

  const payload = isJson ? await response.json() : await response.text();

  return {
    data: payload,
    status: response.status,
    headers: response.headers,
  } as T;
}
