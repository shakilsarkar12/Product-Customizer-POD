import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // Banned manual auth pages - redirect signin/signup to root
  if (pathname === "/signin" || pathname === "/signup") {
    const shop = searchParams.get("shop");
    const redirectUrl = shop ? `/?shop=${shop}` : "/";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Always allow Next.js internal static assets, images, unauthorized page, and public APIs
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/unauthorized") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for Shopify context (Admin OAuth or Storefront App Proxy)
  const shop = searchParams.get("shop");
  const hmac = searchParams.get("hmac");
  const hostParam = searchParams.get("host");
  const idToken = searchParams.get("id_token");
  const signature = searchParams.get("signature");
  const pathPrefix = searchParams.get("path_prefix");
  const productId = searchParams.get("product_id");
  const shopHeader = request.headers.get("x-shopify-shop-domain");

  // Valid Shopify request MUST carry shop, hmac, signature, path_prefix, or product_id
  const isFromShopify = Boolean(
    shop || hmac || hostParam || idToken || signature || pathPrefix || productId || shopHeader
  );

  // If someone attempts direct URL access to /customizer or dashboard outside of a Shopify Store, block & redirect to /unauthorized
  if (!isFromShopify) {
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
