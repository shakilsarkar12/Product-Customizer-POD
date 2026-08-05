"use client";

import React, { useState, useEffect } from "react";
import { TEMPLATES_DATA } from "@/data/customizerData";
import { FiLayout, FiCheck, FiPlus, FiBookmark } from "react-icons/fi";

export default function TemplateGallery({ onLoadTemplate, onSaveAsTemplate }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userTemplates, setUserTemplates] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("customizer_user_templates");
      if (saved) {
        setUserTemplates(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const categories = ["All", "Streetwear", "Vintage", "Sports", "Wedding", "Business", "Holiday"];

  const allTemplates = [...userTemplates, ...TEMPLATES_DATA];

  const filteredTemplates =
    selectedCategory === "All"
      ? allTemplates
      : allTemplates.filter((t) => t.category === selectedCategory);

  return (
    <div className="p-4 flex flex-col gap-4 max-h-[600px] overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-2">
          <FiLayout className="w-4 h-4 text-brand-500" /> Template Gallery ({filteredTemplates.length})
        </h3>
        {onSaveAsTemplate && (
          <button
            onClick={onSaveAsTemplate}
            className="text-[11px] font-bold bg-brand-50 dark:bg-brand-950/50 hover:bg-brand-100 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
          >
            <FiBookmark className="w-3 h-3" /> Save Current
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? "bg-brand-500 text-white shadow-xs"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            onClick={() => onLoadTemplate(tpl)}
            className="group relative bg-gray-50 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-brand-500 dark:hover:border-brand-500 transition-all flex flex-col"
          >
            <div className="h-28 bg-gray-200 dark:bg-gray-700 relative overflow-hidden flex items-center justify-center p-2">
              <img
                src={tpl.thumbnail || "/images/product/product-01.jpg"}
                alt={tpl.title}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-brand-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                <FiCheck className="w-4 h-4" /> Apply Template
              </div>
            </div>
            <div className="p-2.5 flex flex-col">
              <span className="text-[10px] font-extrabold uppercase text-brand-600 dark:text-brand-400 tracking-wider">
                {tpl.category}
              </span>
              <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate mt-0.5">
                {tpl.title}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
