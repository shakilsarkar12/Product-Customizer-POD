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

  const currencySymbol = data?.storeInfo?.currencySymbol || "$";
  const targetData = data?.targetData || {
    monthlyTarget: 25000,
    formattedTarget: `${currencySymbol}25,000`,
    thisMonthRevenue: 0,
    formattedMonthRevenue: `${currencySymbol}0`,
    todayRevenue: 0,
    formattedTodayRevenue: `${currencySymbol}0`,
    progressPercent: 0,
  };

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
              return val + "%";
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

  const handleSaveTarget = async (e) => {
    e.preventDefault();
    const val = parseFloat(newTargetInput);
    if (isNaN(val) || val <= 0) return;

    setIsSaving(true);
    try {
      await updateMonthlyTarget(val);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
            <FiTarget className="w-5 h-5 text-brand-500" /> Monthly Target
          </h3>
          <p className="mt-0.5 text-xs text-gray-400">
            Live progress against your monthly store sales goal
          </p>
        </div>

        <div>
          {!isEditing ? (
            <button
              onClick={() => {
                setNewTargetInput(targetData.monthlyTarget?.toString() || "25000");
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors"
            >
              <FiEdit2 className="w-3.5 h-3.5" /> Edit Goal
            </button>
          ) : (
            <form onSubmit={handleSaveTarget} className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">{currencySymbol}</span>
              <input
                type="number"
                value={newTargetInput}
                onChange={(e) => setNewTargetInput(e.target.value)}
                className="w-20 px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-brand-500 dark:text-white"
                placeholder="25000"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSaving}
                className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                title="Save"
              >
                <FiCheck className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Cancel"
              >
                <FiX className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="relative flex justify-center -my-6">
        <ReactApexChart
          options={options}
          series={series}
          type="radialBar"
          height={310}
        />
        <div className="absolute bottom-6 flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-3 py-1 rounded-full">
          <FiTrendingUp className="w-3.5 h-3.5" />
          <span>{progress}% Achieved</span>
        </div>
      </div>

      <p className="mx-auto mt-2 w-full max-w-[380px] text-center text-xs text-gray-500 sm:w-auto dark:text-gray-400">
        Earned {targetData.formattedTodayRevenue} today. Keep promoting your customized POD products!
      </p>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 mt-4 bg-white border border-gray-100 rounded-xl dark:bg-gray-900/60 dark:border-gray-800">
        <div>
          <p className="text-[11px] uppercase font-semibold tracking-wider text-gray-400">
            Goal Target
          </p>
          <p className="text-base font-extrabold text-gray-800 dark:text-white/90">
            {targetData.formattedTarget}
          </p>
        </div>

        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />

        <div>
          <p className="text-[11px] uppercase font-semibold tracking-wider text-gray-400">
            This Month
          </p>
          <p className="text-base font-extrabold text-brand-600 dark:text-brand-400">
            {targetData.formattedMonthRevenue}
          </p>
        </div>

        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />

        <div>
          <p className="text-[11px] uppercase font-semibold tracking-wider text-gray-400">
            Today
          </p>
          <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {targetData.formattedTodayRevenue}
          </p>
        </div>
      </div>
    </div>
  );
}
