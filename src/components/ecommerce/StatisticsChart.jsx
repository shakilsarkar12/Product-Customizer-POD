"use client";
import dynamic from "next/dynamic";
import { useDashboard } from "@/context/DashboardContext";
import { FiTrendingUp } from "react-icons/fi";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function StatisticsChart() {
  const { data, chartPeriod, setChartPeriod } = useDashboard();

  const currencySymbol = data?.storeInfo?.currencySymbol || "$";
  const stats = data?.statistics?.[chartPeriod] || {
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    sales: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    revenue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };

  const options = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#465FFF", "#10B981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.45,
        opacityTo: 0.05,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 5,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      x: {
        show: true,
      },
      y: [
        {
          formatter: (val) => `${val} Orders`,
        },
        {
          formatter: (val) => `${currencySymbol}${(val * 10).toLocaleString()}`,
        },
      ],
    },
    xaxis: {
      type: "category",
      categories: stats.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
      title: {
        text: undefined,
      },
    },
  };

  const series = [
    {
      name: "Orders Volume",
      data: stats.sales,
    },
    {
      name: `Revenue Scaled (x10 ${currencySymbol})`,
      data: stats.revenue,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5 text-brand-500" /> Sales & Revenue Growth Trajectory
          </h3>
          <p className="mt-0.5 text-xs text-gray-400">
            Real-time analytics comparing store order volume and POD revenue
          </p>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {["monthly", "quarterly", "annually"].map((period) => (
            <button
              key={period}
              onClick={() => setChartPeriod(period)}
              className={`px-3 py-1 text-xs font-semibold capitalize rounded-lg transition-all ${
                chartPeriod === period
                  ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[650px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={290} />
        </div>
      </div>
    </div>
  );
}
