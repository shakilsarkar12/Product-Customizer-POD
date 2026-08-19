"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
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
  onCommitHistory,
}) {
  const containerRef = useRef(null);

  // Visual drag/scale cursor state
  const [isDragging, setIsDragging] = useState(false);
  const [isScaling, setIsScaling] = useState(false);

  // Alignment guide indicators
  const [snapXGuide, setSnapXGuide] = useState(false);
  const [snapYGuide, setSnapYGuide] = useState(false);

  // GPU-Direct Sub-Pixel Physical Precision Engine
  const dragRef = useRef({
    isDragging: false,
    isScaling: false,
    pointerId: null,
    targetEl: null,
    dragStartX: 0,
    dragStartY: 0,
    currentDx: 0,
    currentDy: 0,
    layer: null,
    scaleStart: { centerX: 0, centerY: 0, initialDist: 1, initialScale: 1 },
    rafId: null,
  });

  const printArea = activeView?.printArea || { x: 25, y: 22, width: 50, height: 60 };

  // Pointer Down on layer for movement drag (Supports Mouse, Trackpad & Touch)
  const handlePointerDown = (e, layerId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
    onSelectLayer(layerId);

    const layer = layers.find((l) => l.id === layerId);
    if (!layer || layer.locked) return;

    dragRef.current = {
      isDragging: true,
      isScaling: false,
      pointerId: e.pointerId,
      targetEl: e.currentTarget,
      dragStartX: e.clientX,
      dragStartY: e.clientY,
      currentDx: 0,
      currentDy: 0,
      layer,
      scaleStart: { centerX: 0, centerY: 0, initialDist: 1, initialScale: 1 },
      rafId: null,
    };
    setIsDragging(true);
  };

  // Corner handle pointer down for scaling (Radial distance from center)
  const handleScalePointerDown = (e, layer) => {
    e.preventDefault();
    e.stopPropagation();
    if (layer.locked || !containerRef.current) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + (layer.x / 100) * rect.width;
    const centerY = rect.top + (layer.y / 100) * rect.height;
    const initialDist = Math.max(15, Math.hypot(e.clientX - centerX, e.clientY - centerY));

    dragRef.current = {
      isDragging: false,
      isScaling: true,
      pointerId: e.pointerId,
      targetEl: null,
      dragStartX: e.clientX,
      dragStartY: e.clientY,
      currentDx: 0,
      currentDy: 0,
      layer,
      scaleStart: {
        centerX,
        centerY,
        initialDist,
        initialScale: layer.scale || 1,
      },
      rafId: null,
    };
    setIsScaling(true);
  };

  // GPU Physical Pixel Precision Move Listener (Zero Percentage Jitter on Slow Moves)
  const handlePointerMove = useCallback(
    (e) => {
      const state = dragRef.current;
      if (!state.isDragging && !state.isScaling) return;
      if (!containerRef.current || !state.layer) return;

      if (state.rafId) {
        cancelAnimationFrame(state.rafId);
      }

      state.rafId = requestAnimationFrame(() => {
        if (!containerRef.current) return;

        if (state.isDragging && state.targetEl) {
          const dx = e.clientX - state.dragStartX;
          const dy = e.clientY - state.dragStartY;
          state.currentDx = dx;
          state.currentDy = dy;

          const layer = state.layer;
          // Apply hardware GPU pixel-accurate translation with zero quantization
          state.targetEl.style.transform = `translate3d(calc(-50% + ${dx}px), calc(-50% + ${dy}px), 0) rotate(${
            layer.rotation || 0
          }deg) scale(${layer.scale || 1}) scaleX(${layer.flipX ? -1 : 1}) scaleY(${layer.flipY ? -1 : 1})`;

          const rect = containerRef.current.getBoundingClientRect();
          const approxX = layer.x + (dx / rect.width) * 100;
          const approxY = layer.y + (dy / rect.height) * 100;

          setSnapXGuide(Math.abs(approxX - 50) < 0.6);
          setSnapYGuide(Math.abs(approxY - 50) < 0.6);
        } else if (state.isScaling && state.scaleStart.initialDist) {
          const currentDist = Math.hypot(
            e.clientX - state.scaleStart.centerX,
            e.clientY - state.scaleStart.centerY
          );
          const ratio = currentDist / state.scaleStart.initialDist;
          const newScale = Math.max(
            0.2,
            Math.min(4.0, state.scaleStart.initialScale * ratio)
          );
          onUpdateLayer(state.layer.id, { scale: newScale });
        }
      });
    },
    [onUpdateLayer]
  );

  const handlePointerUp = useCallback(
    (e) => {
      const state = dragRef.current;
      if (state.isDragging && state.layer && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const deltaXPercent = (state.currentDx / rect.width) * 100;
        const deltaYPercent = (state.currentDy / rect.height) * 100;

        let newX = Math.max(5, Math.min(95, state.layer.x + deltaXPercent));
        let newY = Math.max(5, Math.min(95, state.layer.y + deltaYPercent));

        // Reset inline GPU transform offset
        if (state.targetEl) {
          state.targetEl.style.transform = `translate3d(-50%, -50%, 0) rotate(${
            state.layer.rotation || 0
          }deg) scale(${state.layer.scale || 1}) scaleX(${state.layer.flipX ? -1 : 1}) scaleY(${
            state.layer.flipY ? -1 : 1
          })`;
          state.targetEl.style.left = `${newX}%`;
          state.targetEl.style.top = `${newY}%`;

          if (state.pointerId) {
            try {
              state.targetEl.releasePointerCapture(state.pointerId);
            } catch (_) {}
          }
        }

        onUpdateLayer(state.layer.id, { x: newX, y: newY });
        if (onCommitHistory) {
          onCommitHistory();
        }
      } else if (state.isScaling && onCommitHistory) {
        onCommitHistory();
      }

      if (state.rafId) {
        cancelAnimationFrame(state.rafId);
      }

      dragRef.current = {
        isDragging: false,
        isScaling: false,
        pointerId: null,
        targetEl: null,
        dragStartX: 0,
        dragStartY: 0,
        currentDx: 0,
        currentDy: 0,
        layer: null,
        scaleStart: { centerX: 0, centerY: 0, initialDist: 1, initialScale: 1 },
        rafId: null,
      };

      setIsDragging(false);
      setIsScaling(false);
      setSnapXGuide(false);
      setSnapYGuide(false);
    },
    [onUpdateLayer, onCommitHistory]
  );

  // Global Pointer Event Listeners
  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

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

        const newX = Math.max(5, Math.min(95, selectedLayer.x + dx));
        const newY = Math.max(5, Math.min(95, selectedLayer.y + dy));
        onUpdateLayer(selectedLayerId, { x: newX, y: newY }, true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedLayerId, layers, onDeleteLayer, onDuplicateLayer, onUpdateLayer]);

  return (
    <div
      className="relative w-full h-full flex items-center justify-center p-2 select-none overflow-hidden"
      onClick={() => onSelectLayer(null)}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Zoom Control Overlay Pills */}
      <div className="absolute top-4 right-4 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-1.5 flex items-center gap-1 text-xs">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoomLevel((z) => Math.max(0.6, z - 0.1));
          }}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
          title="Zoom Out (-)"
        >
          <FiZoomOut className="w-4 h-4" />
        </button>
        <span className="font-mono px-1 font-bold text-gray-700 dark:text-gray-300 min-w-[42px] text-center">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoomLevel((z) => Math.min(1.6, z + 0.1));
          }}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
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
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-semibold transition-colors cursor-pointer"
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

      {/* Aspect-Ratio-Locked Interactive Stage Frame */}
      <div
        ref={containerRef}
        style={{ transform: `scale(${zoomLevel})` }}
        className="relative h-[94%] max-h-[850px] aspect-[4/5] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200/90 dark:border-gray-700/90 flex items-center justify-center overflow-hidden shrink-0 select-none"
      >
        {/* Product Image Mockup Background */}
        <div
          className="absolute inset-0 flex items-center justify-center p-4 transition-colors duration-300 pointer-events-none select-none"
          style={{ backgroundColor: selectedColor?.hex || "#ffffff" }}
        >
          {(() => {
            const mockupSrc =
              (activeView?.id === "back"
                ? (activeView?.image || selectedColor?.backImage || selectedColor?.image)
                : (activeView?.image || selectedColor?.image || selectedColor?.backImage)) ||
              selectedColor?.image ||
              activeView?.image ||
              "/images/product/product-01.jpg";

            return mockupSrc ? (
              <img
                src={mockupSrc}
                alt={product?.name}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                className="w-full h-full max-h-full max-w-full object-contain pointer-events-none opacity-95 transition-all duration-300 select-none"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 opacity-25">
                <span className="text-7xl font-extrabold uppercase tracking-widest">{product?.category}</span>
              </div>
            );
          })()}
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

        {/* Strictly Clipped Design Layers Workbench */}
        <div
          className="absolute inset-0 pointer-events-auto z-20 overflow-hidden"
          style={{
            clipPath: `inset(${printArea.y}% ${Math.max(0, 100 - (printArea.x + printArea.width))}% ${Math.max(0, 100 - (printArea.y + printArea.height))}% ${printArea.x}% round 10px)`,
          }}
        >
          {layers.map((layer) => {
            if (layer.hidden) return null;
            const isSelected = layer.id === selectedLayerId;

            return (
              <div
                key={layer.id}
                id={`layer-${layer.id}`}
                onPointerDown={(e) => handlePointerDown(e, layer.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLayer(layer.id);
                }}
                style={{
                  left: `${layer.x}%`,
                  top: `${layer.y}%`,
                  transform: `translate3d(-50%, -50%, 0) rotate(${layer.rotation || 0}deg) scale(${layer.scale || 1}) scaleX(${
                    layer.flipX ? -1 : 1
                  }) scaleY(${layer.flipY ? -1 : 1})`,
                  opacity: (layer.opacity ?? 100) / 100,
                  mixBlendMode: layer.blendMode || "normal",
                  cursor: layer.locked ? "not-allowed" : isDragging ? "grabbing" : "move",
                  touchAction: "none",
                  userSelect: "none",
                  WebkitUserDrag: "none",
                  backfaceVisibility: "hidden",
                  willChange: isDragging ? "transform" : "auto",
                }}
                className={`absolute inline-flex items-center justify-center p-1.5 select-none ${
                  isSelected
                    ? "z-40 ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 rounded-xl shadow-xl"
                    : "z-20 hover:ring-1 hover:ring-brand-400/80 cursor-pointer"
                }`}
              >
                {/* Layer Floating Quick Action Bar */}
                {isSelected && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 bg-gray-900/95 backdrop-blur-md text-white px-2 py-1 rounded-xl shadow-2xl border border-gray-700 flex items-center gap-1 text-xs whitespace-nowrap animate-fade-in pointer-events-auto"
                  >
                    <button
                      onClick={() => onDuplicateLayer && onDuplicateLayer(layer)}
                      className="p-1 hover:bg-gray-800 rounded text-gray-200 hover:text-white cursor-pointer"
                      title="Duplicate Layer (Ctrl+D)"
                    >
                      <FiCopy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onUpdateLayer(layer.id, { flipX: !layer.flipX }, true)}
                      className="p-1 hover:bg-gray-800 rounded text-gray-200 hover:text-white cursor-pointer"
                      title="Flip Horizontal"
                    >
                      ↔
                    </button>
                    <button
                      onClick={() => onUpdateLayer(layer.id, { flipY: !layer.flipY }, true)}
                      className="p-1 hover:bg-gray-800 rounded text-gray-200 hover:text-white cursor-pointer"
                      title="Flip Vertical"
                    >
                      ↕
                    </button>
                    <button
                      onClick={() => onUpdateLayer(layer.id, { rotation: ((layer.rotation || 0) + 45) % 360 }, true)}
                      className="p-1 hover:bg-gray-800 rounded text-gray-200 hover:text-white cursor-pointer"
                      title="Rotate 45°"
                    >
                      <FiRotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onUpdateLayer(layer.id, { locked: !layer.locked }, true)}
                      className="p-1 hover:bg-gray-800 rounded text-gray-200 hover:text-white cursor-pointer"
                      title={layer.locked ? "Unlock Layer" : "Lock Layer"}
                    >
                      {layer.locked ? <FiLock className="w-3.5 h-3.5 text-amber-400" /> : <FiUnlock className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => onDeleteLayer(layer.id)}
                      className="p-1 hover:bg-red-900/80 rounded text-red-400 hover:text-red-300 cursor-pointer"
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
                      className="select-none tracking-tight leading-none pointer-events-none"
                    >
                      {layer.text || "Custom Text"}
                    </div>
                  )
                )}

                {/* Layer Type: Clipart / SVG */}
                {layer.type === "clipart" && (
                  <div
                    className="w-20 h-20 flex items-center justify-center p-1 pointer-events-none"
                    dangerouslySetInnerHTML={{
                      __html: layer.color
                        ? layer.svg?.replace(/fill='[^']+'/g, `fill='${layer.color}'`)
                        : layer.svg,
                    }}
                  />
                )}

                {/* Layer Type: Image / Upload */}
                {layer.type === "image" && (
                  <img
                    src={layer.url}
                    alt="Custom Layer"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
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
                    className="max-w-[240px] max-h-[240px] object-contain shadow-md pointer-events-none"
                  />
                )}

                {/* Corner Scale & Rotate Resize Handles Sized to Full Bounding Box */}
                {isSelected && !layer.locked && (
                  <>
                    <div
                      onPointerDown={(e) => handleScalePointerDown(e, layer)}
                      className="absolute -bottom-2 -right-2 w-4 h-4 bg-brand-500 border-2 border-white dark:border-gray-900 rounded-full shadow-md cursor-se-resize z-40 hover:scale-125 transition-transform"
                      title="Drag to Scale"
                    />
                    <div
                      onPointerDown={(e) => handleScalePointerDown(e, layer)}
                      className="absolute -top-2 -left-2 w-4 h-4 bg-brand-500 border-2 border-white dark:border-gray-900 rounded-full shadow-md cursor-nw-resize z-40 hover:scale-125 transition-transform"
                      title="Drag to Scale"
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
