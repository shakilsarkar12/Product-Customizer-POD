import { NextResponse } from "next/server";
import { getCredentialsFromDb, saveCredentialsToDb } from "@/lib/mongodb";
import { getValidAdminAccessToken } from "@/lib/shopifyTokenService";
import { getTemplates } from "@/lib/templatesDb";

/**
 * High Performance Live Store Analytics API
 * Aggregates live Shopify Admin REST data + MongoDB Customizer Orders & Templates
 */

// Helper to extract country name from country code or address
function getCountryInfo(code, name) {
  const map = {
    US: { name: "United States", flag: "/images/country/country-01.svg" },
    FR: { name: "France", flag: "/images/country/country-02.svg" },
    GB: { name: "United Kingdom", flag: "/images/country/country-01.svg" },
    CA: { name: "Canada", flag: "/images/country/country-01.svg" },
    DE: { name: "Germany", flag: "/images/country/country-02.svg" },
    AU: { name: "Australia", flag: "/images/country/country-01.svg" },
    BD: { name: "Bangladesh", flag: "/images/country/country-01.svg" },
    IN: { name: "India", flag: "/images/country/country-01.svg" },
  };

  const cleanCode = (code || "").toUpperCase();
  if (map[cleanCode]) {
    return map[cleanCode];
  }
  return {
    name: name || code || "International",
    flag: "/images/country/country-01.svg",
  };
}

export async function GET(req) {
  try {
    const creds = (await getCredentialsFromDb()) || {};
    const shop = (creds.shopDomain || process.env.SHOPIFY_STORE_DOMAIN || "")
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");

    let storeName = creds.siteName || creds.dashboardTitle || (shop ? `${shop.split(".")[0].toUpperCase()} Store` : "My Customizer Store");
    let currency = creds.currency || "USD";
    let currencySymbol = currency.includes("BDT") ? "৳" : currency.includes("EUR") ? "€" : currency.includes("GBP") ? "£" : "$";
    let monthlyTarget = creds.monthlyTarget || 25000;

    let shopifyOrders = [];
    let liveShopDetails = null;
    let shopifyCustomersCount = 0;
    let shopifyProductsCount = 0;

    const accessToken = await getValidAdminAccessToken();

    if (accessToken && shop && !accessToken.startsWith("mock_") && !accessToken.startsWith("shpat_random")) {
      // 1. Fetch live Store metadata
      try {
        const shopRes = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        });
        if (shopRes.ok) {
          const shopData = await shopRes.json();
          if (shopData.shop) {
            liveShopDetails = shopData.shop;
            storeName = liveShopDetails.name || storeName;
            currency = liveShopDetails.currency || currency;
            currencySymbol = liveShopDetails.money_format ? liveShopDetails.money_format.charAt(0) : currencySymbol;
          }
        }
      } catch (err) {
        console.warn("[Shopify Live Shop Sync Error]:", err.message);
      }

      // 2. Fetch live Orders
      try {
        const ordersRes = await fetch(
          `https://${shop}/admin/api/2024-01/orders.json?status=any&limit=50&fields=id,name,order_number,total_price,financial_status,fulfillment_status,created_at,customer,line_items,shipping_address`,
          {
            headers: {
              "X-Shopify-Access-Token": accessToken,
              "Content-Type": "application/json",
            },
          }
        );
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (Array.isArray(ordersData.orders)) {
            shopifyOrders = ordersData.orders;
          }
        }
      } catch (err) {
        console.warn("[Shopify Live Orders Sync Error]:", err.message);
      }

      // 3. Fetch Customers count
      try {
        const custRes = await fetch(`https://${shop}/admin/api/2024-01/customers/count.json`, {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        });
        if (custRes.ok) {
          const custData = await custRes.json();
          shopifyCustomersCount = custData.count || 0;
        }
      } catch (err) {
        console.warn("[Shopify Customer Count Error]:", err.message);
      }

      // 4. Fetch Products count
      try {
        const prodRes = await fetch(`https://${shop}/admin/api/2024-01/products/count.json`, {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        });
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          shopifyProductsCount = prodData.count || 0;
        }
      } catch (err) {
        console.warn("[Shopify Product Count Error]:", err.message);
      }
    }

    let totalRevenue = 0;
    let todayRevenue = 0;
    let totalOrders = shopifyOrders.length;
    let totalCustomers = shopifyCustomersCount || 0;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const todayDateStr = now.toISOString().split("T")[0];

    const monthlySalesMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const monthlyRevenueMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const countryCountMap = {};

    let formattedOrders = [];

    if (shopifyOrders.length > 0) {
      // Process real live Shopify orders
      shopifyOrders.forEach((o) => {
        const price = parseFloat(o.total_price || 0);
        totalRevenue += price;

        const orderDate = new Date(o.created_at);
        const orderDateStr = o.created_at ? o.created_at.split("T")[0] : "";
        if (orderDateStr === todayDateStr) {
          todayRevenue += price;
        }

        if (orderDate.getFullYear() === currentYear) {
          const m = orderDate.getMonth();
          monthlySalesMap[m] += 1;
          monthlyRevenueMap[m] += price;
        }

        // Country tally
        const countryCode = o.shipping_address?.country_code || o.customer?.default_address?.country_code || "US";
        const countryName = o.shipping_address?.country || o.customer?.default_address?.country || "United States";
        if (!countryCountMap[countryCode]) {
          countryCountMap[countryCode] = { code: countryCode, name: countryName, count: 0 };
        }
        countryCountMap[countryCode].count += 1;

        // Line item details
        const firstItem = o.line_items?.[0] || {};
        const variantTitle = firstItem.variant_title ? `${firstItem.variant_title}` : "Standard";
        const status = o.fulfillment_status === "fulfilled"
          ? "Delivered"
          : o.financial_status === "paid"
          ? "Processing"
          : o.financial_status === "pending"
          ? "Pending"
          : "Canceled";

        formattedOrders.push({
          id: o.id || o.order_number,
          orderNumber: o.name || `#${o.order_number || o.id}`,
          name: firstItem.title || "Customized POD Product",
          variants: variantTitle,
          category: firstItem.vendor || "Print-on-Demand",
          price: `${currencySymbol}${price.toFixed(2)}`,
          rawPrice: price,
          status,
          customerName: o.customer ? `${o.customer.first_name || ""} ${o.customer.last_name || ""}`.trim() || "Shopify Customer" : "Direct Customer",
          date: o.created_at ? new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Today",
          image: firstItem.properties?.find((p) => p.name === "_custom_image")?.value || "/images/product/product-01.jpg",
        });
      });
    }

    // Demographics calculation (only from real data)
    const totalDemographicCount = Object.values(countryCountMap).reduce((acc, c) => acc + c.count, 0) || 0;
    const demographicsList = totalDemographicCount > 0
      ? Object.values(countryCountMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
          .map((c) => {
            const info = getCountryInfo(c.code, c.name);
            const percent = Math.round((c.count / totalDemographicCount) * 100);
            return {
              country: info.name,
              code: c.code,
              flag: info.flag,
              customers: c.count,
              percentage: percent,
            };
          })
      : [];

    // Active Templates Count from DB
    const dbTemplates = await getTemplates();
    const totalTemplates = dbTemplates.length;

    // Monthly Target Calculations
    const thisMonthRevenue = monthlyRevenueMap[currentMonth] || 0;
    const progressPercent = monthlyTarget > 0 ? Math.min(100, Math.round((thisMonthRevenue / monthlyTarget) * 100)) : 0;

    const responsePayload = {
      storeInfo: {
        name: storeName,
        domain: shop,
        currency,
        currencySymbol,
        productsCount: shopifyProductsCount,
        lastSyncedAt: new Date().toISOString(),
      },
      metrics: {
        totalCustomers: totalCustomers.toLocaleString(),
        customersGrowth: totalCustomers > 0 ? "+100%" : "0%",
        totalOrders: totalOrders.toLocaleString(),
        ordersGrowth: totalOrders > 0 ? "+100%" : "0%",
        totalRevenue: `${currencySymbol}${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        rawTotalRevenue: totalRevenue,
        revenueGrowth: totalRevenue > 0 ? "+100%" : "0%",
        totalTemplates: totalTemplates.toString(),
        templatesGrowth: "Live Active",
      },
      recentOrders: formattedOrders.slice(0, 10),
      monthlySales: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        salesCount: monthlySalesMap,
        revenue: monthlyRevenueMap,
      },
      targetData: {
        monthlyTarget: monthlyTarget,
        formattedTarget: `${currencySymbol}${monthlyTarget.toLocaleString()}`,
        thisMonthRevenue: thisMonthRevenue,
        formattedMonthRevenue: `${currencySymbol}${thisMonthRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        todayRevenue: todayRevenue,
        formattedTodayRevenue: `${currencySymbol}${todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        progressPercent: progressPercent,
      },
      demographics: demographicsList,
      statistics: {
        monthly: {
          categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          sales: monthlySalesMap,
          revenue: monthlyRevenueMap.map((r) => Math.round(r / 10)),
        },
        quarterly: {
          categories: ["Q1 (Jan-Mar)", "Q2 (Apr-Jun)", "Q3 (Jul-Sep)", "Q4 (Oct-Dec)"],
          sales: [
            monthlySalesMap[0] + monthlySalesMap[1] + monthlySalesMap[2],
            monthlySalesMap[3] + monthlySalesMap[4] + monthlySalesMap[5],
            monthlySalesMap[6] + monthlySalesMap[7] + monthlySalesMap[8],
            monthlySalesMap[9] + monthlySalesMap[10] + monthlySalesMap[11],
          ],
          revenue: [
            Math.round((monthlyRevenueMap[0] + monthlyRevenueMap[1] + monthlyRevenueMap[2]) / 10),
            Math.round((monthlyRevenueMap[3] + monthlyRevenueMap[4] + monthlyRevenueMap[5]) / 10),
            Math.round((monthlyRevenueMap[6] + monthlyRevenueMap[7] + monthlyRevenueMap[8]) / 10),
            Math.round((monthlyRevenueMap[9] + monthlyRevenueMap[10] + monthlyRevenueMap[11]) / 10),
          ],
        },
        annually: {
          categories: ["2024", "2025", "2026 (YTD)"],
          sales: [0, 0, totalOrders],
          revenue: [0, 0, Math.round(totalRevenue / 10)],
        },
      },
    };

    return NextResponse.json(responsePayload);
  } catch (err) {
    console.error("[Dashboard Stats API Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { monthlyTarget, siteName, dashboardTitle } = body;

    const existingData = (await getCredentialsFromDb()) || {};
    const updated = {
      ...existingData,
      monthlyTarget: monthlyTarget ? parseFloat(monthlyTarget) : existingData.monthlyTarget || 25000,
      siteName: siteName || existingData.siteName,
      dashboardTitle: dashboardTitle || existingData.dashboardTitle,
      updatedAt: new Date(),
    };

    await saveCredentialsToDb(updated);
    return NextResponse.json({ success: true, message: "Dashboard settings updated successfully!", data: updated });
  } catch (err) {
    console.error("[Dashboard Stats POST Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
