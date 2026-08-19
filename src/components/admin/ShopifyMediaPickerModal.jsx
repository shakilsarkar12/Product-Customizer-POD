"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FiImage,
  FiRefreshCw,
  FiSearch,
  FiCheck,
  FiX,
  FiExternalLink,
  FiUploadCloud,
} from "react-icons/fi";

export default function ShopifyMediaPickerModal({
  isOpen,
  onClose,
  onSelectImage,
  title = "Select Image from Shopify Files",
}) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUrl, setSelectedUrl] = useState(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shopify/files", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (err) {
      console.warn("[Fetch Shopify Files Modal Error]:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
      setSelectedUrl(null);
    }
  }, [isOpen, fetchFiles]);

  if (!isOpen) return null;

  const filteredFiles = files.filter(
    (f) =>
      (f.altText && f.altText.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.url && f.url.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleConfirm = (url) => {
    if (url) {
      onSelectImage(url);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-3xl w-full max-h-[85vh] shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-500">
              <FiImage className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Connected Shopify Store Media Library (Content &rarr; Files)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchFiles}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              title="Refresh Shopify Files"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files by name or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 shrink-0">
            {filteredFiles.length} file{filteredFiles.length === 1 ? "" : "s"} found
          </span>
        </div>

        {/* Media Grid View */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-square rounded-2xl bg-gray-100 dark:bg-gray-700/50 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mx-auto mb-2 text-gray-400">
                <FiImage className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-gray-800 dark:text-white">
                No Shopify Files Found
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                Upload mockup images in your <strong>Shopify Admin &rarr; Content &rarr; Files</strong> or sync product images to pick them here.
              </p>
            </div>
          )}

          {!loading && filteredFiles.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredFiles.map((file) => {
                const isSelected = selectedUrl === file.url;
                return (
                  <div
                    key={file.id || file.url}
                    onClick={() => setSelectedUrl(file.url)}
                    onDoubleClick={() => handleConfirm(file.url)}
                    className={`group relative aspect-square rounded-2xl border-2 overflow-hidden cursor-pointer transition-all bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-2 ${
                      isSelected
                        ? "border-brand-500 shadow-md ring-2 ring-brand-500/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-brand-400"
                    }`}
                  >
                    <img
                      src={file.url}
                      alt={file.altText || "Shopify Asset"}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />

                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-md">
                        <FiCheck className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    {/* Image Meta Bar */}
                    <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                      <span className="truncate max-w-[100px]">{file.altText || "Image"}</span>
                      {file.width && <span>{file.width}px</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 flex items-center justify-between">
          <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-xs">
            {selectedUrl ? `Selected: ${selectedUrl.substring(0, 40)}...` : "Select an image to apply"}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleConfirm(selectedUrl)}
              disabled={!selectedUrl}
              className="px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <FiCheck className="w-3.5 h-3.5" /> Use Selected Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
