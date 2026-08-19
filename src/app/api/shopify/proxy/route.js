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
    const title = searchParams.get("title") || "";
    const image = searchParams.get("image") || "";
    const price = searchParams.get("price") || "";

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");

    const allProducts = await getProducts();
    const cleanId = (productId || "").replace(/^shopify-/, "");
    const targetProduct = allProducts.find(
      (p) =>
        p.id === productId ||
        p.shopifyProductId === productId ||
        p.shopifyProductId === cleanId ||
        p.id === `shopify-${cleanId}`
    ) || allProducts[0];

    const finalProdId = targetProduct?.id || productId;

    // Full customizer URL with complete origin so iframe loads the full app directly with server prefetch
    const customizerSrc = `${appUrl}/customizer?shop=${encodeURIComponent(shop)}&product_id=${encodeURIComponent(finalProdId)}&title=${encodeURIComponent(title)}&image=${encodeURIComponent(image)}&price=${encodeURIComponent(price)}`;

    // Shopify App Proxy returns Liquid/HTML rendered inside merchant theme
    const liquidHtml = `
      <div id="podcraft-customizer-app-proxy" style="width: 100%; min-height: 850px; border: none; margin: 0; padding: 0;">
        <iframe
          src="${customizerSrc}"
          style="width: 100%; height: 950px; border: none; border-radius: 16px;"
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
