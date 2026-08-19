import React from "react";
import TemplateManager from "@/components/admin/TemplateManager";

export const metadata = {
  title: "Design Template Presets | Customizer Templates",
  description: "Manage pre-designed customer templates for Wedding, Birthday, Business, Eid, and Halloween.",
};

export default function TemplatesDesignPage() {
  return (
    <div className="p-4 md:p-6 max-w-[1700px] mx-auto">
      <TemplateManager />
    </div>
  );
}
