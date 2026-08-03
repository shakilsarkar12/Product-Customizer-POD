"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { HiOutlineBuildingStorefront, HiOutlineCheckCircle, HiOutlineCog6Tooth, HiOutlinePuzzlePiece } from "react-icons/hi2";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [storeData, setStoreData] = useState({
    siteName: "Shopify Store",
    shopDomain: "your-store.myshopify.com",
    supportEmail: "support@store.com",
  });

  useEffect(() => {
    async function loadStoreProfile() {
      try {
        const res = await fetch("/api/shopify/credentials");
        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            setStoreData({
              siteName: data.siteName || data.shopDomain?.split(".")[0] || "Shopify Store",
              shopDomain: data.shopDomain || "your-store.myshopify.com",
              supportEmail: data.supportEmail || `support@${data.shopDomain || "store.com"}`,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load store profile header:", err);
      }
    }
    loadStoreProfile();
  }, []);

  function toggleDropdown(e) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const initialLetter = (storeData.siteName || "S").charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle gap-2"
      >
        <span className="flex items-center justify-center rounded-full h-10 w-10 bg-brand-500 text-white font-bold text-base shadow-sm ring-2 ring-brand-100 dark:ring-brand-900/50">
          {initialLetter}
        </span>

        <span className="block font-semibold text-theme-sm text-gray-800 dark:text-gray-200 truncate max-w-[140px]">
          {storeData.siteName}
        </span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
          <span className="flex items-center justify-center rounded-full h-11 w-11 bg-brand-500 text-white font-bold text-lg shadow-sm">
            {initialLetter}
          </span>
          <div className="overflow-hidden">
            <span className="block font-bold text-gray-800 dark:text-gray-100 text-sm truncate">
              {storeData.siteName}
            </span>
            <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400 truncate">
              {storeData.supportEmail}
            </span>
          </div>
        </div>

        <ul className="flex flex-col gap-1 pt-3 pb-2 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <HiOutlineCog6Tooth className="w-5 h-5 text-gray-500 group-hover:text-brand-500" />
              Account Settings
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/shopify-integration"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <HiOutlinePuzzlePiece className="w-5 h-5 text-gray-500 group-hover:text-brand-500" />
              Shopify Integration Hub
            </DropdownItem>
          </li>
        </ul>

        <div className="flex items-center justify-between pt-3 px-1 text-xs">
          <span className="text-gray-500 dark:text-gray-400 font-medium">Store Status</span>
          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold rounded-full flex items-center gap-1">
            <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Connected
          </span>
        </div>
      </Dropdown>
    </div>
  );
}
