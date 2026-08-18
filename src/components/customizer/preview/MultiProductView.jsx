"use client";

import React from "react";
import { FiBox, FiCheck } from "react-icons/fi";

export default function MultiProductView({
  product,
  selectedColor,
  onColorChange,
  activeViewId,
  onViewChange,
  onOpen3DModal,
}) {
  const views = product?.views || [];
  const colors = product?.colors || [];

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-full max-w-5xl mx-auto">
      {/* Product Views Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto justify-center md:justify-start">
        <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider shrink-0 hidden sm:inline">
          Views ({views.length}):
        </span>
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-900/80 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shrink-0">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeViewId === view.id
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-800"
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color Swatches Selector & 3D Preview Mode */}
      <div className="flex items-center gap-4 shrink-0">
        {colors.length > 0 && (
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/80 py-1 px-2.5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
              Color: <span className="font-bold text-gray-800 dark:text-white">{selectedColor?.name}</span>
            </span>
            <div className="flex items-center gap-1.5">
              {colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onColorChange(c)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                    selectedColor?.id === c.id
                      ? "ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 scale-110 shadow-sm border-white dark:border-gray-900"
                      : "border-gray-300 dark:border-gray-600 hover:scale-115 opacity-85 hover:opacity-100"
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onOpen3DModal}
          className="py-1.5 px-3 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 dark:hover:bg-brand-900/80 border border-brand-200 dark:border-brand-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
        >
          <FiBox className="w-3.5 h-3.5 text-brand-500" />
          <span>3D Preview</span>
        </button>
      </div>
    </div>
  );
}
