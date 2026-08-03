import React from "react";
import ShopifyIntegrationPanel from "@/components/admin/ShopifyIntegrationPanel";

export const metadata = {
  title: "Shopify Integration Settings | App Embed & GraphQL Proxy",
  description: "Configure Shopify theme app embeds, App Proxy routes, and Cart Line-Item Properties payload generator.",
};

export default function ShopifyIntegrationPage() {
  return (
    <div className="p-4 md:p-6 max-w-[1700px] mx-auto">
      <ShopifyIntegrationPanel />
    </div>
  );
}
