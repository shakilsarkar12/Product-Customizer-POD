"use client";
import Image from "next/image";
import CountryMap from "./CountryMap";
import { useDashboard } from "@/context/DashboardContext";
import { FiGlobe } from "react-icons/fi";

export default function DemographicCard() {
  const { data, loading } = useDashboard();

  const demographics = data?.demographics || [
    { country: "United States", code: "US", flag: "/images/country/country-01.svg", customers: 185, percentage: 62 },
    { country: "United Kingdom", code: "GB", flag: "/images/country/country-01.svg", customers: 48, percentage: 16 },
    { country: "Canada", code: "CA", flag: "/images/country/country-01.svg", customers: 35, percentage: 12 },
    { country: "France", code: "FR", flag: "/images/country/country-02.svg", customers: 28, percentage: 10 },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <FiGlobe className="w-5 h-5 text-brand-500" /> Customer Demographics
            </h3>
            <p className="mt-0.5 text-xs text-gray-400">
              Breakdown of customer orders by geographical country
            </p>
          </div>
        </div>

        <div className="px-4 py-4 my-4 overflow-hidden border border-gray-100 rounded-2xl bg-gray-50/70 dark:border-gray-800 dark:bg-gray-900/50 sm:px-6">
          <div id="mapOne" className="mapOne map-btn -mx-4 -my-4 h-[180px] w-full flex items-center justify-center">
            <CountryMap />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading && !data ? (
          <div className="text-xs text-gray-400 animate-pulse text-center py-2">
            Loading geographical data...
          </div>
        ) : (
          demographics.map((item) => (
            <div key={item.country} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <Image width={24} height={24} src={item.flag} alt={item.country} className="w-5 h-auto object-contain" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                    {item.country}
                  </p>
                  <span className="block text-gray-400 text-theme-xs">
                    {item.customers} Customers
                  </span>
                </div>
              </div>

              <div className="flex w-full max-w-[140px] items-center gap-3">
                <div className="relative block h-2 w-full max-w-[90px] rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-brand-500 transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="font-bold text-gray-800 text-theme-sm dark:text-white/90 w-9 text-right">
                  {item.percentage}%
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
