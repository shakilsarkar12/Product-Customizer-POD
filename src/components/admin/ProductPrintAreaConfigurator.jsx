"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FiSliders,
  FiPlus,
  FiCheck,
  FiTrash2,
  FiExternalLink,
  FiImage,
  FiLayers,
  FiMaximize2,
  FiCheckCircle,
  FiSmartphone,
  FiBox,
  FiRefreshCw,
  FiShoppingBag,
} from "react-icons/fi";
import Link from "next/link";
import ShopifyMediaPickerModal from "./ShopifyMediaPickerModal";

export default function ProductPrintAreaConfigurator() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [activeViewKey, setActiveViewKey] = useState("front"); // "front" | "back" | ...
  const [saving, setSaving] = useState(false);
  const [syncingShopify, setSyncingShopify] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    category: "Apparel",
    basePrice: 25.0,
    frontImage: "/images/product/product-01.jpg",
    backImage: "/images/product/product-02.jpg",
  });

  // Shopify Media Picker State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState("current-view"); // 'current-view' | 'new-front' | 'new-back'

  const handleSelectShopifyImage = (url) => {
    if (mediaPickerTarget === "current-view") {
      handleUpdateViewImage(url);
      showToast("Updated mockup image from Shopify Files!");
    } else if (mediaPickerTarget === "new-front") {
      setNewProductForm((prev) => ({ ...prev, frontImage: url }));
      showToast("Front mockup selected from Shopify Files!");
    } else if (mediaPickerTarget === "new-back") {
      setNewProductForm((prev) => ({ ...prev, backImage: url }));
      showToast("Back mockup selected from Shopify Files!");
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync Products from Shopify Store
  const handleSyncShopify = async () => {
    setSyncingShopify(true);
    try {
      const res = await fetch("/api/products?sync=true", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        showToast(`Synced ${data.syncedCount || 0} product(s) from your Shopify store!`);
        await fetchProducts();
      } else {
        showToast(data.error || "Shopify sync failed.");
      }
    } catch (err) {
      console.error("[Sync Shopify Error]:", err);
      showToast("Shopify sync failed: " + err.message);
    } finally {
      setSyncingShopify(false);
    }
  };

  // Fetch Products from API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const prods = data.products || [];
        setProducts(prods);
        if (prods.length > 0 && !selectedProductId) {
          setSelectedProductId(prods[0].id);
        }
      }
    } catch (err) {
      console.error("[Fetch Products Error]:", err);
      showToast("Error loading products.");
    } finally {
      setLoading(false);
    }
  }, [selectedProductId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Helper to get active view config
  const currentView = currentProduct?.views?.find((v) => v.id === activeViewKey) || currentProduct?.views?.[0] || {
    id: "front",
    label: "Front View",
    image: "/images/product/product-01.jpg",
    printArea: { x: 25, y: 22, width: 50, height: 60 },
  };

  const printArea = currentView.printArea || { x: 25, y: 22, width: 50, height: 60 };

  // Update Print Area coordinates for current view
  const handleUpdatePrintArea = (field, value) => {
    if (!currentProduct) return;
    const num = Number(value);

    const updatedViews = currentProduct.views.map((v) => {
      if (v.id === (currentView.id || activeViewKey)) {
        return {
          ...v,
          printArea: {
            ...v.printArea,
            [field]: num,
          },
        };
      }
      return v;
    });

    setProducts((prev) =>
      prev.map((p) => (p.id === currentProduct.id ? { ...p, views: updatedViews } : p))
    );
  };

  // Update View Image URL
  const handleUpdateViewImage = (imgUrl) => {
    if (!currentProduct) return;

    const updatedViews = currentProduct.views.map((v) => {
      if (v.id === (currentView.id || activeViewKey)) {
        return {
          ...v,
          image: imgUrl,
        };
      }
      return v;
    });

    // Also update matching color image if primary color
    const updatedColors = currentProduct.colors?.map((c, i) => {
      if (i === 0) {
        return {
          ...c,
          image: activeViewKey === "front" ? imgUrl : c.image,
          backImage: activeViewKey === "back" ? imgUrl : c.backImage,
        };
      }
      return c;
    });

    setProducts((prev) =>
      prev.map((p) => (p.id === currentProduct.id ? { ...p, views: updatedViews, colors: updatedColors } : p))
    );
  };

  // Quick Preset Positions
  const applyPresetPosition = (preset) => {
    if (preset === "center-chest") {
      handleUpdatePrintArea("x", 30);
      handleUpdatePrintArea("y", 22);
      handleUpdatePrintArea("width", 40);
      handleUpdatePrintArea("height", 35);
    } else if (preset === "full-front") {
      handleUpdatePrintArea("x", 22);
      handleUpdatePrintArea("y", 18);
      handleUpdatePrintArea("width", 56);
      handleUpdatePrintArea("height", 65);
    } else if (preset === "pocket-left") {
      handleUpdatePrintArea("x", 55);
      handleUpdatePrintArea("y", 24);
      handleUpdatePrintArea("width", 22);
      handleUpdatePrintArea("height", 22);
    } else if (preset === "back-full") {
      handleUpdatePrintArea("x", 20);
      handleUpdatePrintArea("y", 18);
      handleUpdatePrintArea("width", 60);
      handleUpdatePrintArea("height", 68);
    }
  };

  // Save Product to DB
  const handleSaveProduct = async () => {
    if (!currentProduct) return;
    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentProduct),
      });
      if (res.ok) {
        showToast(`Saved print area and images for "${currentProduct.name}"!`);
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      console.error("[Save Product Error]:", err);
      showToast("Failed to save product settings.");
    } finally {
      setSaving(false);
    }
  };

  // Create New Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProductForm.name.trim()) return;

    try {
      const payload = {
        name: newProductForm.name.trim(),
        category: newProductForm.category,
        basePrice: Number(newProductForm.basePrice) || 25,
        frontImage: newProductForm.frontImage || "/images/product/product-01.jpg",
        backImage: newProductForm.backImage || "/images/product/product-02.jpg",
        views: [
          {
            id: "front",
            label: "Front View",
            image: newProductForm.frontImage || "/images/product/product-01.jpg",
            printArea: { x: 25, y: 22, width: 50, height: 60 },
          },
          {
            id: "back",
            label: "Back View",
            image: newProductForm.backImage || "/images/product/product-02.jpg",
            printArea: { x: 25, y: 20, width: 50, height: 65 },
          },
        ],
        colors: [
          { id: "white", name: "White", hex: "#FFFFFF", image: newProductForm.frontImage },
          { id: "black", name: "Black", hex: "#111827", image: newProductForm.backImage },
        ],
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`Created new product "${newProductForm.name}"!`);
        setIsAddModalOpen(false);
        await fetchProducts();
        setSelectedProductId(data.product.id);
      }
    } catch (err) {
      console.error("[Create Product Error]:", err);
      showToast("Failed to create product.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <FiCheckCircle className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
            <FiSliders className="w-6 h-6 text-brand-500" /> Product & Print Area Configurator
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Configure custom Front Mockup Image, Back Mockup Image, and precise design print boundaries (X, Y, Width, Height) for each product in your store.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleSyncShopify}
            disabled={syncingShopify}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Import/sync all products directly from connected Shopify store"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${syncingShopify ? "animate-spin" : ""}`} />
            {syncingShopify ? "Syncing Shopify..." : "Sync from Shopify"}
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4" /> Add Product
          </button>
          <button
            onClick={handleSaveProduct}
            disabled={saving}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <FiCheck className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Product Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {products.map((prod) => (
          <button
            key={prod.id}
            onClick={() => {
              setSelectedProductId(prod.id);
              setActiveViewKey(prod.views?.[0]?.id || "front");
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 cursor-pointer ${
              selectedProductId === prod.id
                ? "bg-brand-500 text-white border-brand-500 shadow-md scale-102"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50"
            }`}
          >
            {prod.isShopifySync ? (
              <FiShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <FiSmartphone className="w-3.5 h-3.5" />
            )}
            <span>{prod.name}</span>
            {prod.isShopifySync && (
              <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold px-1.5 py-0.2 rounded-md uppercase">
                Shopify
              </span>
            )}
            <span className="text-[10px] opacity-75 font-mono">(${prod.basePrice?.toFixed(2)})</span>
          </button>
        ))}
      </div>

      {loading || !currentProduct ? (
        <div className="h-96 rounded-3xl bg-white dark:bg-gray-800 animate-pulse flex items-center justify-center">
          <span className="text-xs text-gray-400 font-bold">Loading product settings...</span>
        </div>
      ) : (
        /* Main Two-Column Visual Studio Editor */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Visual Print Area Interactive Canvas */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-between">
            {/* View Switcher Pills */}
            <div className="w-full flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase">View:</span>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                  {currentProduct.views?.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setActiveViewKey(v.id)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        (currentView.id || activeViewKey) === v.id
                          ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-xs"
                          : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <Link
                href={`/customizer?product_id=${currentProduct.id}`}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <FiExternalLink className="w-3.5 h-3.5" /> Test in Studio
              </Link>
            </div>

            {/* Interactive Visual Preview Box */}
            <div className="relative w-full max-w-[420px] aspect-[4/5] bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center p-4 shadow-inner">
              {/* Product Mockup Image */}
              <img
                src={currentView.image || "/images/product/product-01.jpg"}
                alt={currentProduct.name}
                className="w-full h-full object-contain pointer-events-none select-none transition-all"
                onError={(e) => (e.target.src = "/images/product/product-01.jpg")}
              />

              {/* Dotted Grid Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              />

              {/* Dynamic Print Area Boundary Box */}
              <div
                className="absolute border-2 border-dashed border-brand-500 dark:border-brand-400 bg-brand-500/10 rounded-xl transition-all flex flex-col items-center justify-center p-1"
                style={{
                  left: `${printArea.x}%`,
                  top: `${printArea.y}%`,
                  width: `${printArea.width}%`,
                  height: `${printArea.height}%`,
                }}
              >
                <span className="bg-brand-600 text-white text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-md shadow-sm">
                  {currentView.label} Print Area
                </span>
                <span className="text-[10px] font-mono font-bold text-brand-700 dark:text-brand-300 mt-1">
                  {printArea.width}% × {printArea.height}%
                </span>
              </div>
            </div>

            {/* Quick Position Presets */}
            <div className="w-full pt-4 mt-4 border-t border-gray-100 dark:border-gray-700/60 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Quick Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPresetPosition("center-chest")}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                >
                  Center Chest
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetPosition("full-front")}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                >
                  Full Print
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetPosition("pocket-left")}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                >
                  Pocket Print
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetPosition("back-full")}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                >
                  Full Back
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Controls, Image URLs & Coordinate Sliders */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* View Mockup Image URL */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FiImage className="w-4 h-4 text-brand-500" /> {currentView.label} Mockup Image
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setMediaPickerTarget("current-view");
                    setIsMediaPickerOpen(true);
                  }}
                  className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-600 dark:text-brand-300 rounded-lg text-[11px] font-bold border border-brand-200 dark:border-brand-900 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <FiImage className="w-3 h-3" /> Pick from Shopify Files
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                  Image URL / File Path
                </label>
                <input
                  type="text"
                  value={currentView.image || ""}
                  onChange={(e) => handleUpdateViewImage(e.target.value)}
                  placeholder="e.g. /images/product/product-01.jpg or CDN URL"
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Print Area Dimension & Position Sliders */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-2">
                <h3 className="text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FiMaximize2 className="w-4 h-4 text-brand-500" /> Print Area Positioning
                </h3>
                <span className="text-[10px] font-bold text-brand-600 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-full">
                  {currentView.label}
                </span>
              </div>

              {/* Horizontal Position X */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>Horizontal Position (X Offset)</span>
                  <span className="font-mono text-brand-600">{printArea.x}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={printArea.x}
                  onChange={(e) => handleUpdatePrintArea("x", e.target.value)}
                  className="w-full accent-brand-500"
                />
              </div>

              {/* Vertical Position Y */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>Vertical Position (Y Offset)</span>
                  <span className="font-mono text-brand-600">{printArea.y}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={printArea.y}
                  onChange={(e) => handleUpdatePrintArea("y", e.target.value)}
                  className="w-full accent-brand-500"
                />
              </div>

              {/* Print Area Width */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>Print Area Width</span>
                  <span className="font-mono text-brand-600">{printArea.width}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="85"
                  value={printArea.width}
                  onChange={(e) => handleUpdatePrintArea("width", e.target.value)}
                  className="w-full accent-brand-500"
                />
              </div>

              {/* Print Area Height */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>Print Area Height</span>
                  <span className="font-mono text-brand-600">{printArea.height}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="85"
                  value={printArea.height}
                  onChange={(e) => handleUpdatePrintArea("height", e.target.value)}
                  className="w-full accent-brand-500"
                />
              </div>
            </div>

            {/* Product Meta & Price Info */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <FiBox className="w-4 h-4 text-brand-500" /> General Details & Base Price
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    value={currentProduct.name || ""}
                    onChange={(e) =>
                      setProducts((prev) =>
                        prev.map((p) => (p.id === currentProduct.id ? { ...p, name: e.target.value } : p))
                      )
                    }
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-1">
                    Base Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={currentProduct.basePrice || 20}
                    onChange={(e) =>
                      setProducts((prev) =>
                        prev.map((p) =>
                          p.id === currentProduct.id ? { ...p, basePrice: parseFloat(e.target.value) || 0 } : p
                        )
                      )
                    }
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-700 p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Add New Store Product</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
              Add a new customizable product with front and back mockup views.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Oversized Hoodie"
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                  >
                    <option value="Apparel">Apparel</option>
                    <option value="Drinkware">Drinkware</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Bags">Bags</option>
                    <option value="Headwear">Headwear</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Base Price ($)
                  </label>
                  <input
                    type="number"
                    value={newProductForm.basePrice}
                    onChange={(e) => setNewProductForm({ ...newProductForm, basePrice: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Front Mockup Image URL
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaPickerTarget("new-front");
                      setIsMediaPickerOpen(true);
                    }}
                    className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FiImage className="w-3 h-3" /> Pick from Shopify Files
                  </button>
                </div>
                <input
                  type="text"
                  value={newProductForm.frontImage}
                  onChange={(e) => setNewProductForm({ ...newProductForm, frontImage: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Back Mockup Image URL
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaPickerTarget("new-back");
                      setIsMediaPickerOpen(true);
                    }}
                    className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FiImage className="w-3 h-3" /> Pick from Shopify Files
                  </button>
                </div>
                <input
                  type="text"
                  value={newProductForm.backImage}
                  onChange={(e) => setNewProductForm({ ...newProductForm, backImage: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shopify Media Picker Modal */}
      <ShopifyMediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectImage={handleSelectShopifyImage}
      />
    </div>
  );
}
