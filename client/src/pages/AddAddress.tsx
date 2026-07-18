import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { addAddress } from "../services/addressService";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store";
import { MapPin, Navigation, Info } from "lucide-react";
import L from "leaflet";

const SELLER_COORDS = { lat: 22.6030, lng: 88.3660 };

const Inputfield = ({ type, placeholder, name, handleChange, address }: any) => (
  <input
    className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
    type={type}
    placeholder={placeholder}
    name={name}
    onChange={handleChange}
    value={address[name]}
    required
  />
);

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

const AddAddress = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [address, setAddresses] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<L.LatLng | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isWithinRange, setIsWithinRange] = useState<boolean>(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddresses((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (!user) {
      navigate("/cart");
      return;
    }

    // Initialize Leaflet Map
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView(
        [SELLER_COORDS.lat, SELLER_COORDS.lng],
        13
      );
      mapRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Create Custom Store (Seller) Icon
      const storeIcon = L.divIcon({
        html: `<div class="flex items-center justify-center w-10 h-10 bg-amber-500 rounded-full border-2 border-white shadow-md text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M30 7v3a3 3 0 0 1-6 0v-3"/></svg>
        </div>`,
        className: "custom-store-pin",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      // Add Seller Marker
      L.marker([SELLER_COORDS.lat, SELLER_COORDS.lng], { icon: storeIcon })
        .addTo(map)
        .bindPopup("<b>SrisCart Hub</b><br>Baghbazar, Kolkata")
        .openPopup();

      // Draw 4km Delivery Range Circle
      L.circle([SELLER_COORDS.lat, SELLER_COORDS.lng], {
        color: "#e2a300",
        fillColor: "#fcd34d",
        fillOpacity: 0.15,
        radius: 4000, // 4000 meters = 4 km
      }).addTo(map);

      // Custom Customer Home Icon
      const homeIcon = L.divIcon({
        html: `<div class="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full border-2 border-white shadow-md text-white animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>`,
        className: "custom-home-pin",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      // Setup Click listener to place marker
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        updatePinnedLocation(lat, lng, homeIcon);
      });

      // Try to auto-locate user on mount
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            updatePinnedLocation(latitude, longitude, homeIcon);
          },
          (error) => {
            console.log("Auto-location failed or denied. Defaulting center.");
          }
        );
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const updatePinnedLocation = (lat: number, lng: number, customIcon?: L.DivIcon) => {
    if (!mapRef.current) return;

    const latlng = L.latLng(lat, lng);
    setCoordinates(latlng);

    // Calculate Distance
    const dist = getDistance(SELLER_COORDS.lat, SELLER_COORDS.lng, lat, lng);
    setDistance(dist);

    const withinRange = dist <= 4.0;
    setIsWithinRange(withinRange);

    const homeIcon = customIcon || L.divIcon({
      html: `<div class="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full border-2 border-white shadow-md text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>`,
      className: "custom-home-pin",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng(latlng);
    } else {
      markerRef.current = L.marker(latlng, { icon: homeIcon, draggable: true })
        .addTo(mapRef.current)
        .on("dragend", (event) => {
          const draggedMarker = event.target;
          const position = draggedMarker.getLatLng();
          updatePinnedLocation(position.lat, position.lng, homeIcon);
        });
    }

    mapRef.current.panTo(latlng);
  };

  const locateUser = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updatePinnedLocation(latitude, longitude);
      },
      (error) => {
        toast.error("Unable to retrieve your location. Click directly on the map instead.");
      }
    );
  };

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coordinates) {
      toast.error("Please click on the map to pin your delivery location");
      return;
    }

    if (!isWithinRange) {
      toast.error("Cannot save: Address is outside our 4km delivery range!");
      return;
    }

    try {
      setLoading(true);
      const addressData = {
        ...address,
        zipcode: Number(address.zipcode),
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      };

      const data = await addAddress(addressData as any);
      if (data.success) {
        toast.success(data.message);
        navigate("/cart");
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 pb-20 max-w-6xl mx-auto px-4">
      <div className="flex flex-col items-start mb-8 border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <MapPin className="w-8 h-8 text-primary" />
          <span>Add Shipping <span className="text-primary bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Address</span></span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">Please fill in your address and pin your exact location on the map within our 4km zone.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Contact Details</h2>
          <form onSubmit={onSubmitHandler} className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <Inputfield
                handleChange={handleChange}
                address={address}
                name="firstName"
                type="text"
                placeholder="First Name"
              />
              <Inputfield
                handleChange={handleChange}
                address={address}
                name="lastName"
                type="text"
                placeholder="Last Name"
              />
            </div>
            <Inputfield
              handleChange={handleChange}
              address={address}
              name="email"
              type="email"
              placeholder="Email address"
            />
            
            <h2 className="text-lg font-bold text-gray-800 pt-2 pb-1">Delivery Address</h2>
            <Inputfield
              handleChange={handleChange}
              address={address}
              name="street"
              type="text"
              placeholder="Street Address"
            />
            <div className="grid grid-cols-2 gap-4">
              <Inputfield
                handleChange={handleChange}
                address={address}
                name="city"
                type="text"
                placeholder="City"
              />
              <Inputfield
                handleChange={handleChange}
                address={address}
                name="state"
                type="text"
                placeholder="State"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Inputfield
                handleChange={handleChange}
                address={address}
                name="zipcode"
                type="text"
                placeholder="Zipcode"
              />
              <Inputfield
                handleChange={handleChange}
                address={address}
                name="country"
                type="text"
                placeholder="Country"
              />
            </div>
            <Inputfield
              handleChange={handleChange}
              address={address}
              name="phone"
              type="text"
              placeholder="Phone Number"
            />

            <button
              type="submit"
              disabled={loading || !isWithinRange}
              className={`w-full mt-6 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white py-3.5 px-4 font-bold rounded-xl shadow-lg transition-all cursor-pointer uppercase flex items-center justify-center gap-2 ${
                loading || !isWithinRange ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                "Save Address"
              )}
            </button>
          </form>
        </div>

        {/* Map Column */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xl shadow-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-gray-800 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-primary" /> Pin Your Location
              </h3>
              <p className="text-gray-500 text-xs mt-0.5">Click/tap on the map to set your house position.</p>
            </div>
            <button
              type="button"
              onClick={locateUser}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs transition cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-primary fill-primary" />
              Use Current Location
            </button>
          </div>

          <div className="relative flex-1 min-h-[400px] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
            <div ref={mapContainerRef} className="absolute inset-0 z-10" />
            
            {/* Range Overlay Box */}
            <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur px-4 py-3 rounded-2xl shadow-xl border border-gray-100 text-xs space-y-2 max-w-xs">
              <div className="flex items-center gap-1.5 font-bold text-gray-700">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <span>Zone Details</span>
              </div>
              <p className="text-gray-500 leading-normal">
                Deliveries are only supported within a <b>4.0 km</b> radius of our primary hub.
              </p>
              {distance !== null && (
                <div className="pt-1.5 border-t border-gray-100">
                  <p className="text-gray-500">
                    Distance: <span className="font-bold text-gray-800">{distance.toFixed(2)} km</span>
                  </p>
                  <p className={`font-bold mt-0.5 flex items-center gap-1 ${
                    isWithinRange ? "text-emerald-600" : "text-red-500"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isWithinRange ? "bg-emerald-600 animate-ping" : "bg-red-500"}`} />
                    {isWithinRange ? "Within Delivery Zone" : "OUT OF RANGE!"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAddress;

