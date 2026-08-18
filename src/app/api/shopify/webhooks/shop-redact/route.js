import { NextResponse } from "next/server";
import { verifyShopifyWebhook } from "@/lib/shopifyHmac";

/**
 * Mandatory GDPR Webhook: shop/redact
 * Shopify Spec: https://shopify.dev/docs/apps/store/security-data-privacy/gdpr-webhooks#shop-redact
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
    console.log("[Shopify GDPR Shop Redact] Received for shop:", payload.shop_domain);

    return NextResponse.json({ success: true, message: "Shop redact acknowledged." });
  } catch (err) {
    console.error("[GDPR Shop Redact Error]:", err);
    return NextResponse.json({ success: true });
  }
}
