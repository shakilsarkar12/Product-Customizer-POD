import { NextResponse } from "next/server";
import { getProducts } from "@/lib/productsDb";

/**
 * Shopify App Proxy Route
 * Spec: https://shopify.dev/docs/apps/online-store/app-proxies
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop") || "store.myshopify.com";
    const productId = searchParams.get("product_id") || "";

    const allProducts = await getProducts();
    const targetProduct = allProducts.find((p) => p.id === productId || p.shopifyProductId === productId) || allProducts[0];

    // Shopify App Proxy returns Liquid/HTML rendered inside merchant theme
    const liquidHtml = `
      <div id="podcraft-customizer-app-proxy" style="width: 100%; min-height: 800px; border: none;">
        <iframe
          src="/customizer?shop=${encodeURIComponent(shop)}&product_id=${encodeURIComponent(targetProduct?.id || '')}"
          style="width: 100%; height: 900px; border: none; border-radius: 16px;"
          allow="camera; microphone; clipboard-read; clipboard-write;"
        ></iframe>
      </div>
    `;

    return new Response(liquidHtml, {
      status: 200,
      headers: {
        "Content-Type": "application/liquid",
      },
    });
  } catch (err) {
    console.error("[Shopify Proxy Route Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
