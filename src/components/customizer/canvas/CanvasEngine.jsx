"use client";

import React, { useRef, useState, useEffect } from "react";
import { FiMove, FiRotateCw, FiTrash2, FiLock, FiUnlock, FiEye, FiEyeOff, FiZoomIn, FiZoomOut, FiMaximize2 } from "react-icons/fi";

export default function CanvasEngine({
  product,
  selectedColor,
  activeView,
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  showGrid,
  zoomLevel,
  setZoomLevel,
}) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [layerStartPos, setLayerStartPos] = useState({ x: 0, y: 0 });

  const printArea = activeView?.printArea || { x: 25, y: 22, width: 50, height: 60 };

  const handleMouseDown = (e, layerId) => {
    e.stopPropagation();
    onSelectLayer(layerId);

    const layer = layers.find((l) => l.id === layerId);
    if (!layer || layer.locked) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLayerStartPos({ x: layer.x, y: layer.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedLayerId) return;
    const selectedLayer = layers.find((l) => l.id === selectedLayerId);
    if (!selectedLayer || selectedLayer.locked) return;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const deltaXPercent = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStart.y) / rect.height) * 100;

    let newX = Math.round((layerStartPos.x + deltaXPercent) * 10) / 10;
    let newY = Math.round((layerStartPos.y + deltaYPercent) * 10) / 10;

    // Snap to Grid (5% increments) if grid is enabled
    if (showGrid) {
      newX = Math.round(newX / 5) * 5;
      newY = Math.round(newY / 5) * 5;
    }

    // Clamp within print boundary
    newX = Math.max(printArea.x, Math.min(printArea.x + printArea.width, newX));
    newY = Math.max(printArea.y, Math.min(printArea.y + printArea.height, newY));

    onUpdateLayer(selectedLayerId, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900/60 p-4 md:p-8 select-none overflow-hidden min-h-[500px]">
      {/* Zoom & Viewport Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg text-xs">
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
          title="Zoom Out"
        >
          <FiZoomOut className="w-4 h-4" />
        </button>
        <span className="font-semibold text-gray-700 dark:text-gray-200 min-w-[40px] text-center">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.1))}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
          title="Zoom In"
        >
          <FiZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 ml-1"
          title="Reset Zoom"
        >
          <FiMaximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Canvas Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        style={{ transform: `scale(${zoomLevel})` }}
        className="relative w-[360px] sm:w-[440px] md:w-[480px] h-[480px] sm:h-[540px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700/80 flex items-center justify-center transition-transform duration-150 ease-out overflow-hidden"
      >
        {/* Product Background Mockup Image */}
        <div
          className="absolute inset-0 flex items-center justify-center p-4"
          style={{ backgroundColor: selectedColor?.hex || "#ffffff" }}
        >
          {selectedColor?.image ? (
            <img
              src={selectedColor.image}
              alt={product?.name}
              className="w-full h-full object-contain pointer-events-none opacity-90 transition-all duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 opacity-30">
              <span className="text-6xl font-bold uppercase tracking-widest">{product?.category}</span>
            </div>
          )}
        </div>

        {/* Snap Grid Overlay */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              opacity: 0.35,
            }}
          />
        )}

        {/* Print Area Boundary Box */}
        <div
          className="absolute border-2 border-dashed border-brand-500/70 dark:border-brand-400/80 rounded-xl pointer-events-none z-10 transition-all duration-300"
          style={{
            left: `${printArea.x}%`,
            top: `${printArea.y}%`,
            width: `${printArea.width}%`,
            height: `${printArea.height}%`,
          }}
        >
          <span className="absolute -top-3 left-3 bg-brand-500 text-white text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full shadow-sm">
            Print Area ({activeView?.label})
          </span>
        </div>

        {/* Canvas Rendered Layers */}
        {layers.map((layer) => {
          if (layer.hidden) return null;
          const isSelected = layer.id === selectedLayerId;

          return (
            <div
              key={layer.id}
              onMouseDown={(e) => handleMouseDown(e, layer.id)}
              style={{
                left: `${layer.x}%`,
                top: `${layer.y}%`,
                transform: `translate(-50%, -50%) rotate(${layer.rotation || 0}deg) scale(${layer.scale || 1})`,
                cursor: layer.locked ? "not-allowed" : "move",
              }}
              className={`absolute z-20 transition-shadow ${
                isSelected
                  ? "ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 rounded-lg"
                  : "hover:ring-1 hover:ring-brand-300"
              }`}
            >
              {/* Layer Type: Text */}
              {layer.type === "text" && (
                <div
                  style={{
                    fontFamily: layer.fontFamily || "Inter, sans-serif",
                    fontSize: `${layer.fontSize || 24}px`,
                    color: layer.color || "#111827",
                    WebkitTextStroke: layer.strokeWidth ? `${layer.strokeWidth}px ${layer.strokeColor || "#000"}` : "none",
                    textShadow: layer.shadowColor ? `0px 4px ${layer.shadowBlur || 6}px ${layer.shadowColor}` : "none",
                    letterSpacing: `${layer.letterSpacing || 0}px`,
                    whiteSpace: "nowrap",
                  }}
                  className="font-bold tracking-tight select-none p-1"
                >
                  {layer.text || "Sample Text"}
                </div>
              )}

              {/* Layer Type: Clipart / SVG */}
              {layer.type === "clipart" && (
                <div
                  className="w-16 h-16 flex items-center justify-center p-1"
                  dangerouslySetInnerHTML={{ __html: layer.svg }}
                />
              )}

              {/* Layer Type: Image / Upload */}
              {layer.type === "image" && (
                <img
                  src={layer.url}
                  alt="Custom Layer"
                  className="max-w-[160px] max-h-[160px] object-contain rounded-lg shadow-md"
                />
              )}

              {/* Selection Transform Handles */}
              {isSelected && !layer.locked && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateLayer(layer.id, { rotation: ((layer.rotation || 0) + 45) % 360 });
                    }}
                    className="absolute -top-3 -right-3 w-6 h-6 bg-brand-500 hover:bg-brand-600 text-white rounded-full flex items-center justify-center shadow-md text-xs cursor-pointer z-30"
                    title="Rotate 45°"
                  >
                    <FiRotateCw className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLayer(layer.id);
                    }}
                    className="absolute -bottom-3 -right-3 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md text-xs cursor-pointer z-30"
                    title="Delete Layer"
                  >
                    <FiTrash2 className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
