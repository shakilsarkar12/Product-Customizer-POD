"use client";

import React, { useState } from "react";
import { CLIPARTS_DATA } from "@/data/customizerData";
import { FiSmile, FiPlus } from "react-icons/fi";

export default function ClipartLibrary({ onAddClipart }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Badges", "Ornaments", "Shapes", "Symbols", "Icons"];

  const filteredCliparts = activeCategory === "All"
    ? CLIPARTS_DATA
    : CLIPARTS_DATA.filter((c) => c.category === activeCategory);

  return (
    <div className="p-4 flex flex-col gap-4 max-h-[600px] overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-2">
          <FiSmile className="w-4 h-4 text-brand-500" /> Vector Cliparts & Shapes
        </h3>
      </div>

      {/* Categories Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? "bg-brand-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cliparts Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {filteredCliparts.map((item) => (
          <div
            key={item.id}
            onClick={() => onAddClipart(item)}
            className="group relative p-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-gray-700 transition-all"
          >
            <div
              className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform"
              dangerouslySetInnerHTML={{ __html: item.svg }}
            />
            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 mt-1 truncate max-w-full text-center">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
