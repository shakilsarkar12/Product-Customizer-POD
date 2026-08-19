"use client";

import React, { useState, useRef } from "react";
import {
  FiBox,
  FiX,
  FiSun,
  FiMoon,
  FiCamera,
  FiCheck,
  FiRotateCw,
} from "react-icons/fi";

export default function ThreeDPreviewModal({
  isOpen,
  onClose,
  product,
  selectedColor,
  layersByView = {},
  activeViewId = "front",
}) {
  const [rotation, setRotation] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [env, setEnv] = useState("studio"); // 'studio' | 'dark'
  const [copiedNotification, setCopiedNotification] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialRotation: 0, initialTilt: 0 });

  if (!isOpen) return null;

  // Determine if viewing front or back based on 360 degree rotation
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  const isBackView = normalizedRotation > 90 && normalizedRotation < 270;
  const currentViewKey = isBackView ? "back" : "front";

  const frontViewObj = product?.views?.find((v) => v.id === "front") || product?.views?.[0] || {
    id: "front",
    label: "Front View",
    image: selectedColor?.image || "/images/product/product-01.jpg",
    printArea: { x: 25, y: 22, width: 50, height: 60 },
  };

  const backViewObj = product?.views?.find((v) => v.id === "back") || product?.views?.[1] || {
    id: "back",
    label: "Back View",
    image: selectedColor?.backImage || selectedColor?.image || "/images/product/product-02.jpg",
    printArea: { x: 25, y: 20, width: 50, height: 65 },
  };

  const mockupImage =
    (isBackView
      ? (backViewObj.image || selectedColor?.backImage || selectedColor?.image)
      : (frontViewObj.image || selectedColor?.image || selectedColor?.backImage)) ||
    selectedColor?.image ||
    "/images/product/product-01.jpg";

  const currentLayers = layersByView[currentViewKey] || [];

  // Mouse Drag 360 degree rotation
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialRotation: rotation,
      initialTilt: tilt,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setRotation(Math.round(dragStartRef.current.initialRotation + deltaX * 0.8));
    setTilt(Math.max(-20, Math.min(20, Math.round(dragStartRef.current.initialTilt - deltaY * 0.3))));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleSnapshot = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col items-center border border-gray-200 dark:border-gray-700 animate-in fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors cursor-pointer"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Title & View Indicator */}
        <div className="flex items-center gap-2 mb-1">
          <FiBox className="w-5 h-5 text-brand-500" />
          <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
            Interactive 3D Realtime Visualizer
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 border border-brand-200 dark:border-brand-900">
            {isBackView ? "Back View (180°)" : "Front View (0°)"}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 text-center">
          Click & drag to rotate 360° • Layers match canvas position & scale 1:1
        </p>

        {/* Lighting Mode Selector */}
        <div className="flex items-center gap-2 mb-3 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
          <button
            onClick={() => setEnv("studio")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              env === "studio"
                ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-xs"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <FiSun className="w-3.5 h-3.5" /> Studio White
          </button>
          <button
            onClick={() => setEnv("dark")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              env === "dark"
                ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-xs"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <FiMoon className="w-3.5 h-3.5 text-purple-400" /> Dark Cyberpunk
          </button>
        </div>

        {/* 3D Interactive Workbench */}
        <div
          onMouseDown={handleMouseDown}
          className={`relative w-full h-[400px] rounded-2xl flex items-center justify-center border shadow-inner overflow-hidden cursor-grab active:cursor-grabbing transition-colors duration-500 ${
            env === "studio"
              ? "bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 border-gray-200 dark:border-gray-700"
              : "bg-gradient-to-b from-slate-950 via-purple-950 to-slate-900 border-purple-900/50"
          }`}
          style={{ perspective: "1000px" }}
        >
          {/* 3D Rotating Stage Frame - Exact 500x625 (4:5 Aspect) Canvas Sizing */}
          <div
            style={{
              width: "500px",
              height: "625px",
              transform: `rotateY(${rotation}deg) rotateX(${tilt}deg) scale(0.56)`,
              transformOrigin: "center center",
              transformStyle: "preserve-3d",
            }}
            className="absolute bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200/90 dark:border-gray-700/90 overflow-hidden flex items-center justify-center transition-transform duration-75 ease-out select-none"
          >
            {/* Product Mockup Image */}
            <div
              className="absolute inset-0 flex items-center justify-center p-4 transition-colors duration-300 pointer-events-none"
              style={{ backgroundColor: selectedColor?.hex || "#ffffff" }}
            >
              <img
                src={mockupImage}
                alt="3D Garment"
                className="w-full h-full object-contain pointer-events-none drop-shadow-xl"
              />
            </div>

            {/* Rendered User Customized Design Layers on 3D Model */}
            {currentLayers.map((layer) => {
              if (layer.hidden) return null;
              return (
                <div
                  key={layer.id}
                  style={{
                    left: `${layer.x}%`,
                    top: `${layer.y}%`,
                    transform: `translate(-50%, -50%) rotate(${layer.rotation || 0}deg) scale(${layer.scale || 1}) scaleX(${
                      layer.flipX ? -1 : 1
                    }) scaleY(${layer.flipY ? -1 : 1})`,
                    opacity: (layer.opacity ?? 100) / 100,
                    mixBlendMode: layer.blendMode || "normal",
                  }}
                  className="absolute pointer-events-none select-none z-20 flex items-center justify-center"
                >
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

                  {/* Layer Type: Clipart */}
                  {layer.type === "clipart" && (
                    <div
                      className="w-20 h-20 flex items-center justify-center p-1"
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
                      className="max-w-[180px] max-h-[180px] object-contain shadow-md pointer-events-none select-none"
                    />
                  )}
                </div>
              );
            })}

            {/* 3D Realistic Cylindrical Lighting & Ambient Shading Overlay */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-25"
              style={{
                background: `linear-gradient(90deg, rgba(0,0,0,0.35) 0%, rgba(255,255,255,0.5) 50%, rgba(0,0,0,0.35) 100%)`,
              }}
            />
          </div>

          {/* Perspective Ground Shadow */}
          <div className="absolute bottom-4 w-56 h-6 bg-black/30 dark:bg-black/70 rounded-full blur-lg pointer-events-none" />

          {/* Snapshot Confirmation */}
          {copiedNotification && (
            <div className="absolute top-4 bg-emerald-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce z-50">
              <FiCheck className="w-4 h-4" /> 3D Snapshot Captured!
            </div>
          )}

          {/* Bottom Controls Bar */}
          <div className="absolute bottom-3 left-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 shadow-xs flex items-center justify-between z-30">
            <span>
              Angle: <span className="font-mono text-brand-600">{rotation}°</span> ({isBackView ? "Back" : "Front"})
            </span>
            <button
              onClick={handleSnapshot}
              className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FiCamera className="w-3.5 h-3.5" /> Snapshot 3D
            </button>
          </div>
        </div>

        {/* Rotation Action Buttons */}
        <div className="flex items-center gap-2.5 mt-4">
          <button
            onClick={() => setRotation((r) => r - 45)}
            className="py-2 px-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FiRotateCw className="w-3.5 h-3.5 rotate-180" /> -45°
          </button>
          <button
            onClick={() => {
              setRotation(0);
              setTilt(0);
            }}
            className="py-2 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-extrabold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Reset Front (0°)
          </button>
          <button
            onClick={() => {
              setRotation(180);
              setTilt(0);
            }}
            className="py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            View Back (180°)
          </button>
          <button
            onClick={() => setRotation((r) => r + 45)}
            className="py-2 px-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FiRotateCw className="w-3.5 h-3.5" /> +45°
          </button>
        </div>
      </div>
    </div>
  );
}
