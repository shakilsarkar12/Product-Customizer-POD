"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FiShoppingBag,
  FiRefreshCw,
  FiEdit3,
  FiExternalLink,
  FiCheckCircle,
  FiLayers,
  FiPlus,
  FiEye,
  FiCheck,
} from "react-icons/fi";

export default function ShopifyProductsGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.warn("[Load Products Grid Error]:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSyncShopify = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/products?sync=true", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts(data.products || []);
        showToast(`Successfully synced ${data.syncedCount || data.products?.length || 0} products from Shopify!`);
      } else {
        showToast(data.error || "Failed to sync products from Shopify.");
      }
    } catch (err) {
      showToast("Sync error: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <FiCheck className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          {toastMsg}
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 dark:border-gray-700/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <FiShoppingBag className="w-5 h-5 text-brand-500" /> Connected Shopify Store Products
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real dynamic products imported from Shopify. Manage mockups, print areas, and launch directly in Customizer Studio.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleSyncShopify}
            disabled={syncing}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing Shopify..." : "Sync from Shopify"}
          </button>

          <Link
            href="/templates"
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <FiLayers className="w-3.5 h-3.5 text-brand-500" /> Configurator Hub
          </Link>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-gray-100 dark:bg-gray-700/50 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12 px-4">
          <div className="w-14 h-14 rounded-3xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center mx-auto mb-3 text-brand-500">
            <FiShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-extrabold text-gray-800 dark:text-white">
            No Synced Products Found
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
            Click <strong>&quot;Sync from Shopify&quot;</strong> above to automatically import live products, mockups, and prices from your connected store.
          </p>
          <button
            onClick={handleSyncShopify}
            disabled={syncing}
            className="mt-4 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <FiRefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Connecting & Syncing..." : "Sync Store Products Now"}
          </button>
        </div>
      )}

      {/* Dynamic Products Grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-6">
          {products.map((product) => {
            const frontImage = product.colors?.[0]?.image || product.views?.[0]?.image || "/images/product/product-01.jpg";
            const backImage = product.colors?.[0]?.backImage || product.views?.[1]?.image || null;
            const price = product.basePrice || 25.0;
            const colorsCount = product.colors?.length || 1;
            const viewsCount = product.views?.length || 2;

            return (
              <div
                key={product.id}
                className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-4 hover:shadow-lg hover:border-brand-400 dark:hover:border-brand-500 transition-all flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {product.category || "Shopify Product"}
                    </span>
                    {product.shopifyProductId && (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-bold">
                        ID #{product.shopifyProductId}
                      </span>
                    )}
                  </div>

                  {/* Mockup Preview Visual */}
                  <div className="relative w-full h-44 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-2 overflow-hidden border border-gray-100 dark:border-gray-700/60 mb-3">
                    <img
                      src={frontImage}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Print Area Overlay Hint */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-24 h-28 border border-dashed border-brand-500/60 bg-brand-500/10 rounded-lg flex items-center justify-center text-[9px] font-bold text-brand-600 dark:text-brand-300">
                        Print Area
                      </div>
                    </div>

                    {backImage && (
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-white font-mono">
                        Front &amp; Back Ready
                      </div>
                    )}
                  </div>

                  {/* Title & Price */}
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate" title={product.name}>
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between mt-1 mb-3">
                    <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">
                      ${price.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      {colorsCount} Color{colorsCount > 1 ? "s" : ""} • {viewsCount} View{viewsCount > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/80">
                  <Link
                    href={`/customizer?product_id=${encodeURIComponent(product.id)}&title=${encodeURIComponent(product.name)}&image=${encodeURIComponent(frontImage)}&price=${price}`}
                    className="px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl text-center shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FiEye className="w-3.5 h-3.5" /> Customize
                  </Link>

                  <Link
                    href="/templates"
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FiEdit3 className="w-3.5 h-3.5 text-gray-500" /> Print Area
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
