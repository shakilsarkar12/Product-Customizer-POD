import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // Banned manual auth pages - redirect signin/signup to root
  if (pathname === "/signin" || pathname === "/signup") {
    const shop = searchParams.get("shop");
    const redirectUrl = shop ? `/?shop=${shop}` : "/";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Bypass static files and public Shopify OAuth API endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/api/shopify/auth") ||
    pathname.startsWith("/api/shopify/callback") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const shop = searchParams.get("shop");
  const sessionCookie = request.cookies.get("shopify_session")?.value;

  // If visiting from Shopify Admin or embedding with shop parameter
  if (shop && !sessionCookie) {
    // Auto-trigger Shopify OAuth if session cookie is not set
    const authUrl = new URL("/api/shopify/auth", request.url);
    authUrl.searchParams.set("shop", shop);
    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
