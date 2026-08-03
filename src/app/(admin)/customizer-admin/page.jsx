import React from "react";
import CustomizerOrdersTable from "@/components/admin/CustomizerOrdersTable";
import TemplateManager from "@/components/admin/TemplateManager";
import PricingRulesConfig from "@/components/admin/PricingRulesConfig";
import ShopifyIntegrationPanel from "@/components/admin/ShopifyIntegrationPanel";

export const metadata = {
  title: "Merchant Customizer Admin | Manage Orders & Pricing Rules",
  description: "Manage custom orders, print files, template presets, pricing surcharges, and Shopify app embed status.",
};

export default function CustomizerAdminPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1700px] mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Merchant Customizer Admin Hub
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Control print file exports, order queues, dynamic pricing rules, and template preset galleries.
        </p>
      </div>

      <CustomizerOrdersTable />
      <PricingRulesConfig />
      <TemplateManager />
      <ShopifyIntegrationPanel />
    </div>
  );
}
