"use client";

import React, { useState } from "react";
import {
  FiDollarSign,
  FiTag,
  FiShoppingBag,
  FiDownload,
  FiUsers,
  FiShare2,
  FiPercent,
  FiCheckCircle,
} from "react-icons/fi";

export default function PricingWidget({
  pricingData,
  selectedMaterial,
  onMaterialChange,
  materials = [],
  quantity = 1,
  onQuantityChange,
  onAddToCart,
  onExportPrintFiles,
  onOpenTeamPersonalization,
  onShareDesign,
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-5 shadow-lg flex flex-col gap-4">
      {/* Header & Total Price */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <FiTag className="w-3.5 h-3.5 text-brand-500" /> Total Price
          </span>
          {pricingData.discountPercent > 0 && (
            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 mt-0.5">
              <FiPercent className="w-3 h-3" /> {pricingData.discountPercent}% Bulk Tier Discount Applied!
            </span>
          )}
        </div>

        <div className="flex flex-col items-end">
          <span className="text-2xl font-black text-brand-600 dark:text-brand-400 tracking-tight">
            ${pricingData.totalPrice.toFixed(2)}
          </span>
          <span className="text-[10px] font-semibold text-gray-400">
            (${pricingData.unitPrice.toFixed(2)} / item)
          </span>
        </div>
      </div>

      {/* Material Selector */}
      {materials.length > 0 && (
        <div>
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
            Material Upgrade
          </label>
          <select
            value={selectedMaterial?.id || ""}
            onChange={(e) => onMaterialChange(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-medium dark:text-white focus:outline-none focus:border-brand-500"
          >
            {materials.map((mat) => (
              <option key={mat.id} value={mat.id}>
                {mat.name} {mat.priceAddon > 0 ? `(+$${mat.priceAddon.toFixed(2)})` : "(Included)"}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quantity & Volume Discount Tiers */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
            Order Quantity
          </label>
          <span className="text-[10px] text-brand-600 dark:text-brand-400 font-bold">
            5+ = 10% OFF | 10+ = 20% OFF
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onQuantityChange && onQuantityChange(Math.max(1, quantity - 1))}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm flex items-center justify-center hover:bg-gray-200"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            max="500"
            value={quantity}
            onChange={(e) => onQuantityChange && onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="flex-1 py-1.5 px-3 text-center text-xs font-bold bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl dark:text-white"
          />
          <button
            onClick={() => onQuantityChange && onQuantityChange(quantity + 1)}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm flex items-center justify-center hover:bg-gray-200"
          >
            +
          </button>
        </div>
      </div>

      {/* Team Personalization Roster Button */}
      {onOpenTeamPersonalization && (
        <button
          onClick={onOpenTeamPersonalization}
          className="py-2 px-3 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 text-brand-700 dark:text-brand-300 font-bold text-xs rounded-xl border border-brand-200 dark:border-brand-900/60 flex items-center justify-center gap-1.5 transition-colors"
        >
          <FiUsers className="w-3.5 h-3.5" /> Team Names & Roster Personalization
        </button>
      )}

      {/* Itemized Price Breakdown */}
      <div className="flex flex-col gap-1.5 bg-gray-50 dark:bg-gray-900/60 p-3 rounded-2xl border border-gray-200/60 dark:border-gray-700/60">
        <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-0.5">
          Cost Calculation Breakdown
        </span>
        {pricingData.breakdown.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              ${item.amount.toFixed(2)}
            </span>
          </div>
        ))}
        {pricingData.discountAmount > 0 && (
          <div className="flex items-center justify-between text-xs text-emerald-500 font-bold border-t border-gray-200 dark:border-gray-700 pt-1 mt-0.5">
            <span>Volume Discount</span>
            <span>-${pricingData.discountAmount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          onClick={onAddToCart}
          className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <FiShoppingBag className="w-4 h-4" /> Add Customized Item to Cart
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExportPrintFiles}
            className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <FiDownload className="w-3.5 h-3.5 text-brand-500" /> Export 300DPI
          </button>

          {onShareDesign && (
            <button
              onClick={onShareDesign}
              className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <FiShare2 className="w-3.5 h-3.5 text-brand-500" /> Share Design
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
