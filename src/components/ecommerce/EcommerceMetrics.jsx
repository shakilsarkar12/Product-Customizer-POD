"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon, DollarLineIcon, PageIcon } from "@/icons";
import { useDashboard } from "@/context/DashboardContext";
import Link from "next/link";

export const EcommerceMetrics = () => {
  const { data, loading } = useDashboard();

  const metrics = data?.metrics || {
    totalCustomers: "...",
    customersGrowth: "+12.5%",
    totalOrders: "...",
    ordersGrowth: "+8.4%",
    totalRevenue: "$0.00",
    revenueGrowth: "+15.2%",
    totalTemplates: "...",
    templatesGrowth: "Active",
  };

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse"
          >
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="mt-5 space-y-2">
              <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="w-28 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Total Revenue */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-12 h-12 bg-brand-50 text-brand-600 rounded-xl dark:bg-brand-950/50 dark:text-brand-400">
            <DollarLineIcon className="size-6" />
          </div>
          <Badge color="success">
            <ArrowUpIcon className="size-3" />
            {metrics.revenueGrowth}
          </Badge>
        </div>

        <div className="mt-5">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-400">
            POD Total Revenue
          </span>
          <h4 className="mt-1 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {metrics.totalRevenue}
          </h4>
        </div>
      </div>

      {/* Total Orders */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl dark:bg-blue-950/50 dark:text-blue-400">
            <BoxIconLine className="size-6" />
          </div>
          <Badge color="success">
            <ArrowUpIcon className="size-3" />
            {metrics.ordersGrowth}
          </Badge>
        </div>

        <div className="mt-5">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-400">
            Total Orders
          </span>
          <h4 className="mt-1 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {metrics.totalOrders}
          </h4>
        </div>
      </div>

      {/* Total Customers */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-50 text-purple-600 rounded-xl dark:bg-purple-950/50 dark:text-purple-400">
            <GroupIcon className="size-6" />
          </div>
          <Badge color="success">
            <ArrowUpIcon className="size-3" />
            {metrics.customersGrowth}
          </Badge>
        </div>

        <div className="mt-5">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-400">
            Total Customers
          </span>
          <h4 className="mt-1 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {metrics.totalCustomers}
          </h4>
        </div>
      </div>

      {/* Active POD Templates */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-12 h-12 bg-amber-50 text-amber-600 rounded-xl dark:bg-amber-950/50 dark:text-amber-400">
            <PageIcon className="size-6" />
          </div>
          <Link
            href="/templates"
            className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
          >
            Manage &rarr;
          </Link>
        </div>

        <div className="mt-5">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-400">
            Active Design Templates
          </span>
          <h4 className="mt-1 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {metrics.totalTemplates}
          </h4>
        </div>
      </div>
    </div>
  );
};
