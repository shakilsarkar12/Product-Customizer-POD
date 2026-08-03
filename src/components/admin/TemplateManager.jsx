"use client";

import React, { useState } from "react";
import { TEMPLATES_DATA } from "@/data/customizerData";
import { FiLayout, FiPlus, FiTrash2, FiEdit, FiCheck } from "react-icons/fi";

export default function TemplateManager() {
  const [templates, setTemplates] = useState(TEMPLATES_DATA);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Wedding");

  const handleAddTemplate = () => {
    if (!newTitle.trim()) return;
    const newTpl = {
      id: `tpl-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      productType: "t-shirt",
      thumbnail: "/images/product/product-01.jpg",
      layers: [
        { id: "t1", type: "text", text: newTitle.toUpperCase(), fontSize: 24, fontFamily: "Inter", color: "#111827", x: 50, y: 40 },
      ],
    };
    setTemplates([newTpl, ...templates]);
    setNewTitle("");
  };

  const handleDelete = (id) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FiLayout className="w-5 h-5 text-brand-500" /> Template Presets Library
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage merchant pre-designed templates for customer quick customization.
          </p>
        </div>
      </div>

      {/* Add New Template Form */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center gap-3">
        <input
          type="text"
          placeholder="New Template Title (e.g. Eid Mubarak Special Edition)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 py-2 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-brand-500 dark:text-white"
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="py-2 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
        >
          <option value="Wedding">Wedding</option>
          <option value="Birthday">Birthday</option>
          <option value="Business">Business</option>
          <option value="Eid">Eid</option>
          <option value="Halloween">Halloween</option>
          <option value="Sports">Sports</option>
        </select>
        <button
          onClick={handleAddTemplate}
          className="w-full md:w-auto py-2 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <FiPlus className="w-4 h-4" /> Create Template
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-brand-600 dark:text-brand-400 tracking-wider">
                  {tpl.category}
                </span>
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{tpl.title}</h4>
              </div>
              <button
                onClick={() => handleDelete(tpl.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                title="Delete Template"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-500">
              <span>{tpl.layers.length} Layers</span>
              <span className="font-mono text-gray-400">{tpl.productType}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
