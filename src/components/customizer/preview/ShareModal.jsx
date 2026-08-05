"use client";

import React, { useState } from "react";
import { FiShare2, FiX, FiCopy, FiCheck } from "react-icons/fi";

export default function ShareModal({ isOpen, onClose, product, layersCount }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-99999 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative flex flex-col border border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full"
        >
          <FiX className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-extrabold text-gray-800 dark:text-white flex items-center gap-2 mb-1">
          <FiShare2 className="w-5 h-5 text-brand-500" /> Share Custom Artwork Design
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          Share this unique custom design for {product?.name || "Product"} with friends or teammates!
        </p>

        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 mb-4">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 text-xs bg-transparent border-none focus:outline-none dark:text-gray-300 truncate font-mono"
          />
          <button
            onClick={handleCopy}
            className="py-1.5 px-3 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm transition-all"
          >
            {copied ? <FiCheck className="w-4 h-4 text-white" /> : <FiCopy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
