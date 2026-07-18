import React, { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  getAvailableOrders, 
  acceptOrder, 
  updateDeliveryStep, 
  updateRiderLocation 
} from "../../services/riderService";
import { Compass, Award } from "lucide-react";
import { CURRENCY } from "../../constants";
import toast from "react-hot-toast";
import L from "leaflet";

// Components
import ActiveJobCard from "../../components/rider/ActiveJobCard";
import AvailableJobsList from "../../components/rider/AvailableJobsList";

const SELLER_COORDS = { lat: 22.6030, lng: 88.3660 };

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

const ActiveDeliveries = () => {
  const { rider, setRider } = useOutletContext<any>();
  const currency = CURRENCY;

  // States
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [activeJob, setActiveJob] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      const data = await getAvailableOrders();
      if (data.success) {
        setJobs(data.orders);
        
        const active = data.orders.find((o: any) => {
          const s = o.status?.toLowerCase() || "order_placed";
          return s === "rider_assigned" || s === "rider assigned" || s === "out_for_delivery" || s === "out for delivery";
        });
        if (active) {
          setActiveJob(active);
          const actStat = active.status?.toLowerCase();
          if (actStat === "out_for_delivery" || actStat === "out for delivery") {
            setSimulating(true);
          }
        } else {
          setActiveJob(null);
          setSimulating(false);
          setSimProgress(0);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load jobs");
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Map setup
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const startLat = rider?.latitude || SELLER_COORDS.lat;
    const startLng = rider?.longitude || SELLER_COORDS.lng;

    const map = L.map(mapContainerRef.current, { zoomControl: true }).setView(
      [startLat, startLng],
      14
    );
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const storeIcon = L.divIcon({
      html: `<div class="flex items-center justify-center w-8 h-8 bg-amber-500 rounded-full border border-white text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="lucide lucide-store"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M30 7v3a3 3 0 0 1-6 0v-3"/></svg>
      </div>`,
      className: "custom-store-pin",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([SELLER_COORDS.lat, SELLER_COORDS.lng], { icon: storeIcon })
      .addTo(map)
      .bindPopup("<b>SrisCart Store (Pick-up Hub)</b>");

    const riderIcon = L.divIcon({
      html: `<div class="flex items-center justify-center w-10 h-10 bg-emerald-500 rounded-full border-2 border-white text-white shadow-lg animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="lucide lucide-bike"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M15 6h5a1 1 0 0 1 1 1v2"/><path d="M12 11.5V14l-3 3"/><path d="m8 6 2-2 3.5 7.5L17 11"/><path d="M12 11.5h4"/></svg>
      </div>`,
      className: "custom-rider-pin",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const marker = L.marker([startLat, startLng], { icon: riderIcon })
      .addTo(map)
      .bindPopup("<b>You (Rider)</b>")
      .openPopup();
    riderMarkerRef.current = marker;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 14);
          marker.setLatLng([latitude, longitude]);
          try {
            const data = await updateRiderLocation(latitude, longitude);
            if (data.success && data.rider) {
              setRider(data.rider);
            }
          } catch (err) {
            console.error("Failed to sync current location:", err);
          }
        },
        (error) => {
          console.log("Geolocation unavailable.", error);
        }
      );
    }

    map.on("click", async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      try {
        const data = await updateRiderLocation(lat, lng);
        if (data.success && data.rider) {
          setRider(data.rider);
        }
        toast.success("Coordinates updated successfully!");
      } catch (err: any) {
        toast.error("Failed to save coordinate updates.");
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        riderMarkerRef.current = null;
        routeLineRef.current = null;
        destinationMarkerRef.current = null;
      }
    };
  }, []);

  // Update Route Polyline & Destination Flags
  useEffect(() => {
    if (!mapRef.current) return;

    if (destinationMarkerRef.current) {
      mapRef.current.removeLayer(destinationMarkerRef.current);
      destinationMarkerRef.current = null;
    }
    if (routeLineRef.current) {
      mapRef.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    if (!activeJob) return;

    const destLat = activeJob.address?.latitude || SELLER_COORDS.lat + 0.015;
    const destLng = activeJob.address?.longitude || SELLER_COORDS.lng + 0.015;

    const deliveryIcon = L.divIcon({
      html: `<div class="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full border border-white text-white shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>`,
      className: "custom-dest-pin",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    destinationMarkerRef.current = L.marker([destLat, destLng], { icon: deliveryIcon })
      .addTo(mapRef.current)
      .bindPopup(`<b>Deliver to: ${activeJob.address?.firstName || "Customer"}</b>`);

    const points = generateRoutePoints([SELLER_COORDS.lat, SELLER_COORDS.lng], [destLat, destLng]);
    routeLineRef.current = L.polyline(points, {
      color: "#10b981",
      weight: 4,
      opacity: 0.8,
      dashArray: "6, 6",
    }).addTo(mapRef.current);

    const bounds = L.latLngBounds([SELLER_COORDS.lat, SELLER_COORDS.lng], [destLat, destLng]);
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });

  }, [activeJob]);

  // Route transit simulation sync
  useEffect(() => {
    if (!simulating || !activeJob || !mapRef.current) return;

    const destLat = activeJob.address?.latitude || SELLER_COORDS.lat + 0.015;
    const destLng = activeJob.address?.longitude || SELLER_COORDS.lng + 0.015;
    const points = generateRoutePoints([SELLER_COORDS.lat, SELLER_COORDS.lng], [destLat, destLng]);

    const timer = setInterval(async () => {
      setSimProgress((prev) => {
        const nextProgress = prev + 4;
        if (nextProgress >= 100) {
          clearInterval(timer);
          setSimulating(false);
          
          const endPoint = points[points.length - 1];
          if (riderMarkerRef.current) riderMarkerRef.current.setLatLng(endPoint);
          updateDeliveryStep(activeJob._id, {
            latitude: endPoint[0],
            longitude: endPoint[1]
          });
          toast.success("You have arrived at your destination! Mark the order as Delivered.");
          return 100;
        }

        const targetIdx = Math.min(
          points.length - 1,
          Math.floor((nextProgress / 100) * points.length)
        );
        const currentPos = points[targetIdx];

        if (riderMarkerRef.current) {
          riderMarkerRef.current.setLatLng(currentPos);
        }

        updateDeliveryStep(activeJob._id, {
          latitude: currentPos[0],
          longitude: currentPos[1]
        });

        return nextProgress;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [simulating, activeJob]);

  const handleAcceptOrder = async (orderId: string) => {
    if (rider?.status === "Inactive") {
      toast.error("You must turn your duty status ON to accept delivery jobs.");
      return;
    }
    try {
      const data = await acceptOrder(orderId);
      if (data.success) {
        toast.success("Job accepted! Head to Baghbazar Store to collect items.");
        fetchJobs();
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to accept job");
    }
  };

  const startDeliverySimulation = async () => {
    if (!activeJob) return;
    try {
      const data = await updateDeliveryStep(activeJob._id, {
        status: "out_for_delivery",
        latitude: SELLER_COORDS.lat,
        longitude: SELLER_COORDS.lng
      });
      if (data.success) {
        toast.success("Order picked up! Simulating route transit...");
        setSimProgress(0);
        setSimulating(true);
        fetchJobs();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update step");
    }
  };

  const markJobCompleted = async () => {
    if (!activeJob) return;
    try {
      const data = await updateDeliveryStep(activeJob._id, {
        status: "delivered"
      });
      if (data.success) {
        toast.success("Order marked as Delivered successfully!");
        setActiveJob(null);
        setSimulating(false);
        setSimProgress(0);
        fetchJobs();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to complete delivery");
    }
  };

  return (
    <div className="md:p-10 p-4 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Active Deliveries</h2>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 flex flex-col space-y-6">
          {activeJob ? (
            <ActiveJobCard
              activeJob={activeJob}
              currency={currency}
              simulating={simulating}
              simProgress={simProgress}
              startDeliverySimulation={startDeliverySimulation}
              markJobCompleted={markJobCompleted}
            />
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center space-y-4 shadow-sm flex flex-col items-center">
              <Award className="w-12 h-12 text-emerald-600 animate-pulse" />
              <div>
                <h3 className="font-extrabold text-emerald-800 text-base">Waiting for Delivery Jobs</h3>
                <p className="text-emerald-700 text-xs mt-1.5 leading-relaxed">
                  {rider?.status === "Active" 
                    ? "You are currently online and active on duty. When a seller accepts a new order, it will appear in the listing below."
                    : "You are currently offline (Duty Off). Toggle your status to ON to receive available delivery orders near you."}
                </p>
              </div>
            </div>
          )}

          <AvailableJobsList
            jobs={jobs}
            jobsLoading={jobsLoading}
            currency={currency}
            handleAcceptOrder={handleAcceptOrder}
            riderStatus={rider?.status}
          />
        </div>

        <div className="lg:col-span-7 flex flex-col min-h-[450px] lg:min-h-[550px] bg-gray-100 rounded-3xl overflow-hidden border border-gray-200 shadow-inner relative">
          <div ref={mapContainerRef} className="absolute inset-0 z-10" />
          <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl border border-gray-100 shadow-xl max-w-xs space-y-1">
            <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-500 animate-pulse" /> Live Dispatch Map
            </p>
            <p className="text-[10px] text-gray-400 leading-normal">
              Drag the map and click on it to set your current active position coordinates manually.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveDeliveries;
