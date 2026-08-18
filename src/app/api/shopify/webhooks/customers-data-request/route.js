import { NextResponse } from "next/server";
import { verifyShopifyWebhook } from "@/lib/shopifyHmac";

/**
 * Mandatory GDPR Webhook: customers/data_request
 * Shopify Spec: https://shopify.dev/docs/apps/store/security-data-privacy/gdpr-webhooks#customers-data_request
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
    console.log("[Shopify GDPR Data Request] Received for shop:", payload.shop_domain, "customer:", payload.customer?.id);

    // Return 200 OK immediately as required by Shopify
    return NextResponse.json({ success: true, message: "Customer data request acknowledged." });
  } catch (err) {
    console.error("[GDPR Data Request Error]:", err);
    return NextResponse.json({ success: true });
  }
}
