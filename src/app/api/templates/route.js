import { NextResponse } from "next/server";
import { getTemplates, createTemplate, updateTemplate, deleteTemplate, getTemplateById } from "@/lib/templatesDb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const product = searchParams.get("product");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    if (id) {
      const single = await getTemplateById(id);
      if (!single) {
        return NextResponse.json({ error: `Template '${id}' not found` }, { status: 404 });
      }
      return NextResponse.json(single);
    }

    let allTemplates = await getTemplates();

    // Filter by product assignment if product query param is provided
    if (product && product !== "all") {
      allTemplates = allTemplates.filter((t) => {
        const types = t.productTypes || (t.productType ? [t.productType] : ["all"]);
        return types.includes("all") || types.includes(product);
      });
    }

    // Filter by category if provided
    if (category && category !== "All") {
      allTemplates = allTemplates.filter((t) => t.category === category);
    }

    // Filter by search keyword if provided
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      allTemplates = allTemplates.filter((t) => {
        const inTitle = (t.title || "").toLowerCase().includes(q);
        const inCategory = (t.category || "").toLowerCase().includes(q);
        const inLayers = t.layers?.some((l) => (l.text || "").toLowerCase().includes(q));
        return inTitle || inCategory || inLayers;
      });
    }

    return NextResponse.json({
      templates: allTemplates,
      total: allTemplates.length,
    });
  } catch (err) {
    console.error("[Templates GET API Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Template title is required." }, { status: 400 });
    }

    const created = await createTemplate(body);
    return NextResponse.json({ success: true, template: created }, { status: 201 });
  } catch (err) {
    console.error("[Templates POST API Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json({ error: "Template 'id' is required for update." }, { status: 400 });
    }

    const updated = await updateTemplate(id, body);
    return NextResponse.json({ success: true, template: updated });
  } catch (err) {
    console.error("[Templates PUT API Error]:", err);
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
      return NextResponse.json({ error: "Template 'id' is required for deletion." }, { status: 400 });
    }

    const res = await deleteTemplate(id);
    return NextResponse.json(res);
  } catch (err) {
    console.error("[Templates DELETE API Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
