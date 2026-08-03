import React from "react";
import Link from "next/link";

export const metadata = {
  title: "401 Unauthorized Access | Product Customizer POD",
  description: "Access Restricted to Installed Shopify Admin Stores",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-gray-950">
      <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m0-8v4m-6.938 4h13.876c1.27 0 2.091-1.37 1.472-2.48l-6.938-12c-.619-1.11-2.227-1.11-2.846 0l-6.938 12c-.619 1.11.202 2.48 1.472 2.48z"
            />
          </svg>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          401 - Unauthorized Access
        </h1>

        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Direct browser access to this application URL is restricted. This Product Customizer app can only be opened natively inside an installed <strong>Shopify Admin Store</strong>.
        </p>

        <div className="rounded-xl bg-gray-100 p-4 text-left dark:bg-gray-800/60 mb-6">
          <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
            How to Access:
          </span>
          <ol className="list-decimal list-inside text-xs text-gray-700 dark:text-gray-300 space-y-1">
            <li>Log into your <strong>Shopify Admin Panel</strong>.</li>
            <li>Go to the <strong>Apps</strong> section.</li>
            <li>Click <strong>Product Customizer POD</strong> to launch natively.</li>
          </ol>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500">
          Product Customizer POD Engine &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
