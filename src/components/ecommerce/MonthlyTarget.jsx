"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { FiTarget, FiEdit2, FiCheck, FiX, FiTrendingUp } from "react-icons/fi";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlyTarget() {
  const { data, updateMonthlyTarget } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [newTargetInput, setNewTargetInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const targetData = data?.targetData || {
    monthlyTarget: 25000,
    formattedTarget: "$25,000",
    thisMonthRevenue: 18450,
    formattedMonthRevenue: "$18,450",
    todayRevenue: 1280,
    formattedTodayRevenue: "$1,280",
    progressPercent: 74,
  };

  const currencySymbol = data?.storeInfo?.currencySymbol || "$";
  const progress = targetData.progressPercent || 0;
  const series = [progress];

  const options = {
    colors: [progress >= 100 ? "#10b981" : "#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "700",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return `${val}%`;
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: [progress >= 100 ? "#10b981" : "#465FFF"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  };

  const handleSaveTarget = async () => {
    const num = parseFloat(newTargetInput);
    if (isNaN(num) || num <= 0) return;
    setIsSaving(true);
    await updateMonthlyTarget(num);
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03] flex flex-col justify-between">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-8 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <FiTarget className="w-5 h-5 text-brand-500" /> Monthly Target
            </h3>
            <p className="mt-0.5 text-xs text-gray-400">
              Live progress against your monthly store sales goal
            </p>
          </div>

          <button
            onClick={() => {
              setNewTargetInput(targetData.monthlyTarget.toString());
              setIsEditing(!isEditing);
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 p-1.5 rounded-lg transition-colors"
            title="Edit Target"
          >
            <FiEdit2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit Goal</span>
          </button>
        </div>

        {/* Edit Target Form Popup */}
        {isEditing && (
          <div className="mt-3 p-3 bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60 rounded-xl flex items-center gap-2">
            <span className="text-xs font-bold text-brand-700 dark:text-brand-300">{currencySymbol}</span>
            <input
              type="number"
              value={newTargetInput}
              onChange={(e) => setNewTargetInput(e.target.value)}
              placeholder="e.g. 30000"
              className="w-full text-xs bg-white dark:bg-gray-800 border border-brand-300 dark:border-brand-700 rounded-lg px-2.5 py-1 text-gray-900 dark:text-white focus:outline-none"
            />
            <button
              onClick={handleSaveTarget}
              disabled={isSaving}
              className="px-2.5 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 shadow-2xs"
            >
              <FiCheck className="w-3 h-3" /> {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Radial Chart */}
        <div className="relative mt-2">
          <div className="max-h-[300px]">
            <ReactApexChart options={options} series={series} type="radialBar" height={300} />
          </div>

          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-bold text-success-600 dark:bg-success-500/15 dark:text-success-500 flex items-center gap-1 shadow-2xs">
            <FiTrendingUp className="w-3 h-3" />
            {progress}% Achieved
          </span>
        </div>

        <p className="mx-auto mt-8 w-full max-w-[340px] text-center text-xs text-gray-500 sm:text-sm">
          {progress >= 100
            ? "Congratulations! You have surpassed your monthly revenue target!"
            : `Earned ${targetData.formattedTodayRevenue} today. Keep promoting your customized POD products!`}
        </p>
      </div>

      {/* Footer 3 Stats */}
      <div className="flex items-center justify-around px-4 py-4 sm:py-5">
        <div className="text-center">
          <p className="mb-0.5 text-xs text-gray-400 font-medium">Goal Target</p>
          <p className="text-sm sm:text-base font-extrabold text-gray-800 dark:text-white">
            {targetData.formattedTarget}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-8 dark:bg-gray-800" />

        <div className="text-center">
          <p className="mb-0.5 text-xs text-gray-400 font-medium">This Month</p>
          <p className="text-sm sm:text-base font-extrabold text-brand-600 dark:text-brand-400">
            {targetData.formattedMonthRevenue}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-8 dark:bg-gray-800" />

        <div className="text-center">
          <p className="mb-0.5 text-xs text-gray-400 font-medium">Today</p>
          <p className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {targetData.formattedTodayRevenue}
          </p>
        </div>
      </div>
    </div>
  );
}
