"use client";

import { useSearchParams } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";
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
  FiShoppingBag as FiCartIcon
} from "react-icons/fi";

export default function CustomizerStudio() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const searchParams = useSearchParams();
  const paramProductId = searchParams ? (searchParams.get("product_id") || searchParams.get("id")) : null;
  const paramProductTitle = searchParams ? (searchParams.get("title") || searchParams.get("product_title") || searchParams.get("name")) : null;
  const paramProductImage = searchParams ? (searchParams.get("image") || searchParams.get("product_image") || searchParams.get("img")) : null;
  const paramPrice = searchParams ? searchParams.get("price") : null;
  const paramColor = searchParams ? searchParams.get("color") : null;

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

  // Product state
  const [selectedProductId, setSelectedProductId] = useState("t-shirt");

  const currentProduct = useMemo(() => {
    if (dynamicShopifyProduct) return dynamicShopifyProduct;
    return PRODUCTS_DATA.find((p) => p.id === selectedProductId) || PRODUCTS_DATA[0];
  }, [dynamicShopifyProduct, selectedProductId]);

  const [selectedColor, setSelectedColor] = useState(currentProduct.colors[0]);
  useEffect(() => {
    if (currentProduct?.colors?.[0]) {
      setSelectedColor(currentProduct.colors[0]);
    }
  }, [currentProduct]);

  const [selectedMaterialId, setSelectedMaterialId] = useState(currentProduct.materials[0]?.id);
  const [activeViewId, setActiveViewId] = useState(currentProduct.views[0]?.id || "front");

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
  const [notification, setNotification] = useState(null);

  // History Undo/Redo stack
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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

  // Calculate Price
  const pricingData = useMemo(
    () =>
      calculateCustomizerPrice({
        product: currentProduct,
        selectedMaterialId,
        layersByView,
        activeViewId,
      }),
    [currentProduct, selectedMaterialId, layersByView, activeViewId]
  );

  const triggerToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Layer Modification Functions
  const handleUpdateLayer = (layerId, updates) => {
    setLayersByView((prev) => {
      const viewLayers = prev[activeViewId] || [];
      const updatedLayers = viewLayers.map((l) => (l.id === layerId ? { ...l, ...updates } : l));
      return { ...prev, [activeViewId]: updatedLayers };
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
    setLayersByView((prev) => ({
      ...prev,
      [activeViewId]: [...(prev[activeViewId] || []), newLayer],
    }));
    setSelectedLayerId(newLayer.id);
    triggerToast("New text layer added!");
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
    setLayersByView((prev) => ({
      ...prev,
      [activeViewId]: [...(prev[activeViewId] || []), newLayer],
    }));
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
    setLayersByView((prev) => ({
      ...prev,
      [activeViewId]: [...(prev[activeViewId] || []), newLayer],
    }));
    setSelectedLayerId(newLayer.id);
    triggerToast(`Added ${clipartItem.name} clipart!`);
  };

  const handleLoadTemplate = (tpl) => {
    if (tpl.productType && PRODUCTS_DATA.some((p) => p.id === tpl.productType)) {
      setSelectedProductId(tpl.productType);
    }
    setLayersByView({
      front: tpl.layers.map((l, i) => ({ ...l, id: `tpl-layer-${i}-${Date.now()}` })),
    });
    triggerToast(`Loaded template: "${tpl.title}"`);
  };

  const handleDeleteLayer = (layerId) => {
    setLayersByView((prev) => ({
      ...prev,
      [activeViewId]: (prev[activeViewId] || []).filter((l) => l.id !== layerId),
    }));
    if (selectedLayerId === layerId) setSelectedLayerId(null);
    triggerToast("Layer deleted.");
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
    triggerToast(`High-Res 300DPI Print Metadata & JSON exported! (${result.orderId})`);
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
      {/* Standalone Studio Header Bar */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/customizer-admin"
            className="flex items-center gap-2 py-1.5 px-3 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold rounded-xl border border-gray-700 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 text-brand-400" /> Exit to Admin
          </Link>
          <div className="h-5 w-px bg-gray-800" />
          <div className="flex items-center gap-2">
            <Image src="/images/logo/logo-icon.png" alt="Logo" width={24} height={24} className="w-6 h-6" />
            <span className="font-extrabold text-sm text-white tracking-tight">Shopify Product Customizer Studio</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5">
            <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Live Studio Active
          </span>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 w-full bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-9999 px-4 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs font-bold rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <FiCheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          {notification}
        </div>
      )}

      {/* 1. Left Nav Vertical Icon Bar */}
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
              {PRODUCTS_DATA.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    setSelectedProductId(prod.id);
                    setSelectedColor(prod.colors[0]);
                    setSelectedMaterialId(prod.materials[0]?.id);
                    setActiveViewId(prod.views[0]?.id || "front");
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
                    ${prod.basePrice.toFixed(2)}
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

        {activeToolTab === "upload" && <ImageAiTools onAddImage={handleAddImage} />}

        {activeToolTab === "template" && <TemplateGallery onLoadTemplate={handleLoadTemplate} />}

        {activeToolTab === "clipart" && <ClipartLibrary onAddClipart={handleAddClipart} />}

        {activeToolTab === "layers" && (
          <LayersPanel
            layers={currentLayers}
            selectedLayerId={selectedLayerId}
            onSelectLayer={setSelectedLayerId}
            onUpdateLayer={handleUpdateLayer}
            onDeleteLayer={handleDeleteLayer}
            onReorderLayers={(newLayers) =>
              setLayersByView((prev) => ({ ...prev, [activeViewId]: newLayers }))
            }
          />
        )}
      </div>

      {/* 3. Center Interactive Canvas Workbench */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-100/70 dark:bg-gray-900/70 relative">
        {/* Top Workbench Toolbar */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
              {currentProduct.name}
            </h2>
            <span className="px-2 py-0.5 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 rounded-full text-[10px] font-extrabold uppercase">
              {currentProduct.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGrid((g) => !g)}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 transition-colors ${
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

        {/* Multi View Tab Switcher */}
        <div className="p-4 pb-0">
          <MultiProductView
            product={currentProduct}
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
            activeViewId={activeViewId}
            onViewChange={setActiveViewId}
            onOpen3DModal={() => setIs3DModalOpen(true)}
          />
        </div>

        {/* Canvas Engine */}
        <CanvasEngine
          product={currentProduct}
          selectedColor={selectedColor}
          activeView={activeView}
          layers={currentLayers}
          selectedLayerId={selectedLayerId}
          onSelectLayer={setSelectedLayerId}
          onUpdateLayer={handleUpdateLayer}
          onDeleteLayer={handleDeleteLayer}
          showGrid={showGrid}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
        />
      </div>

      {/* 4. Right Pricing & Checkout Drawer */}
      <div className="w-full lg:w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-4 overflow-y-auto">
        <PricingWidget
          pricingData={pricingData}
          selectedMaterial={currentProduct.materials.find((m) => m.id === selectedMaterialId)}
          onMaterialChange={setSelectedMaterialId}
          materials={currentProduct.materials}
          onAddToCart={handleAddToCart}
          onExportPrintFiles={handleExportFiles}
        />
      </div>

      {/* 3D Preview Visualizer Modal */}
      <ThreeDPreviewModal
        isOpen={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        product={currentProduct}
        selectedColor={selectedColor}
      />
      </div>
    </div>
  );
}
