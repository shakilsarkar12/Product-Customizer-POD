"use client";

import React, { useState } from "react";
import { FiBox, FiX, FiRefreshCw, FiSun, FiMoon, FiCamera, FiCheck } from "react-icons/fi";

export default function ThreeDPreviewModal({ isOpen, onClose, product, selectedColor }) {
  const [rotation, setRotation] = useState(0);
  const [env, setEnv] = useState("studio"); // 'studio', 'dark', 'warm'
  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!isOpen) return null;

  const handleSnapshot = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-99999 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative flex flex-col items-center border border-gray-200 dark:border-gray-700 animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-extrabold text-gray-800 dark:text-white flex items-center gap-2 mb-1">
          <FiBox className="w-5 h-5 text-brand-500" /> Interactive 3D Realtime Visualizer
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 text-center">
          Rotate 360° to inspect details under different studio environment lightings
        </p>

        {/* Lighting Preset Selector */}
        <div className="flex items-center gap-2 mb-4 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
          <button
            onClick={() => setEnv("studio")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              env === "studio"
                ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-xs"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <FiSun className="w-3.5 h-3.5" /> Studio White
          </button>
          <button
            onClick={() => setEnv("dark")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              env === "dark"
                ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-xs"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <FiMoon className="w-3.5 h-3.5 text-purple-400" /> Dark Cyberpunk
          </button>
        </div>

        {/* 3D Workbench Render Container */}
        <div
          className={`relative w-full h-80 rounded-2xl flex items-center justify-center border shadow-inner overflow-hidden transition-colors duration-500 ${
            env === "studio"
              ? "bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 border-gray-200 dark:border-gray-700"
              : "bg-gradient-to-b from-slate-950 via-purple-950 to-slate-900 border-purple-900/50"
          }`}
        >
          <img
            src={selectedColor?.image || "/images/product/product-01.jpg"}
            alt="3D Product Mockup"
            style={{ transform: `rotateY(${rotation}deg)` }}
            className="w-64 h-64 object-contain transition-transform duration-300 ease-out drop-shadow-2xl"
          />

          {/* Perspective Floor Shadow */}
          <div className="absolute bottom-6 w-48 h-6 bg-black/20 dark:bg-black/60 rounded-full blur-md" />

          {/* Toast Notification inside modal */}
          {copiedNotification && (
            <div className="absolute top-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
              <FiCheck className="w-4 h-4" /> High-Res 3D Snapshot Saved!
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-2 rounded-xl text-center text-xs font-bold text-gray-700 dark:text-gray-200 shadow-xs flex items-center justify-between">
            <span>Angle: {rotation}°</span>
            <button
              onClick={handleSnapshot}
              className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <FiCamera className="w-3.5 h-3.5" /> Snapshot 3D
            </button>
          </div>
        </div>

        {/* Rotation Action Buttons */}
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={() => setRotation((r) => r - 45)}
            className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 transition-colors"
          >
            <FiRefreshCw className="w-3.5 h-3.5" /> Rotate -45°
          </button>
          <button
            onClick={() => setRotation(0)}
            className="py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-extrabold shadow-md active:scale-95 transition-all"
          >
            Reset Angle
          </button>
          <button
            onClick={() => setRotation((r) => r + 45)}
            className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 transition-colors"
          >
            <FiRefreshCw className="w-3.5 h-3.5" /> Rotate +45°
          </button>
        </div>
      </div>
    </div>
  );
}
