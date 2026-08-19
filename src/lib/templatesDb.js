import clientPromise from "./mongodb";
import fs from "fs";
import path from "path";

const FALLBACK_TEMPLATES_PATH = path.join(process.cwd(), ".data", "templates.json");

function ensureFallbackDirExists() {
  const dir = path.dirname(FALLBACK_TEMPLATES_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readFallbackTemplates() {
  try {
    ensureFallbackDirExists();
    if (fs.existsSync(FALLBACK_TEMPLATES_PATH)) {
      const content = fs.readFileSync(FALLBACK_TEMPLATES_PATH, "utf8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[Templates DB Fallback Read Error]:", err.message);
  }
  return null;
}

function writeFallbackTemplates(templates) {
  try {
    ensureFallbackDirExists();
    fs.writeFileSync(FALLBACK_TEMPLATES_PATH, JSON.stringify(templates, null, 2), "utf8");
  } catch (err) {
    console.error("[Templates DB Fallback Write Error]:", err.message);
  }
}

/**
 * Get all configured design templates from MongoDB or fallback
 */
export async function getTemplates() {
  try {
    const mongoClient = await clientPromise;
    if (mongoClient) {
      const db = mongoClient.db("shopify_customizer");
      const templates = await db.collection("templates").find({}).sort({ updatedAt: -1 }).toArray();
      if (templates.length > 0) {
        return templates.map((t) => {
          const clean = { ...t };
          delete clean._id;
          return clean;
        });
      }
    }
  } catch (err) {
    console.warn("[Templates Mongo Fetch Error]:", err.message);
  }

  const fallback = readFallbackTemplates();
  if (fallback !== null) {
    return fallback;
  }

  return [];
}

/**
 * Get a single template by ID
 */
export async function getTemplateById(id) {
  const all = await getTemplates();
  return all.find((t) => t.id === id) || null;
}

/**
 * Create a new template and save to MongoDB
 */
export async function createTemplate(templateData) {
  const newTemplate = {
    id: templateData.id || `tpl-${Date.now()}`,
    title: templateData.title || "Untitled Template",
    category: templateData.category || "Custom",
    productTypes: Array.isArray(templateData.productTypes) && templateData.productTypes.length > 0
      ? templateData.productTypes
      : templateData.productType
      ? [templateData.productType]
      : ["all"],
    thumbnail: templateData.thumbnail || "/images/product/product-01.jpg",
    layers: templateData.layers || [
      { id: `t1-${Date.now()}`, type: "text", text: (templateData.title || "CUSTOM TEXT").toUpperCase(), fontSize: 24, fontFamily: "Inter", color: "#111827", x: 50, y: 40 },
    ],
    tags: templateData.tags || [],
    isFeatured: Boolean(templateData.isFeatured),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const mongoClient = await clientPromise;
    if (mongoClient) {
      const db = mongoClient.db("shopify_customizer");
      const insertFields = { ...newTemplate };
      delete insertFields._id;

      await db.collection("templates").updateOne(
        { id: newTemplate.id },
        { $set: insertFields },
        { upsert: true }
      );
      console.log(`[Templates Mongo DB] Created template '${newTemplate.id}' in MongoDB!`);
    }
  } catch (err) {
    console.error("[Templates Mongo Create Error]:", err.message);
  }

  const currentList = (await getTemplates()).filter((t) => t.id !== newTemplate.id);
  const updatedList = [newTemplate, ...currentList];
  writeFallbackTemplates(updatedList);

  return newTemplate;
}

/**
 * Update an existing template by ID in MongoDB
 */
export async function updateTemplate(id, updateData) {
  const currentList = await getTemplates();
  const existing = currentList.find((t) => t.id === id);

  if (!existing) {
    throw new Error(`Template with ID '${id}' not found.`);
  }

  const cleanUpdate = { ...updateData };
  delete cleanUpdate._id;
  delete cleanUpdate.id;

  const updatedTemplate = {
    ...existing,
    ...cleanUpdate,
    id,
    productTypes: Array.isArray(updateData.productTypes) && updateData.productTypes.length > 0
      ? updateData.productTypes
      : updateData.productType
      ? [updateData.productType]
      : existing.productTypes || ["all"],
    updatedAt: new Date().toISOString(),
  };
  delete updatedTemplate._id;

  try {
    const mongoClient = await clientPromise;
    if (mongoClient) {
      const db = mongoClient.db("shopify_customizer");
      const updateFields = { ...updatedTemplate };
      delete updateFields._id;

      await db.collection("templates").updateOne(
        { id },
        { $set: updateFields },
        { upsert: true }
      );
      console.log(`[Templates Mongo DB] Updated template '${id}' in MongoDB!`);
    }
  } catch (err) {
    console.error("[Templates Mongo Update Error]:", err.message);
    throw err;
  }

  const updatedList = currentList.map((t) => (t.id === id ? updatedTemplate : t));
  writeFallbackTemplates(updatedList);

  return updatedTemplate;
}

/**
 * Delete a template permanently by ID
 */
export async function deleteTemplate(id) {
  try {
    const mongoClient = await clientPromise;
    if (mongoClient) {
      const db = mongoClient.db("shopify_customizer");
      await db.collection("templates").deleteOne({ id });
    }
  } catch (err) {
    console.warn("[Templates Mongo Delete Error]:", err.message);
  }

  const currentList = await getTemplates();
  const updatedList = currentList.filter((t) => t.id !== id);
  writeFallbackTemplates(updatedList);

  return { success: true, deletedId: id };
}
