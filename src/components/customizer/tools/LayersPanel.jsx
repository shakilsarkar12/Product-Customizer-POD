"use client";

import React from "react";
import {
  FiLayers,
  FiEye,
  FiEyeOff,
  FiLock,
  FiUnlock,
  FiTrash2,
  FiCopy,
  FiArrowUp,
  FiArrowDown,
  FiSliders,
} from "react-icons/fi";

export default function LayersPanel({
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onReorderLayers,
  onClearAllLayers,
}) {
  const moveLayer = (index, direction) => {
    const newLayers = [...layers];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= layers.length) return;

    const temp = newLayers[index];
    newLayers[index] = newLayers[targetIndex];
    newLayers[targetIndex] = temp;

    onReorderLayers(newLayers);
  };

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  if (layers.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center text-gray-400">
        <FiLayers className="w-12 h-12 mb-2 opacity-30" />
        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">No Canvas Layers</span>
        <span className="text-[11px] text-gray-500 mt-1">Add text, graphics, or cliparts to start building layers.</span>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4 max-h-[600px] overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2.5">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-2">
          <FiLayers className="w-4 h-4 text-brand-500" /> Layers Manager ({layers.length})
        </h3>
        {onClearAllLayers && (
          <button
            onClick={onClearAllLayers}
            className="text-[11px] font-bold text-red-500 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Layer Opacity & Blend Mode inspector if layer selected */}
      {selectedLayer && (
        <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl border border-brand-200 dark:border-brand-900/60 flex flex-col gap-2">
          <span className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider flex items-center gap-1">
            <FiSliders className="w-3.5 h-3.5" /> Layer Opacity & Blending
          </span>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-[11px] text-gray-600 dark:text-gray-300 font-semibold mb-1">
                <span>Opacity</span>
                <span>{selectedLayer.opacity ?? 100}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={selectedLayer.opacity ?? 100}
                onChange={(e) => onUpdateLayer(selectedLayer.id, { opacity: parseInt(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold block mb-1">
                Blend Mode
              </label>
              <select
                value={selectedLayer.blendMode || "normal"}
                onChange={(e) => onUpdateLayer(selectedLayer.id, { blendMode: e.target.value })}
                className="w-full p-1 text-[11px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white font-medium"
              >
                <option value="normal">Normal</option>
                <option value="multiply">Multiply</option>
                <option value="screen">Screen</option>
                <option value="overlay">Overlay</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Layer Stack Item List */}
      <div className="flex flex-col gap-2">
        {layers.map((layer, idx) => {
          const isSelected = layer.id === selectedLayerId;

          return (
            <div
              key={layer.id}
              onClick={() => onSelectLayer(layer.id)}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? "bg-brand-50 dark:bg-brand-950/40 border-brand-500 shadow-xs"
                  : "bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[11px] font-mono font-bold text-gray-400">#{idx + 1}</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                    {layer.type === "text"
                      ? `Text: "${layer.text}"`
                      : layer.type === "clipart"
                      ? `Vector (${layer.name || "Clipart"})`
                      : "Custom Image"}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                    {layer.type}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayer(idx, -1);
                  }}
                  disabled={idx === 0}
                  className="p-1 text-gray-400 hover:text-brand-500 disabled:opacity-20"
                  title="Move Up"
                >
                  <FiArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayer(idx, 1);
                  }}
                  disabled={idx === layers.length - 1}
                  className="p-1 text-gray-400 hover:text-brand-500 disabled:opacity-20"
                  title="Move Down"
                >
                  <FiArrowDown className="w-3.5 h-3.5" />
                </button>
                {onDuplicateLayer && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateLayer(layer);
                    }}
                    className="p-1 text-gray-400 hover:text-brand-500"
                    title="Duplicate Layer"
                  >
                    <FiCopy className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateLayer(layer.id, { hidden: !layer.hidden });
                  }}
                  className="p-1 text-gray-400 hover:text-brand-500"
                  title={layer.hidden ? "Show" : "Hide"}
                >
                  {layer.hidden ? <FiEyeOff className="w-3.5 h-3.5 text-red-500" /> : <FiEye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateLayer(layer.id, { locked: !layer.locked });
                  }}
                  className="p-1 text-gray-400 hover:text-brand-500"
                  title={layer.locked ? "Unlock" : "Lock"}
                >
                  {layer.locked ? <FiLock className="w-3.5 h-3.5 text-amber-500" /> : <FiUnlock className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLayer(layer.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500"
                  title="Delete"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
