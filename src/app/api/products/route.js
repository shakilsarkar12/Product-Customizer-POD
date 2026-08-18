import { NextResponse } from "next/server";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from "@/lib/productsDb";
import { syncShopifyProducts } from "@/lib/shopifyProductSync";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const sync = searchParams.get("sync");

    // Optional real-time sync with Shopify
    if (sync === "true") {
      const syncResult = await syncShopifyProducts();
      return NextResponse.json(syncResult);
    }

    if (id) {
      const single = await getProductById(id);
      if (!single) {
        return NextResponse.json({ error: `Product '${id}' not found` }, { status: 404 });
      }
      return NextResponse.json(single);
    }

    const allProducts = await getProducts();
    return NextResponse.json({
      products: allProducts,
      total: allProducts.length,
    });
  } catch (err) {
    console.error("[Products GET API Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    // Check if user requested Shopify Sync action
    if (body.action === "sync_shopify") {
      const syncRes = await syncShopifyProducts();
      return NextResponse.json(syncRes);
    }

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Product name is required." }, { status: 400 });
    }

    const created = await createProduct(body);
    return NextResponse.json({ success: true, product: created }, { status: 201 });
  } catch (err) {
    console.error("[Products POST API Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json({ error: "Product 'id' is required for update." }, { status: 400 });
    }

    const updated = await updateProduct(id, body);
    return NextResponse.json({ success: true, product: updated });
  } catch (err) {
    console.error("[Products PUT API Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch (e) {
        // body not provided
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Product 'id' is required for deletion." }, { status: 400 });
    }

    const res = await deleteProduct(id);
    return NextResponse.json(res);
  } catch (err) {
    console.error("[Products DELETE API Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
