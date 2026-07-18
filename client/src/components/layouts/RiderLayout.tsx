import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  Bike, 
  LogOut, 
  ShoppingCart,
  ToggleLeft,
  ToggleRight,
  ListTodo,
  TrendingUp,
  User
} from "lucide-react";
import { riderLogout, updateRiderProfile } from "../../services/riderService";
import toast from "react-hot-toast";

interface RiderLayoutProps {
  rider: any;
  setRider: (rider: any) => void;
  setIsAuth: (auth: boolean) => void;
}

const RiderLayout: React.FC<RiderLayoutProps> = ({
  rider,
  setRider,
  setIsAuth,
}) => {
  const navigate = useNavigate();

  const toggleDutyStatus = async () => {
    if (!rider) return;
    const newStatus = rider.status === "Active" ? "Inactive" : "Active";
    try {
      const data = await updateRiderProfile({ status: newStatus });
      if (data.success) {
        setRider(data.rider);
        toast.success(`Duty turned ${newStatus === "Active" ? "ON (Active)" : "OFF (Inactive)"}`);
      } else {
        toast.error(data.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update duty status");
    }
  };

  const handleLogout = async () => {
    try {
      const data = await riderLogout();
      if (data.success) {
        setIsAuth(false);
        setRider(null);
        toast.success("Logged out successfully");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
    }
  };

  const sidebarLinks = [
    { name: "Active Deliveries", path: "/rider", icon: <ListTodo className="w-6 h-6 shrink-0" />, end: true },
    { name: "Earnings & History", path: "/rider/earnings", icon: <TrendingUp className="w-6 h-6 shrink-0" />, end: false },
    { name: "My Profile", path: "/rider/profile", icon: <User className="w-6 h-6 shrink-0" />, end: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white fixed top-0 left-0 right-0 z-[1000] h-16 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/")}>
          <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 shadow-lg">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 bg-clip-text text-transparent tracking-wide">
            SrisCart
          </span>
          <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 border border-amber-200 rounded-full tracking-wider">
            Rider Portal
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-5 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-slate-100 flex items-center justify-center shrink-0">
              {rider?.image ? (
                <img src={rider.image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4.5 h-4.5 text-gray-400" />
              )}
            </div>
            <p className="hidden md:block font-semibold">Hi! <span className="font-bold text-gray-700">{rider?.name}</span></p>
          </div>
          
          <button
            onClick={toggleDutyStatus}
            className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 border transition cursor-pointer ${
              rider?.status === "Active"
                ? "bg-emerald-500 text-white border-emerald-500 shadow-sm animate-pulse"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {rider?.status === "Active" ? (
              <>
                <ToggleRight className="w-4 h-4 shrink-0" />
                <span>DUTY: ON</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 shrink-0" />
                <span>DUTY: OFF</span>
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="border border-gray-200 rounded-full text-xs px-3.5 py-1.5 text-gray-600 hover:bg-gray-50 transition cursor-pointer font-bold flex items-center gap-1 shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      <div className="flex pt-16 h-screen overflow-hidden">
        {/* Sidebar NavLinks */}
        <div className="md:w-64 w-16 border-r text-base border-gray-300 pt-4 flex flex-col bg-white shrink-0">
          {sidebarLinks.map((item) => (
            <NavLink
              to={item.path}
              key={item.name}
              end={item.end}
              className={({ isActive }) => `w-full flex items-center justify-center md:justify-start py-3.5 px-2 md:px-4 gap-3 transition-all outline-none text-left cursor-pointer border-y-0 border-l-0 border-r-4 md:border-r-[6px] ${
                isActive
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-white hover:bg-gray-100/90 border-white text-gray-500"
              }`}
            >
              {item.icon}
              <p className="md:block hidden text-sm font-bold">{item.name}</p>
            </NavLink>
          ))}
        </div>

        {/* Scrollable View Content Outlet */}
        <div className="no-scrollbar flex-1 h-full overflow-y-scroll bg-slate-50">
          <Outlet context={{ rider, setRider }} />
        </div>
      </div>
    </div>
  );
};

export default RiderLayout;
