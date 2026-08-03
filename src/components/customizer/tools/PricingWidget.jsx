"use client";

import React from "react";
import { FiDollarSign, FiTag, FiShoppingBag, FiDownload } from "react-icons/fi";

export default function PricingWidget({
  pricingData,
  selectedMaterial,
  onMaterialChange,
  materials = [],
  onAddToCart,
  onExportPrintFiles,
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2.5">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <FiTag className="w-3.5 h-3.5 text-brand-500" /> Dynamic Pricing Breakdown
        </span>
        <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400">
          ${pricingData.totalPrice.toFixed(2)}
        </span>
      </div>

      {/* Material Selector */}
      {materials.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
            Material Upgrade
          </label>
          <select
            value={selectedMaterial?.id || ""}
            onChange={(e) => onMaterialChange(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-medium dark:text-white"
          >
            {materials.map((mat) => (
              <option key={mat.id} value={mat.id}>
                {mat.name} {mat.priceAddon > 0 ? `(+$${mat.priceAddon.toFixed(2)})` : "(Included)"}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Itemized Breakdown List */}
      <div className="flex flex-col gap-1.5 bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
        {pricingData.breakdown.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              ${item.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={onExportPrintFiles}
          className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <FiDownload className="w-4 h-4 text-brand-500" /> Export 300DPI
        </button>

        <button
          onClick={onAddToCart}
          className="py-2.5 px-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
        >
          <FiShoppingBag className="w-4 h-4" /> Add to Cart
        </button>
      </div>
    </div>
  );
}
