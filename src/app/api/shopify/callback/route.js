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

      // Save token directly to MongoDB keyed by merchant shopDomain
      const now = Date.now();
      const TOKEN_EXPIRY_MS = 23 * 60 * 60 * 1000;

      await saveCredentialsToDb({
        shopDomain: cleanShop,
        clientId: clientId || "",
        clientSecret: clientSecret || "",
        accessToken,
        lastRefreshedAt: now,
        expiresAt: now + TOKEN_EXPIRY_MS,
        installedAt: new Date(),
      });

      console.log(`[Shopify 1-Click Install] Successfully installed & saved access token to MongoDB for store: ${cleanShop}`);

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
