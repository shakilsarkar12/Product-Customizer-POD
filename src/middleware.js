import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // Banned manual auth pages - redirect signin/signup to root
  if (pathname === "/signin" || pathname === "/signup") {
    const shop = searchParams.get("shop") || request.cookies.get("shopify_shop")?.value;
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

  // If request comes from Shopify App Proxy (has path_prefix or product_id) but hits root "/", rewrite to /customizer
  const pathPrefix = searchParams.get("path_prefix");
  const productId = searchParams.get("product_id");
  if (pathname === "/" && (pathPrefix || productId)) {
    return NextResponse.rewrite(new URL(`/customizer${request.nextUrl.search}`, request.url));
  }

  // Preserve shop parameter in cookie if present
  const shop = searchParams.get("shop");
  const response = NextResponse.next();

  if (shop) {
    const cleanShop = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");
    response.cookies.set("shopify_shop", cleanShop, {
      path: "/",
      sameSite: "none",
      secure: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
