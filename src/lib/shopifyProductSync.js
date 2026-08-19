import { getCredentialsFromDb } from "./mongodb";
import { getValidAdminAccessToken } from "./shopifyTokenService";
import { getProducts, createProduct, updateProduct } from "./productsDb";

/**
 * Fetch real products from connected Shopify Store via Admin REST API
 */
export async function syncShopifyProducts() {
  const credentials = (await getCredentialsFromDb()) || {};
  const shop = (credentials.shopDomain || process.env.SHOPIFY_STORE_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const accessToken = (await getValidAdminAccessToken()) || credentials.accessToken || process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "";

  if (!shop || shop === "your-store.myshopify.com") {
    return {
      success: false,
      error: "No valid Shopify store domain configured. Please check your Shopify Credentials in Settings.",
      syncedCount: 0,
    };
  }

  try {
    const shopifyUrl = `https://${shop}/admin/api/2024-01/products.json?limit=50`;
    console.log(`[Shopify Sync] Fetching live products from ${shopifyUrl}...`);

    const response = await fetch(shopifyUrl, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Shopify Sync Warning] Response code ${response.status}: ${errText}`);
      return {
        success: false,
        error: `Shopify API returned status ${response.status}: ${errText}`,
        syncedCount: 0,
      };
    }

    const data = await response.json();
    const shopifyProducts = data.products || [];
    console.log(`[Shopify Sync] Successfully fetched ${shopifyProducts.length} products from ${shop}!`);

    if (shopifyProducts.length === 0) {
      return {
        success: true,
        message: "Connected to Shopify, but no products found in your Shopify store admin yet.",
        syncedCount: 0,
        products: await getProducts(),
      };
    }

    const currentDbProducts = await getProducts();
    const syncedList = [];

    for (const item of shopifyProducts) {
      const existing = currentDbProducts.find(
        (p) => p.shopifyProductId === String(item.id) || p.id === `shopify-${item.id}`
      );

      const frontImg = item.images?.[0]?.src || item.image?.src || "/images/product/product-01.jpg";
      const backImg = item.images?.[1]?.src || frontImg;
      const basePrice = parseFloat(item.variants?.[0]?.price || 25.0);

      // Extract colors from variants or options
      const colorOption = item.options?.find((opt) => opt.name.toLowerCase() === "color" || opt.name.toLowerCase() === "colour");
      let colors = [];
      if (colorOption && colorOption.values?.length > 0) {
        colors = colorOption.values.map((cName, idx) => ({
          id: cName.toLowerCase().replace(/\s+/g, "-"),
          name: cName,
          hex: idx === 0 ? "#FFFFFF" : idx === 1 ? "#111827" : idx === 2 ? "#1E3A8A" : "#6B7280",
          image: item.images?.[idx]?.src || frontImg,
          backImage: backImg,
        }));
      } else {
        colors = [
          { id: "default", name: "Default Color", hex: "#FFFFFF", image: frontImg, backImage: backImg },
        ];
      }

      const productPayload = {
        id: existing?.id || `shopify-${item.id}`,
        shopifyProductId: String(item.id),
        name: existing?.name || item.title,
        category: existing?.category || item.product_type || "Shopify Item",
        basePrice: existing?.basePrice !== undefined ? existing.basePrice : basePrice,
        colors: existing?.colors?.length > 0 ? existing.colors : colors,
        materials: existing?.materials || [
          { id: "standard", name: "Standard Quality", priceAddon: 0 },
          { id: "premium", name: "Premium Upgrade", priceAddon: 5.0 },
        ],
        sizes: item.options?.find((opt) => opt.name.toLowerCase() === "size")?.values || ["S", "M", "L", "XL", "2XL"],
        variantId: String(item.variants?.[0]?.id || ""),
        variants: item.variants || [],
        views: existing?.views?.length > 0 ? existing.views : [
          {
            id: "front",
            label: "Front View",
            image: frontImg,
            printArea: { x: 25, y: 22, width: 50, height: 60 },
          },
          {
            id: "back",
            label: "Back View",
            image: backImg,
            printArea: { x: 25, y: 20, width: 50, height: 65 },
          },
        ],
        handle: item.handle,
        isShopifySync: true,
      };

      if (existing) {
        const updated = await updateProduct(existing.id, productPayload);
        syncedList.push(updated);
      } else {
        const created = await createProduct(productPayload);
        syncedList.push(created);
      }
    }

    const allUpdated = await getProducts();
    return {
      success: true,
      syncedCount: shopifyProducts.length,
      products: allUpdated,
      store: shop,
    };
  } catch (err) {
    console.error("[Shopify Sync Error]:", err);
    return {
      success: false,
      error: err.message,
      syncedCount: 0,
    };
  }
}
