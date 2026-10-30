import { type NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/config/env";
import { getAccessToken } from "@/lib/session";

/**
 * Server-side API reverse proxy handler.
 * Forwards client-side map requests to the upstream backend injecting httpOnly authorization tokens.
 */
async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await context.params;
  const apiUrl = getApiUrl();

  const targetPath = path.join("/");
  const searchParams = request.nextUrl.search;
  const targetUrl = `${apiUrl}/api/${targetPath}${searchParams}`;

  const accessToken = await getAccessToken();
  const forwardHeaders = new Headers();

  const contentType = request.headers.get("content-type");
  if (contentType) forwardHeaders.set("Content-Type", contentType);
  if (accessToken) forwardHeaders.set("Authorization", `Bearer ${accessToken}`);

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const upstreamResponse = await fetch(targetUrl, {
    method: request.method,
    headers: forwardHeaders,
    body,
  });

  if (upstreamResponse.status === 204)
    return new NextResponse(null, { status: 204 });

  const responsePayload = await upstreamResponse.arrayBuffer();
  const responseHeaders = new Headers();
  const upstreamContentType = upstreamResponse.headers.get("content-type");

  if (upstreamContentType)
    responseHeaders.set("Content-Type", upstreamContentType);

  return new NextResponse(responsePayload, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export {
  proxyRequest as GET,
  proxyRequest as POST,
  proxyRequest as PUT,
  proxyRequest as PATCH,
  proxyRequest as DELETE,
};
