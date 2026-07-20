import React, { useEffect, useRef, useState } from "react";
import { DollarSign, FileText, Users, Store, Bike, Compass, TrendingUp, ShoppingBag, PieChart, Layers } from "lucide-react";
import L from "leaflet";

interface AdminAnalyticsProps {
  stats: any;
  sellers: any[];
  riders: any[];
  orders: any[];
  currency: string;
  loading: boolean;
}

const SELLER_COORDS = { lat: 22.6030, lng: 88.3660 };

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  stats,
  sellers,
  riders,
  orders,
  currency,
  loading,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [hoveredData, setHoveredData] = useState<{ day: string; value: number } | null>(null);

  // 1. Calculate Business Metrics
  const totalSales = stats?.totalSales || 0;
  const totalOrders = stats?.totalOrders || 0;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  
  // 2. Generate Last 7 Days Daily Sales Chart Data
  const getSalesTrendData = () => {
    const data: { day: string; value: number }[] = [];
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const dayName = daysOfWeek[d.getDay()];
      
      const dailySum = orders
        .filter((o) => {
          const isDelivered = o.status?.toLowerCase() === "delivered";
          const orderDate = new Date(o.createdAt).toDateString();
          return isDelivered && orderDate === dateStr;
        })
        .reduce((sum, o) => sum + o.amount, 0);

      data.push({ day: dayName, value: dailySum });
    }
    return data;
  };

  const trendData = getSalesTrendData();
  const maxTrendValue = Math.max(...trendData.map((t) => t.value), 100);

  // 3. Calculate Top Selling Products Leaderboard
  const getTopProducts = () => {
    const productMap: { [key: string]: { name: string; category: string; quantity: number; revenue: number } } = {};
    
    orders.forEach((o) => {
      if (o.status?.toLowerCase() !== "delivered") return;
      
      o.items?.forEach((item: any) => {
        const prod = item.product;
        if (!prod || !prod._id) return;
        
        const q = item.quantity || 1;
        const price = prod.offerPrice || prod.price || 0;
        
        if (productMap[prod._id]) {
          productMap[prod._id].quantity += q;
          productMap[prod._id].revenue += q * price;
        } else {
          productMap[prod._id] = {
            name: prod.name,
            category: prod.category || "General",
            quantity: q,
            revenue: q * price
          };
        }
      });
    });

    return Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const topProducts = getTopProducts();

  // 4. Calculate Category Sales Volume
  const getCategorySales = () => {
    const categoryMap: { [key: string]: number } = {};
    orders.forEach((o) => {
      if (o.status?.toLowerCase() !== "delivered") return;
      
      o.items?.forEach((item: any) => {
        const prod = item.product;
        if (!prod) return;
        const cat = prod.category || "Other";
        const revenue = (item.quantity || 1) * (prod.offerPrice || prod.price || 0);
        categoryMap[cat] = (categoryMap[cat] || 0) + revenue;
      });
    });

    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const categorySales = getCategorySales();
  const totalCategoryRevenue = categorySales.reduce((sum, c) => sum + c.value, 0) || 1;

  // 5. Plot Map Pins (Sellers, Riders)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, { zoomControl: true }).setView(
      [SELLER_COORDS.lat, SELLER_COORDS.lng],
      13
    );
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => mapRef.current?.removeLayer(m));
    markersRef.current = [];

    // Plot Hub
    const primaryIcon = L.divIcon({
      html: `<div class="flex items-center justify-center w-9 h-9 bg-primary text-white rounded-full border-2 border-white shadow-md font-bold">Hub</div>`,
      className: "custom-hub-pin",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
    const primaryMarker = L.marker([SELLER_COORDS.lat, SELLER_COORDS.lng], { icon: primaryIcon })
      .addTo(mapRef.current)
      .bindPopup("<b>SrisCart Primary Baghbazar Store</b>");
    markersRef.current.push(primaryMarker);

    // Plot Sellers
    sellers.forEach((store) => {
      if (Math.abs(store.latitude - SELLER_COORDS.lat) < 0.0001 && Math.abs(store.longitude - SELLER_COORDS.lng) < 0.0001) return;
      const storeIcon = L.divIcon({
        html: `<div class="flex items-center justify-center w-8 h-8 bg-amber-500 rounded-full border border-white text-white shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="lucide lucide-store"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M30 7v3a3 3 0 0 1-6 0v-3"/></svg>
        </div>`,
        className: "custom-seller-pin",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      const storeMarker = L.marker([store.latitude || SELLER_COORDS.lat, store.longitude || SELLER_COORDS.lng], { icon: storeIcon })
        .addTo(mapRef.current!)
        .bindPopup(`<b>Store: ${store.storeName}</b><br/>Status: ${store.status || "Active"}`);
      markersRef.current.push(storeMarker);
    });

    // Plot Riders
    riders.forEach((rider) => {
      const isOnline = rider.status === "Active";
      const riderIcon = L.divIcon({
        html: `<div class="flex items-center justify-center w-9 h-9 ${isOnline ? "bg-emerald-500" : "bg-gray-400"} rounded-full border-2 border-white text-white shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="lucide lucide-bike"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M15 6h5a1 1 0 0 1 1 1v2"/><path d="M12 11.5V14l-3 3"/><path d="m8 6 2-2 3.5 7.5L17 11"/><path d="M12 11.5h4"/></svg>
        </div>`,
        className: "custom-rider-pin",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      const riderMarker = L.marker([rider.latitude || SELLER_COORDS.lat + 0.005, rider.longitude || SELLER_COORDS.lng + 0.005], { icon: riderIcon })
        .addTo(mapRef.current!)
        .bindPopup(`<b>Rider: ${rider.name}</b><br/>Duty: ${isOnline ? "ON (Active)" : "OFF (Inactive)"}`);
      markersRef.current.push(riderMarker);
    });
  }, [sellers, riders]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary"></div>
      </div>
    );
  }

  // Generate SVG Points coordinates for trend line graph
  const svgWidth = 500;
  const svgHeight = 200;
  const points = trendData.map((d, index) => {
    const x = (index / (trendData.length - 1)) * (svgWidth - 60) + 30;
    const y = svgHeight - (d.value / maxTrendValue) * (svgHeight - 60) - 30;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="space-y-8 w-full">
      {/* 1. Industrial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sales */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
            <DollarSign className="w-6.5 h-6.5" />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Sales</p>
            <p className="text-2xl font-black text-gray-800">{currency}{totalSales.toLocaleString()}</p>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <FileText className="w-6.5 h-6.5" />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-black text-gray-800">{totalOrders}</p>
          </div>
        </div>

        {/* AOV */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6.5 h-6.5" />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Avg Order Value</p>
            <p className="text-2xl font-black text-gray-800">{currency}{averageOrderValue}</p>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/10 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
            <Users className="w-6.5 h-6.5" />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-black text-gray-800">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        {/* Sellers */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500/10 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
            <Store className="w-6.5 h-6.5" />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Sellers</p>
            <p className="text-2xl font-black text-gray-800">{stats?.totalSellers || 0}</p>
          </div>
        </div>

        {/* Riders */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-500/10 text-cyan-600 rounded-2xl flex items-center justify-center shrink-0">
            <Bike className="w-6.5 h-6.5" />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Active Riders</p>
            <p className="text-2xl font-black text-gray-800">{stats?.totalRiders || 0}</p>
          </div>
        </div>
      </div>

      {/* 2. Visual Analytics Section (Sales Trend and Category Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* Sales Revenue Trend Line Graph */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-primary" /> Sales Performance
              </span>
              <h3 className="text-lg font-black text-gray-800 mt-0.5">Revenue Trend (Last 7 Days)</h3>
            </div>
          </div>

          {/* Interactive SVG Chart */}
          <div className="w-full pt-4">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-fit overflow-visible">
              {/* Gridlines */}
              <line x1="30" y1="30" x2={svgWidth - 30} y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="85" x2={svgWidth - 30} y2="85" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="140" x2={svgWidth - 30} y2="140" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="170" x2={svgWidth - 30} y2="170" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Area Gradient under line */}
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={`M 30,170 L ${points} L ${svgWidth - 30},170 Z`}
                fill="url(#chart-gradient)"
              />

              {/* Trend Line */}
              <polyline
                fill="none"
                stroke="#d97706"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />

              {/* Static Value Tags */}
              {trendData.map((d, idx) => {
                const x = (idx / (trendData.length - 1)) * (svgWidth - 60) + 30;
                const y = svgHeight - (d.value / maxTrendValue) * (svgHeight - 60) - 30;
                return (
                  <g key={idx}>
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#ffffff"
                      stroke="#d97706"
                      strokeWidth="2.5"
                    />
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      fill="#475569"
                      className="text-[9px] font-extrabold"
                    >
                      {d.value > 0 ? `${currency}${d.value}` : ""}
                    </text>
                    <text
                      x={x}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      fill="#94a3b8"
                      className="text-[10px] font-bold"
                    >
                      {d.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Sales by Category (Vertical Volume) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-primary" /> Category Distribution
            </span>
            <h3 className="text-lg font-black text-gray-800 mt-0.5 mb-5">Sales by Category</h3>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {categorySales.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">No categorised product sales recorded.</p>
            ) : (
              categorySales.map((cat, idx) => {
                const percentage = Math.round((cat.value / totalCategoryRevenue) * 100);
                const barColors = [
                  "bg-gradient-to-r from-amber-400 to-amber-500",
                  "bg-gradient-to-r from-blue-400 to-blue-500",
                  "bg-gradient-to-r from-emerald-400 to-emerald-500",
                  "bg-gradient-to-r from-purple-400 to-purple-500",
                ];
                const colorClass = barColors[idx % barColors.length];

                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                      <span className="capitalize">{cat.name}</span>
                      <span>{currency}{cat.value.toLocaleString()} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 3. Product Leaderboard & Dispatch Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        {/* Left Column: Top Selling Products (Leaderboard) */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg">
          <div className="border-b border-gray-100 pb-3 mb-4">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-primary" /> Top Performers
            </span>
            <h3 className="text-lg font-black text-gray-800 mt-0.5">Top Selling Products</h3>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-center">Qty Sold</th>
                  <th className="pb-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-xs text-gray-400">
                      No sales data available.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-primary/10 text-primary font-black text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="truncate max-w-[160px]">{p.name}</span>
                      </td>
                      <td className="py-3.5 text-xs text-gray-550 capitalize">{p.category}</td>
                      <td className="py-3.5 text-center font-extrabold text-gray-800">{p.quantity}</td>
                      <td className="py-3.5 text-right font-black text-emerald-600">{currency}{p.revenue.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Physical Partner Map */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg flex flex-col justify-between">
          <div className="border-b border-gray-100 pb-3 mb-4">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" /> Active Logistics Map
            </span>
            <h3 className="text-lg font-black text-gray-800 mt-0.5">Physical Coverage Radius</h3>
          </div>

          <div 
            ref={mapContainerRef} 
            className="w-full h-64 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-inner z-10" 
          />

          <p className="text-[11px] text-gray-400 leading-normal text-center mt-3">
            Physical mapping of all onboarded merchant stores (yellow) and delivery rider agents (green/gray) around the core Baghbazar hub.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
