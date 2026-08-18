import crypto from "crypto";

/**
 * Verify Shopify OAuth Callback HMAC Signature
 * Spec: https://shopify.dev/docs/apps/auth/oauth/getting-started#step-2-verify-the-installation-request
 */
export function verifyShopifyHmac(searchParams, secret) {
  const hmac = searchParams.get("hmac");
  if (!hmac || !secret) return false;

  const map = new Map();
  searchParams.forEach((val, key) => {
    if (key !== "hmac" && key !== "signature") {
      map.set(key, val);
    }
  });

  // Sort keys alphabetically
  const sortedKeys = Array.from(map.keys()).sort();
  const queryString = sortedKeys.map((k) => `${k}=${map.get(k)}`).join("&");

  const calculatedHmac = crypto
    .createHmac("sha256", secret)
    .update(queryString)
    .digest("hex");

  try {
    const a = Buffer.from(hmac, "utf8");
    const b = Buffer.from(calculatedHmac, "utf8");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (e) {
    return false;
  }
}

/**
 * Verify Shopify Webhook HMAC Header (X-Shopify-Hmac-Sha256)
 * Spec: https://shopify.dev/docs/apps/webhooks/configuration/https#step-5-verify-the-webhook
 */
export function verifyShopifyWebhook(rawBody, hmacHeader, secret) {
  if (!rawBody || !hmacHeader || !secret) return false;

  const hash = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  try {
    const a = Buffer.from(hmacHeader, "utf8");
    const b = Buffer.from(hash, "utf8");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (e) {
    return false;
  }
}
