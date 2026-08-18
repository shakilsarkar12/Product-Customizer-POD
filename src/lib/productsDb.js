import clientPromise from "./mongodb";
import fs from "fs";
import path from "path";
import { PRODUCTS_DATA } from "@/data/customizerData";

const FALLBACK_PRODUCTS_PATH = path.join(process.cwd(), ".data", "products.json");

function ensureFallbackDirExists() {
  const dir = path.dirname(FALLBACK_PRODUCTS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readFallbackProducts() {
  try {
    ensureFallbackDirExists();
    if (fs.existsSync(FALLBACK_PRODUCTS_PATH)) {
      const content = fs.readFileSync(FALLBACK_PRODUCTS_PATH, "utf8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[Products DB Fallback Read Error]:", err.message);
  }
  return null;
}

function writeFallbackProducts(products) {
  try {
    ensureFallbackDirExists();
    fs.writeFileSync(FALLBACK_PRODUCTS_PATH, JSON.stringify(products, null, 2), "utf8");
  } catch (err) {
    console.error("[Products DB Fallback Write Error]:", err.message);
  }
}

/**
 * Get all configured products from MongoDB or Fallback file
 */
export async function getProducts() {
  try {
    const mongoClient = await clientPromise;
    if (mongoClient) {
      const db = mongoClient.db("shopify_customizer");
      const count = await db.collection("products").countDocuments();
      if (count > 0 || fs.existsSync(FALLBACK_PRODUCTS_PATH)) {
        const products = await db.collection("products").find({}).sort({ updatedAt: -1 }).toArray();
        return products.map((p) => ({ ...p, _id: undefined }));
      }
    }
  } catch (err) {
    console.warn("[Products Mongo Fetch Error]:", err.message);
  }

  const fallback = readFallbackProducts();
  if (fallback !== null) {
    return fallback;
  }

  // Initial seed with PRODUCTS_DATA only on first startup
  const initialProducts = JSON.parse(JSON.stringify(PRODUCTS_DATA));
  writeFallbackProducts(initialProducts);

  try {
    const mongoClient = await clientPromise;
    if (mongoClient) {
      const db = mongoClient.db("shopify_customizer");
      await db.collection("products").insertMany(initialProducts);
    }
  } catch (e) {
    // Ignore seed error
  }

  return initialProducts;
}

/**
 * Get product by ID
 */
export async function getProductById(id) {
  const all = await getProducts();
  return all.find((p) => p.id === id) || null;
}

/**
 * Create a new product configuration
 */
export async function createProduct(productData) {
  const newProduct = {
    id: productData.id || `prod-${Date.now()}`,
    name: productData.name || "New Custom Product",
    category: productData.category || "Apparel",
    basePrice: Number(productData.basePrice) || 25.0,
    colors: Array.isArray(productData.colors) && productData.colors.length > 0
      ? productData.colors
      : [
          { id: "white", name: "White", hex: "#FFFFFF", image: productData.frontImage || "/images/product/product-01.jpg", backImage: productData.backImage || "/images/product/product-01.jpg" },
        ],
    materials: Array.isArray(productData.materials) && productData.materials.length > 0
      ? productData.materials
      : [{ id: "standard", name: "Standard Quality", priceAddon: 0 }],
    sizes: Array.isArray(productData.sizes) && productData.sizes.length > 0
      ? productData.sizes
      : ["S", "M", "L", "XL", "2XL"],
    views: Array.isArray(productData.views) && productData.views.length > 0
      ? productData.views
      : [
          {
            id: "front",
            label: "Front View",
            image: productData.frontImage || "/images/product/product-01.jpg",
            printArea: productData.frontPrintArea || { x: 25, y: 22, width: 50, height: 60 },
          },
          {
            id: "back",
            label: "Back View",
            image: productData.backImage || "/images/product/product-02.jpg",
            printArea: productData.backPrintArea || { x: 25, y: 20, width: 50, height: 65 },
          },
        ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const mongoClient = await clientPromise;
    if (mongoClient) {
      const db = mongoClient.db("shopify_customizer");
      await db.collection("products").updateOne(
        { id: newProduct.id },
        { $set: newProduct },
        { upsert: true }
      );
    }
  } catch (err) {
    console.warn("[Products Mongo Create Error]:", err.message);
  }

  const currentList = (await getProducts()).filter((p) => p.id !== newProduct.id);
  const updatedList = [newProduct, ...currentList];
  writeFallbackProducts(updatedList);

  return newProduct;
}

/**
 * Update an existing product configuration
 */
export async function updateProduct(id, updateData) {
  const currentList = await getProducts();
  const existing = currentList.find((p) => p.id === id);

  if (!existing) {
    throw new Error(`Product with ID '${id}' not found.`);
  }

  const updatedProduct = {
    ...existing,
    ...updateData,
    id,
    updatedAt: new Date().toISOString(),
  };

  try {
    const mongoClient = await clientPromise;
    if (mongoClient) {
      const db = mongoClient.db("shopify_customizer");
      await db.collection("products").updateOne(
        { id },
        { $set: updatedProduct }
      );
    }
  } catch (err) {
    console.warn("[Products Mongo Update Error]:", err.message);
  }

  const updatedList = currentList.map((p) => (p.id === id ? updatedProduct : p));
  writeFallbackProducts(updatedList);

  return updatedProduct;
}

/**
 * Delete a product configuration
 */
export async function deleteProduct(id) {
  try {
    const mongoClient = await clientPromise;
    if (mongoClient) {
      const db = mongoClient.db("shopify_customizer");
      await db.collection("products").deleteOne({ id });
    }
  } catch (err) {
    console.warn("[Products Mongo Delete Error]:", err.message);
  }

  const currentList = await getProducts();
  const updatedList = currentList.filter((p) => p.id !== id);
  writeFallbackProducts(updatedList);

  return { success: true, deletedId: id };
}
