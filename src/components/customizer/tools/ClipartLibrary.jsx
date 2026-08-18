"use client";

import React, { useState } from "react";
import { CLIPARTS_DATA } from "@/data/customizerData";
import { FiSmile, FiSearch, FiCheck } from "react-icons/fi";

export default function ClipartLibrary({ onAddClipart, selectedLayer, onUpdateLayer }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [clipartColor, setClipartColor] = useState("#3B82F6");

  const categories = ["All", "Badges", "Ornaments", "Shapes", "Symbols", "Icons"];

  const filteredCliparts = CLIPARTS_DATA.filter((c) => {
    const matchesCategory = activeCategory === "All" || c.category === activeCategory;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAdd = (item) => {
    onAddClipart({
      ...item,
      svg: item.svg.replace(/fill='[^']+'/g, `fill='${clipartColor}'`),
    });
  };

  return (
    <div className="p-4 flex flex-col gap-3.5 h-full overflow-y-auto">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-2">
          <FiSmile className="w-4 h-4 text-brand-500" /> Vector Cliparts & Badges
        </h3>
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-semibold text-gray-500">Color:</label>
          <input
            type="color"
            value={clipartColor}
            onChange={(e) => setClipartColor(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer border border-gray-200"
            title="Clipart Fill Color"
          />
        </div>
      </div>

      {/* Selected Clipart Inspector */}
      {selectedLayer && selectedLayer.type === "clipart" && (
        <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl border border-brand-200 dark:border-brand-900 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-brand-700 dark:text-brand-300 block">
              Active Clipart: {selectedLayer.name || "Custom Icon"}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              Change fill color of selected clipart
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedLayer.color || clipartColor}
              onChange={(e) => onUpdateLayer(selectedLayer.id, { color: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200"
              title="Change Selected Clipart Color"
            />
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search cliparts or shapes..."
          className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-brand-500 focus:outline-none dark:text-white"
        />
      </div>

      {/* Categories Filter - Wrapped so all pills are visible */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === cat
                ? "bg-brand-500 text-white shadow-xs"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
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
            onClick={() => handleAdd(item)}
            className="group relative p-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-gray-700 transition-all shadow-xs"
          >
            <div
              className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform"
              dangerouslySetInnerHTML={{
                __html: item.svg.replace(/fill='[^']+'/g, `fill='${clipartColor}'`),
              }}
            />
            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 mt-1 truncate max-w-full text-center">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
