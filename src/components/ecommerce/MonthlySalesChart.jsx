"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { FiBarChart2 } from "react-icons/fi";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlySalesChart() {
  const { data, loading } = useDashboard();
  const [viewMode, setViewMode] = useState("revenue"); // "revenue" | "sales"

  const currencySymbol = data?.storeInfo?.currencySymbol || "$";
  const monthlySales = data?.monthlySales || {
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    salesCount: [28, 35, 42, 38, 54, 49, 62, 58, 67, 72, 85, 94],
    revenue: [1420, 1850, 2200, 1980, 2850, 2600, 3290, 3100, 3550, 3900, 4450, 5100],
  };

  const chartSeriesData = viewMode === "revenue" ? monthlySales.revenue : monthlySales.salesCount;
  const seriesName = viewMode === "revenue" ? "Revenue" : "Orders";

  const options = {
    colors: [viewMode === "revenue" ? "#465fff" : "#10b981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: monthlySales.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: false,
    },
    yaxis: {
      title: {
        text: undefined,
      },
      labels: {
        formatter: (val) => (viewMode === "revenue" ? `${currencySymbol}${val}` : `${val}`),
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: true,
      },
      y: {
        formatter: (val) => (viewMode === "revenue" ? `${currencySymbol}${val.toLocaleString()}` : `${val} Orders`),
      },
    },
  };

  const series = [
    {
      name: seriesName,
      data: chartSeriesData,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
            <FiBarChart2 className="w-5 h-5 text-brand-500" /> Monthly Performance
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {viewMode === "revenue" ? "Total store revenue generated per month" : "Total volume of customizer orders per month"}
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("revenue")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === "revenue"
                ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-2xs"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Revenue ({currencySymbol})
          </button>
          <button
            onClick={() => setViewMode("sales")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === "sales"
                ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar mt-3">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          {loading && !data ? (
            <div className="h-[180px] flex items-center justify-center text-xs text-gray-400 animate-pulse">
              Loading chart data...
            </div>
          ) : (
            <ReactApexChart options={options} series={series} type="bar" height={180} />
          )}
        </div>
      </div>
    </div>
  );
}
