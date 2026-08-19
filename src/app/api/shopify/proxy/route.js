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
    const variantId = targetProduct?.variantId || searchParams.get("variant_id") || "";

    // Full customizer URL with complete origin so iframe loads the full app directly with server prefetch
    const customizerSrc = `${appUrl}/customizer?shop=${encodeURIComponent(shop)}&product_id=${encodeURIComponent(finalProdId)}&variant_id=${encodeURIComponent(variantId)}&title=${encodeURIComponent(title)}&image=${encodeURIComponent(image)}&price=${encodeURIComponent(price)}`;

    // Shopify App Proxy returns Liquid/HTML rendered inside merchant theme with parent window redirect listener
    const liquidHtml = `
      <div id="podcraft-customizer-app-proxy" style="width: 100%; min-height: 850px; border: none; margin: 0; padding: 0;">
        <iframe
          id="podcraft-customizer-iframe"
          src="${customizerSrc}"
          style="width: 100%; height: 950px; border: none; border-radius: 16px;"
          allow="camera; microphone; clipboard-read; clipboard-write; payment;"
        ></iframe>
      </div>

      <script>
        (function() {
          var isRedirecting = false;
          window.addEventListener("message", async function(event) {
            if (!event.data || isRedirecting) return;

            // 1. Direct Checkout Redirect from Draft Order API
            if (event.data.type === "SHOPIFY_REDIRECT" && event.data.url) {
              isRedirecting = true;
              window.location.href = event.data.url;
              return;
            }

            // 2. Add to Cart on Shopify Store via Storefront Cart API
            if (event.data.type === "CUSTOMIZER_ADD_TO_CART" && event.data.payload) {
              isRedirecting = true;
              try {
                var item = event.data.payload;
                var res = await fetch("/cart/add.js", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    items: [{
                      id: item.variantId || item.id,
                      quantity: item.quantity || 1,
                      properties: item.properties || {}
                    }]
                  })
                });

                if (event.data.goToCheckout) {
                  window.location.href = "/checkout";
                } else {
                  window.location.href = "/cart";
                }
              } catch (e) {
                console.error("[Customizer Storefront Cart Error]:", e);
                window.location.href = event.data.goToCheckout ? "/checkout" : "/cart";
              }
            }
          });
        })();
      </script>
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
