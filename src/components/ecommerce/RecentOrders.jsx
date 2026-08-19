"use client";
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { useDashboard } from "@/context/DashboardContext";
import { FiRefreshCw, FiSearch, FiShoppingBag, FiExternalLink } from "react-icons/fi";
import Link from "next/link";

export default function RecentOrders() {
  const { data, loading, syncing, refreshData } = useDashboard();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const orders = data?.recentOrders || [];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.orderNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Header with Title, Live Status & Controls */}
      <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
              Recent Shopify & POD Orders
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time customized print items and incoming customer orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-brand-500 dark:text-white w-40 sm:w-48"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-2.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Delivered">Delivered</option>
            <option value="Processing">Processing</option>
            <option value="Pending">Pending</option>
          </select>

          {/* Sync Button */}
          <button
            onClick={() => refreshData()}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xs transition-colors"
            title="Sync Live Orders"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-brand-500" : ""}`} />
            {syncing ? "Syncing..." : "Sync"}
          </button>

          <Link
            href="/customizer-admin"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-400 rounded-lg transition-colors"
          >
            All Orders <FiExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Orders Table */}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y bg-gray-50/50 dark:bg-gray-900/40">
            <TableRow>
              <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Order & Product
              </TableCell>
              <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Customer
              </TableCell>
              <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Date
              </TableCell>
              <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Price
              </TableCell>
              <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading && orders.length === 0 ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell className="py-3.5" colSpan={5}>
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell className="py-12 text-center text-gray-400 text-xs" colSpan={5}>
                  <FiShoppingBag className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600 opacity-60" />
                  <p className="font-semibold text-gray-600 dark:text-gray-300 text-sm">No incoming orders yet</p>
                  <p className="text-gray-400 text-xs mt-1">When customers place orders from your Shopify store, customized print items will appear here in real-time.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors">
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 relative overflow-hidden rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 shrink-0">
                        <Image
                          width={40}
                          height={40}
                          src={order.image || "/images/product/product-01.jpg"}
                          className="h-full w-full object-cover"
                          alt={order.name}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-brand-600 dark:text-brand-400 text-xs">
                            {order.orderNumber}
                          </span>
                        </div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 truncate max-w-[180px] sm:max-w-xs">
                          {order.name}
                        </p>
                        <span className="text-gray-400 text-[11px]">
                          {order.variants}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 text-gray-700 font-medium text-theme-sm dark:text-gray-300">
                    {order.customerName}
                  </TableCell>
                  <TableCell className="py-3.5 text-gray-500 text-theme-xs dark:text-gray-400">
                    {order.date}
                  </TableCell>
                  <TableCell className="py-3.5 font-bold text-gray-900 text-theme-sm dark:text-white">
                    {order.price}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <Badge
                      size="sm"
                      color={
                        order.status === "Delivered"
                          ? "success"
                          : order.status === "Processing"
                          ? "info"
                          : order.status === "Pending"
                          ? "warning"
                          : "error"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
