import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard,
  Users, 
  Store, 
  Bike, 
  LogOut, 
  ShoppingCart,
  ShieldCheck
} from "lucide-react";
import { adminLogout } from "../../services/adminService";
import toast from "react-hot-toast";

interface AdminLayoutProps {
  setIsAuth: (auth: boolean) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ setIsAuth }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const data = await adminLogout();
      if (data.success) {
        setIsAuth(false);
        toast.success("Logged out successfully");
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Logout failed");
    }
  };

  const sidebarLinks = [
    { name: "Dashboard Analytics", path: "/admin", icon: <LayoutDashboard className="w-6 h-6 shrink-0" />, end: true },
    { name: "Manage Users", path: "/admin/users", icon: <Users className="w-6 h-6 shrink-0" />, end: false },
    { name: "Manage Sellers", path: "/admin/sellers", icon: <Store className="w-6 h-6 shrink-0" />, end: false },
    { name: "Manage Riders", path: "/admin/riders", icon: <Bike className="w-6 h-6 shrink-0" />, end: false },
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
          <span className="text-[9px] font-black uppercase bg-red-100 text-red-800 px-2 py-0.5 border border-red-200 rounded-full tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Admin Portal
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <p className="font-semibold">Hi! <span className="font-bold text-gray-700">Admin</span></p>
          <button
            onClick={handleLogout}
            className="border border-gray-200 rounded-full text-xs px-3.5 py-1.5 text-gray-600 hover:bg-gray-50 transition cursor-pointer font-bold flex items-center gap-1 border-solid bg-white shrink-0"
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

        {/* Scrollable Content Area */}
        <div className="no-scrollbar flex-1 h-full overflow-y-scroll bg-slate-50">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
