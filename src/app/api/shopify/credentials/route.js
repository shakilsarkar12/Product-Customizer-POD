import { NextResponse } from "next/server";
import { refreshShopifyAccessToken, getValidAdminAccessToken, getTokenStatus } from "@/lib/shopifyTokenService";
import { getCredentialsFromDb } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const body = await req.json();
    const { shopDomain, clientId, clientSecret, accessToken, siteName, dashboardTitle, supportEmail, timezone, currency, language } = body;

    // Refresh & persist directly to MongoDB
    const tokenInfo = await refreshShopifyAccessToken({
      shopDomain,
      clientId,
      clientSecret,
      accessToken,
      siteName,
      dashboardTitle,
      supportEmail,
      timezone,
      currency,
      language,
    });

    return NextResponse.json({
      success: true,
      message: "Shopify General Settings & Store Credentials saved to MongoDB Database!",
      data: tokenInfo,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  const dbData = (await getCredentialsFromDb()) || {};
  const activeToken = await getValidAdminAccessToken();
  const status = await getTokenStatus();

  const domain = dbData.shopDomain || status.shopDomain || process.env.SHOPIFY_STORE_DOMAIN || "your-store.myshopify.com";
  const shopName = domain
    .replace(".myshopify.com", "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return NextResponse.json({
    success: true,
    shopDomain: domain,
    siteName: dbData.siteName || `${shopName} Customizer`,
    dashboardTitle: dbData.dashboardTitle || `${shopName} Overview`,
    supportEmail: dbData.supportEmail || `support@${domain}`,
    timezone: dbData.timezone || "UTC+06:00 (Dhaka)",
    currency: dbData.currency || "USD ($)",
    language: dbData.language || "English",
    clientId: dbData.clientId || status.clientId || "",
    activeAdminAccessToken: activeToken ? `${activeToken.slice(0, 8)}••••••••` : "",
  });
}
