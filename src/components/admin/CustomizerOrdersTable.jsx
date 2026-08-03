"use client";

import React, { useState } from "react";
import { FiDownload, FiEye, FiCheck, FiShoppingBag, FiSearch } from "react-icons/fi";

const MOCK_CUSTOM_ORDERS = [
  {
    orderId: "#ORD-10948",
    customer: "Sarah Jenkins",
    product: "Unisex Heavy Cotton T-Shirt",
    color: "White",
    customizationSummary: "Text: 'FOREVER & ALWAYS' + Crown Clipart",
    sides: "Front, Back",
    totalPrice: 35.0,
    status: "Ready for Printing",
    date: "2026-08-03",
  },
  {
    orderId: "#ORD-10949",
    customer: "Michael Scott",
    product: "Premium Fleece Pullover Hoodie",
    color: "Black",
    customizationSummary: "Text: 'CYBER CORE INC.'",
    sides: "Front",
    totalPrice: 48.0,
    status: "Printing in Progress",
    date: "2026-08-03",
  },
  {
    orderId: "#ORD-10950",
    customer: "Emma Watson",
    product: "Ceramic Coffee Mug (11 oz)",
    color: "Pure White",
    customizationSummary: "Text: 'SPOOKY SIPS'",
    sides: "Center Wrap",
    totalPrice: 18.0,
    status: "Fulfilled",
    date: "2026-08-02",
  },
];

export default function CustomizerOrdersTable() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = MOCK_CUSTOM_ORDERS.filter(
    (o) =>
      o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4">
      {/* Table Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FiShoppingBag className="w-5 h-5 text-brand-500" /> Customized Orders & Production Print Files
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Download 300 DPI print-ready vectors and images for customized Shopify orders.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search orders or customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-brand-500 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-[11px] uppercase tracking-wider text-gray-500 font-bold bg-gray-50/50 dark:bg-gray-900/40">
              <th className="p-3 rounded-l-xl">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Product</th>
              <th className="p-3">Customization Specs</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right rounded-r-xl">Print Files</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-xs">
            {filteredOrders.map((ord) => (
              <tr key={ord.orderId} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-3 font-bold text-brand-600 dark:text-brand-400">{ord.orderId}</td>
                <td className="p-3 font-semibold text-gray-800 dark:text-gray-200">{ord.customer}</td>
                <td className="p-3 text-gray-600 dark:text-gray-300">
                  {ord.product} <span className="text-gray-400 font-normal">({ord.color})</span>
                </td>
                <td className="p-3 text-gray-700 dark:text-gray-300 max-w-xs truncate">
                  {ord.customizationSummary}
                </td>
                <td className="p-3 font-extrabold text-gray-900 dark:text-white">
                  ${ord.totalPrice.toFixed(2)}
                </td>
                <td className="p-3">
                  <span className="px-2.5 py-1 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 rounded-full text-[10px] font-extrabold">
                    {ord.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => alert(`Downloading 300 DPI Print Package for ${ord.orderId}`)}
                    className="py-1.5 px-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <FiDownload className="w-3.5 h-3.5" /> Download Print Package
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
