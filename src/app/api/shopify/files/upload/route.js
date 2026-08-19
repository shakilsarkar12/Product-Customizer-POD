import { NextResponse } from "next/server";
import { getCredentialsFromDb } from "@/lib/mongodb";
import { getValidAdminAccessToken } from "@/lib/shopifyTokenService";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Direct File Upload to Shopify Content Files via GraphQL Staged Uploads API
 */
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ success: false, error: "No file provided for upload." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const creds = (await getCredentialsFromDb()) || {};
    const shop = (creds.shopDomain || process.env.SHOPIFY_STORE_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
    const accessToken = await getValidAdminAccessToken();

    // 1. Save a local fallback copy in public/uploads
    let localUrl = null;
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = path.join(uploadDir, safeFilename);
      await writeFile(filePath, buffer);
      localUrl = `/uploads/${safeFilename}`;
    } catch (fsErr) {
      console.warn("[Local Upload Backup Warning]:", fsErr.message);
    }

    let shopifyUrl = null;
    let shopifyFileId = null;

    // 2. Upload directly to Shopify Content Files if connected
    if (shop && accessToken) {
      try {
        // Step A: Request staged upload target
        const stagedQuery = `
          mutation generateStagedUploadTarget($input: [StagedUploadInput!]!) {
            stagedUploadsCreate(input: $input) {
              stagedTargets {
                url
                resourceUrl
                parameters {
                  name
                  value
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `;

        const stagedRes = await fetch(`https://${shop}/admin/api/2024-01/graphql.json`, {
          method: "POST",
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: stagedQuery,
            variables: {
              input: [
                {
                  filename: file.name,
                  mimeType: file.type || "image/png",
                  httpMethod: "POST",
                  resource: "IMAGE",
                },
              ],
            },
          }),
        });

        if (stagedRes.ok) {
          const stagedData = await stagedRes.json();
          const target = stagedData.data?.stagedUploadsCreate?.stagedTargets?.[0];

          if (target) {
            // Step B: Upload file binary to Shopify Google Cloud Storage
            const s3FormData = new FormData();
            for (const param of target.parameters) {
              s3FormData.append(param.name, param.value);
            }
            const blob = new Blob([buffer], { type: file.type || "image/png" });
            s3FormData.append("file", blob, file.name);

            const storageRes = await fetch(target.url, {
              method: "POST",
              body: s3FormData,
            });

            if (storageRes.ok || storageRes.status === 201) {
              // Step C: Register image in Shopify Content Files
              const fileCreateQuery = `
                mutation fileCreate($files: [FileCreateInput!]!) {
                  fileCreate(files: $files) {
                    files {
                      id
                      fileStatus
                      alt
                      createdAt
                      ... on MediaImage {
                        image {
                          url
                        }
                      }
                    }
                    userErrors {
                      field
                      message
                    }
                  }
                }
              `;

              const createRes = await fetch(`https://${shop}/admin/api/2024-01/graphql.json`, {
                method: "POST",
                headers: {
                  "X-Shopify-Access-Token": accessToken,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  query: fileCreateQuery,
                  variables: {
                    files: [
                      {
                        originalSource: target.resourceUrl,
                        alt: file.name,
                        contentType: "IMAGE",
                      },
                    ],
                  },
                }),
              });

              if (createRes.ok) {
                const createData = await createRes.json();
                const createdFile = createData.data?.fileCreate?.files?.[0];
                if (createdFile) {
                  shopifyFileId = createdFile.id;
                  shopifyUrl = createdFile.image?.url || target.resourceUrl;
                  console.log(`[Shopify Upload Engine] Image ${file.name} successfully uploaded to Shopify Content Files!`);
                }
              }
            }
          }
        }
      } catch (shopifyErr) {
        console.warn("[Shopify Staged Upload Error]:", shopifyErr.message);
      }
    }

    const finalUrl = shopifyUrl || localUrl || "";

    return NextResponse.json({
      success: true,
      url: finalUrl,
      shopifyUrl,
      localUrl,
      fileId: shopifyFileId,
      filename: file.name,
      size: buffer.length,
    });
  } catch (err) {
    console.error("[Upload API Error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
