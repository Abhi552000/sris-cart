import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserOrders } from "../services/orderService";
import { CURRENCY } from "../constants";
import { MapPin, Bike, Clock, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import L from "leaflet";

const SELLER_COORDS = { lat: 22.6030, lng: 88.3660 };

// Helper to interpolate points for the rider path
const generateRoutePoints = (start: [number, number], end: [number, number], steps = 50) => {
  const points: [number, number][] = [];
  const corner: [number, number] = [start[0], end[1]];
  const halfSteps = Math.floor(steps / 2);
  
  for (let i = 0; i <= halfSteps; i++) {
    const t = i / halfSteps;
    const lat = start[0] + (corner[0] - start[0]) * t;
    const lng = start[1] + (corner[1] - start[1]) * t;
    points.push([lat, lng]);
  }
  
  for (let i = 1; i <= halfSteps; i++) {
    const t = i / halfSteps;
    const lat = corner[0] + (end[0] - corner[0]) * t;
    const lng = corner[1] + (end[1] - corner[1]) * t;
    points.push([lat, lng]);
  }
  
  return points;
};

// Haversine formula to compute distance in km
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const currency = CURRENCY;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);

  const fetchOrderDetails = async (silent = false) => {
    try {
      const data = await getUserOrders();
      if (data.success) {
        const foundOrder = data.orders.find((o: any) => o._id === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
        } else if (!silent) {
          toast.error("Order not found");
          navigate("/my-orders");
        }
      } else if (!silent) {
        toast.error("Failed to load orders");
      }
    } catch (error: any) {
      if (!silent) {
        toast.error(error.message || "Failed to fetch order details");
      }
    } finally {
      setLoading(false);
    }
  };

  // Poll order details every 3 seconds for full full-stack synchronization
  useEffect(() => {
    fetchOrderDetails(false);
    const interval = setInterval(() => {
      fetchOrderDetails(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Set up Map on mount / once order is loaded
  useEffect(() => {
    if (!order || !mapContainerRef.current || mapRef.current) return;

    const buyerLat = order.address?.latitude || SELLER_COORDS.lat + 0.015;
    const buyerLng = order.address?.longitude || SELLER_COORDS.lng + 0.015;

    // Create Map and center it at mid-point
    const midLat = (SELLER_COORDS.lat + buyerLat) / 2;
    const midLng = (SELLER_COORDS.lng + buyerLng) / 2;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView([midLat, midLng], 14);
    mapRef.current = map;

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Custom Store Icon
    const storeIcon = L.divIcon({
      html: `<div class="flex items-center justify-center w-10 h-10 bg-amber-500 rounded-full border-2 border-white shadow-lg text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="lucide lucide-store"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M30 7v3a3 3 0 0 1-6 0v-3"/></svg>
      </div>`,
      className: "custom-store-pin",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    // Custom Home Icon
    const homeIcon = L.divIcon({
      html: `<div class="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full border-2 border-white shadow-lg text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>`,
      className: "custom-home-pin",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    // Add Markers
    L.marker([SELLER_COORDS.lat, SELLER_COORDS.lng], { icon: storeIcon })
      .addTo(map)
      .bindPopup("<b>SrisCart Hub (Seller)</b>")
      .openPopup();

    destinationMarkerRef.current = L.marker([buyerLat, buyerLng], { icon: homeIcon })
      .addTo(map)
      .bindPopup("<b>Your Delivery Address</b>");

    // Route points and line
    const points = generateRoutePoints([SELLER_COORDS.lat, SELLER_COORDS.lng], [buyerLat, buyerLng]);

    routeLineRef.current = L.polyline(points, {
      color: "#3b82f6",
      weight: 4,
      opacity: 0.7,
      dashArray: "8, 8",
    }).addTo(map);

    // Zoom map to fit route bounds
    const bounds = L.latLngBounds([SELLER_COORDS.lat, SELLER_COORDS.lng], [buyerLat, buyerLng]);
    map.fitBounds(bounds, { padding: [50, 50] });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        riderMarkerRef.current = null;
        routeLineRef.current = null;
        destinationMarkerRef.current = null;
      }
    };
  }, [order]);

  // Synchronize Rider Location on map updates
  useEffect(() => {
    if (!order || !mapRef.current) return;

    // Custom Rider Icon
    const riderIcon = L.divIcon({
      html: `<div class="flex items-center justify-center w-11 h-11 bg-emerald-500 rounded-full border-2 border-white shadow-xl text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="lucide lucide-bike"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M15 6h5a1 1 0 0 1 1 1v2"/><path d="M12 11.5V14l-3 3"/><path d="m8 6 2-2 3.5 7.5L17 11"/><path d="M12 11.5h4"/></svg>
      </div>`,
      className: "custom-rider-pin",
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const statusLower = order.status?.toLowerCase() || "order_placed";
    const isDelivered = statusLower === "delivered";
    const hasCoords = order.riderLatitude !== null && order.riderLongitude !== null;

    if (isDelivered) {
      const endPoint = [
        order.address?.latitude || SELLER_COORDS.lat + 0.015,
        order.address?.longitude || SELLER_COORDS.lng + 0.015
      ];
      if (riderMarkerRef.current) {
        riderMarkerRef.current.setLatLng(endPoint as any);
      } else {
        riderMarkerRef.current = L.marker(endPoint as any, { icon: riderIcon }).addTo(mapRef.current);
      }
      riderMarkerRef.current.bindPopup("<b>Delivered Successfully!</b>").openPopup();
    } else if (hasCoords) {
      const currentPos = L.latLng(order.riderLatitude, order.riderLongitude);
      if (riderMarkerRef.current) {
        riderMarkerRef.current.setLatLng(currentPos);
      } else {
        riderMarkerRef.current = L.marker(currentPos, { icon: riderIcon }).addTo(mapRef.current);
      }

      // Smoothly pan map to track rider movement
      if (statusLower === "out_for_delivery" || statusLower === "out for delivery") {
        mapRef.current.panTo(currentPos);
        riderMarkerRef.current.bindPopup("<b>Rider is delivering...</b>").openPopup();
      } else if (statusLower === "rider_assigned" || statusLower === "rider assigned") {
        riderMarkerRef.current.bindPopup("<b>Rider accepted! Collecting items...</b>").openPopup();
      }
    } else {
      // Rider preparing at store
      const startPoint = L.latLng(SELLER_COORDS.lat, SELLER_COORDS.lng);
      if (riderMarkerRef.current) {
        riderMarkerRef.current.setLatLng(startPoint);
      } else {
        riderMarkerRef.current = L.marker(startPoint, { icon: riderIcon }).addTo(mapRef.current);
      }
      if (statusLower === "order_accepted" || statusLower === "order accepted") {
        riderMarkerRef.current.bindPopup("<b>Waiting for Rider to accept...</b>").openPopup();
      } else {
        riderMarkerRef.current.bindPopup("<b>Preparing items...</b>").openPopup();
      }
    }

  }, [order]);

  // Calculate live progress percentage from coordinates
  const getProgressPercentage = () => {
    if (!order) return 0;
    const statusLower = order.status?.toLowerCase() || "order_placed";
    if (statusLower === "delivered") return 100;
    if ((statusLower === "out_for_delivery" || statusLower === "out for delivery") && 
        order.riderLatitude !== undefined && 
        order.riderLatitude !== null && 
        order.riderLongitude !== undefined && 
        order.riderLongitude !== null) {
      const buyerLat = order.address?.latitude || SELLER_COORDS.lat + 0.015;
      const buyerLng = order.address?.longitude || SELLER_COORDS.lng + 0.015;

      const remainingDist = getDistance(
        order.riderLatitude,
        order.riderLongitude,
        buyerLat,
        buyerLng
      );
      const totalDist = getDistance(
        SELLER_COORDS.lat,
        SELLER_COORDS.lng,
        buyerLat,
        buyerLng
      );

      if (totalDist === 0) return 100;
      
      const pct = Math.max(0, Math.min(100, Math.round((1 - remainingDist / totalDist) * 100)));
      return pct;
    }
    return 0;
  };

  const progress = getProgressPercentage();

  const getRiderStatusText = () => {
    const statusLower = order?.status?.toLowerCase() || "order_placed";
    if (statusLower === "delivered") return "Your order has been delivered!";
    if (statusLower === "out_for_delivery" || statusLower === "out for delivery") {
      if (progress === 0) return "Rider picking up items from Baghbazar Store...";
      if (progress < 40) return "Rider has left the store and is heading your way.";
      if (progress < 85) return "Rider is passing Baghbazar Street. On-track for delivery.";
      if (progress < 100) return "Almost there! Rider is entering your neighborhood.";
      return "Rider has arrived at your address!";
    }
    if (statusLower === "rider_assigned" || statusLower === "rider assigned") return "Rider has been assigned and is heading to the store to collect items.";
    if (statusLower === "order_accepted" || statusLower === "order accepted") return "Seller has accepted your order. Finding nearest active rider...";
    return "Waiting for seller to accept your order...";
  };

  const getStepStatusClass = (stepIndex: number) => {
    const statuses = ["order_placed", "order_accepted", "rider_assigned", "out_for_delivery", "delivered"];
    const statusLower = order?.status?.toLowerCase() || "order_placed";
    
    // Normalize status strings
    let currentIdx = statuses.indexOf(statusLower);
    if (currentIdx === -1) {
      if (statusLower === "order placed") currentIdx = 0;
      else if (statusLower === "order accepted") currentIdx = 1;
      else if (statusLower === "rider assigned") currentIdx = 2;
      else if (statusLower === "out for delivery") currentIdx = 3;
    }
    
    if (currentIdx >= stepIndex) {
      return "bg-emerald-500 border-emerald-500 text-white";
    }
    return "bg-gray-100 border-gray-200 text-gray-400";
  };

  const isStepCompleted = (stepIndex: number) => {
    const statuses = ["order_placed", "order_accepted", "rider_assigned", "out_for_delivery", "delivered"];
    const statusLower = order?.status?.toLowerCase() || "order_placed";
    
    // Normalize status strings
    let currentIdx = statuses.indexOf(statusLower);
    if (currentIdx === -1) {
      if (statusLower === "order placed") currentIdx = 0;
      else if (statusLower === "order accepted") currentIdx = 1;
      else if (statusLower === "rider assigned") currentIdx = 2;
      else if (statusLower === "out for delivery") currentIdx = 3;
    }
    return currentIdx >= stepIndex;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mt-16 text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md mx-auto">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-gray-800">Order Not Found</h2>
        <p className="text-gray-500 text-sm mt-2">The order ID does not exist or has been deleted.</p>
        <button onClick={() => navigate("/my-orders")} className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl font-bold transition">
          Go back to Orders
        </button>
      </div>
    );
  }

  const orderStatusLower = order.status?.toLowerCase() || "order_placed";
  const showProgress = orderStatusLower === "out_for_delivery" || orderStatusLower === "out for delivery";

  return (
    <div className="mt-16 pb-20 max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate("/my-orders")}
            className="flex items-center gap-1.5 text-gray-500 hover:text-primary font-semibold text-sm transition cursor-pointer mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Orders
          </button>
          <h1 className="text-3xl font-extrabold text-gray-800">
            Track Order <span className="text-primary bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 bg-white px-5 py-3.5 rounded-2xl border border-gray-100 shadow-lg">
          <Clock className="w-6 h-6 text-primary animate-pulse shrink-0" />
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Estimated Delivery</p>
            <p className="font-bold text-gray-800 text-sm sm:text-base">
              {orderStatusLower === "delivered" ? "Delivered!" : showProgress ? `${Math.max(1, Math.round((100 - progress) * 0.15))} Mins Remaining` : "Under 30 Minutes"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Timeline / Order Card */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          {/* Rider status alert */}
          <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex gap-4">
            <Bike className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-800 text-sm">Delivery Status Update</h4>
              <p className="text-emerald-700 text-xs mt-1 leading-relaxed">
                {getRiderStatusText()}
              </p>
            </div>
          </div>

          {/* Progress timeline */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-50/50">
            <h3 className="font-bold text-gray-800 mb-6 text-base">Tracking Timeline</h3>
            <div className="relative space-y-8 pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
              {/* Step 1 */}
              <div className="relative">
                <span className={`absolute left-[-29px] top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${getStepStatusClass(0)}`}>
                  {isStepCompleted(0) ? <CheckCircle2 className="w-4 h-4 fill-emerald-500 stroke-white" /> : "1"}
                </span>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Order Placed</h4>
                  <p className="text-gray-400 text-xs mt-0.5">We have received your order details.</p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="relative">
                <span className={`absolute left-[-29px] top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${getStepStatusClass(1)}`}>
                  {isStepCompleted(1) ? <CheckCircle2 className="w-4 h-4 fill-emerald-500 stroke-white" /> : "2"}
                </span>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Order Accepted</h4>
                  <p className="text-gray-400 text-xs mt-0.5">Seller has confirmed your items and packing.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <span className={`absolute left-[-29px] top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${getStepStatusClass(2)}`}>
                  {isStepCompleted(2) ? <CheckCircle2 className="w-4 h-4 fill-emerald-500 stroke-white" /> : "3"}
                </span>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Rider Assigned</h4>
                  <p className="text-gray-400 text-xs mt-0.5">Rider is assigned and heading to collect package.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <span className={`absolute left-[-29px] top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${getStepStatusClass(3)}`}>
                  {isStepCompleted(3) ? <CheckCircle2 className="w-4 h-4 fill-emerald-500 stroke-white" /> : "4"}
                </span>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Out for Delivery</h4>
                  <p className="text-gray-400 text-xs mt-0.5">Rider is bringing items in express cold-chain.</p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="relative">
                <span className={`absolute left-[-29px] top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${getStepStatusClass(4)}`}>
                  {isStepCompleted(4) ? <CheckCircle2 className="w-4 h-4 fill-emerald-500 stroke-white" /> : "5"}
                </span>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Delivered</h4>
                  <p className="text-gray-400 text-xs mt-0.5">Order completed successfully.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Address Details Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-50/50 text-xs sm:text-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-1.5">
              <MapPin className="w-4.5 h-4.5 text-primary" /> Delivery Details
            </h3>
            <div className="space-y-2.5 text-gray-600">
              <p>
                <span className="font-bold text-gray-700">Recipient:</span> {order.address?.firstName} {order.address?.lastName}
              </p>
              <p>
                <span className="font-bold text-gray-700">Address:</span> {order.address?.street}, {order.address?.city}, {order.address?.state} {order.address?.zipcode}
              </p>
              <p>
                <span className="font-bold text-gray-700">Phone:</span> {order.address?.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Map Container */}
        <div className="lg:col-span-7 flex flex-col min-h-[450px] lg:min-h-0 bg-gray-100 rounded-3xl overflow-hidden border border-gray-200 shadow-inner relative">
          <div ref={mapContainerRef} className="absolute inset-0 z-10" />

          {/* Floating Progress Bar */}
          {showProgress && (
            <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-xl flex flex-col gap-2 max-w-sm">
              <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                <span className="flex items-center gap-1">
                  <Bike className="w-4 h-4 text-emerald-500" /> Rider Progress
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
