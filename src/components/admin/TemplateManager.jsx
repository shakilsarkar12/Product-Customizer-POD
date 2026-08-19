"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FiLayout,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiCheck,
  FiCopy,
  FiSearch,
  FiExternalLink,
  FiX,
  FiFilter,
  FiLayers,
  FiTag,
  FiCheckCircle,
  FiSliders,
  FiImage,
} from "react-icons/fi";
import Link from "next/link";
import { CLIPARTS_DATA, FONTS_LIST } from "@/data/customizerData";
import ProductPrintAreaConfigurator from "./ProductPrintAreaConfigurator";
import ShopifyMediaPickerModal from "./ShopifyMediaPickerModal";

const AVAILABLE_CATEGORIES = [
  "All",
  "Streetwear",
  "Vintage",
  "Sports",
  "Wedding",
  "Birthday",
  "Business",
  "Holiday",
  "Eid",
  "Custom",
];

export default function TemplateManager() {
  const [activeAdminTab, setActiveAdminTab] = useState("templates"); // "templates" | "products-config"
  const [templates, setTemplates] = useState([]);
  const [dynamicProducts, setDynamicProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [productFilter, setProductFilter] = useState("All");

  // Modal State for Create & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null); // null = Create, string = Edit
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "Streetwear",
    productTypes: ["all"],
    thumbnail: "/images/product/product-01.jpg",
    primaryText: "NEW CUSTOM DESIGN",
    fontFamily: "Outfit",
    fontSize: 26,
    textColor: "#111827",
    isCurved: false,
    arcAngle: 25,
    selectedClipart: "",
    subtitleText: "",
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Dynamic Products from API
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          const mapped = data.products.map((p) => ({
            id: p.id,
            shopifyProductId: p.shopifyProductId,
            name: p.name,
            icon: p.category === "Apparel" ? "👕" : p.category === "Drinkware" ? "☕" : "🛍️",
          }));
          setDynamicProducts(mapped);
        }
      }
    } catch (err) {
      console.warn("[Fetch Products Error]:", err);
    }
  }, []);

  // Fetch Templates from API
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/templates", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error("[Fetch Templates Error]:", err);
      showToast("Error loading templates from database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchProducts();
  }, [fetchTemplates, fetchProducts]);

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingTemplateId(null);
    setFormData({
      title: "",
      category: "Streetwear",
      productTypes: ["all"],
      thumbnail: "/images/product/product-01.jpg",
      primaryText: "NEW CUSTOM DESIGN",
      fontFamily: "Outfit",
      fontSize: 26,
      textColor: "#111827",
      isCurved: false,
      arcAngle: 25,
      selectedClipart: "",
      subtitleText: "",
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (tpl) => {
    setEditingTemplateId(tpl.id);
    const mainTextLayer = tpl.layers?.find((l) => l.type === "text") || {};
    const subTextLayer = tpl.layers?.filter((l) => l.type === "text")[1] || {};
    const clipartLayer = tpl.layers?.find((l) => l.type === "clipart") || {};

    setFormData({
      title: tpl.title || "",
      category: tpl.category || "General",
      productTypes: Array.isArray(tpl.productTypes) && tpl.productTypes.length > 0
        ? tpl.productTypes
        : tpl.productType
        ? [tpl.productType]
        : ["all"],
      thumbnail: tpl.thumbnail || "/images/product/product-01.jpg",
      primaryText: mainTextLayer.text || tpl.title || "CUSTOM DESIGN",
      fontFamily: mainTextLayer.fontFamily || "Outfit",
      fontSize: mainTextLayer.fontSize || 26,
      textColor: mainTextLayer.color || "#111827",
      isCurved: Boolean(mainTextLayer.curved),
      arcAngle: mainTextLayer.arcAngle || 25,
      selectedClipart: clipartLayer.name || "",
      subtitleText: subTextLayer.text || "",
    });
    setIsModalOpen(true);
  };

  // Toggle Product in Multi-Select
  const handleToggleProduct = (prodId) => {
    if (prodId === "all") {
      setFormData((prev) => ({
        ...prev,
        productTypes: prev.productTypes.includes("all") ? [] : ["all"],
      }));
      return;
    }

    setFormData((prev) => {
      let updated = prev.productTypes.filter((p) => p !== "all");
      if (updated.includes(prodId)) {
        updated = updated.filter((p) => p !== prodId);
      } else {
        updated = [...updated, prodId];
      }
      if (updated.length === 0) {
        updated = ["all"];
      }
      return { ...prev, productTypes: updated };
    });
  };

  // Submit Save or Update
  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Please enter a template title.");
      return;
    }

    setSaving(true);

    // Build layers payload
    const layers = [
      {
        id: `t1-${Date.now()}`,
        type: "text",
        text: formData.primaryText.trim() || formData.title.toUpperCase(),
        fontSize: Number(formData.fontSize) || 24,
        fontFamily: formData.fontFamily || "Outfit",
        color: formData.textColor || "#111827",
        x: 50,
        y: formData.selectedClipart ? 48 : 40,
        curved: formData.isCurved,
        arcAngle: Number(formData.arcAngle) || 25,
      },
    ];

    if (formData.subtitleText.trim()) {
      layers.push({
        id: `t2-${Date.now()}`,
        type: "text",
        text: formData.subtitleText.trim(),
        fontSize: Math.max(12, Math.round(Number(formData.fontSize) * 0.55)),
        fontFamily: formData.fontFamily || "Outfit",
        color: formData.textColor === "#FFFFFF" ? "#E5E7EB" : "#4B5563",
        x: 50,
        y: 62,
      });
    }

    if (formData.selectedClipart) {
      const clipart = CLIPARTS_DATA.find((c) => c.name === formData.selectedClipart);
      if (clipart) {
        layers.unshift({
          id: `c1-${Date.now()}`,
          type: "clipart",
          name: clipart.name,
          svg: clipart.svg,
          x: 50,
          y: 28,
        });
      }
    }

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      productTypes: formData.productTypes.length > 0 ? formData.productTypes : ["all"],
      thumbnail: formData.thumbnail || "/images/product/product-01.jpg",
      layers,
    };

    try {
      if (editingTemplateId) {
        // UPDATE Existing
        const res = await fetch("/api/templates", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingTemplateId, ...payload }),
        });
        if (res.ok) {
          showToast(`Successfully updated template "${formData.title}"!`);
        } else {
          throw new Error("Update failed");
        }
      } else {
        // CREATE New
        const res = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          showToast(`Created new template "${formData.title}"!`);
        } else {
          throw new Error("Create failed");
        }
      }

      setIsModalOpen(false);
      await fetchTemplates();
    } catch (err) {
      console.error("[Save Template Error]:", err);
      showToast("Failed to save template. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Template
  const handleDeleteTemplate = async (id) => {
    try {
      const res = await fetch(`/api/templates?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Template deleted successfully.");
        setDeleteConfirmId(null);
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("[Delete Template Error]:", err);
      showToast("Failed to delete template.");
    }
  };

  // Duplicate Template
  const handleDuplicateTemplate = async (tpl) => {
    try {
      const newPayload = {
        ...tpl,
        id: `tpl-${Date.now()}`,
        title: `${tpl.title} (Copy)`,
      };
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPayload),
      });
      if (res.ok) {
        showToast(`Duplicated "${tpl.title}"`);
        await fetchTemplates();
      }
    } catch (err) {
      console.error("[Duplicate Error]:", err);
    }
  };

  // Filter templates list
  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch =
      (tpl.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tpl.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.layers?.some((l) => (l.text || "").toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === "All" || tpl.category === categoryFilter;

    const types = tpl.productTypes || (tpl.productType ? [tpl.productType] : ["all"]);
    const matchesProduct =
      productFilter === "All" || types.includes("all") || types.includes(productFilter);

    return matchesSearch && matchesCategory && matchesProduct;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <FiCheckCircle className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Top Banner & Action Header */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
              <FiLayout className="w-6 h-6 text-brand-500" /> Merchant Customizer Studio Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
              {templates.length} Templates • {dynamicProducts.length} Products
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Configure custom Front/Back mockup images, print area dimensions (X, Y, Width, Height), and pre-designed graphics assigned to specific products.
          </p>
        </div>

        {activeAdminTab === "templates" && (
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0 cursor-pointer active:scale-95"
          >
            <FiPlus className="w-4 h-4" /> Create New Template
          </button>
        )}
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full sm:w-auto self-start border border-gray-200/80 dark:border-gray-700/80">
        <button
          onClick={() => setActiveAdminTab("templates")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeAdminTab === "templates"
              ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <FiLayout className="w-4 h-4" />
          <span>🎨 Design Template Presets</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            {templates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab("products-config")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeAdminTab === "products-config"
              ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <FiSliders className="w-4 h-4" />
          <span>📐 Products & Print Areas Configurator</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 font-bold">
            Front / Back
          </span>
        </button>
      </div>

      {activeAdminTab === "products-config" ? (
        <ProductPrintAreaConfigurator />
      ) : (
        <>
          {/* Filter & Search Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search templates by title, typography, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-brand-500 dark:text-white"
              />
            </div>

            {/* Category & Product Selectors */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                <FiFilter className="w-3.5 h-3.5" /> Filter:
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-2 px-3 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white focus:outline-none"
              >
                {AVAILABLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>

              {/* Product Filter */}
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="py-2 px-3 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white focus:outline-none"
              >
                <option value="All">All Assigned Products</option>
                {dynamicProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.icon || "👕"} {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 animate-pulse flex flex-col justify-between"
            >
              <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <FiLayout className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <h3 className="text-base font-bold text-gray-800 dark:text-white">No Templates Found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or create a new design template for your products.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
          >
            <FiPlus className="w-4 h-4" /> Create Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((tpl) => {
            const productTypes = tpl.productTypes || (tpl.productType ? [tpl.productType] : ["all"]);
            const isAllProducts = productTypes.includes("all");

            return (
              <div
                key={tpl.id}
                className="group bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-brand-500/50 transition-all flex flex-col justify-between"
              >
                {/* Thumbnail Preview Area */}
                <div className="relative h-44 bg-gray-100 dark:bg-gray-900/80 p-4 flex items-center justify-center overflow-hidden border-b border-gray-100 dark:border-gray-700/50">
                  <img
                    src={tpl.thumbnail || "/images/product/product-01.jpg"}
                    alt={tpl.title}
                    className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Category Badge */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 dark:bg-gray-800/90 text-brand-600 dark:text-brand-400 backdrop-blur-md shadow-2xs border border-gray-200/50 dark:border-gray-700/50">
                    {tpl.category}
                  </span>

                  {/* Layers Count Badge */}
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-md flex items-center gap-1">
                    <FiLayers className="w-3 h-3" /> {tpl.layers?.length || 1} Layers
                  </span>

                  {/* Hover Quick Action to Launch in Studio */}
                  <Link
                    href={`/customizer?templateId=${tpl.id}${!isAllProducts && productTypes[0] ? `&product_id=${productTypes[0]}` : ""}`}
                    className="absolute inset-0 bg-brand-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2 backdrop-blur-xs"
                  >
                    <FiExternalLink className="w-4 h-4" /> Test in Customizer Studio &rarr;
                  </Link>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {tpl.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate font-mono">
                      {tpl.layers?.find((l) => l.type === "text")?.text || tpl.title}
                    </p>
                  </div>

                  {/* Assigned Products Badges */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5 flex items-center gap-1">
                      <FiTag className="w-3 h-3" /> Assigned Products:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {isAllProducts ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                          ✨ All Products (Universal)
                        </span>
                      ) : (
                        productTypes.map((pId) => {
                          const prod = dynamicProducts.find((p) => p.id === pId);
                          return (
                            <span
                              key={pId}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900"
                            >
                              {prod ? `${prod.icon || "🛍️"} ${prod.name}` : pId}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-3 mt-1 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(tpl)}
                        className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                        title="Edit Template"
                      >
                        <FiEdit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDuplicateTemplate(tpl)}
                        className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                        title="Duplicate Template"
                      >
                        <FiCopy className="w-3.5 h-3.5" /> Clone
                      </button>
                    </div>

                    <button
                      onClick={() => setDeleteConfirmId(tpl.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors text-xs font-semibold"
                      title="Delete Template"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete Template?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Are you sure you want to delete this template preset? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTemplate(deleteConfirmId)}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Full Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col my-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiLayout className="w-5 h-5 text-brand-500" />
                  {editingTemplateId ? "Edit Design Template" : "Create New Design Template"}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Configure preset typography, graphics, and assigned target products.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTemplate} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Template Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Template Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eid Mubarak Gold Edition"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-brand-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white focus:outline-none"
                  >
                    {AVAILABLE_CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Template Mockup Thumbnail Image */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Template Mockup Image URL
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FiImage className="w-3 h-3" /> Pick from Shopify Files
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. /images/product/product-01.jpg or Shopify CDN URL"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white font-mono"
                />
              </div>

              {/* Product Assignment Multi-Selector */}
              <div className="p-4 bg-gray-50/80 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700">
                <label className="block text-xs font-bold text-gray-800 dark:text-white mb-1">
                  Assign Template to Product(s) *
                </label>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                  Select which POD products this template is designed for. Customers customizing these products will see this template.
                </p>

                <div className="flex flex-wrap gap-2">
                  {/* Universal All Products Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleProduct("all")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                      formData.productTypes.includes("all")
                        ? "bg-brand-500 text-white border-brand-500 shadow-xs"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-brand-400"
                    }`}
                  >
                    {formData.productTypes.includes("all") && <FiCheck className="w-3.5 h-3.5" />}
                    ✨ All Products (Universal)
                  </button>

                  {/* Individual Products */}
                  {dynamicProducts.length === 0 ? (
                    <div className="w-full mt-2 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                      <span>No Shopify products synced yet. Go to <strong>Products Configurator</strong> tab to sync.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          setActiveAdminTab("products-config");
                        }}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px]"
                      >
                        Sync Products &rarr;
                      </button>
                    </div>
                  ) : (
                    dynamicProducts.map((prod) => {
                      const isSelected =
                        !formData.productTypes.includes("all") &&
                        formData.productTypes.includes(prod.id);

                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => handleToggleProduct(prod.id)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-blue-400"
                          }`}
                        >
                          {isSelected && <FiCheck className="w-3.5 h-3.5" />}
                          <span>{prod.icon || "🛍️"}</span> {prod.name}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Design Preset Layers (Typography & Clipart) */}
              <div className="p-4 bg-gray-50/80 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                <label className="block text-xs font-bold text-gray-800 dark:text-white">
                  Pre-configured Design Layers & Typography
                </label>

                {/* Primary Text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Main Headline Text
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. FOREVER & ALWAYS"
                      value={formData.primaryText}
                      onChange={(e) => setFormData({ ...formData, primaryText: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Subtitle / Secondary Text (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah & Michael • 2026"
                      value={formData.subtitleText}
                      onChange={(e) => setFormData({ ...formData, subtitleText: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                    />
                  </div>
                </div>

                {/* Font & Color */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Font Family
                    </label>
                    <select
                      value={formData.fontFamily}
                      onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                    >
                      {FONTS_LIST.map((f) => (
                        <option key={f.name} value={f.name}>
                          {f.name} ({f.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Font Size ({formData.fontSize}px)
                    </label>
                    <input
                      type="range"
                      min="16"
                      max="48"
                      value={formData.fontSize}
                      onChange={(e) => setFormData({ ...formData, fontSize: Number(e.target.value) })}
                      className="w-full accent-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        className="w-full px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-mono dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Curved Text & Clipart */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.isCurved}
                        onChange={(e) => setFormData({ ...formData, isCurved: e.target.checked })}
                        className="rounded accent-brand-500"
                      />
                      Curved Arc Effect
                    </label>
                    {formData.isCurved && (
                      <input
                        type="range"
                        min="10"
                        max="50"
                        value={formData.arcAngle}
                        onChange={(e) => setFormData({ ...formData, arcAngle: Number(e.target.value) })}
                        className="w-24 accent-brand-500"
                        title="Arc Angle"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Preset Clipart Icon
                    </label>
                    <select
                      value={formData.selectedClipart}
                      onChange={(e) => setFormData({ ...formData, selectedClipart: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                    >
                      <option value="">None (Text Only)</option>
                      {CLIPARTS_DATA.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.category})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Preview Thumbnail */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Preview Thumbnail Image URL
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="flex-1 px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                  />
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0">
                    <img
                      src={formData.thumbnail}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.src = "/images/product/product-01.jpg")}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <FiCheck className="w-4 h-4" />
                  {saving ? "Saving Template..." : editingTemplateId ? "Save Changes" : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shopify Files Media Picker Modal */}
      <ShopifyMediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectImage={(url) => {
          setFormData((prev) => ({ ...prev, thumbnail: url }));
          showToast("Template image updated from Shopify Files!");
        }}
      />
    </div>
  );
}
