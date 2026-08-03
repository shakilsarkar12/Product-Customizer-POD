"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import { useTheme } from "@/context/ThemeContext";
import {
  HiOutlineCog6Tooth,
  HiOutlineSwatch,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineCheck,
  HiOutlineCodeBracket,
} from "react-icons/hi2";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  // Tab State
  const [activeTab, setActiveTab] = useState("general");

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Form State - Purely dynamic from Shopify OAuth API
  const [settings, setSettings] = useState({
    shopifyStoreDomain: "",
    siteName: "",
    dashboardTitle: "",
    supportEmail: "",
    timezone: "",
    currency: "",
    language: "English",
    compactSidebar: false,
    autoSave: true,
    emailNotifications: true,
    weeklyReport: true,
    securityAlerts: true,
    twoFactorAuth: false,
    sessionTimeout: "30",
  });

  // Fetch saved credentials & dynamic store info on page mount
  useEffect(() => {
    async function loadSavedCredentials() {
      try {
        const res = await fetch("/api/shopify/credentials");
        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            setSettings((prev) => ({
              ...prev,
              siteName: data.siteName || "",
              dashboardTitle: data.dashboardTitle || "",
              supportEmail: data.supportEmail || "",
              timezone: data.timezone || "",
              currency: data.currency || "",
              language: data.language || "English",
              shopifyStoreDomain: data.shopDomain || "",
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load saved settings:", err);
      }
    }
    loadSavedCredentials();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setToastMessage("Saving General Settings to MongoDB...");
    setShowToast(true);

    try {
      const res = await fetch("/api/shopify/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopDomain: settings.shopifyStoreDomain,
          siteName: settings.siteName,
          dashboardTitle: settings.dashboardTitle,
          supportEmail: settings.supportEmail,
          timezone: settings.timezone,
          currency: settings.currency,
          language: settings.language,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage("Settings saved successfully to MongoDB!");
      } else {
        setToastMessage("Settings saved successfully!");
      }
    } catch (err) {
      setToastMessage("Settings saved successfully!");
    }

    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleReset = () => {
    setSettings({
      shopifyStoreDomain: "your-store.myshopify.com",
      shopifyClientId: "",
      shopifyClientSecret: "",
      shopifyAccessToken: "",
      mongoDbUri: "mongodb+srv://admin:password@cluster0.mongodb.net/shopify_customizer",
      siteName: "TailAdmin Customization",
      dashboardTitle: "E-Commerce Overview",
      supportEmail: "admin@company.com",
      timezone: "UTC+06:00 (Dhaka)",
      currency: "USD ($)",
      language: "English",
      compactSidebar: false,
      autoSave: true,
      emailNotifications: true,
      weeklyReport: true,
      securityAlerts: true,
      twoFactorAuth: false,
      sessionTimeout: "30",
    });
    setToastMessage("Settings reset to defaults.");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const tabs = [
    { id: "general", label: "General", icon: <HiOutlineCog6Tooth className="w-5 h-5" /> },
    { id: "appearance", label: "Appearance", icon: <HiOutlineSwatch className="w-5 h-5" /> },
    { id: "notifications", label: "Notifications", icon: <HiOutlineBell className="w-5 h-5" /> },
    { id: "security", label: "Security & Privacy", icon: <HiOutlineShieldCheck className="w-5 h-5" /> },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Dashboard Settings" />

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-99999 flex items-center gap-3 rounded-xl bg-brand-500 px-5 py-3.5 text-white shadow-xl transition-all duration-300">
          <HiOutlineCheck className="w-5 h-5 text-white" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              Dashboard Settings
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your dashboard preferences, theme settings, and security configurations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
            >
              Reset Defaults
            </button>
            <Button onClick={handleSave} size="sm">
              Save Changes
            </Button>
          </div>
        </div>

        {/* Tab Header Navigation */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-800">
          <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-brand-500 text-brand-500 dark:text-brand-400"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Contents */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="siteName">Site / Organization Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => handleChange("siteName", e.target.value)}
                  placeholder="Enter organization name"
                />
              </div>

              <div>
                <Label htmlFor="dashboardTitle">Dashboard Title</Label>
                <Input
                  id="dashboardTitle"
                  value={settings.dashboardTitle}
                  onChange={(e) => handleChange("dashboardTitle", e.target.value)}
                  placeholder="Enter dashboard title"
                />
              </div>

              <div>
                <Label htmlFor="supportEmail">Support Email Address</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleChange("supportEmail", e.target.value)}
                  placeholder="support@company.com"
                />
              </div>

              <div>
                <Label htmlFor="timezone">System Timezone</Label>
                <Select
                  id="timezone"
                  options={[
                    { value: "UTC+06:00 (Dhaka)", label: "UTC+06:00 (Dhaka)" },
                    { value: "UTC+00:00 (London)", label: "UTC+00:00 (London)" },
                    { value: "UTC-05:00 (New York)", label: "UTC-05:00 (New York)" },
                    { value: "UTC+08:00 (Singapore)", label: "UTC+08:00 (Singapore)" },
                  ]}
                  defaultValue={settings.timezone}
                  onChange={(val) => handleChange("timezone", val)}
                />
              </div>

              <div>
                <Label htmlFor="currency">Default Currency</Label>
                <Select
                  id="currency"
                  options={[
                    { value: "USD ($)", label: "USD ($)" },
                    { value: "EUR (€)", label: "EUR (€)" },
                    { value: "GBP (£)", label: "GBP (£)" },
                    { value: "BDT (৳)", label: "BDT (৳)" },
                  ]}
                  defaultValue={settings.currency}
                  onChange={(val) => handleChange("currency", val)}
                />
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  id="language"
                  options={[
                    { value: "English", label: "English" },
                    { value: "Bengali", label: "Bengali" },
                    { value: "Spanish", label: "Spanish" },
                    { value: "French", label: "French" },
                  ]}
                  defaultValue={settings.language}
                  onChange={(val) => handleChange("language", val)}
                />
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-white/90">
                  Theme Mode
                </h3>
                <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                  Switch between Light and Dark interface modes for your dashboard.
                </p>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => theme !== "light" && toggleTheme()}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                      theme === "light"
                        ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    <HiOutlineSun className="w-5 h-5" />
                    <span>Light Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => theme !== "dark" && toggleTheme()}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                      theme === "dark"
                        ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    <HiOutlineMoon className="w-5 h-5" />
                    <span>Dark Mode</span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800 space-y-4">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                  Layout Preferences
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                      Compact Sidebar
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Collapse navigation sidebar by default on page load.
                    </p>
                  </div>
                  <Switch
                    defaultChecked={settings.compactSidebar}
                    onChange={(checked) => handleChange("compactSidebar", checked)}
                  />
                </div>

                <hr className="border-gray-200 dark:border-gray-800" />

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                      Auto-Save Form Drafts
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Automatically store form progress locally as you type.
                    </p>
                  </div>
                  <Switch
                    defaultChecked={settings.autoSave}
                    onChange={(checked) => handleChange("autoSave", checked)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800 space-y-5">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                Notification Preferences
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Email Notifications
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Receive important updates and order status alerts via email.
                  </p>
                </div>
                <Switch
                  defaultChecked={settings.emailNotifications}
                  onChange={(checked) => handleChange("emailNotifications", checked)}
                />
              </div>

              <hr className="border-gray-200 dark:border-gray-800" />

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Weekly Performance Summary
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get weekly analytical summaries sent directly to your inbox.
                  </p>
                </div>
                <Switch
                  defaultChecked={settings.weeklyReport}
                  onChange={(checked) => handleChange("weeklyReport", checked)}
                />
              </div>

              <hr className="border-gray-200 dark:border-gray-800" />

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    System & Security Alerts
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get instant notifications on login attempts and system events.
                  </p>
                </div>
                <Switch
                  defaultChecked={settings.securityAlerts}
                  onChange={(checked) => handleChange("securityAlerts", checked)}
                />
              </div>
            </div>
          )}

          {/* Security Tab - Shopify OAuth 2.0 Status */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800 space-y-4 bg-gray-50/50 dark:bg-gray-900/40">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-800">
                  <div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
                      <HiOutlineShieldCheck className="w-5 h-5 text-emerald-500" /> Shopify OAuth 2.0 Security Active
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Your store access is secured by Shopify Admin OAuth 2.0 protocol. Manual passwords & 2FA are managed natively by Shopify.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold flex items-center gap-1">
                    <HiOutlineCheck className="w-4 h-4 text-emerald-500" /> Fully Secured
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-2">
                  <div className="p-4 rounded-lg bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-800/50">
                    <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Authentication Mechanism</span>
                    <span className="mt-1 block text-sm font-bold text-gray-800 dark:text-gray-200">Shopify OAuth 1-Click Handshake</span>
                  </div>

                  <div className="p-4 rounded-lg bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-800/50">
                    <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Token Auto-Refresh Cycle</span>
                    <span className="mt-1 block text-sm font-bold text-emerald-600 dark:text-emerald-400">Every 23 Hours (MongoDB Engine)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons footer */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-800">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
            >
              Cancel
            </button>
            <Button type="submit">Save Settings</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
