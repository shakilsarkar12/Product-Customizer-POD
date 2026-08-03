"use client";

import React, { useState } from "react";
import { FiBox, FiX, FiRefreshCw } from "react-icons/fi";

export default function ThreeDPreviewModal({ isOpen, onClose, product, selectedColor }) {
  const [rotation, setRotation] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative flex flex-col items-center border border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full"
        >
          <FiX className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-1">
          <FiBox className="w-5 h-5 text-brand-500" /> Interactive 3D Mockup Visualizer
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Drag horizontally or click rotate to inspect 360° product view
        </p>

        {/* 3D Simulation Workbench */}
        <div className="relative w-72 h-80 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-inner overflow-hidden">
          <img
            src={selectedColor?.image || "/images/product/product-01.jpg"}
            alt="3D Product Mockup"
            style={{ transform: `rotateY(${rotation}deg)` }}
            className="w-64 h-64 object-contain transition-transform duration-500 ease-out"
          />

          <div className="absolute bottom-3 left-3 right-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-2 rounded-xl text-center text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-xs">
            3D View Angle: {rotation}°
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => setRotation((r) => r - 45)}
            className="py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5"
          >
            <FiRefreshCw className="w-3.5 h-3.5" /> Rotate Left
          </button>
          <button
            onClick={() => setRotation(0)}
            className="py-2 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md"
          >
            Reset Angle
          </button>
          <button
            onClick={() => setRotation((r) => r + 45)}
            className="py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5"
          >
            <FiRefreshCw className="w-3.5 h-3.5" /> Rotate Right
          </button>
        </div>
      </div>
    </div>
  );
}
