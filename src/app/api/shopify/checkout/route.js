import { NextResponse } from "next/server";
import { getValidAdminAccessToken } from "@/lib/shopifyTokenService";
import { getCredentialsFromDb } from "@/lib/mongodb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, ngrok-skip-browser-warning",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

/**
 * Dynamic Custom Pricing & Shopify Draft Order Checkout Generator
 * Creates an official Shopify Checkout session with custom unit price,
 * line item properties, print specifications, and team rosters.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      productId,
      variantId,
      productTitle = "Customized Product",
      quantity = 1,
      customUnitPrice = 25.0,
      totalPrice,
      discountPercent = 0,
      discountAmount = 0,
      selectedColor,
      selectedSize = "L",
      selectedMaterial,
      layersByView = {},
      teamRoster = [],
      previewImages = {},
    } = body;

    const orderId = `POD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Format applied discount for bulk volume tiers
    let appliedDiscount = null;
    if (Number(discountAmount) > 0 || Number(discountPercent) > 0) {
      appliedDiscount = {
        title: `Bulk Volume Discount (${discountPercent}% OFF)`,
        description: `Customizer Volume Tier Savings for ${quantity} items`,
        value: Number(discountPercent) > 0 ? String(discountPercent) : String(discountAmount),
        value_type: Number(discountPercent) > 0 ? "percentage" : "fixed_amount",
        amount: Number(discountAmount).toFixed(2),
      };
    }

    // 1. Format Line Item Properties for Shopify Order & Factory Production
    const properties = [
      { name: "Customization ID", value: orderId },
      { name: "Size", value: String(selectedSize || "L").toUpperCase() },
      { name: "Color", value: selectedColor?.name || "Default Color" },
      {
        name: "Material Quality",
        value: `${selectedMaterial?.name || "Standard Quality"}${
          selectedMaterial?.priceAddon ? ` (+$${selectedMaterial.priceAddon.toFixed(2)})` : ""
        }`,
      },
    ];

    // Add per-view customization summary
    Object.entries(layersByView).forEach(([viewKey, layers]) => {
      if (Array.isArray(layers) && layers.length > 0) {
        const descriptions = layers
          .map((l) => {
            if (l.type === "text") return `Text: "${l.text || ""}" (${l.fontFamily || "Default"})`;
            if (l.type === "image") return `Graphic: [Uploaded Artwork]`;
            if (l.type === "clipart") return `Clipart: [Vector Asset]`;
            return `Layer: ${l.type}`;
          })
          .join(" • ");
        if (descriptions) {
          const capitalizedView = viewKey.charAt(0).toUpperCase() + viewKey.slice(1);
          properties.push({ name: `${capitalizedView} Customization`, value: descriptions });
        }
      }
    });

    if (Array.isArray(teamRoster) && teamRoster.length > 0) {
      properties.push({
        name: "Team Roster Personalization",
        value: `${teamRoster.length} Players (${teamRoster.map((r) => `#${r.number || "0"} ${r.name || "Player"}`).join(", ")})`,
      });
    }

    properties.push({
      name: "Custom Unit Price",
      value: `$${Number(customUnitPrice).toFixed(2)}`,
    });

    if (Number(discountAmount) > 0) {
      properties.push({
        name: "Bulk Volume Savings",
        value: `${discountPercent}% OFF (-$${Number(discountAmount).toFixed(2)})`,
      });
    }

    // 2. Fetch Active Shopify Store & Token
    const dbCreds = (await getCredentialsFromDb()) || {};
    const shopDomain =
      body.shopDomain ||
      dbCreds.shopDomain ||
      process.env.SHOPIFY_STORE_DOMAIN ||
      "t-customizer-mjng1g1b.myshopify.com";

    const cleanShop = shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    let token = null;

    try {
      token = await getValidAdminAccessToken();
    } catch (err) {
      console.warn("[Shopify Checkout API] Token resolution notice:", err.message);
    }

    // 3. Create Official Shopify Draft Order with Custom Price
    if (token && cleanShop) {
      try {
        const draftOrderPayload = {
          draft_order: {
            line_items: [
              {
                title: `${productTitle} (Customized - ${selectedSize || "Standard"})`,
                price: Number(customUnitPrice).toFixed(2),
                quantity: Math.max(1, parseInt(quantity) || 1),
                requires_shipping: true,
                taxable: false,
                properties: properties,
              },
            ],
            applied_discount: appliedDiscount,
            taxes_included: true,
            note: `Customized POD Product Order • Ref: ${orderId}${
              discountAmount > 0 ? ` • Bulk Tier Savings: -$${Number(discountAmount).toFixed(2)} (${discountPercent}%)` : ""
            }`,
            tags: "POD_Customized, Customizer_Studio, Custom_Price",
          },
        };

        const shopifyRes = await fetch(`https://${cleanShop}/admin/api/2024-01/draft_orders.json`, {
          method: "POST",
          headers: {
            "X-Shopify-Access-Token": token,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(draftOrderPayload),
        });

        if (shopifyRes.ok) {
          const data = await shopifyRes.json();
          const draftOrder = data.draft_order;

          if (draftOrder && draftOrder.invoice_url) {
            console.log(`[Shopify Checkout API] Created Draft Order #${draftOrder.name} -> ${draftOrder.invoice_url}`);
            return NextResponse.json(
              {
                success: true,
                checkoutUrl: draftOrder.invoice_url,
                orderId: draftOrder.id,
                orderName: draftOrder.name,
                totalPrice: draftOrder.total_price || totalPrice,
                properties,
              },
              { headers: corsHeaders }
            );
          }
        } else {
          const errBody = await shopifyRes.text();
          console.warn("[Shopify Checkout API] Draft Order response failed:", shopifyRes.status, errBody);
        }
      } catch (apiErr) {
        console.error("[Shopify Checkout API] Error calling Shopify Admin API:", apiErr);
      }
    }

    // 4. Direct Storefront Checkout Fallback
    const fallbackCheckoutUrl = `https://${cleanShop}/checkout`;

    return NextResponse.json(
      {
        success: true,
        checkoutUrl: fallbackCheckoutUrl,
        orderId: orderId,
        orderName: `#${orderId}`,
        isFallback: true,
        customUnitPrice: Number(customUnitPrice).toFixed(2),
        properties,
        message: "Customized order prepared for direct checkout!",
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("[Shopify Checkout API Route Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process custom checkout" },
      { status: 500, headers: corsHeaders }
    );
  }
}
