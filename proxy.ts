/**
 * API Proxy — forwards `/api/v1/*` to the backend server.
 *
 * Usage:
 *   Local:  NEXT_PUBLIC_API_URL=http://localhost:5000 bun --bun next dev
 *   Prod:   set NEXT_PUBLIC_API_URL to your production backend
 *
 * This proxy is needed so that cookie-based sessions from better-auth
 * work without CORS issues — the browser sends cookies to the same
 * origin and the proxy forwards them with `credentials: "include"`.
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // Only proxy requests starting with /api/v1
  if (!pathname.startsWith("/api/v1")) {
    return new NextResponse("", { status: 404 }); // Let Next.js handle it normally
  }

  // Build the target URL on the backend
  const targetUrl = `${BACKEND_URL}${pathname}${req.nextUrl.search}`;

  // Clone headers, stripping host-specific ones
  const headers = new Headers(req.headers);
  headers.set("Host", new URL(BACKEND_URL).host);
  headers.delete("Origin");
  headers.delete("Referer");

  // Forward the request to the backend
  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: req.body,
    // duplex: "half",
  });

  // Build response headers
  const resHeaders = new Headers(response.headers);

  // Rewrite set-cookie paths so browser sends them to app origin
  const setCookie = resHeaders.getSetCookie();
  if (setCookie.length) {
    resHeaders.delete("set-cookie");
    for (const cookie of setCookie) {
      const rewritten = cookie.replace(/Path=\/api\/v1/g, "Path=/");
      resHeaders.append("set-cookie", rewritten);
    }
  }

  // Return the proxied response
  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: resHeaders,
  });
}
export const config = {
  /*
        * Match all paths except for the ones starting with:
        * - /api(API routes)
        * - /_next/static(Next.js static files)
        * - /_next/image(Next.js image optimization)
        * - /favicon.ico(Favicon)
        * - /sitemap.xml(Sitemap)
        * - /robots.txt(Robots.txt)
        * - /.well-known(Custom endpoints)

    */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)",
  ],
};
