"use client";

import React from "react";
import { FONTS_LIST } from "@/data/customizerData";
import {
  FiType,
  FiEdit3,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiBold,
  FiItalic,
  FiSliders,
  FiZap,
} from "react-icons/fi";

export default function TextControls({ selectedLayer, onAddText, onUpdateLayer }) {
  if (!selectedLayer || selectedLayer.type !== "text") {
    return (
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-2">
            <FiType className="w-4 h-4 text-brand-500" /> Typography Tool
          </h3>
        </div>

        <button
          onClick={() => onAddText("YOUR CUSTOM TEXT")}
          className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
        >
          <FiType className="w-4 h-4" /> Add Text Layer
        </button>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2.5 block uppercase tracking-wider flex items-center gap-1.5">
            <FiZap className="w-3.5 h-3.5 text-brand-500" /> Quick Text Presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "VINTAGE 1990", style: { font: "Bebas Neue", color: "#EF4444" } },
              { label: "TOKYO STREETWEAR", style: { font: "Outfit", color: "#3B82F6" } },
              { label: "LIMITED EDITION", style: { font: "Inter", color: "#F59E0B" } },
              { label: "CHAMPIONS 01", style: { font: "Bebas Neue", color: "#10B981" } },
            ].map((preset, idx) => (
              <button
                key={idx}
                onClick={() => onAddText(preset.label)}
                className="py-2.5 px-3 bg-gray-50 dark:bg-gray-800/80 hover:bg-brand-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-xl text-left transition-colors truncate"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-2">
          <FiEdit3 className="w-4 h-4 text-brand-500" /> Text Inspector
        </h3>
        <button
          onClick={() => onAddText("NEW TEXT")}
          className="text-[11px] font-bold bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400 px-2.5 py-1 rounded-lg border border-brand-200 dark:border-brand-900 transition-colors"
        >
          + Add New
        </button>
      </div>

      {/* Layer Content */}
      <div>
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
          Text Content
        </label>
        <input
          type="text"
          value={selectedLayer.text || ""}
          onChange={(e) => onUpdateLayer(selectedLayer.id, { text: e.target.value })}
          className="w-full px-3 py-2 text-xs font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-brand-500 focus:outline-none dark:text-white"
        />
      </div>

      {/* Curved Text Arc Effect */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200/70 dark:border-gray-700/70 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={Boolean(selectedLayer.curved)}
              onChange={(e) =>
                onUpdateLayer(selectedLayer.id, {
                  curved: e.target.checked,
                  arcAngle: selectedLayer.arcAngle !== undefined ? selectedLayer.arcAngle : 28,
                })
              }
              className="rounded accent-brand-500"
            />
            Curved Text (Arc Effect)
          </label>
          {selectedLayer.curved && (
            <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400">
              {selectedLayer.arcAngle !== undefined ? selectedLayer.arcAngle : 28}°
            </span>
          )}
        </div>
        {selectedLayer.curved && (
          <input
            type="range"
            min="5"
            max="90"
            value={selectedLayer.arcAngle !== undefined ? selectedLayer.arcAngle : 28}
            onChange={(e) => onUpdateLayer(selectedLayer.id, { arcAngle: parseInt(e.target.value) })}
            className="w-full accent-brand-500 cursor-pointer"
          />
        )}
      </div>

      {/* Font Family Picker */}
      <div>
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
          Font Family
        </label>
        <select
          value={selectedLayer.fontFamily || "Inter, sans-serif"}
          onChange={(e) => onUpdateLayer(selectedLayer.id, { fontFamily: e.target.value })}
          className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-brand-500 focus:outline-none dark:text-white font-medium"
        >
          {FONTS_LIST.map((font) => (
            <option key={font.name} value={font.family}>
              {font.name} ({font.category})
            </option>
          ))}
        </select>
      </div>

      {/* Formatting Toggles & Alignment */}
      <div className="flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-800/60 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdateLayer(selectedLayer.id, { bold: !selectedLayer.bold })}
            className={`p-1.5 rounded-lg border transition-colors ${
              selectedLayer.bold
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
            }`}
            title="Bold"
          >
            <FiBold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdateLayer(selectedLayer.id, { italic: !selectedLayer.italic })}
            className={`p-1.5 rounded-lg border transition-colors ${
              selectedLayer.italic
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
            }`}
            title="Italic"
          >
            <FiItalic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdateLayer(selectedLayer.id, { uppercase: !selectedLayer.uppercase })}
            className={`p-1.5 text-xs font-black rounded-lg border transition-colors ${
              selectedLayer.uppercase
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
            }`}
            title="Uppercase"
          >
            AA
          </button>
        </div>

        <div className="flex items-center gap-1 border-l border-gray-200 dark:border-gray-700 pl-2">
          <button
            onClick={() => onUpdateLayer(selectedLayer.id, { align: "left" })}
            className={`p-1.5 rounded-lg border transition-colors ${
              selectedLayer.align === "left"
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
            }`}
          >
            <FiAlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdateLayer(selectedLayer.id, { align: "center" })}
            className={`p-1.5 rounded-lg border transition-colors ${
              (selectedLayer.align || "center") === "center"
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
            }`}
          >
            <FiAlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdateLayer(selectedLayer.id, { align: "right" })}
            className={`p-1.5 rounded-lg border transition-colors ${
              selectedLayer.align === "right"
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
            }`}
          >
            <FiAlignRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Colors (Fill & Highlight Background) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
            Text Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedLayer.color || "#111827"}
              onChange={(e) => onUpdateLayer(selectedLayer.id, { color: e.target.value })}
              className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5"
            />
            <span className="text-[11px] font-mono text-gray-600 dark:text-gray-300 uppercase">
              {selectedLayer.color || "#111827"}
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
            Highlight Box
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedLayer.bgColor || "#ffffff"}
              onChange={(e) => onUpdateLayer(selectedLayer.id, { bgColor: e.target.value })}
              className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5"
            />
            <button
              onClick={() => onUpdateLayer(selectedLayer.id, { bgColor: selectedLayer.bgColor ? null : "#ffffff" })}
              className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              {selectedLayer.bgColor ? "Clear" : "Enable"}
            </button>
          </div>
        </div>
      </div>

      {/* Font Size & Letter Spacing Sliders */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1 font-medium">
            <span>Font Size</span>
            <span className="font-bold">{selectedLayer.fontSize || 24}px</span>
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
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1 font-medium">
            <span>Letter Spacing</span>
            <span className="font-bold">{selectedLayer.letterSpacing || 0}px</span>
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

      {/* Stroke / Outline */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200/70 dark:border-gray-700/70 flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-200 block">
          Outline Stroke
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={selectedLayer.strokeColor || "#000000"}
            onChange={(e) => onUpdateLayer(selectedLayer.id, { strokeColor: e.target.value })}
            className="w-7 h-7 rounded border border-gray-200 cursor-pointer"
          />
          <div className="flex-1">
            <span className="text-[11px] text-gray-500 block mb-0.5">Thickness ({selectedLayer.strokeWidth || 0}px)</span>
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
            <span className="text-[11px] text-gray-500 block mb-0.5">Blur Radius ({selectedLayer.shadowBlur || 0}px)</span>
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
