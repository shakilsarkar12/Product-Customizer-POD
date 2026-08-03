"use client";

import React from "react";
import { FiLayers, FiEye, FiEyeOff, FiLock, FiUnlock, FiTrash2, FiCopy, FiArrowUp, FiArrowDown } from "react-icons/fi";

export default function LayersPanel({
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  onReorderLayers,
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

  if (layers.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center text-gray-400">
        <FiLayers className="w-12 h-12 mb-2 opacity-40" />
        <span className="text-sm font-semibold">No Layers on Canvas</span>
        <span className="text-xs text-gray-500 mt-1">Add text, images, or cliparts to see layers here.</span>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-3 max-h-[500px] overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-2">
          <FiLayers className="w-4 h-4 text-brand-500" /> Layer Management ({layers.length})
        </h3>
      </div>

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
                <span className="text-xs font-mono font-semibold text-gray-400">#{idx + 1}</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                    {layer.type === "text" ? `Text: "${layer.text}"` : layer.type === "clipart" ? `Clipart (${layer.name || 'Vector'})` : "Custom Image"}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">{layer.type}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                {/* Move Up/Down */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayer(idx, -1);
                  }}
                  disabled={idx === 0}
                  className="p-1 text-gray-500 hover:text-brand-500 disabled:opacity-30"
                  title="Bring Forward"
                >
                  <FiArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayer(idx, 1);
                  }}
                  disabled={idx === layers.length - 1}
                  className="p-1 text-gray-500 hover:text-brand-500 disabled:opacity-30"
                  title="Send Backward"
                >
                  <FiArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Toggle Visibility */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateLayer(layer.id, { hidden: !layer.hidden });
                  }}
                  className="p-1 text-gray-500 hover:text-brand-500"
                  title={layer.hidden ? "Show Layer" : "Hide Layer"}
                >
                  {layer.hidden ? <FiEyeOff className="w-3.5 h-3.5 text-red-500" /> : <FiEye className="w-3.5 h-3.5" />}
                </button>

                {/* Lock/Unlock */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateLayer(layer.id, { locked: !layer.locked });
                  }}
                  className="p-1 text-gray-500 hover:text-brand-500"
                  title={layer.locked ? "Unlock Layer" : "Lock Layer"}
                >
                  {layer.locked ? <FiLock className="w-3.5 h-3.5 text-amber-500" /> : <FiUnlock className="w-3.5 h-3.5" />}
                </button>

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLayer(layer.id);
                  }}
                  className="p-1 text-gray-500 hover:text-red-500"
                  title="Delete Layer"
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
