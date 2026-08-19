"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { PRODUCTS_DATA, TEMPLATES_DATA, CLIPARTS_DATA } from "@/data/customizerData";
import { calculateCustomizerPrice } from "@/utils/PricingEngine";
import { generateProductionFiles, downloadJsonFile } from "@/utils/ProductionExport";

import CanvasEngine from "./canvas/CanvasEngine";
import TextControls from "./tools/TextControls";
import ImageAiTools from "./tools/ImageAiTools";
import TemplateGallery from "./tools/TemplateGallery";
import ClipartLibrary from "./tools/ClipartLibrary";
import LayersPanel from "./tools/LayersPanel";
import PricingWidget from "./tools/PricingWidget";
import MultiProductView from "./preview/MultiProductView";
import ThreeDPreviewModal from "./preview/ThreeDPreviewModal";
import RosterModal from "./preview/RosterModal";
import ShareModal from "./preview/ShareModal";

import {
  FiSmartphone,
  FiType,
  FiImage,
  FiLayout,
  FiSmile,
  FiLayers,
  FiGrid,
  FiRotateCcw,
  FiRotateCw,
  FiSave,
  FiCheckCircle,
  FiArrowLeft,
  FiShoppingBag,
  FiShare2,
  FiHelpCircle,
  FiX,
} from "react-icons/fi";

export default function CustomizerStudio() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const searchParams = useSearchParams();
  const paramProductId = searchParams ? searchParams.get("product_id") || searchParams.get("id") : null;
  const paramProductTitle = searchParams ? searchParams.get("title") || searchParams.get("product_title") || searchParams.get("name") : null;
  const paramProductImage = searchParams ? searchParams.get("image") || searchParams.get("product_image") || searchParams.get("img") : null;
  const paramPrice = searchParams ? searchParams.get("price") : null;
  const paramColor = searchParams ? searchParams.get("color") : null;
  const paramTemplateId = searchParams ? searchParams.get("templateId") || searchParams.get("template") : null;

  // Dynamic Shopify Product passed via URL parameters
  const dynamicShopifyProduct = useMemo(() => {
    if (paramProductImage || paramProductTitle) {
      return {
        id: paramProductId || "shopify-custom-product",
        name: paramProductTitle || "Shopify Custom Product",
        category: "Shopify Item",
        basePrice: paramPrice ? parseFloat(paramPrice) : 25.0,
        colors: [
          {
            id: paramColor ? paramColor.toLowerCase() : "original",
            name: paramColor ? paramColor : "Original Color",
            hex: "#FFFFFF",
            image: paramProductImage || "/images/product/product-01.jpg",
          },
        ],
        materials: [
          { id: "standard", name: "Standard Material", priceAddon: 0 },
          { id: "premium", name: "Premium Material Upgrade", priceAddon: 5.0 },
        ],
        sizes: ["S", "M", "L", "XL", "2XL"],
        views: [
          { id: "front", label: "Front View", printArea: { x: 25, y: 22, width: 50, height: 60 } },
          { id: "back", label: "Back View", printArea: { x: 25, y: 20, width: 50, height: 65 } },
        ],
      };
    }
    return null;
  }, [paramProductId, paramProductTitle, paramProductImage, paramPrice, paramColor]);

  // Product selection state (MUST be declared before effects)
  const [selectedProductId, setSelectedProductId] = useState(paramProductId || "");

  // Dynamic available products from database
  const [availableProducts, setAvailableProducts] = useState([]);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.products && data.products.length > 0) {
          setAvailableProducts(data.products);
          setSelectedProductId((currentId) => {
            if (currentId && data.products.some((p) => p.id === currentId || p.shopifyProductId === currentId)) {
              return currentId;
            }
            return paramProductId || data.products[0].id;
          });
        }
      })
      .catch((err) => console.warn("[Fetch Products Studio Error]:", err));
  }, [paramProductId]);

  const DEFAULT_PRODUCT_FALLBACK = useMemo(() => ({
    id: "default-product",
    name: "Custom Product",
    category: "Apparel",
    basePrice: 25.0,
    colors: [
      { id: "white", name: "White", hex: "#FFFFFF", image: "/images/product/product-01.jpg", backImage: "/images/product/product-02.jpg" },
    ],
    materials: [
      { id: "standard", name: "Standard Quality", priceAddon: 0 },
    ],
    sizes: ["S", "M", "L", "XL"],
    views: [
      { id: "front", label: "Front View", image: "/images/product/product-01.jpg", printArea: { x: 25, y: 22, width: 50, height: 60 } },
      { id: "back", label: "Back View", image: "/images/product/product-02.jpg", printArea: { x: 25, y: 20, width: 50, height: 65 } },
    ],
  }), []);

  const currentProduct = useMemo(() => {
    // 1. Prioritize saved/configured product in database
    const dbMatch = availableProducts.find(
      (p) =>
        p.id === selectedProductId ||
        p.shopifyProductId === selectedProductId ||
        (paramProductId &&
          (p.id === paramProductId ||
            p.shopifyProductId === paramProductId ||
            p.shopifyProductId === paramProductId.replace("shopify-", "")))
    );
    if (dbMatch) return dbMatch;

    // 2. If dynamic Shopify product passed in URL
    if (dynamicShopifyProduct) return dynamicShopifyProduct;

    // 3. Fallback to first product or default
    return availableProducts[0] || DEFAULT_PRODUCT_FALLBACK;
  }, [dynamicShopifyProduct, selectedProductId, paramProductId, availableProducts, DEFAULT_PRODUCT_FALLBACK]);

  const [selectedColor, setSelectedColor] = useState(
    currentProduct?.colors?.[0] || { id: "white", name: "White", hex: "#FFFFFF", image: "/images/product/product-01.jpg" }
  );

  useEffect(() => {
    if (currentProduct?.colors?.[0]) {
      setSelectedColor(currentProduct.colors[0]);
    }
  }, [currentProduct]);

  const [selectedMaterialId, setSelectedMaterialId] = useState(currentProduct?.materials?.[0]?.id || "standard");
  const [activeViewId, setActiveViewId] = useState(currentProduct?.views?.[0]?.id || "front");
  const [quantity, setQuantity] = useState(1);

  // Layers state per view { front: [], back: [], ... }
  const [layersByView, setLayersByView] = useState({
    front: [
      { id: "layer-initial", type: "text", text: "CUSTOM PRINT", fontSize: 32, fontFamily: "Bebas Neue", color: "#3B82F6", x: 50, y: 40, rotation: 0, scale: 1 },
    ],
  });

  const [selectedLayerId, setSelectedLayerId] = useState("layer-initial");
  const [activeToolTab, setActiveToolTab] = useState("text"); // 'product', 'text', 'upload', 'template', 'clipart', 'layers'
  const [showGrid, setShowGrid] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // History stack for Undo / Redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Save history state on layer modifications
  const saveStateToHistory = (newLayersByView) => {
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, JSON.parse(JSON.stringify(newLayersByView))];
    });
    setHistoryIndex((idx) => idx + 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setLayersByView(JSON.parse(JSON.stringify(history[prevIndex])));
      setHistoryIndex(prevIndex);
      triggerToast("Undo applied");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setLayersByView(JSON.parse(JSON.stringify(history[nextIndex])));
      setHistoryIndex(nextIndex);
      triggerToast("Redo applied");
    }
  };

  const activeView = useMemo(
    () => currentProduct.views.find((v) => v.id === activeViewId) || currentProduct.views[0],
    [currentProduct, activeViewId]
  );

  const currentLayers = useMemo(
    () => layersByView[activeViewId] || [],
    [layersByView, activeViewId]
  );

  const selectedLayer = useMemo(
    () => currentLayers.find((l) => l.id === selectedLayerId),
    [currentLayers, selectedLayerId]
  );

  // Dynamic Pricing Calculation
  const pricingData = useMemo(
    () =>
      calculateCustomizerPrice({
        product: currentProduct,
        selectedMaterialId,
        layersByView,
        activeViewId,
        quantity,
      }),
    [currentProduct, selectedMaterialId, layersByView, activeViewId, quantity]
  );

  const triggerToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Layer Actions
  const handleUpdateLayer = (layerId, updates) => {
    setLayersByView((prev) => {
      const viewLayers = prev[activeViewId] || [];
      const updatedLayers = viewLayers.map((l) => (l.id === layerId ? { ...l, ...updates } : l));
      const newState = { ...prev, [activeViewId]: updatedLayers };
      saveStateToHistory(newState);
      return newState;
    });
  };

  const handleAddText = (textString = "NEW CUSTOM TEXT") => {
    const newLayer = {
      id: `text-${Date.now()}`,
      type: "text",
      text: textString,
      fontSize: 24,
      fontFamily: "Inter, sans-serif",
      color: "#111827",
      x: 50,
      y: 50,
      rotation: 0,
      scale: 1,
    };
    setLayersByView((prev) => {
      const newState = {
        ...prev,
        [activeViewId]: [...(prev[activeViewId] || []), newLayer],
      };
      saveStateToHistory(newState);
      return newState;
    });
    setSelectedLayerId(newLayer.id);
    triggerToast("Text layer added!");
  };

  const handleAddImage = (imageUrl) => {
    const newLayer = {
      id: `img-${Date.now()}`,
      type: "image",
      url: imageUrl,
      x: 50,
      y: 50,
      rotation: 0,
      scale: 1,
    };
    setLayersByView((prev) => {
      const newState = {
        ...prev,
        [activeViewId]: [...(prev[activeViewId] || []), newLayer],
      };
      saveStateToHistory(newState);
      return newState;
    });
    setSelectedLayerId(newLayer.id);
    triggerToast("Image layer added!");
  };

  const handleAddClipart = (clipartItem) => {
    const newLayer = {
      id: `clipart-${Date.now()}`,
      type: "clipart",
      name: clipartItem.name,
      svg: clipartItem.svg,
      x: 50,
      y: 50,
      rotation: 0,
      scale: 1,
    };
    setLayersByView((prev) => {
      const newState = {
        ...prev,
        [activeViewId]: [...(prev[activeViewId] || []), newLayer],
      };
      saveStateToHistory(newState);
      return newState;
    });
    setSelectedLayerId(newLayer.id);
    triggerToast(`Added ${clipartItem.name} clipart!`);
  };

  const handleDuplicateLayer = (targetLayer) => {
    if (!targetLayer) return;
    const duplicated = {
      ...JSON.parse(JSON.stringify(targetLayer)),
      id: `${targetLayer.type}-${Date.now()}`,
      x: Math.min(80, targetLayer.x + 4),
      y: Math.min(80, targetLayer.y + 4),
    };
    setLayersByView((prev) => {
      const newState = {
        ...prev,
        [activeViewId]: [...(prev[activeViewId] || []), duplicated],
      };
      saveStateToHistory(newState);
      return newState;
    });
    setSelectedLayerId(duplicated.id);
    triggerToast("Layer duplicated!");
  };

  const handleLoadTemplate = useCallback((tpl) => {
    if (!tpl || !tpl.layers) return;
    const productTypes = tpl.productTypes || (tpl.productType ? [tpl.productType] : ["all"]);
    if (!productTypes.includes("all") && !productTypes.includes(selectedProductId) && productTypes[0]) {
      if (availableProducts.some((p) => p.id === productTypes[0] || p.shopifyProductId === productTypes[0])) {
        setSelectedProductId(productTypes[0]);
      }
    }
    const newLayers = {
      front: tpl.layers.map((l, i) => ({ ...l, id: `tpl-layer-${i}-${Date.now()}` })),
    };
    setLayersByView(newLayers);
    saveStateToHistory(newLayers);
    triggerToast(`Loaded template: "${tpl.title}"`);
  }, [selectedProductId]);

  // Auto-load template if templateId is passed in URL query parameters
  useEffect(() => {
    if (paramTemplateId) {
      fetch(`/api/templates?id=${paramTemplateId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((tpl) => {
          if (tpl && tpl.layers) {
            handleLoadTemplate(tpl);
            setActiveToolTab("template");
          }
        })
        .catch((err) => console.warn("[Auto-load template error]:", err));
    }
  }, [paramTemplateId, handleLoadTemplate]);

  const handleSaveAsTemplate = () => {
    const newTemplate = {
      id: `user-tpl-${Date.now()}`,
      title: `My Design (${new Date().toLocaleDateString()})`,
      category: "Custom",
      layers: currentLayers,
    };
    try {
      const saved = JSON.parse(localStorage.getItem("customizer_user_templates") || "[]");
      localStorage.setItem("customizer_user_templates", JSON.stringify([newTemplate, ...saved]));
      triggerToast("Saved current design as custom template!");
    } catch (e) {
      triggerToast("Template saved locally!");
    }
  };

  const handleSelectLayer = useCallback((layerId) => {
    setSelectedLayerId(layerId);
    if (!layerId) return;

    const target = currentLayers.find((l) => l.id === layerId);
    if (!target) return;

    if (target.type === "text") {
      setActiveToolTab("text");
    } else if (target.type === "image") {
      setActiveToolTab("upload");
    } else if (target.type === "clipart") {
      setActiveToolTab("clipart");
    }
  }, [currentLayers]);

  const handleDeleteLayer = (layerId) => {
    setLayersByView((prev) => {
      const newState = {
        ...prev,
        [activeViewId]: (prev[activeViewId] || []).filter((l) => l.id !== layerId),
      };
      saveStateToHistory(newState);
      return newState;
    });
    if (selectedLayerId === layerId) setSelectedLayerId(null);
    triggerToast("Layer deleted.");
  };

  const handleClearAllLayers = () => {
    setLayersByView((prev) => {
      const newState = { ...prev, [activeViewId]: [] };
      saveStateToHistory(newState);
      return newState;
    });
    setSelectedLayerId(null);
    triggerToast("Cleared all layers.");
  };

  const handleExportFiles = () => {
    const result = generateProductionFiles({
      product: currentProduct,
      selectedColor,
      selectedMaterial: currentProduct.materials.find((m) => m.id === selectedMaterialId),
      layersByView,
      activeViewId,
    });
    downloadJsonFile(result.printMetadata, `${result.orderId}_PrintSpecs.json`);
    triggerToast(`High-Res 300DPI Metadata & JSON exported! (${result.orderId})`);
  };

  const handleAddToCart = () => {
    triggerToast(
      `Added ${quantity}x customized ${currentProduct.name} to Shopify Cart! Total: $${pricingData.totalPrice.toFixed(
        2
      )}`
    );
  };

  if (!mounted) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-900 text-white font-bold text-sm gap-3">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Interactive Studio...</span>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-900 overflow-hidden select-none">
      {/* Top Header Navigation Bar */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            className="flex items-center gap-2 py-1.5 px-3 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-extrabold rounded-xl border border-gray-700 transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4 text-brand-400" /> Exit Studio
          </button>
          <div className="h-5 w-px bg-gray-800" />
          <div className="flex items-center gap-2">
            <Image src="/images/logo/logo-icon.png" alt="Logo" width={24} height={24} className="w-6 h-6" />
            <span className="font-black text-sm text-white tracking-tight hidden sm:inline">
              Shopify Product Customizer Studio
            </span>
          </div>
        </div>

        {/* Action Controls: Undo/Redo/Help */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-xl border border-gray-700">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 text-gray-300 hover:text-white disabled:opacity-30 rounded-lg transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <FiRotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 text-gray-300 hover:text-white disabled:opacity-30 rounded-lg transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <FiRotateCw className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl border border-gray-700 text-xs transition-colors"
            title="Keyboard Shortcuts"
          >
            <FiHelpCircle className="w-4 h-4" />
          </button>

          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full items-center gap-1.5 hidden md:flex">
            <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Live Studio Active
          </span>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 w-full bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
        {/* Toast Notification */}
        {notification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-9999 px-4 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs font-extrabold rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
            <FiCheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            {notification}
          </div>
        )}

        {/* 1. Left Nav Vertical Icon Sidebar Bar */}
        <div className="flex lg:flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-2 gap-2 z-20 justify-center lg:justify-start">
          {[
            { id: "product", label: "Product", icon: FiSmartphone },
            { id: "text", label: "Text", icon: FiType },
            { id: "upload", label: "Image / AI", icon: FiImage },
            { id: "template", label: "Templates", icon: FiLayout },
            { id: "clipart", label: "Cliparts", icon: FiSmile },
            { id: "layers", label: "Layers", icon: FiLayers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeToolTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveToolTab(tab.id)}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 2. Secondary Left Drawer Panel */}
        <div className="w-full lg:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto flex flex-col z-10">
          {activeToolTab === "product" && (
            <div className="p-4 flex flex-col gap-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Select Product Catalog</h3>
              <div className="flex flex-col gap-2.5">
                {availableProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setSelectedProductId(prod.id);
                      if (prod.colors?.[0]) setSelectedColor(prod.colors[0]);
                      if (prod.materials?.[0]) setSelectedMaterialId(prod.materials[0]?.id);
                      if (prod.views?.[0]) setActiveViewId(prod.views[0]?.id || "front");
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedProductId === prod.id
                        ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 shadow-xs"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-100">{prod.name}</span>
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">{prod.category}</span>
                    </div>
                    <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400">
                      ${prod.basePrice?.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeToolTab === "text" && (
            <TextControls
              selectedLayer={selectedLayer}
              onAddText={handleAddText}
              onUpdateLayer={handleUpdateLayer}
            />
          )}

          {activeToolTab === "upload" && (
            <ImageAiTools
              onAddImage={handleAddImage}
              selectedLayer={selectedLayer}
              onUpdateLayer={handleUpdateLayer}
            />
          )}

          {activeToolTab === "template" && (
            <TemplateGallery
              onLoadTemplate={handleLoadTemplate}
              onSaveAsTemplate={handleSaveAsTemplate}
              selectedProductId={selectedProductId}
              selectedProductName={currentProduct?.name || "Selected Product"}
            />
          )}

          {activeToolTab === "clipart" && (
            <ClipartLibrary
              onAddClipart={handleAddClipart}
              selectedLayer={selectedLayer}
              onUpdateLayer={handleUpdateLayer}
            />
          )}

          {activeToolTab === "layers" && (
            <LayersPanel
              layers={currentLayers}
              selectedLayerId={selectedLayerId}
              onSelectLayer={handleSelectLayer}
              onUpdateLayer={handleUpdateLayer}
              onDeleteLayer={handleDeleteLayer}
              onDuplicateLayer={handleDuplicateLayer}
              onReorderLayers={(newLayers) =>
                setLayersByView((prev) => ({ ...prev, [activeViewId]: newLayers }))
              }
              onClearAllLayers={handleClearAllLayers}
            />
          )}
        </div>

        {/* 3. Center Interactive Canvas Workbench */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-100/70 dark:bg-gray-900/70 relative overflow-hidden h-full">
          {/* Top Workbench Toolbar */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-6 py-2.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                {currentProduct.name}
              </h2>
              <span className="px-2.5 py-0.5 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 rounded-full text-[10px] font-extrabold uppercase">
                {currentProduct.category}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGrid((g) => !g)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  showGrid
                    ? "bg-brand-50 dark:bg-brand-950 border-brand-300 text-brand-600 dark:text-brand-400"
                    : "bg-white dark:bg-gray-700 border-gray-200 text-gray-600 dark:text-gray-300"
                }`}
                title="Toggle Grid Lines"
              >
                <FiGrid className="w-4 h-4" /> Grid
              </button>
            </div>
          </div>

          {/* Interactive Canvas Engine - Takes Full Available Screen Space */}
          <div className="flex-1 min-h-0 relative flex items-center justify-center w-full overflow-hidden p-2">
            <CanvasEngine
              product={currentProduct}
              selectedColor={selectedColor}
              activeView={activeView}
              layers={currentLayers}
              selectedLayerId={selectedLayerId}
              onSelectLayer={handleSelectLayer}
              onUpdateLayer={handleUpdateLayer}
              onDeleteLayer={handleDeleteLayer}
              onDuplicateLayer={handleDuplicateLayer}
              showGrid={showGrid}
              zoomLevel={zoomLevel}
              setZoomLevel={setZoomLevel}
            />
          </div>

          {/* Multi View Tab Switcher & Base Color Selector (Placed at Bottom) */}
          <div className="px-4 py-2.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shrink-0 z-20">
            <MultiProductView
              product={currentProduct}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
              activeViewId={activeViewId}
              onViewChange={setActiveViewId}
              onOpen3DModal={() => setIs3DModalOpen(true)}
            />
          </div>
        </div>

        {/* 4. Right Pricing & Checkout Drawer */}
        <div className="w-full lg:w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-4 overflow-y-auto">
          <PricingWidget
            pricingData={pricingData}
            selectedMaterial={currentProduct.materials.find((m) => m.id === selectedMaterialId)}
            onMaterialChange={setSelectedMaterialId}
            materials={currentProduct.materials}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onAddToCart={handleAddToCart}
            onExportPrintFiles={handleExportFiles}
            onOpenTeamPersonalization={() => setIsRosterModalOpen(true)}
            onShareDesign={() => setIsShareModalOpen(true)}
          />
        </div>

        {/* Modals */}
        <ThreeDPreviewModal
          isOpen={is3DModalOpen}
          onClose={() => setIs3DModalOpen(false)}
          product={currentProduct}
          selectedColor={selectedColor}
          layersByView={layersByView}
          activeViewId={activeViewId}
        />

        <RosterModal
          isOpen={isRosterModalOpen}
          onClose={() => setIsRosterModalOpen(false)}
          onApplyRoster={(roster) => {
            setQuantity(roster.length || 1);
            triggerToast(`Applied team roster for ${roster.length} items!`);
          }}
        />

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          product={currentProduct}
          layersCount={currentLayers.length}
        />

        {/* Keyboard Shortcuts Help Modal */}
        {isHelpModalOpen && (
          <div className="fixed inset-0 z-99999 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative flex flex-col border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full"
              >
                <FiX className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-extrabold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                <FiHelpCircle className="w-5 h-5 text-brand-500" /> Keyboard Shortcuts Guide
              </h3>

              <div className="flex flex-col gap-2.5 text-xs text-gray-700 dark:text-gray-200">
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <span className="font-medium">Delete Active Layer</span>
                  <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 font-mono rounded">Delete / Backspace</kbd>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <span className="font-medium">Duplicate Layer</span>
                  <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 font-mono rounded">Ctrl + D</kbd>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <span className="font-medium">Nudge Layer Position</span>
                  <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 font-mono rounded">Arrow Keys</kbd>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <span className="font-medium">Fast Nudge (5%)</span>
                  <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 font-mono rounded">Shift + Arrow Keys</kbd>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
