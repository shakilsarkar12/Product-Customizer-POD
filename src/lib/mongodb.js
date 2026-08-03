import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shopify_customizer";
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((err) => {
      console.warn("[MongoDB] Connection warning (using File-backed DB fallback):", err.message);
      return null;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch((err) => {
    console.warn("[MongoDB] Connection warning:", err.message);
    return null;
  });
}

// Local File Database Fallback Path
const FALLBACK_DB_PATH = path.join(process.cwd(), ".data", "shopify_credentials.json");

function ensureFallbackDirExists() {
  const dir = path.dirname(FALLBACK_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Save Shopify Credentials to MongoDB (and File Fallback)
 */
export async function saveCredentialsToDb(credentialsData) {
  let savedInMongo = false;
  const shopDomain = credentialsData.shopDomain || "default_store";

  try {
    const mongoClient = await clientPromise;
    if (mongoClient) {
      const db = mongoClient.db("shopify_customizer");
      await db.collection("credentials").updateOne(
        { shopDomain: shopDomain },
        { $set: { ...credentialsData, updatedAt: new Date() } },
        { upsert: true }
      );
      await db.collection("credentials").updateOne(
        { _id: "shopify_store_credentials" },
        { $set: { ...credentialsData, updatedAt: new Date() } },
        { upsert: true }
      );
      savedInMongo = true;
      console.log(`[MongoDB] Successfully saved Shopify credentials for ${shopDomain} to MongoDB!`);
    }
  } catch (err) {
    console.warn("[MongoDB] Save Error:", err.message);
  }

  // Always sync to persistent file storage as guarantee
  try {
    ensureFallbackDirExists();
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(credentialsData, null, 2), "utf8");
    console.log("[Local DB Fallback] Credentials persisted to disk.");
  } catch (fileErr) {
    console.error("[Local DB Fallback] Save Error:", fileErr.message);
  }

  return { savedInMongo, credentialsData };
}

/**
 * Get Shopify Credentials from MongoDB (or File Fallback)
 */
export async function getCredentialsFromDb() {
  try {
    const mongoClient = await clientPromise;
    if (mongoClient) {
      const db = mongoClient.db("shopify_customizer");
      const doc = await db.collection("credentials").findOne({ _id: "shopify_store_credentials" });
      if (doc) return doc;
    }
  } catch (err) {
    console.warn("[MongoDB] Fetch Error:", err.message);
  }

  // Fallback to local disk file
  try {
    if (fs.existsSync(FALLBACK_DB_PATH)) {
      const content = fs.readFileSync(FALLBACK_DB_PATH, "utf8");
      return JSON.parse(content);
    }
  } catch (fileErr) {
    console.error("[Local DB Fallback] Read Error:", fileErr.message);
  }

  return null;
}

export default clientPromise;
