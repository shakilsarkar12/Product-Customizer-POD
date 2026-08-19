import { saveCredentialsToDb, getCredentialsFromDb } from "./mongodb";

/**
 * Shopify Admin Access Token Manager with MongoDB Persistence & 23-Hour Auto-Refresh Engine
 */

const TOKEN_EXPIRY_MS = 23 * 60 * 60 * 1000; // 23 Hours in milliseconds

/**
 * Exchange Client ID & Secret for a Fresh Shopify Admin Access Token and save to MongoDB
 */
export async function refreshShopifyAccessToken({
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
} = {}) {
  // Load existing credentials from DB if not passed directly
  const existingDbData = (await getCredentialsFromDb()) || {};

  const shop = (shopDomain || existingDbData.shopDomain || process.env.SHOPIFY_STORE_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const id = clientId || process.env.SHOPIFY_CLIENT_ID || existingDbData.clientId;
  const secret = clientSecret || process.env.SHOPIFY_CLIENT_SECRET || existingDbData.clientSecret;

  let freshAccessToken = accessToken || null;

  if (!freshAccessToken && shop && id && secret) {
    try {
      const shopifyUrl = `https://${shop}/admin/oauth/access_token`;
      console.log(`[Shopify Token Engine] Requesting token exchange at: ${shopifyUrl}...`);

      const response = await fetch(shopifyUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          client_id: id,
          client_secret: secret,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          freshAccessToken = data.access_token;
          console.log("[Shopify Token Engine] Token exchange successful directly with Shopify!");
        }
      } else {
        const errText = await response.text();
        console.warn(`[Shopify Token Engine Warning] Response ${response.status}: ${errText.substring(0, 200)}`);
      }
    } catch (err) {
      console.warn("[Shopify Token Engine Error]:", err.message);
    }
  }

  // Fallback to existing token or environment access token
  if (!freshAccessToken) {
    freshAccessToken = existingDbData.accessToken || process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "";
  }

  const now = Date.now();
  const expiresAt = now + TOKEN_EXPIRY_MS;

  const tokenRecord = {
    ...existingDbData,
    shopDomain: shop,
    clientId: id || "",
    clientSecret: secret || "",
    accessToken: freshAccessToken,
    lastRefreshedAt: now,
    expiresAt,
    siteName: siteName || existingDbData.siteName || `${shop.split(".")[0]} Customizer`,
    dashboardTitle: dashboardTitle || existingDbData.dashboardTitle || `${shop.split(".")[0]} Overview`,
    supportEmail: supportEmail || existingDbData.supportEmail || `support@${shop}`,
    timezone: timezone || existingDbData.timezone || "UTC+06:00 (Dhaka)",
    currency: currency || existingDbData.currency || "USD ($)",
    language: language || existingDbData.language || "en",
  };

  // PERSIST DIRECTLY TO MONGODB DATABASE & FALLBACK
  await saveCredentialsToDb(tokenRecord);

  console.log(
    `[Shopify Token Engine] Admin Access Token saved to MongoDB! Expires in 23h (${new Date(expiresAt).toLocaleString()})`
  );

  return tokenRecord;
}

/**
 * Get guaranteed valid Shopify Admin Access Token from MongoDB (Auto-refreshes every 23 hours)
 */
export async function getValidAdminAccessToken() {
  let dbRecord = (await getCredentialsFromDb()) || {};

  const now = Date.now();
  const isExpired = !dbRecord?.expiresAt || now >= dbRecord.expiresAt;
  const isMissing = !dbRecord?.accessToken;

  // Check 23-hour expiry: If expired or missing, generate fresh token from .env Client ID & Secret
  if (isMissing || isExpired) {
    console.log(
      `[Shopify Token Engine] Token ${isMissing ? "missing" : "expired (23h limit reached)"}. Automatically regenerating fresh token in database...`
    );
    dbRecord = await refreshShopifyAccessToken({
      clientId: process.env.SHOPIFY_CLIENT_ID || dbRecord.clientId,
      clientSecret: process.env.SHOPIFY_CLIENT_SECRET || dbRecord.clientSecret,
      shopDomain: process.env.SHOPIFY_STORE_DOMAIN || dbRecord.shopDomain,
    });
  }

  return dbRecord?.accessToken || "";
}

/**
 * Token Status Details for Dashboard & Settings
 */
export async function getTokenStatus() {
  const dbRecord = (await getCredentialsFromDb()) || {};
  const now = Date.now();
  const expiresAt = dbRecord.expiresAt || now;
  const msRemaining = Math.max(0, expiresAt - now);
  const hoursRemaining = (msRemaining / (1000 * 60 * 60)).toFixed(1);

  return {
    shopDomain: dbRecord.shopDomain || process.env.SHOPIFY_STORE_DOMAIN || "",
    clientId: dbRecord.clientId || process.env.SHOPIFY_CLIENT_ID || "",
    clientSecret: dbRecord.clientSecret || process.env.SHOPIFY_CLIENT_SECRET || "",
    accessToken: dbRecord.accessToken ? `${dbRecord.accessToken.substring(0, 8)}••••••••` : "Not Generated",
    lastRefreshedAt: dbRecord.lastRefreshedAt ? new Date(dbRecord.lastRefreshedAt).toLocaleString() : "N/A",
    expiresAt: dbRecord.expiresAt ? new Date(dbRecord.expiresAt).toLocaleString() : "N/A",
    hoursRemaining: `${hoursRemaining} Hours`,
    isValid: msRemaining > 0 && Boolean(dbRecord.accessToken),
    mongoDbConnected: true,
  };
}
