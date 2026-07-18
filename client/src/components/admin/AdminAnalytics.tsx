import React, { useEffect, useRef } from "react";
import { DollarSign, FileText, Users, Store, Bike, Compass, MapPin } from "lucide-react";
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

  // Count order status types
  const pendingOrders = orders.filter(
    (o) => {
      const s = o.status?.toLowerCase() || "";
      return s === "order_placed" || s === "order placed";
    }
  ).length;

  const acceptedOrders = orders.filter(
    (o) => {
      const s = o.status?.toLowerCase() || "";
      return s === "order_accepted" || s === "order accepted";
    }
  ).length;

  const activeDeliveries = orders.filter(
    (o) => {
      const s = o.status?.toLowerCase() || "";
      return s === "rider_assigned" || s === "rider assigned" || s === "out_for_delivery" || s === "out for delivery";
    }
  ).length;

  const completedOrders = orders.filter(
    (o) => {
      const s = o.status?.toLowerCase() || "";
      return s === "delivered";
    }
  ).length;

  // Initialize Map and plot markers
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

  // Sync Markers when sellers/riders data updates
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach((marker) => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Plot primary store hub
    const primaryIcon = L.divIcon({
      html: `<div class="flex items-center justify-center w-9 h-9 bg-primary text-white rounded-full border-2 border-white shadow-md font-bold">
        Hub
      </div>`,
      className: "custom-hub-pin",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
    const primaryMarker = L.marker([SELLER_COORDS.lat, SELLER_COORDS.lng], { icon: primaryIcon })
      .addTo(mapRef.current)
      .bindPopup("<b>SrisCart Primary Baghbazar Store</b>");
    markersRef.current.push(primaryMarker);

    // Plot other Sellers
    sellers.forEach((store) => {
      // Don't duplicate primary hub coords if same
      if (Math.abs(store.latitude - SELLER_COORDS.lat) < 0.0001 && Math.abs(store.longitude - SELLER_COORDS.lng) < 0.0001) {
        return;
      }

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
        html: `<div class="flex items-center justify-center w-9 h-9 ${
          isOnline ? "bg-emerald-500" : "bg-gray-400"
        } rounded-full border-2 border-white text-white shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="lucide lucide-bike"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M15 6h5a1 1 0 0 1 1 1v2"/><path d="M12 11.5V14l-3 3"/><path d="m8 6 2-2 3.5 7.5L17 11"/><path d="M12 11.5h4"/></svg>
        </div>`,
        className: "custom-rider-pin",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const riderMarker = L.marker([rider.latitude || SELLER_COORDS.lat + 0.005, rider.longitude || SELLER_COORDS.lng + 0.005], { icon: riderIcon })
        .addTo(mapRef.current!)
        .bindPopup(`<b>Rider: ${rider.name}</b><br/>Duty Status: ${isOnline ? "ON (Active)" : "OFF (Inactive)"}`);
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

  return (
    <div className="space-y-6">
      {/* 1. Hero Analytics Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Sales</p>
            <p className="text-xl font-black text-gray-800">{currency}{stats?.totalSales || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Orders</p>
            <p className="text-xl font-black text-gray-800">{stats?.totalOrders || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/10 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Users</p>
            <p className="text-xl font-black text-gray-800">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Sellers</p>
            <p className="text-xl font-black text-gray-800">{stats?.totalSellers || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-500/10 text-cyan-600 rounded-xl flex items-center justify-center shrink-0">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Riders</p>
            <p className="text-xl font-black text-gray-800">{stats?.totalRiders || 0}</p>
          </div>
        </div>
      </div>

      {/* 2. Order Breakdown grid and Dispatch Map layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Order Insights */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-3">
              Order Breakdown
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
                <span className="text-gray-500">Pending Confirmation:</span>
                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold">{pendingOrders}</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
                <span className="text-gray-500">Confirmed & Prepared:</span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold">{acceptedOrders}</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
                <span className="text-gray-500">Active Deliveries:</span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">{activeDeliveries}</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
                <span className="text-gray-500">Completed:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">{completedOrders}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live dispatch map */}
        <div className="lg:col-span-8 flex flex-col min-h-[450px] bg-gray-100 rounded-3xl overflow-hidden border border-gray-200 shadow-inner relative">
          <div ref={mapContainerRef} className="absolute inset-0 z-10" />
          <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl border border-gray-100 shadow-xl max-w-xs space-y-1">
            <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-500 animate-pulse" /> Platform Dispatch Map
            </p>
            <p className="text-[10px] text-gray-400 leading-normal">
              Showing physical locations of all store sellers (orange pins) and active riders (green/grey bike markers).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
