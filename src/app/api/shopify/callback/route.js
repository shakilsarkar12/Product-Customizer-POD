import { NextResponse } from "next/server";
import { saveCredentialsToDb } from "@/lib/mongodb";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");
  const code = searchParams.get("code");

  if (!shop || !code) {
    return NextResponse.json({ error: "Invalid OAuth Callback payload." }, { status: 400 });
  }

  const cleanShop = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  try {
    // Exchange temporary authorization code for permanent/long-lived access token
    const tokenResponse = await fetch(`https://${cleanShop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    if (tokenResponse.ok) {
      const data = await tokenResponse.json();
      const accessToken = data.access_token;

      // Fetch live store information directly from Shopify Admin API using the new Access Token
      let shopDetails = {};
      try {
        const shopRes = await fetch(`https://${cleanShop}/admin/api/2024-01/shop.json`, {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        });
        if (shopRes.ok) {
          const shopData = await shopRes.json();
          if (shopData.shop) {
            shopDetails = shopData.shop;
          }
        }
      } catch (shopErr) {
        console.warn("[Shopify Shop API Error]:", shopErr.message);
      }

      // Save token & live store metadata directly to MongoDB
      const now = Date.now();
      const TOKEN_EXPIRY_MS = 23 * 60 * 60 * 1000;

      await saveCredentialsToDb({
        shopDomain: cleanShop,
        clientId: clientId || "",
        clientSecret: clientSecret || "",
        accessToken,
        siteName: shopDetails.name || `${cleanShop.split(".")[0]} Customizer`,
        dashboardTitle: shopDetails.name ? `${shopDetails.name} Overview` : `${cleanShop.split(".")[0]} Overview`,
        supportEmail: shopDetails.email || `support@${cleanShop}`,
        currency: shopDetails.currency ? `${shopDetails.currency} (${shopDetails.money_format ? shopDetails.money_format.charAt(0) : "$"})` : "USD ($)",
        timezone: shopDetails.iana_timezone || shopDetails.timezone || "UTC+06:00 (Dhaka)",
        lastRefreshedAt: now,
        expiresAt: now + TOKEN_EXPIRY_MS,
        installedAt: new Date(),
      });

      console.log(`[Shopify 1-Click Install] Successfully installed & saved live store details (${shopDetails.name || cleanShop}) to MongoDB!`);

      // Redirect merchant straight to App Dashboard
      const host = req.headers.get("host") ? `${req.headers.get("x-forwarded-proto") || "http"}://${req.headers.get("host")}` : "http://localhost:3000";
      return NextResponse.redirect(`${host}/?shop=${cleanShop}&installed=true`);
    } else {
      const errorText = await tokenResponse.text();
      return NextResponse.json({ error: "OAuth Token Exchange Failed", details: errorText }, { status: 400 });
    }
  } catch (err) {
    console.error("[Shopify OAuth Callback Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
