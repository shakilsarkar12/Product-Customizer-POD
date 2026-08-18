import { NextResponse } from "next/server";
import { getCredentialsFromDb } from "@/lib/mongodb";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");

  const dbCreds = (await getCredentialsFromDb()) || {};
  const targetShop = shop || dbCreds.shopDomain || process.env.SHOPIFY_STORE_DOMAIN;

  if (!targetShop) {
    return NextResponse.json({ error: "Missing 'shop' query parameter. Example: ?shop=your-store.myshopify.com" }, { status: 400 });
  }

  const cleanShop = targetShop.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const clientId = dbCreds.clientId || process.env.SHOPIFY_CLIENT_ID;
  const scopes = "read_products,write_products,read_orders,write_orders,read_draft_orders,write_draft_orders,read_themes";

  let host = process.env.NEXT_PUBLIC_APP_URL;
  if (!host && req.headers.get("host")) {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    host = `${proto}://${req.headers.get("host")}`;
  }
  if (!host) {
    host = "https://podcraft.shakildev.online";
  }
  const redirectUri = `${host}/api/shopify/callback`;

  // Standard 1-Click Shopify OAuth Install URL
  const installUrl = `https://${cleanShop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return NextResponse.redirect(installUrl);
}
