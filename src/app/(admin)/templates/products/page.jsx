import React from "react";
import ProductPrintAreaConfigurator from "@/components/admin/ProductPrintAreaConfigurator";
import TemplateSubNavTabs from "@/components/admin/TemplateSubNavTabs";

export const metadata = {
  title: "Products & Print Areas Configurator | Customizer Templates",
  description: "Configure product mockups and printable boundary coordinates for your store products.",
};

export default function TemplatesProductsConfigPage() {
  return (
    <div className="p-4 md:p-6 max-w-[1700px] mx-auto flex flex-col">
      <TemplateSubNavTabs />
      <ProductPrintAreaConfigurator />
    </div>
  );
}
