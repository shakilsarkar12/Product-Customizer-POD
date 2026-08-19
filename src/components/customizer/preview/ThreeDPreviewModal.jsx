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
  FiDownload,
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
  const [selectedViewKey, setSelectedViewKey] = useState(activeViewId);
  const [env, setEnv] = useState("studio"); // 'studio' | 'dark'
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [notificationText, setNotificationText] = useState("");
  const [downloading, setDownloading] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialRotation: 0, initialTilt: 0 });

  if (!isOpen) return null;

  const views = product?.views || [
    {
      id: "front",
      label: "Front View",
      image: selectedColor?.image || "/images/product/product-01.jpg",
      printArea: { x: 25, y: 22, width: 50, height: 60 },
    },
    {
      id: "back",
      label: "Back View",
      image: selectedColor?.backImage || "/images/product/product-02.jpg",
      printArea: { x: 25, y: 20, width: 50, height: 65 },
    },
  ];

  // Determine active view object
  const currentViewObj =
    views.find((v) => v.id === selectedViewKey) || views[0];

  const currentPrintArea = currentViewObj?.printArea || { x: 25, y: 22, width: 50, height: 60 };

  const mockupImage =
    currentViewObj?.image ||
    (selectedViewKey === "back" ? selectedColor?.backImage : selectedColor?.image) ||
    selectedColor?.image ||
    "/images/product/product-01.jpg";

  const currentLayers = layersByView[selectedViewKey] || [];

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
    const newRot = Math.round(dragStartRef.current.initialRotation + deltaX * 0.8);
    setRotation(newRot);
    setTilt(Math.max(-20, Math.min(20, Math.round(dragStartRef.current.initialTilt - deltaY * 0.3))));

    // Auto-detect front/back if only front/back exist
    const normalized = ((newRot % 360) + 360) % 360;
    if (views.length === 2 && views.some((v) => v.id === "front") && views.some((v) => v.id === "back")) {
      if (normalized > 90 && normalized < 270) {
        setSelectedViewKey("back");
      } else {
        setSelectedViewKey("front");
      }
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Helper to load image for canvas
  const loadImage = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

  // Render a specific view onto an offscreen canvas and download PNG (Strict Print Area Clipping & Zero Shadows)
  const renderAndDownloadView = async (viewObj) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 1200;
    canvas.height = 1500;

    // 1. Clean Crisp Background
    if (env === "studio") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, "#090d16");
      bgGrad.addColorStop(1, "#1e1b4b");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 2. Garment Frame Base
    ctx.fillStyle = selectedColor?.hex || "#ffffff";
    ctx.beginPath();
    ctx.roundRect(100, 100, 1000, 1250, 40);
    ctx.fill();

    // 3. Draw Garment Mockup Image
    const viewMockupUrl =
      viewObj?.image ||
      (viewObj?.id === "back" ? selectedColor?.backImage : selectedColor?.image) ||
      selectedColor?.image ||
      "/images/product/product-01.jpg";

    const garmentImg = await loadImage(viewMockupUrl);
    if (garmentImg) {
      ctx.drawImage(garmentImg, 100, 100, 1000, 1250);
    }

    // 4. Strict Print Area Clipping Mask for Design Layers
    const printArea = viewObj?.printArea || { x: 25, y: 22, width: 50, height: 60 };
    const viewLayers = layersByView[viewObj.id] || [];

    ctx.save();
    const clipX = 100 + (printArea.x / 100) * 1000;
    const clipY = 100 + (printArea.y / 100) * 1250;
    const clipW = (printArea.width / 100) * 1000;
    const clipH = (printArea.height / 100) * 1250;

    ctx.beginPath();
    ctx.roundRect(clipX, clipY, clipW, clipH, 12);
    ctx.clip();

    // Draw all customized layers strictly inside clipped print area
    for (const layer of viewLayers) {
      if (layer.hidden) continue;

      ctx.save();
      const stageX = 100 + (layer.x / 100) * 1000;
      const stageY = 100 + (layer.y / 100) * 1250;

      ctx.translate(stageX, stageY);
      ctx.rotate(((layer.rotation || 0) * Math.PI) / 180);
      ctx.scale(
        (layer.scale || 1) * (layer.flipX ? -1 : 1),
        (layer.scale || 1) * (layer.flipY ? -1 : 1)
      );
      ctx.globalAlpha = (layer.opacity ?? 100) / 100;

      if (layer.type === "text") {
        const fontSize = (layer.fontSize || 24) * 2.0;
        ctx.font = `${layer.bold ? "bold " : ""}${layer.italic ? "italic " : ""}${fontSize}px ${
          layer.fontFamily || "Inter"
        }`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (layer.bgColor) {
          const metrics = ctx.measureText(layer.text || "");
          const textWidth = metrics.width + 40;
          const textHeight = fontSize * 1.4;
          ctx.fillStyle = layer.bgColor;
          ctx.beginPath();
          ctx.roundRect(-textWidth / 2, -textHeight / 2, textWidth, textHeight, 16);
          ctx.fill();
        }

        ctx.fillStyle = layer.color || "#111827";
        ctx.fillText(layer.text || "Custom Text", 0, 0);

        if (layer.strokeWidth) {
          ctx.lineWidth = layer.strokeWidth * 2;
          ctx.strokeStyle = layer.strokeColor || "#000000";
          ctx.strokeText(layer.text || "Custom Text", 0, 0);
        }
      } else if ((layer.type === "image" || layer.type === "clipart") && layer.url) {
        const layerImg = await loadImage(layer.url);
        if (layerImg) {
          const imgWidth = 380;
          const aspect = layerImg.height / layerImg.width || 1;
          const imgHeight = imgWidth * aspect;
          ctx.drawImage(layerImg, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
        }
      }

      ctx.restore();
    }
    ctx.restore(); // Restore clip

    // 5. Clean Watermark
    ctx.fillStyle = env === "studio" ? "rgba(17, 24, 39, 0.6)" : "rgba(255, 255, 255, 0.75)";
    ctx.font = "bold 24px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(
      `${product?.name || "Product"} • ${viewObj.label}`,
      40,
      canvas.height - 40
    );

    // 6. Download PNG
    const dataUrl = canvas.toDataURL("image/png");
    const safeProdName = (product?.name || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const safeViewName = viewObj.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const filename = `Customizer-${safeProdName}-${safeViewName}.png`;

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download Current View PNG
  const handleDownloadCurrentView = async () => {
    setDownloading(true);
    try {
      await renderAndDownloadView(currentViewObj);
      setNotificationText(`✓ 📥 Downloaded "${currentViewObj.label}" (Strict Print Area Clipped)!`);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3500);
    } catch (err) {
      console.error("[Snapshot Error]:", err);
    } finally {
      setDownloading(false);
    }
  };

  // Download All Configured Views at Once
  const handleDownloadAllViews = async () => {
    setDownloading(true);
    try {
      for (let i = 0; i < views.length; i++) {
        await renderAndDownloadView(views[i]);
        await new Promise((res) => setTimeout(res, 400));
      }
      setNotificationText(`✓ 📥 All ${views.length} Views Downloaded (Strictly Clipped)!`);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 4000);
    } catch (err) {
      console.error("[Batch Snapshot Error]:", err);
    } finally {
      setDownloading(false);
    }
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
            Interactive 3D Visualizer & Export
          </h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">
          Rotate 360° • Switch between custom views • Strictly clipped to print area
        </p>

        {/* Dynamic View Switcher Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-2xl max-w-full overflow-x-auto">
          {views.map((v) => {
            const isSelected = selectedViewKey === v.id;
            return (
              <button
                key={v.id}
                onClick={() => {
                  setSelectedViewKey(v.id);
                  if (v.id === "back") setRotation(180);
                  else if (v.id === "front") setRotation(0);
                  else if (v.id.includes("left")) setRotation(90);
                  else if (v.id.includes("right") || v.id.includes("side")) setRotation(-90);
                }}
                className={`py-1 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? "bg-brand-500 text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800"
                }`}
              >
                <span>{v.label}</span>
                {(layersByView[v.id]?.length || 0) > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Lighting Mode Selector */}
        <div className="flex items-center gap-2 mb-3 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
          <button
            onClick={() => setEnv("studio")}
            className={`py-1 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              env === "studio"
                ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-xs"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <FiSun className="w-3.5 h-3.5" /> Studio Clean
          </button>
          <button
            onClick={() => setEnv("dark")}
            className={`py-1 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              env === "dark"
                ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-xs"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <FiMoon className="w-3.5 h-3.5 text-purple-400" /> Dark Mode
          </button>
        </div>

        {/* 3D Interactive Workbench (Zero Floor Shadows) */}
        <div
          onMouseDown={handleMouseDown}
          className={`relative w-full h-[380px] rounded-2xl flex items-center justify-center border overflow-hidden cursor-grab active:cursor-grabbing transition-colors duration-500 ${
            env === "studio"
              ? "bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700"
              : "bg-gray-950 border-gray-800"
          }`}
          style={{ perspective: "1000px" }}
        >
          {/* 3D Rotating Stage Frame - Exact 500x625 (4:5 Aspect) */}
          <div
            style={{
              width: "500px",
              height: "625px",
              transform: `rotateY(${rotation}deg) rotateX(${tilt}deg) scale(0.55)`,
              transformOrigin: "center center",
              transformStyle: "preserve-3d",
            }}
            className="absolute bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/90 dark:border-gray-700/90 overflow-hidden flex items-center justify-center transition-transform duration-75 ease-out select-none"
          >
            {/* Product Mockup Image */}
            <div
              className="absolute inset-0 flex items-center justify-center p-4 transition-colors duration-300 pointer-events-none"
              style={{ backgroundColor: selectedColor?.hex || "#ffffff" }}
            >
              <img
                src={mockupImage}
                alt="3D Garment"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>

            {/* Design Layers Strictly Clipped inside Print Area */}
            <div
              className="absolute inset-0 pointer-events-none select-none z-20 overflow-hidden"
              style={{
                clipPath: `inset(${currentPrintArea.y}% ${Math.max(0, 100 - (currentPrintArea.x + currentPrintArea.width))}% ${Math.max(0, 100 - (currentPrintArea.y + currentPrintArea.height))}% ${currentPrintArea.x}%)`,
              }}
            >
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
                    className="absolute pointer-events-none select-none flex items-center justify-center"
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

                    {/* Layer Type: Image */}
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
                        className="max-w-[180px] max-h-[180px] object-contain pointer-events-none select-none"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Toast Notification */}
          {copiedNotification && (
            <div className="absolute top-4 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-bounce z-50">
              <FiCheck className="w-4 h-4" /> {notificationText}
            </div>
          )}

          {/* Bottom Info Bar */}
          <div className="absolute bottom-3 left-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between z-30">
            <span>
              Angle: <span className="font-mono text-brand-600">{rotation}°</span> ({currentViewObj.label})
            </span>
            <span className="text-brand-600 dark:text-brand-400 font-bold text-[11px]">Strictly Clipped to Print Area</span>
          </div>
        </div>

        {/* Action Buttons: Rotation & Batch Snapshot Downloads */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2.5 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/80">
          {/* Rotation Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setRotation((r) => r - 45)}
              className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
              title="-45°"
            >
              <FiRotateCw className="w-3.5 h-3.5 rotate-180" />
            </button>
            <button
              onClick={() => {
                setRotation(0);
                setTilt(0);
                setSelectedViewKey("front");
              }}
              className="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold cursor-pointer"
            >
              Reset Front (0°)
            </button>
            <button
              onClick={() => setRotation((r) => r + 45)}
              className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
              title="+45°"
            >
              <FiRotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCurrentView}
              disabled={downloading}
              className="py-2 px-3.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <FiCamera className="w-3.5 h-3.5" />
              <span>Download {currentViewObj.label}</span>
            </button>

            <button
              onClick={handleDownloadAllViews}
              disabled={downloading}
              className="py-2 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <FiDownload className="w-3.5 h-3.5" />
              <span>Download All Views ({views.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
