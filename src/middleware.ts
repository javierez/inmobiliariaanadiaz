import { NextResponse, type NextRequest } from "next/server";

/**
 * Sets `x-pathname` so server layouts can branch on the current path
 * (e.g. skip Navbar/WhatsAppButton on `/preview/*`).
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // Run on all paths except static assets / Next internals.
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
