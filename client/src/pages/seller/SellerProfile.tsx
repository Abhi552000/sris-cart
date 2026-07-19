import React, { useState, useEffect, useRef } from "react";
import { User, Mail, Store, Phone, MapPin, Save, Hash, Compass, Navigation } from "lucide-react";
import toast from "react-hot-toast";
import { getSellerProfile, updateSellerProfile } from "../../services/authService";
import L from "leaflet";

const SellerProfile = () => {
  const [name, setName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [branch, setBranch] = useState("");
  const [latitude, setLatitude] = useState<number>(22.6030);
  const [longitude, setLongitude] = useState<number>(88.3660);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Helper to place/update marker on the map
  const updatePinnedLocation = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);

    const storeIcon = L.divIcon({
      html: `<div class="flex items-center justify-center w-10 h-10 bg-amber-500 rounded-full border-2 border-white shadow-md text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M30 7v3a3 3 0 0 1-6 0v-3"/></svg>
      </div>`,
      className: "custom-store-pin",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else if (mapRef.current) {
      markerRef.current = L.marker([lat, lng], { icon: storeIcon, draggable: true })
        .addTo(mapRef.current)
        .bindPopup("<b>Your Pinned Store Location</b>")
        .openPopup();

      // Listen to drag events to capture coordinate drops
      markerRef.current.on("dragend", (event: any) => {
        const marker = event.target;
        const position = marker.getLatLng();
        setLatitude(position.lat);
        setLongitude(position.lng);
      });
    }

    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 15);
    }
  };

  // Fetch coordinates from browser Geolocation API
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: deviceLat, longitude: deviceLng } = position.coords;
          updatePinnedLocation(deviceLat, deviceLng);
          toast.success("Successfully pinned your current coordinates!");
        },
        (error) => {
          toast.error("Could not obtain device location. Please click the map manually.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  const fetchProfile = async () => {
    try {
      setFetching(true);
      const data = await getSellerProfile();
      if (data.success) {
        setName(data.seller.name || "");
        setStoreName(data.seller.storeName || "");
        setEmail(data.seller.email || "");
        setPhone(data.seller.phone || "");
        setAddress(data.seller.address || "");
        setGstNumber(data.seller.gstNumber || "");
        setBranch(data.seller.branch || "");
        
        const lat = data.seller.latitude ?? 22.6030;
        const lng = data.seller.longitude ?? 88.3660;
        setLatitude(lat);
        setLongitude(lng);

        // Update map if it is already initialized
        setTimeout(() => {
          if (mapRef.current) {
            updatePinnedLocation(lat, lng);
          }
        }, 100);
      } else {
        toast.error("Failed to load seller profile settings");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Initialize Map after details are loaded
  useEffect(() => {
    if (!fetching && mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([latitude, longitude], 14);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      updatePinnedLocation(latitude, longitude);

      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        updatePinnedLocation(lat, lng);
      });
    }

    // Clean up map on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [fetching]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const payload: any = {
        name,
        storeName,
        phone,
        address,
        gstNumber,
        branch,
        latitude: Number(latitude),
        longitude: Number(longitude),
      };

      const data = await updateSellerProfile(payload);
      if (data.success) {
        toast.success(data.message || "Profile updated successfully!");
        fetchProfile();
      } else {
        toast.error(data.message || "Failed to update profile.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-[50vh] flex-1">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-slate-50/50 p-4 md:p-8">
      {/* Header Title */}
      <div className="flex flex-col items-start mb-6">
        <div className="flex items-center gap-2 text-primary">
          <Store className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Store Settings</span>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-800 mt-1">Seller Profile</h2>
        <div className="w-16 h-1 bg-primary rounded-full mt-2"></div>
      </div>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
        {/* Left Column: Business details */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-slate-100/40">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">
            Business & Merchant Details
          </h3>

          {/* Store Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5" htmlFor="store-name">
              <Store className="w-3.5 h-3.5 text-gray-400" />
              Store / Business Name
            </label>
            <input
              id="store-name"
              type="text"
              required
              disabled={loading}
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. SrisCart Fresh Store"
              className="w-full outline-none py-3 px-4 rounded-xl border border-gray-200 focus:border-primary text-sm text-gray-700 font-medium transition"
            />
          </div>

          {/* Seller Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5" htmlFor="seller-name">
              <User className="w-3.5 h-3.5 text-gray-400" />
              Proprietor / Contact Name
            </label>
            <input
              id="seller-name"
              type="text"
              required
              disabled={loading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full outline-none py-3 px-4 rounded-xl border border-gray-200 focus:border-primary text-sm text-gray-700 font-medium transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* GST Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5" htmlFor="gst-number">
                <Hash className="w-3.5 h-3.5 text-gray-400" />
                GST Number
              </label>
              <input
                id="gst-number"
                type="text"
                required
                disabled={loading}
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="19AAAAA1111A1Z1"
                className="w-full outline-none py-3 px-4 rounded-xl border border-gray-200 focus:border-primary text-sm text-gray-700 font-medium transition"
              />
            </div>

            {/* Branch */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5" htmlFor="store-branch">
                <Store className="w-3.5 h-3.5 text-gray-400" />
                Location Branch
              </label>
              <input
                id="store-branch"
                type="text"
                required
                disabled={loading}
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Baghbazar"
                className="w-full outline-none py-3 px-4 rounded-xl border border-gray-200 focus:border-primary text-sm text-gray-700 font-medium transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5" htmlFor="store-phone">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                Store Phone
              </label>
              <input
                id="store-phone"
                type="text"
                disabled={loading}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full outline-none py-3 px-4 rounded-xl border border-gray-200 focus:border-primary text-sm text-gray-700 font-medium transition"
              />
            </div>

            {/* Email (Read Only) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5" htmlFor="store-email">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                Store Email (Immutable)
              </label>
              <input
                id="store-email"
                type="email"
                required
                disabled={true}
                value={email}
                className="w-full outline-none py-3 px-4 rounded-xl border border-gray-100 bg-slate-50 text-gray-400 text-sm cursor-not-allowed font-medium"
              />
            </div>
          </div>

          {/* Store Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5" htmlFor="store-address">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              Store Physical Address
            </label>
            <textarea
              id="store-address"
              rows={3}
              disabled={loading}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full shop layout address detail"
              className="w-full outline-none py-3 px-4 rounded-xl border border-gray-200 focus:border-primary text-sm text-gray-750 resize-none transition"
            ></textarea>
          </div>
        </div>

        {/* Right Column: Location Map Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl shadow-slate-100/40 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-primary" />
                Store Coordinates
              </h3>
              <button
                type="button"
                onClick={handleLocateMe}
                className="flex items-center gap-1 text-xs text-primary font-bold hover:underline cursor-pointer bg-transparent border-none"
              >
                <Navigation className="w-3.5 h-3.5 animate-pulse" />
                Locate Me
              </button>
            </div>
            
            {/* Map Canvas */}
            <div 
              ref={mapContainerRef} 
              className="w-full h-72 rounded-2xl border border-gray-200 shadow-inner z-10 overflow-hidden"
              id="store-location-map"
            ></div>

            {/* Read-only tags */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-gray-100">
              <div className="text-center">
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Latitude</span>
                <span className="text-xs text-gray-700 font-extrabold">{latitude.toFixed(6)}</span>
              </div>
              <div className="text-center border-l border-gray-200">
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Longitude</span>
                <span className="text-xs text-gray-700 font-extrabold">{longitude.toFixed(6)}</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 leading-normal text-center">
              Click anywhere on the map or drag the golden pin to set your delivery range boundary check center.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-extrabold rounded-2xl shadow-xl shadow-yellow-500/10 hover:shadow-yellow-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Store Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4.5 h-4.5" />
                <span>Save Profile Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerProfile;
