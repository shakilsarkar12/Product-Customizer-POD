"use client";

import React, { useState, useEffect } from "react";
import { TEMPLATES_DATA, PRODUCTS_DATA } from "@/data/customizerData";
import { FiLayout, FiCheck, FiBookmark, FiTag, FiFilter } from "react-icons/fi";

export default function TemplateGallery({
  onLoadTemplate,
  onSaveAsTemplate,
  selectedProductId = "t-shirt",
  selectedProductName = "Current Product",
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [productFilterMode, setProductFilterMode] = useState("current"); // "current" | "all"
  const [apiTemplates, setApiTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Streetwear", "Vintage", "Sports", "Wedding", "Birthday", "Business", "Holiday", "Eid", "Custom"];

  useEffect(() => {
    let isMounted = true;
    const fetchApiTemplates = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/templates", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.templates) {
            setApiTemplates(data.templates);
          }
        }
      } catch (err) {
        console.error("[TemplateGallery API Fetch Error]:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchApiTemplates();
    return () => {
      isMounted = false;
    };
  }, []);

  // 100% Dynamic templates from API
  const allTemplates = apiTemplates;

  // Filter templates: 1. By Product Assignment, 2. By Category
  const filteredTemplates = allTemplates.filter((t) => {
    const productTypes = t.productTypes || (t.productType ? [t.productType] : ["all"]);
    const isUniversal = productTypes.includes("all");

    // Product Filter
    if (productFilterMode === "current") {
      const matchesCurrentProduct = isUniversal || productTypes.includes(selectedProductId);
      if (!matchesCurrentProduct) return false;
    }

    // Category Filter
    if (selectedCategory !== "All" && t.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  return (
    <div className="p-4 flex flex-col gap-3.5 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
        <div>
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-2">
            <FiLayout className="w-4 h-4 text-brand-500" /> Template Gallery ({filteredTemplates.length})
          </h3>
          <span className="text-[11px] text-gray-400">
            Click any template to apply design onto canvas
          </span>
        </div>

        {onSaveAsTemplate && (
          <button
            onClick={onSaveAsTemplate}
            className="text-[11px] font-bold bg-brand-50 dark:bg-brand-950/50 hover:bg-brand-100 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <FiBookmark className="w-3 h-3" /> Save Current
          </button>
        )}
      </div>

      {/* Product Scope Filter Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        <button
          onClick={() => setProductFilterMode("current")}
          className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all truncate text-center cursor-pointer ${
            productFilterMode === "current"
              ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-2xs"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          }`}
          title={`Show templates designed for ${selectedProductName}`}
        >
          For {selectedProductName}
        </button>
        <button
          onClick={() => setProductFilterMode("all")}
          className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
            productFilterMode === "all"
              ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-2xs"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          All Templates ({allTemplates.length})
        </button>
      </div>

      {/* Category Pills - Wrapped so all are visible */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? "bg-brand-500 text-white shadow-xs"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template Cards Grid */}
      {loading && apiTemplates.length === 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-200 dark:border-gray-700">
          <FiLayout className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
            No templates found for this filter.
          </p>
          <button
            onClick={() => {
              setProductFilterMode("all");
              setSelectedCategory("All");
            }}
            className="mt-2 text-xs font-bold text-brand-600 hover:underline"
          >
            View all templates &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredTemplates.map((tpl) => {
            const productTypes = tpl.productTypes || (tpl.productType ? [tpl.productType] : ["all"]);
            const isUniversal = productTypes.includes("all");

            return (
              <div
                key={tpl.id}
                onClick={() => onLoadTemplate(tpl)}
                className="group relative bg-gray-50 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-brand-500 dark:hover:border-brand-500 transition-all flex flex-col justify-between"
              >
                <div className="h-28 bg-gray-100 dark:bg-gray-900/60 relative overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={tpl.thumbnail || "/images/product/product-01.jpg"}
                    alt={tpl.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => (e.target.src = "/images/product/product-01.jpg")}
                  />
                  <div className="absolute inset-0 bg-brand-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 backdrop-blur-2xs">
                    <FiCheck className="w-4 h-4" /> Apply Template
                  </div>
                </div>

                <div className="p-2.5 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-extrabold uppercase text-brand-600 dark:text-brand-400 tracking-wider truncate">
                      {tpl.category}
                    </span>
                    {isUniversal ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Universal
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase">
                        {productTypes[0]}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {tpl.title}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
