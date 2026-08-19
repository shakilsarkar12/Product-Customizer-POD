"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiLayout, FiSliders } from "react-icons/fi";

export default function TemplateSubNavTabs({ templateCount = null }) {
  const pathname = usePathname();

  const isDesignActive = pathname === "/templates/design" || pathname === "/templates";
  const isProductsActive = pathname === "/templates/products";

  return (
    <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full sm:w-auto self-start border border-gray-200/80 dark:border-gray-700/80 mb-6">
      <Link
        href="/templates/design"
        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
          isDesignActive
            ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        }`}
      >
        <FiLayout className="w-4 h-4" />
        <span>🎨 Design Template Presets</span>
        {templateCount !== null && (
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 font-bold">
            {templateCount}
          </span>
        )}
      </Link>

      <Link
        href="/templates/products"
        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
          isProductsActive
            ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        }`}
      >
        <FiSliders className="w-4 h-4" />
        <span>📐 Products & Print Areas Configurator</span>
        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 font-bold">
          Front / Back
        </span>
      </Link>
    </div>
  );
}
