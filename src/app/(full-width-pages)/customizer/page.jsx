import React, { Suspense } from "react";
import CustomizerStudio from "@/components/customizer/CustomizerStudio";
import { getProducts } from "@/lib/productsDb";
import { getTemplates } from "@/lib/templatesDb";

export const metadata = {
  title: "Product Designer Studio | Shopify Dynamic Editor",
  description: "Fullscreen interactive design editor for customizing Shopify products dynamically.",
};

export const dynamic = "force-dynamic";

export default async function StandaloneCustomizerPage() {
  const initialProducts = await getProducts();
  const initialTemplates = await getTemplates();

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-900 flex flex-col select-none">
      <Suspense fallback={<div className="flex items-center justify-center h-full text-white font-bold text-sm">Loading Studio...</div>}>
        <CustomizerStudio initialProducts={initialProducts} initialTemplates={initialTemplates} />
      </Suspense>
    </div>
  );
}
