"use client";

import React, { useState } from "react";
import {
  FiUploadCloud,
  FiCpu,
  FiScissors,
  FiMaximize,
  FiZap,
  FiImage,
  FiSliders,
  FiGrid,
} from "react-icons/fi";

const MOCK_GRAPHIC_PRESETS = [
  { id: "g1", title: "Cyber Skull Vector", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80" },
  { id: "g2", title: "Neon Tiger Art", url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop&q=80" },
  { id: "g3", title: "Abstract Wave", url: "https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=400&auto=format&fit=crop&q=80" },
  { id: "g4", title: "Retro Sunshine", url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&auto=format&fit=crop&q=80" },
];

export default function ImageAiTools({ onAddImage, selectedLayer, onUpdateLayer }) {
  const [activeTab, setActiveTab] = useState("upload");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("vector");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onAddImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAiImage = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const mockSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="100%" height="100%" rx="30" fill="%231e293b"/><circle cx="150" cy="150" r="100" fill="%233b82f6" opacity="0.8"/><path d="M100 180 L150 100 L200 180 Z" fill="%23f59e0b"/><text x="150" y="270" font-family="sans-serif" font-weight="bold" font-size="14" fill="%23ffffff" text-anchor="middle">AI: ${encodeURIComponent(prompt.slice(0, 20))}</text></svg>`;

      setGeneratedImages((prev) => [mockSvg, ...prev]);
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className="p-4 flex flex-col gap-4 max-h-[600px] overflow-y-auto no-scrollbar">
      {/* Sub-tab Switcher */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex-1 py-1.5 px-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "upload"
              ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
          }`}
        >
          <FiUploadCloud className="w-3.5 h-3.5" /> Upload & Presets
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex-1 py-1.5 px-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "ai"
              ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
          }`}
        >
          <FiCpu className="w-3.5 h-3.5" /> AI Generator
        </button>
      </div>

      {/* Selected Image Filter Controls */}
      {selectedLayer && selectedLayer.type === "image" && (
        <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl border border-brand-200 dark:border-brand-900/60 flex flex-col gap-2">
          <span className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider flex items-center gap-1">
            <FiSliders className="w-3.5 h-3.5" /> Selected Image Effects
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onUpdateLayer(selectedLayer.id, { grayscale: !selectedLayer.grayscale })}
              className={`py-1 px-2 text-[11px] font-semibold rounded-lg border transition-colors ${
                selectedLayer.grayscale
                  ? "bg-brand-500 text-white border-brand-500"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
              }`}
            >
              Grayscale
            </button>
            <button
              onClick={() => onUpdateLayer(selectedLayer.id, { sepia: !selectedLayer.sepia })}
              className={`py-1 px-2 text-[11px] font-semibold rounded-lg border transition-colors ${
                selectedLayer.sepia
                  ? "bg-brand-500 text-white border-brand-500"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
              }`}
            >
              Sepia
            </button>
            <button
              onClick={() => onUpdateLayer(selectedLayer.id, { invert: !selectedLayer.invert })}
              className={`py-1 px-2 text-[11px] font-semibold rounded-lg border transition-colors ${
                selectedLayer.invert
                  ? "bg-brand-500 text-white border-brand-500"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
              }`}
            >
              Invert
            </button>
          </div>
        </div>
      )}

      {/* Tab 1: Upload */}
      {activeTab === "upload" && (
        <div className="flex flex-col gap-4">
          <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-brand-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-gray-800/40">
            <FiUploadCloud className="w-9 h-9 text-brand-500 mb-2 animate-bounce" />
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Upload Custom Image
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Supports PNG, JPG, SVG up to 10MB
            </span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Preset Artwork Graphics */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-1.5">
              <FiGrid className="w-3.5 h-3.5 text-brand-500" /> Stock Graphic Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_GRAPHIC_PRESETS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onAddImage(item.url)}
                  className="group relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-brand-500 transition-all shadow-xs"
                >
                  <img src={item.url} alt={item.title} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-brand-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-opacity">
                    Add Graphic
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Prompt Generator */}
      {activeTab === "ai" && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
              Describe your artwork prompt
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Cyberpunk neon tiger logo, clean vector lines, 8k resolution..."
              className="w-full p-2.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-brand-500 focus:outline-none dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
              Art Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full p-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white font-medium"
            >
              <option value="vector">Clean Vector Illustration</option>
              <option value="realistic">Photorealistic Render</option>
              <option value="anime">Anime / Manga Art</option>
              <option value="cyberpunk">Cyberpunk Neon</option>
              <option value="watercolor">Soft Watercolor</option>
            </select>
          </div>

          <button
            onClick={handleGenerateAiImage}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {isGenerating ? (
              <>
                <FiZap className="w-4 h-4 animate-spin" /> Generating AI Artwork...
              </>
            ) : (
              <>
                <FiCpu className="w-4 h-4" /> Generate Art from Prompt
              </>
            )}
          </button>

          {/* Generated Artworks Grid */}
          {generatedImages.length > 0 && (
            <div className="mt-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-2">
                Generated AI Artworks
              </label>
              <div className="grid grid-cols-2 gap-2">
                {generatedImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => onAddImage(imgUrl)}
                    className="relative group border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-brand-500 transition-all"
                  >
                    <img src={imgUrl} alt="AI Artwork" className="w-full h-24 object-cover" />
                    <div className="absolute inset-0 bg-brand-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-opacity">
                      Add to Canvas
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
