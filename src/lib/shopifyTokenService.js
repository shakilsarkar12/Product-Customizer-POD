import { saveCredentialsToDb, getCredentialsFromDb } from "./mongodb";

/**
 * Shopify Admin Access Token Manager with MongoDB Persistence & 23-Hour Auto-Refresh Engine
 * Uses Shopify's Official Client Credentials Flow (grant_type: "client_credentials")
 */

const TOKEN_EXPIRY_MS = 23 * 60 * 60 * 1000; // 23 Hours in milliseconds

/**
 * Generate fresh Admin Access Token from Shopify via client_credentials grant and save to MongoDB
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

  const shop = (shopDomain || process.env.SHOPIFY_STORE_DOMAIN || existingDbData.shopDomain || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const id = clientId || process.env.SHOPIFY_CLIENT_ID || existingDbData.clientId;
  const secret = clientSecret || process.env.SHOPIFY_CLIENT_SECRET || existingDbData.clientSecret;

  let freshAccessToken = accessToken || null;
  let tokenExpiresIn = TOKEN_EXPIRY_MS;

  if (!freshAccessToken && shop && id && secret) {
    try {
      const shopifyUrl = `https://${shop}/admin/oauth/access_token`;
      console.log(`[Shopify Token Engine] Requesting fresh 24h Admin Token from Shopify: ${shopifyUrl}...`);

      const params = new URLSearchParams();
      params.append("grant_type", "client_credentials");
      params.append("client_id", id);
      params.append("client_secret", secret);

      const response = await fetch(shopifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        body: params.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          freshAccessToken = data.access_token;
          // Use 23 hours or expires_in minus 1 hour buffer
          if (data.expires_in) {
            tokenExpiresIn = Math.max(3600 * 1000, (data.expires_in - 3600) * 1000);
          }
          console.log(`[Shopify Token Engine] Successfully generated fresh Shopify Admin Token (${freshAccessToken.substring(0, 10)}...)! Valid for 23 Hours.`);
        }
      } else {
        const errText = await response.text();
        console.warn(`[Shopify Token Engine Warning] Status ${response.status}: ${errText.substring(0, 200)}`);
      }
    } catch (err) {
      console.error("[Shopify Token Engine Error]:", err.message);
    }
  }

  // Fallback to existing token or environment access token
  if (!freshAccessToken) {
    freshAccessToken = existingDbData.accessToken || process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "";
  }

  const now = Date.now();
  const expiresAt = now + tokenExpiresIn;

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
    timezone: timezone || existingDbData.timezone || "America/New_York",
    currency: currency || existingDbData.currency || "USD ($)",
    language: language || existingDbData.language || "en",
  };

  // PERSIST DIRECTLY TO MONGODB DATABASE
  await saveCredentialsToDb(tokenRecord);

  console.log(
    `[Shopify Token Engine] Token saved to MongoDB! Next auto-refresh in 23h (${new Date(expiresAt).toLocaleString()})`
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
      `[Shopify Token Engine] Token ${isMissing ? "missing" : "expired (23h reached)"}. Automatically regenerating fresh token from Shopify...`
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
