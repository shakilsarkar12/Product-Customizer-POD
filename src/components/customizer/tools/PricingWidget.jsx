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
  FiZap,
  FiShield,
  FiTruck,
  FiLayers,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiBox,
} from "react-icons/fi";

export default function PricingWidget({
  pricingData,
  selectedMaterial,
  onMaterialChange,
  materials = [],
  quantity = 1,
  onQuantityChange,
  selectedSize = "L",
  onSizeChange,
  onAddToCart,
  onDirectCheckout,
  onExportPrintFiles,
  onOpenTeamPersonalization,
  onShareDesign,
  onOpen3DPreview,
  checkingOut = false,
  addingToCart = false,
}) {
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(true);

  const availableSizes = ["S", "M", "L", "XL", "2XL", "3XL"];

  // Calculate items needed for next bulk discount tier
  const nextTierInfo = (() => {
    if (quantity < 5) return { needed: 5 - quantity, nextDiscount: 10, nextTier: 5 };
    if (quantity < 10) return { needed: 10 - quantity, nextDiscount: 20, nextTier: 10 };
    return null;
  })();

  return (
    <div className="h-full flex flex-col justify-between bg-white dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/90 dark:border-gray-700/80 rounded-3xl p-5 shadow-xl transition-all duration-300 overflow-y-auto custom-scrollbar">
      {/* Top Section */}
      <div className="flex flex-col gap-4">
        {/* 1. Header & Live Total Price Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-500/10 via-brand-600/5 to-transparent dark:from-brand-500/20 dark:via-gray-800 p-4 rounded-2xl border border-brand-500/20 dark:border-brand-500/30">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiZap className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                Live Total Price
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                ${pricingData.unitPrice.toFixed(2)} / item
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                ${pricingData.totalPrice.toFixed(2)}
              </span>
              {pricingData.discountPercent > 0 ? (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 mt-0.5">
                  <FiPercent className="w-2.5 h-2.5" /> {pricingData.discountPercent}% Bulk Discount
                </span>
              ) : (
                <span className="text-[10px] font-bold text-gray-400">Tax calculated at checkout</span>
              )}
            </div>
          </div>

          {/* Bulk Discount Progress Hint */}
          {nextTierInfo && (
            <div className="mt-3 pt-2.5 border-t border-brand-500/15 dark:border-gray-700/60 flex items-center justify-between text-[11px]">
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                Add <span className="font-extrabold text-brand-600 dark:text-brand-400">{nextTierInfo.needed} more</span> for <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{nextTierInfo.nextDiscount}% OFF</span>
              </span>
              <button
                onClick={() => onQuantityChange && onQuantityChange(nextTierInfo.nextTier)}
                className="text-[10px] font-extrabold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
              >
                Apply Tier
              </button>
            </div>
          )}
        </div>

        {/* 2. Size Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Select Garment Size
            </label>
            <span className="text-[11px] font-semibold text-gray-400">Regular Fit</span>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {availableSizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onSizeChange && onSizeChange(size)}
                  className={`py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-brand-500 text-white border-brand-600 shadow-md scale-105"
                      : "bg-gray-50 dark:bg-gray-700/80 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-brand-400"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Material & Fabric Selector */}
        {materials.length > 0 && (
          <div>
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block mb-1.5">
              Fabric & Material Choice
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {materials.map((mat) => {
                const isSelected = (selectedMaterial?.id || materials[0]?.id) === mat.id;
                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => onMaterialChange && onMaterialChange(mat.id)}
                    className={`w-full py-2 px-3 text-left rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brand-50/80 dark:bg-brand-950/40 border-brand-500 text-brand-900 dark:text-white font-bold ring-1 ring-brand-500 shadow-xs"
                        : "bg-gray-50 dark:bg-gray-700/60 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${isSelected ? "border-brand-500 bg-brand-500 text-white" : "border-gray-400"}`}>
                        {isSelected && <FiCheck className="w-2.5 h-2.5" />}
                      </div>
                      <span>{mat.name}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      {mat.priceAddon > 0 ? `+$${mat.priceAddon.toFixed(2)}` : "Standard (Included)"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Order Quantity Controls */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Order Quantity
            </label>
            <span className="text-[10px] text-brand-600 dark:text-brand-400 font-bold bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-900">
              Bulk Tiers: 5+ (10%) • 10+ (20%)
            </span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/60 p-1 rounded-2xl border border-gray-200 dark:border-gray-600">
            <button
              onClick={() => onQuantityChange && onQuantityChange(Math.max(1, quantity - 1))}
              className="w-9 h-9 rounded-xl bg-white dark:bg-gray-600 text-gray-800 dark:text-white font-extrabold text-base flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-500 shadow-xs transition-all cursor-pointer"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max="1000"
              value={quantity}
              onChange={(e) => onQuantityChange && onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 py-1.5 px-2 text-center text-sm font-black bg-transparent border-none text-gray-900 dark:text-white focus:outline-none"
            />
            <button
              onClick={() => onQuantityChange && onQuantityChange(quantity + 1)}
              className="w-9 h-9 rounded-xl bg-white dark:bg-gray-600 text-gray-800 dark:text-white font-extrabold text-base flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-500 shadow-xs transition-all cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* 5. Team Personalization Button */}
        {onOpenTeamPersonalization && (
          <button
            onClick={onOpenTeamPersonalization}
            className="w-full py-2.5 px-3 bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs rounded-2xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <FiUsers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Add Team Player Names & Numbers</span>
          </button>
        )}

        {/* 6. Itemized Cost Breakdown */}
        <div className="bg-gray-50/80 dark:bg-gray-900/60 p-3.5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 flex flex-col gap-1.5">
          <div
            onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
            className="flex items-center justify-between cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 select-none"
          >
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <FiLayers className="w-3.5 h-3.5 text-brand-500" />
              Itemized Cost Breakdown
            </span>
            {showDetailedBreakdown ? <FiChevronUp className="w-3.5 h-3.5" /> : <FiChevronDown className="w-3.5 h-3.5" />}
          </div>

          {showDetailedBreakdown && (
            <div className="flex flex-col gap-1.5 pt-1.5 border-t border-gray-200/60 dark:border-gray-700/60 animate-in fade-in">
              {pricingData.breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-200">
                    ${item.amount.toFixed(2)}
                  </span>
                </div>
              ))}

              {pricingData.discountAmount > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold border-t border-gray-200/60 dark:border-gray-700/60 pt-1 mt-0.5">
                  <span>Volume Savings ({quantity} items)</span>
                  <span>-${pricingData.discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: High-Converting CTAs & Trust Badges */}
      <div className="flex flex-col gap-2.5 pt-4 mt-4 border-t border-gray-200/80 dark:border-gray-700/80">
        {/* Primary Checkout CTA: 1-Click Buy Now with Custom Price */}
        <button
          type="button"
          onClick={onDirectCheckout}
          disabled={checkingOut || addingToCart}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-500 via-brand-600 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 active:scale-98 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-brand-500/25 transition-all cursor-pointer disabled:opacity-50"
        >
          {checkingOut ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating Shopify Checkout...</span>
            </>
          ) : (
            <>
              <FiZap className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Buy Now with Custom Price (${pricingData.totalPrice.toFixed(2)})</span>
            </>
          )}
        </button>

        {/* Secondary Cart CTA: Add to Shopify Cart */}
        <button
          type="button"
          onClick={onAddToCart}
          disabled={checkingOut || addingToCart}
          className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-600 transition-all cursor-pointer disabled:opacity-50"
        >
          {addingToCart ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <span>Adding to Cart...</span>
            </>
          ) : (
            <>
              <FiShoppingBag className="w-3.5 h-3.5 text-brand-500" />
              <span>Add to Shopify Cart</span>
            </>
          )}
        </button>

        {/* Action Tools Grid: 3D View, Export 300DPI, Share */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {onOpen3DPreview && (
            <button
              onClick={onOpen3DPreview}
              className="py-2 px-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
              title="Interactive 3D Preview"
            >
              <FiBox className="w-3.5 h-3.5 text-purple-500" /> 3D View
            </button>
          )}

          <button
            onClick={onExportPrintFiles}
            className="py-2 px-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
            title="Download 300 DPI Production Specs"
          >
            <FiDownload className="w-3.5 h-3.5 text-brand-500" /> 300 DPI
          </button>

          {onShareDesign && (
            <button
              onClick={onShareDesign}
              className="py-2 px-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
              title="Share Design Link"
            >
              <FiShare2 className="w-3.5 h-3.5 text-emerald-500" /> Share
            </button>
          )}
        </div>

        {/* E-Commerce Trust Badges */}
        <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
          <span className="flex items-center gap-1">
            <FiTruck className="w-3 h-3 text-emerald-500" /> Fast Shipping
          </span>
          <span className="flex items-center gap-1">
            <FiShield className="w-3 h-3 text-brand-500" /> 100% Quality Guaranteed
          </span>
          <span className="flex items-center gap-1">
            <FiCheckCircle className="w-3 h-3 text-purple-500" /> Print-Ready
          </span>
        </div>
      </div>
    </div>
  );
}
