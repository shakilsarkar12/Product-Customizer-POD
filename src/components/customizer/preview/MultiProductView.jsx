"use client";

import React from "react";
import { FiCheck, FiBox } from "react-icons/fi";

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
    <div className="flex flex-col gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Product Views Selector Tabs */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Print Views ({views.length})
        </span>
        <button
          onClick={onOpen3DModal}
          className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
        >
          <FiBox className="w-3.5 h-3.5" /> 3D Preview Mode
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeViewId === view.id
                ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                : "bg-gray-50 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Color Swatches Selector */}
      {colors.length > 0 && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Base Color: <span className="font-bold text-brand-600 dark:text-brand-400">{selectedColor?.name}</span>
          </span>
          <div className="flex items-center gap-2">
            {colors.map((c) => (
              <button
                key={c.id}
                onClick={() => onColorChange(c)}
                style={{ backgroundColor: c.hex }}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  selectedColor?.id === c.id
                    ? "border-brand-500 scale-125 shadow-md"
                    : "border-gray-300 dark:border-gray-600 hover:scale-110"
                }`}
                title={c.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
