import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // Banned manual auth pages - redirect signin/signup to root
  if (pathname === "/signin" || pathname === "/signup") {
    const shop = searchParams.get("shop");
    const redirectUrl = shop ? `/?shop=${shop}` : "/";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Allow public routes: static assets, unauthorized page, customizer storefront proxy, and shopify API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/unauthorized") ||
    pathname.startsWith("/customizer") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for Shopify Admin authentication context parameters or headers
  const shop = searchParams.get("shop");
  const hmac = searchParams.get("hmac");
  const hostParam = searchParams.get("host");
  const idToken = searchParams.get("id_token");
  const shopHeader = request.headers.get("x-shopify-shop-domain");

  const isFromShopifyAdmin = Boolean(shop || hmac || hostParam || idToken || shopHeader);

  // If someone attempts direct browser access outside of Shopify Admin, block & redirect to /unauthorized
  if (!isFromShopifyAdmin) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
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
