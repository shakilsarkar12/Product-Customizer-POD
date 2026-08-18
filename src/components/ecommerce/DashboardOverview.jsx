"use client";

import React from "react";
import { DashboardProvider, useDashboard } from "@/context/DashboardContext";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import { FiRefreshCw, FiCheckCircle, FiBox, FiSettings, FiShoppingBag } from "react-icons/fi";
import Link from "next/link";

function DashboardContent() {
  const { data, syncing, refreshData, lastUpdated } = useDashboard();

  const storeInfo = data?.storeInfo || {
    name: "Shopify Store",
    domain: "Connected Store",
    currency: "USD",
  };

  return (
    <div className="space-y-6">
      {/* Live Store Sync & Overview Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-800 p-6 text-white shadow-lg">
        {/* Ambient Decorative Shapes */}
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-40 -bottom-10 h-32 w-32 rounded-full bg-indigo-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-white border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Shopify Connected
              </span>
              {lastUpdated && (
                <span className="text-[11px] text-white/70">
                  Last sync: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              {storeInfo.name}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
              Real-time Print-on-Demand customizer performance, incoming orders, and revenue insights.
            </p>
          </div>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => refreshData()}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-brand-700 hover:bg-white/90 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-brand-600" : ""}`} />
              {syncing ? "Syncing Shopify..." : "Sync Live Data"}
            </button>

            <Link
              href="/customizer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold backdrop-blur-md border border-white/25 shadow-sm transition-all"
            >
              <FiBox className="w-3.5 h-3.5" />
              Launch Studio
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Top Left: 4 KPI Metrics + Monthly Bar Chart */}
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />
          <MonthlySalesChart />
        </div>

        {/* Top Right: Radial Progress Target */}
        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        {/* Middle: Full Width Statistics Trend Area Chart */}
        <div className="col-span-12">
          <StatisticsChart />
        </div>

        {/* Bottom Left: Customer Demographics Map & Countries */}
        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        {/* Bottom Right: Recent Orders Live Table */}
        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
