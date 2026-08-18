"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  FiMove,
  FiRotateCw,
  FiTrash2,
  FiLock,
  FiUnlock,
  FiEye,
  FiEyeOff,
  FiZoomIn,
  FiZoomOut,
  FiMaximize2,
  FiCopy,
  FiCornerUpRight,
  FiSliders,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
} from "react-icons/fi";

export default function CanvasEngine({
  product,
  selectedColor,
  activeView,
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  showGrid,
  zoomLevel,
  setZoomLevel,
}) {
  const containerRef = useRef(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [layerStartPos, setLayerStartPos] = useState({ x: 0, y: 0 });

  // Scale Handle Drag state
  const [isScaling, setIsScaling] = useState(false);
  const [scaleStart, setScaleStart] = useState({ y: 0, initialScale: 1 });

  // Rotate Handle Drag state
  const [isRotating, setIsRotating] = useState(false);

  // Alignment guide indicators
  const [snapXGuide, setSnapXGuide] = useState(false);
  const [snapYGuide, setSnapYGuide] = useState(false);

  const printArea = activeView?.printArea || { x: 25, y: 22, width: 50, height: 60 };

  // Mouse Down on layer for movement drag
  const handleMouseDown = (e, layerId) => {
    e.stopPropagation();
    onSelectLayer(layerId);

    const layer = layers.find((l) => l.id === layerId);
    if (!layer || layer.locked) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLayerStartPos({ x: layer.x, y: layer.y });
  };

  // Corner handle mouse down for scaling
  const handleScaleMouseDown = (e, layer) => {
    e.stopPropagation();
    if (layer.locked) return;
    setIsScaling(true);
    setScaleStart({ y: e.clientY, initialScale: layer.scale || 1 });
  };

  // Mouse Move over window
  const handleMouseMove = (e) => {
    if (!containerRef.current || !selectedLayerId) return;
    const selectedLayer = layers.find((l) => l.id === selectedLayerId);
    if (!selectedLayer || selectedLayer.locked) return;

    const rect = containerRef.current.getBoundingClientRect();

    if (isDragging) {
      const deltaXPercent = ((e.clientX - dragStart.x) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - dragStart.y) / rect.height) * 100;

      let newX = Math.round((layerStartPos.x + deltaXPercent) * 10) / 10;
      let newY = Math.round((layerStartPos.y + deltaYPercent) * 10) / 10;

      // Check center snap (within 1.5%)
      const isCenterX = Math.abs(newX - 50) < 1.5;
      const isCenterY = Math.abs(newY - 50) < 1.5;

      setSnapXGuide(isCenterX);
      setSnapYGuide(isCenterY);

      if (isCenterX) newX = 50;
      if (isCenterY) newY = 50;

      // Snap to Grid (5% increments) if enabled
      if (showGrid && !isCenterX && !isCenterY) {
        newX = Math.round(newX / 5) * 5;
        newY = Math.round(newY / 5) * 5;
      }

      // Clamp within print boundary with padding
      newX = Math.max(printArea.x, Math.min(printArea.x + printArea.width, newX));
      newY = Math.max(printArea.y, Math.min(printArea.y + printArea.height, newY));

      onUpdateLayer(selectedLayerId, { x: newX, y: newY });
    } else if (isScaling) {
      const deltaY = scaleStart.y - e.clientY;
      const scaleDelta = deltaY * 0.01;
      const newScale = Math.max(0.3, Math.min(3.5, Math.round((scaleStart.initialScale + scaleDelta) * 100) / 100));
      onUpdateLayer(selectedLayerId, { scale: newScale });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsScaling(false);
    setIsRotating(false);
    setSnapXGuide(false);
    setSnapYGuide(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isScaling, isRotating, selectedLayerId, dragStart, layerStartPos, scaleStart, showGrid, printArea]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedLayerId) return;
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") return;

      const selectedLayer = layers.find((l) => l.id === selectedLayerId);
      if (!selectedLayer) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onDeleteLayer(selectedLayerId);
      } else if (e.key === "d" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (onDuplicateLayer) onDuplicateLayer(selectedLayer);
      } else if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const step = e.shiftKey ? 5 : 1;
        let dx = 0;
        let dy = 0;
        if (e.key === "ArrowLeft") dx = -step;
        if (e.key === "ArrowRight") dx = step;
        if (e.key === "ArrowUp") dy = -step;
        if (e.key === "ArrowDown") dy = step;

        const newX = Math.max(printArea.x, Math.min(printArea.x + printArea.width, selectedLayer.x + dx));
        const newY = Math.max(printArea.y, Math.min(printArea.y + printArea.height, selectedLayer.y + dy));
        onUpdateLayer(selectedLayerId, { x: newX, y: newY });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedLayerId, layers, printArea]);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  return (
    <div
      onClick={() => onSelectLayer(null)}
      className="relative flex-1 w-full h-full flex flex-col items-center justify-center select-none overflow-hidden min-h-0 p-1 sm:p-2"
    >
      {/* Zoom & Viewport Toolbar */}
      <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-2.5 py-1 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-xl text-xs">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoomLevel((z) => Math.max(0.6, z - 0.1));
          }}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
          title="Zoom Out (-)"
        >
          <FiZoomOut className="w-4 h-4" />
        </button>
        <span className="font-mono font-bold text-gray-700 dark:text-gray-200 min-w-[38px] text-center text-[11px]">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoomLevel((z) => Math.min(1.6, z + 0.1));
          }}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
          title="Zoom In (+)"
        >
          <FiZoomIn className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-0.5" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoomLevel(1);
          }}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-semibold transition-colors"
          title="Reset Zoom"
        >
          <FiMaximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Center Alignment Snap Lines */}
      {snapXGuide && (
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-brand-500 z-40 pointer-events-none shadow-sm animate-pulse" />
      )}
      {snapYGuide && (
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-brand-500 z-40 pointer-events-none shadow-sm animate-pulse" />
      )}

      {/* Main Interactive Canvas Box - Expands to occupy full available workbench viewport */}
      <div
        ref={containerRef}
        style={{ transform: `scale(${zoomLevel})` }}
        className="relative w-full h-full max-w-[800px] max-h-[100%] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200/90 dark:border-gray-700/90 flex items-center justify-center transition-transform duration-150 ease-out overflow-hidden"
      >
        {/* Product Image Mockup Background */}
        <div
          className="absolute inset-0 flex items-center justify-center p-3 sm:p-6 transition-colors duration-300"
          style={{ backgroundColor: selectedColor?.hex || "#ffffff" }}
        >
          {selectedColor?.image ? (
            <img
              src={selectedColor.image}
              alt={product?.name}
              className="w-full h-full max-h-full max-w-full object-contain pointer-events-none opacity-95 transition-all duration-300 select-none"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 opacity-25">
              <span className="text-7xl font-extrabold uppercase tracking-widest">{product?.category}</span>
            </div>
          )}
        </div>

        {/* Snap Grid Dots */}
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
          className="absolute border-2 border-dashed border-brand-500/70 dark:border-brand-400/80 rounded-2xl pointer-events-none z-10 transition-all duration-300"
          style={{
            left: `${printArea.x}%`,
            top: `${printArea.y}%`,
            width: `${printArea.width}%`,
            height: `${printArea.height}%`,
          }}
        >
          <span className="absolute -top-3 left-3 bg-brand-600 text-white text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full shadow-md tracking-wider">
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
              onClick={(e) => {
                e.stopPropagation();
                onSelectLayer(layer.id);
              }}
              style={{
                left: `${layer.x}%`,
                top: `${layer.y}%`,
                transform: `translate(-50%, -50%) rotate(${layer.rotation || 0}deg) scale(${layer.scale || 1}) scaleX(${
                  layer.flipX ? -1 : 1
                }) scaleY(${layer.flipY ? -1 : 1})`,
                opacity: (layer.opacity ?? 100) / 100,
                mixBlendMode: layer.blendMode || "normal",
                cursor: layer.locked ? "not-allowed" : isDragging ? "grabbing" : "pointer",
              }}
              className={`absolute transition-shadow select-none ${
                isSelected
                  ? "z-40 ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 rounded-xl shadow-lg"
                  : "z-20 hover:ring-1 hover:ring-brand-400/80 cursor-pointer"
              }`}
            >
              {/* Layer Floating Quick Action Bar */}
              {isSelected && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 backdrop-blur-md text-white px-2 py-1 rounded-xl shadow-2xl border border-gray-700 flex items-center gap-1 text-xs whitespace-nowrap animate-fade-in"
                >
                  <button
                    onClick={() => onDuplicateLayer && onDuplicateLayer(layer)}
                    className="p-1 hover:bg-gray-800 rounded text-gray-200 hover:text-white"
                    title="Duplicate Layer (Ctrl+D)"
                  >
                    <FiCopy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdateLayer(layer.id, { flipX: !layer.flipX })}
                    className="p-1 hover:bg-gray-800 rounded text-gray-200 hover:text-white"
                    title="Flip Horizontal"
                  >
                    ↔
                  </button>
                  <button
                    onClick={() => onUpdateLayer(layer.id, { flipY: !layer.flipY })}
                    className="p-1 hover:bg-gray-800 rounded text-gray-200 hover:text-white"
                    title="Flip Vertical"
                  >
                    ↕
                  </button>
                  <button
                    onClick={() => onUpdateLayer(layer.id, { rotation: ((layer.rotation || 0) + 45) % 360 })}
                    className="p-1 hover:bg-gray-800 rounded text-gray-200 hover:text-white"
                    title="Rotate 45°"
                  >
                    <FiRotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdateLayer(layer.id, { locked: !layer.locked })}
                    className="p-1 hover:bg-gray-800 rounded text-gray-200 hover:text-white"
                    title={layer.locked ? "Unlock Layer" : "Lock Layer"}
                  >
                    {layer.locked ? <FiLock className="w-3.5 h-3.5 text-amber-400" /> : <FiUnlock className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => onDeleteLayer(layer.id)}
                    className="p-1 hover:bg-red-900/80 rounded text-red-400 hover:text-red-300"
                    title="Delete Layer (Del)"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Layer Type: Text */}
              {layer.type === "text" && (
                layer.curved ? (
                  (() => {
                    const text = layer.text || "Custom Text";
                    const letters = Array.from(text);
                    const count = letters.length;
                    const fontSize = Number(layer.fontSize) || 24;
                    const angle = Number(layer.arcAngle) !== undefined ? Number(layer.arcAngle) : 28;
                    const charWidth = fontSize * 0.58 + (Number(layer.letterSpacing) || 0);
                    const totalLen = Math.max(10, count * charWidth);
                    const angleRad = Math.max(0.15, (Math.abs(angle) * Math.PI) / 180);
                    const radius = Math.max(25, totalLen / angleRad);
                    const originY = angle >= 0 ? `${radius}px` : `${-radius}px`;

                    return (
                      <div
                        style={{
                          position: "relative",
                          display: "inline-flex",
                          justifyContent: "center",
                          alignItems: "center",
                          minHeight: `${fontSize * 2}px`,
                          minWidth: `${totalLen}px`,
                          padding: "8px 12px",
                          userSelect: "none",
                        }}
                        className="select-none leading-none pointer-events-none"
                      >
                        {letters.map((char, index) => {
                          const charAngle = count > 1 ? ((index / (count - 1)) - 0.5) * angle : 0;

                          return (
                            <span
                              key={index}
                              style={{
                                display: "inline-block",
                                position: "absolute",
                                fontFamily: layer.fontFamily || "Inter, sans-serif",
                                fontSize: `${fontSize}px`,
                                color: layer.color || "#111827",
                                fontWeight: layer.bold ? "bold" : "normal",
                                fontStyle: layer.italic ? "italic" : "normal",
                                textTransform: layer.uppercase ? "uppercase" : "none",
                                WebkitTextStroke: layer.strokeWidth ? `${layer.strokeWidth}px ${layer.strokeColor || "#000"}` : "none",
                                textShadow: layer.shadowColor ? `0px 4px ${layer.shadowBlur || 6}px ${layer.shadowColor}` : "none",
                                transformOrigin: `50% ${originY}`,
                                transform: `rotate(${charAngle}deg)`,
                                whiteSpace: "pre",
                              }}
                            >
                              {char}
                            </span>
                          );
                        })}
                      </div>
                    );
                  })()
                ) : (
                  <div
                    style={{
                      fontFamily: layer.fontFamily || "Inter, sans-serif",
                      fontSize: `${layer.fontSize || 24}px`,
                      color: layer.color || "#111827",
                      fontWeight: layer.bold ? "bold" : "normal",
                      fontStyle: layer.italic ? "italic" : "normal",
                      textTransform: layer.uppercase ? "uppercase" : "none",
                      textAlign: layer.align || "center",
                      backgroundColor: layer.bgColor || "transparent",
                      WebkitTextStroke: layer.strokeWidth ? `${layer.strokeWidth}px ${layer.strokeColor || "#000"}` : "none",
                      textShadow: layer.shadowColor ? `0px 4px ${layer.shadowBlur || 6}px ${layer.shadowColor}` : "none",
                      letterSpacing: `${layer.letterSpacing || 0}px`,
                      whiteSpace: "nowrap",
                      padding: layer.bgColor ? "4px 10px" : "2px",
                      borderRadius: layer.bgColor ? "8px" : "0px",
                    }}
                    className="select-none tracking-tight leading-none"
                  >
                    {layer.text || "Custom Text"}
                  </div>
                )
              )}

              {/* Layer Type: Clipart / SVG */}
              {layer.type === "clipart" && (
                <div
                  className="w-20 h-20 flex items-center justify-center p-1"
                  dangerouslySetInnerHTML={{
                    __html: layer.color
                      ? layer.svg.replace(/fill='[^']+'/g, `fill='${layer.color}'`)
                      : layer.svg,
                  }}
                />
              )}

              {/* Layer Type: Image / Upload */}
              {layer.type === "image" && (
                <img
                  src={layer.url}
                  alt="Custom Layer"
                  style={{
                    filter: layer.grayscale
                      ? "grayscale(100%)"
                      : layer.sepia
                      ? "sepia(100%)"
                      : layer.invert
                      ? "invert(100%)"
                      : "none",
                    borderRadius: layer.cropShape === "circle" ? "9999px" : layer.cropShape === "rounded" ? "16px" : "8px",
                  }}
                  className="max-w-[180px] max-h-[180px] object-contain shadow-md"
                />
              )}

              {/* Bounding Corner Resize Handles */}
              {isSelected && !layer.locked && (
                <>
                  <div
                    onMouseDown={(e) => handleScaleMouseDown(e, layer)}
                    className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-brand-500 border-2 border-white dark:border-gray-900 rounded-full shadow-md cursor-se-resize z-40 hover:scale-125 transition-transform"
                    title="Drag to Scale"
                  />
                  <div
                    onMouseDown={(e) => handleScaleMouseDown(e, layer)}
                    className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-brand-500 border-2 border-white dark:border-gray-900 rounded-full shadow-md cursor-nw-resize z-40 hover:scale-125 transition-transform"
                    title="Drag to Scale"
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
