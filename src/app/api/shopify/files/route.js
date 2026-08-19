import { NextResponse } from "next/server";
import { getCredentialsFromDb } from "@/lib/mongodb";
import { getValidAdminAccessToken } from "@/lib/shopifyTokenService";

/**
 * Fetch live images & media from Shopify Files (Shopify Admin GraphQL / Content -> Files)
 * Spec: https://shopify.dev/docs/api/admin-graphql/2024-01/queries/files
 */
export async function GET(req) {
  try {
    const creds = (await getCredentialsFromDb()) || {};
    const shop = (creds.shopDomain || process.env.SHOPIFY_STORE_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
    const accessToken = await getValidAdminAccessToken();

    if (!shop || !accessToken) {
      return NextResponse.json({
        success: false,
        error: "Shopify Store not connected. Please check Shopify credentials.",
        files: [],
      });
    }

    const graphqlQuery = {
      query: `
        query getShopifyFiles {
          files(first: 50, reverse: true) {
            edges {
              node {
                __typename
                id
                createdAt
                ... on MediaImage {
                  image {
                    url
                    width
                    height
                    altText
                  }
                }
                ... on GenericFile {
                  url
                }
              }
            }
          }
        }
      `,
    };

    console.log(`[Shopify Files API] Querying Shopify Content Files from ${shop}...`);

    const response = await fetch(`https://${shop}/admin/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Shopify Files Error] ${response.status}: ${errText}`);
      
      // Fallback: Fetch product images from REST if GraphQL files scope is restricted
      return await fetchRestProductImagesFallback(shop, accessToken);
    }

    const json = await response.json();
    const edges = json.data?.files?.edges || [];
    let files = [];

    edges.forEach((edge) => {
      const node = edge.node;
      if (node.image?.url) {
        files.push({
          id: node.id,
          url: node.image.url,
          width: node.image.width,
          height: node.image.height,
          altText: node.image.altText || "Shopify Image",
          createdAt: node.createdAt,
        });
      } else if (node.url && (node.url.includes(".jpg") || node.url.includes(".png") || node.url.includes(".webp") || node.url.includes(".svg"))) {
        files.push({
          id: node.id,
          url: node.url,
          width: 800,
          height: 800,
          altText: "Shopify File",
          createdAt: node.createdAt,
        });
      }
    });

    // If Files GraphQL returns 0 files, also include product images as accessible assets
    if (files.length === 0) {
      const productImages = await fetchRestProductImagesFallback(shop, accessToken);
      return productImages;
    }

    return NextResponse.json({
      success: true,
      shop,
      total: files.length,
      files,
    });
  } catch (err) {
    console.error("[Shopify Files Handler Error]:", err);
    return NextResponse.json({ success: false, error: err.message, files: [] }, { status: 500 });
  }
}

async function fetchRestProductImagesFallback(shop, accessToken) {
  try {
    const res = await fetch(`https://${shop}/admin/api/2024-01/products.json?limit=50&fields=id,title,images`, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      const products = data.products || [];
      const extractedImages = [];

      products.forEach((p) => {
        (p.images || []).forEach((img) => {
          extractedImages.push({
            id: `img-${img.id}`,
            url: img.src,
            width: img.width || 1000,
            height: img.height || 1000,
            altText: `${p.title} Image`,
            createdAt: img.created_at || new Date().toISOString(),
          });
        });
      });

      return NextResponse.json({
        success: true,
        shop,
        source: "products_media",
        total: extractedImages.length,
        files: extractedImages,
      });
    }
  } catch (e) {
    console.warn("[REST Fallback Media Error]:", e.message);
  }

  return NextResponse.json({ success: true, files: [] });
}
