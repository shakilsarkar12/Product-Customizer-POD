import { NextResponse } from "next/server";
import { verifyShopifyWebhook } from "@/lib/shopifyHmac";

/**
 * Mandatory GDPR Webhook: customers/redact
 * Shopify Spec: https://shopify.dev/docs/apps/store/security-data-privacy/gdpr-webhooks#customers-redact
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
    console.log("[Shopify GDPR Customer Redact] Received for customer:", payload.customer?.id, "shop:", payload.shop_domain);

    return NextResponse.json({ success: true, message: "Customer data redact acknowledged." });
  } catch (err) {
    console.error("[GDPR Customer Redact Error]:", err);
    return NextResponse.json({ success: true });
  }
}
