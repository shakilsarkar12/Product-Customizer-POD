"use client";

import React from "react";
import { FONTS_LIST } from "@/data/customizerData";
import { FiType, FiAperture, FiSliders, FiEdit3 } from "react-icons/fi";

export default function TextControls({
  selectedLayer,
  onAddText,
  onUpdateLayer,
}) {
  if (!selectedLayer || selectedLayer.type !== "text") {
    return (
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-2">
            <FiType className="w-4 h-4 text-brand-500" /> Add Custom Text
          </h3>
        </div>

        <button
          onClick={() => onAddText("YOUR CUSTOM TEXT")}
          className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-medium rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
        >
          <FiType className="w-4 h-4" /> Add Text Layer
        </button>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
            Quick Text Presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["VINTAGE 1990", "CUSTOM BRAND", "LIMITED EDITION", "YOUR NAME HERE"].map((preset, idx) => (
              <button
                key={idx}
                onClick={() => onAddText(preset)}
                className="py-2 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-lg text-left transition-colors truncate"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4 max-h-[600px] overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-2">
          <FiEdit3 className="w-4 h-4 text-brand-500" /> Typography Inspector
        </h3>
        <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold uppercase">Text Selected</span>
      </div>

      {/* Text Input */}
      <div>
        <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
          Layer Content
        </label>
        <input
          type="text"
          value={selectedLayer.text || ""}
          onChange={(e) => onUpdateLayer(selectedLayer.id, { text: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-brand-500 focus:outline-none dark:text-white"
        />
      </div>

      {/* Font Family Picker */}
      <div>
        <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
          Font Family
        </label>
        <select
          value={selectedLayer.fontFamily || "Inter, sans-serif"}
          onChange={(e) => onUpdateLayer(selectedLayer.id, { fontFamily: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-brand-500 focus:outline-none dark:text-white"
        >
          {FONTS_LIST.map((font) => (
            <option key={font.name} value={font.family}>
              {font.name} ({font.category})
            </option>
          ))}
        </select>
      </div>

      {/* Text Color Picker */}
      <div>
        <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
          Fill Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={selectedLayer.color || "#111827"}
            onChange={(e) => onUpdateLayer(selectedLayer.id, { color: e.target.value })}
            className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
          />
          <span className="text-xs font-mono text-gray-600 dark:text-gray-300 uppercase">
            {selectedLayer.color || "#111827"}
          </span>
        </div>
      </div>

      {/* Font Size & Letter Spacing */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
            <span>Font Size</span>
            <span className="font-semibold">{selectedLayer.fontSize || 24}px</span>
          </div>
          <input
            type="range"
            min="12"
            max="72"
            value={selectedLayer.fontSize || 24}
            onChange={(e) => onUpdateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value) })}
            className="w-full accent-brand-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
            <span>Letter Spacing</span>
            <span className="font-semibold">{selectedLayer.letterSpacing || 0}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            value={selectedLayer.letterSpacing || 0}
            onChange={(e) => onUpdateLayer(selectedLayer.id, { letterSpacing: parseInt(e.target.value) })}
            className="w-full accent-brand-500"
          />
        </div>
      </div>

      {/* Text Stroke / Outline */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200/70 dark:border-gray-700/70 flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-200 block">
          Outline & Stroke
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={selectedLayer.strokeColor || "#000000"}
            onChange={(e) => onUpdateLayer(selectedLayer.id, { strokeColor: e.target.value })}
            className="w-7 h-7 rounded border border-gray-200 cursor-pointer"
          />
          <div className="flex-1">
            <span className="text-xs text-gray-500 block mb-0.5">Stroke Width</span>
            <input
              type="range"
              min="0"
              max="6"
              value={selectedLayer.strokeWidth || 0}
              onChange={(e) => onUpdateLayer(selectedLayer.id, { strokeWidth: parseInt(e.target.value) })}
              className="w-full accent-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Drop Shadow */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200/70 dark:border-gray-700/70 flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-200 block">
          Drop Shadow Effect
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={selectedLayer.shadowColor || "#000000"}
            onChange={(e) => onUpdateLayer(selectedLayer.id, { shadowColor: e.target.value })}
            className="w-7 h-7 rounded border border-gray-200 cursor-pointer"
          />
          <div className="flex-1">
            <span className="text-xs text-gray-500 block mb-0.5">Blur Radius</span>
            <input
              type="range"
              min="0"
              max="20"
              value={selectedLayer.shadowBlur || 0}
              onChange={(e) => onUpdateLayer(selectedLayer.id, { shadowBlur: parseInt(e.target.value) })}
              className="w-full accent-brand-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
