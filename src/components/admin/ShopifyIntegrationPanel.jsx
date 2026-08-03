"use client";

import React, { useState, useEffect } from "react";
import {
  FiCheckCircle,
  FiRefreshCw,
  FiCode,
  FiLayers,
  FiRadio,
  FiShield,
  FiCopy,
  FiExternalLink,
  FiHelpCircle,
  FiCheck,
  FiServer,
} from "react-icons/fi";

export default function ShopifyIntegrationPanel() {
  const [appEmbedActive, setAppEmbedActive] = useState(true);
  const [proxyEnabled, setProxyEnabled] = useState(true);
  const [graphqlConnected, setGraphqlConnected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showProxyGuide, setShowProxyGuide] = useState(false);

  const [integrationData, setIntegrationData] = useState({
    shopDomain: "your-store.myshopify.com",
    clientId: "",
    activeAccessToken: "",
    tokenStatus: null,
  });

  // Fetch live credentials and status from API
  useEffect(() => {
    async function loadIntegration() {
      try {
        const res = await fetch("/api/shopify/credentials");
        if (res.ok) {
          const data = await res.json();
          setIntegrationData({
            shopDomain: data.shopDomain || "your-store.myshopify.com",
            clientId: data.clientId || "",
            activeAccessToken: data.activeAdminAccessToken || "",
            tokenStatus: data.tokenStatus || null,
          });
        }
      } catch (err) {
        console.error("Failed to load shopify integration status:", err);
      } finally {
        setLoading(false);
      }
    }
    loadIntegration();
  }, []);

  const proxyTargetUrl = typeof window !== "undefined"
    ? `${window.location.origin}/customizer`
    : "https://your-customizer-app.com/customizer";

  const handleCopyProxy = () => {
    navigator.clipboard.writeText(proxyTargetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FiRadio className="w-5 h-5 text-brand-500 animate-pulse" /> Shopify Integration & App Embed Hub
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
            <span>Connected Store:</span>
            <strong className="font-mono text-brand-500 bg-brand-50 dark:bg-brand-950/50 px-2 py-0.5 rounded">
              {integrationData.shopDomain}
            </strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
            <FiCheckCircle className="w-4 h-4 text-emerald-500" /> Live & Connected
          </span>
        </div>
      </div>

      {/* Toggles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* App Embed Block */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">App Embed Block</h3>
              <p className="text-xs text-gray-500 mt-0.5">Online Store 2.0 Theme Editor Widget</p>
            </div>
            <span className="p-2 bg-brand-50 dark:bg-brand-950 text-brand-500 rounded-xl">
              <FiLayers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {appEmbedActive ? "Active on Theme" : "Disabled"}
            </span>
            <button
              onClick={() => setAppEmbedActive((a) => !a)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                appEmbedActive ? "bg-brand-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  appEmbedActive ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* App Proxy Route */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                App Proxy <code className="text-xs text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-900/50 px-1.5 py-0.5 rounded">/apps/customizer</code>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Seamless Store Domain Routing</p>
            </div>
            <span className="p-2 bg-brand-50 dark:bg-brand-950 text-brand-500 rounded-xl">
              <FiShield className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {proxyEnabled ? "Proxy Enabled" : "Disabled"}
            </span>
            <button
              onClick={() => setProxyEnabled((p) => !p)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                proxyEnabled ? "bg-brand-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  proxyEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* GraphQL Admin API */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Admin GraphQL API</h3>
              <p className="text-xs text-gray-500 mt-0.5">Draft Orders & Auto Token Refresh</p>
            </div>
            <span className="p-2 bg-brand-50 dark:bg-brand-950 text-brand-500 rounded-xl">
              <FiCode className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {graphqlConnected ? "23h Auto-Refresh Active" : "Disconnected"}
            </span>
            <button
              onClick={() => setGraphqlConnected((g) => !g)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                graphqlConnected ? "bg-brand-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  graphqlConnected ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Live Cart Line-Item Properties Payload Output */}
      <div className="p-4 bg-gray-900 text-gray-100 rounded-2xl font-mono text-xs overflow-x-auto flex flex-col gap-2 shadow-inner border border-gray-800">
        <div className="flex items-center justify-between text-gray-400 border-b border-gray-800 pb-2">
          <span>Shopify Cart Line-Item Properties Dynamic Output</span>
          <span className="text-[10px] text-emerald-400 font-bold">STATUS: 200 OK (Store: {integrationData.shopDomain})</span>
        </div>
        <pre className="text-emerald-300 leading-relaxed">{`{
  "store": "${integrationData.shopDomain}",
  "proxy_endpoint": "/apps/customizer",
  "items": [{
    "id": 48291049201948,
    "quantity": 1,
    "properties": {
      "_customizer_design_id": "DSGN-2026-9482",
      "_print_file_url": "https://${integrationData.shopDomain}/apps/customizer/print/highres_300dpi.png",
      "_print_area_sides": "Front, Left Sleeve",
      "Custom Text": "FOREVER & ALWAYS",
      "Material": "Organic Premium Cotton",
      "Final Price": "$35.00"
    }
  }]
}`}</pre>
      </div>
    </div>
  );
}
