import { NextResponse } from "next/server";
import { verifyShopifyWebhook } from "@/lib/shopifyHmac";

/**
 * App Uninstalled Webhook: app/uninstalled
 * Shopify Spec: https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#app-uninstalled
 */
export async function POST(req) {
  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
    const secret = process.env.SHOPIFY_CLIENT_SECRET;

    if (secret && hmacHeader) {
      const isValid = verifyShopifyWebhook(rawBody, hmacHeader, secret);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid webhook HMAC" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody || "{}");
    const shopDomain = req.headers.get("x-shopify-shop-domain") || payload.myshopify_domain || payload.domain;
    console.log("[Shopify App Uninstalled] Webhook triggered for:", shopDomain);

    return NextResponse.json({ success: true, message: `App uninstallation handled for ${shopDomain}` });
  } catch (err) {
    console.error("[App Uninstalled Webhook Error]:", err);
    return NextResponse.json({ success: true });
  }
}
