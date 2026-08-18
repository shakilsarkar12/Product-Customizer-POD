"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [chartPeriod, setChartPeriod] = useState("monthly"); // monthly | quarterly | annually
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardStats = useCallback(async (isManualSync = false) => {
    if (isManualSync) {
      setSyncing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await fetch("/api/dashboard/stats", {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch stats (Status: ${res.status})`);
      }
      const stats = await res.json();
      setData(stats);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("[DashboardContext Fetch Error]:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const updateMonthlyTarget = async (newTarget) => {
    try {
      const res = await fetch("/api/dashboard/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyTarget: newTarget }),
      });
      if (res.ok) {
        await fetchDashboardStats(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error("[Update Target Error]:", err);
      return false;
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        data,
        loading,
        syncing,
        error,
        chartPeriod,
        setChartPeriod,
        refreshData: () => fetchDashboardStats(true),
        updateMonthlyTarget,
        lastUpdated,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
