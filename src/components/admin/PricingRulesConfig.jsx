"use client";

import React, { useState } from "react";
import { FiDollarSign, FiSave, FiSliders, FiCheckCircle } from "react-icons/fi";

export default function PricingRulesConfig() {
  const [baseFrontPrintFee, setBaseFrontPrintFee] = useState(5.0);
  const [extraColorFee, setExtraColorFee] = useState(2.0);
  const [extraLayerFee, setExtraLayerFee] = useState(1.0);
  const [organicMaterialAddon, setOrganicMaterialAddon] = useState(8.0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveRules = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FiSliders className="w-5 h-5 text-brand-500" /> Dynamic Pricing Engine Rules Configuration
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Set global pricing surcharges for print areas, extra colors, materials, and design complexity.
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold flex items-center gap-1">
            <FiCheckCircle className="w-4 h-4 text-emerald-500" /> Saved Successfully!
          </span>
        )}
      </div>

      {/* Inputs Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-200 block mb-1">
            Front/Back Primary Print Location Fee ($)
          </label>
          <input
            type="number"
            value={baseFrontPrintFee}
            onChange={(e) => setBaseFrontPrintFee(parseFloat(e.target.value))}
            className="w-full py-2 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white font-mono"
          />
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-200 block mb-1">
            Extra Color Addition Fee ($ per color)
          </label>
          <input
            type="number"
            value={extraColorFee}
            onChange={(e) => setExtraColorFee(parseFloat(e.target.value))}
            className="w-full py-2 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white font-mono"
          />
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-200 block mb-1">
            Design Layer Surcharge ($ per layer &gt; 2)
          </label>
          <input
            type="number"
            value={extraLayerFee}
            onChange={(e) => setExtraLayerFee(parseFloat(e.target.value))}
            className="w-full py-2 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white font-mono"
          />
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-200 block mb-1">
            Premium Organic Cotton Material Addon ($)
          </label>
          <input
            type="number"
            value={organicMaterialAddon}
            onChange={(e) => setOrganicMaterialAddon(parseFloat(e.target.value))}
            className="w-full py-2 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white font-mono"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSaveRules}
          className="py-2.5 px-6 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <FiSave className="w-4 h-4" /> Update Pricing Rules
        </button>
      </div>
    </div>
  );
}
