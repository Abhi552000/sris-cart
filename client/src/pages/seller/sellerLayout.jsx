import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { getSellerProfile, logoutSeller } from "../../services/authService";

const SellerLayout = () => {
  const navigate = useNavigate();
  const [sellerName, setSellerName] = useState("Admin");

  const sidebarLinks = [
    { name: "Add Product", path: "/seller", icon: assets.add_icon },
    {
      name: "Product List",
      path: "/seller/product-list",
      icon: assets.product_list_icon,
    },
    { name: "Order", path: "/seller/orders", icon: assets.order_icon },
    { name: "Profile", path: "/seller/profile", icon: assets.profile_icon },
  ];

  const fetchSellerDetails = async () => {
    try {
      const data = await getSellerProfile();
      if (data.success && data.seller?.name) {
        setSellerName(data.seller.name);
      }
    } catch (error) {
      console.error("Failed to fetch seller details:", error);
    }
  };

  useEffect(() => {
    fetchSellerDetails();
  }, []);

  const logout = async () => {
    try {
      const data = await logoutSeller();
      if (data.success) {
        toast.success(data.message);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => {
            navigate("/");
          }}
        >
          {/* LOGO */}
          <div
            className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br 
    from-yellow-400 via-yellow-500 to-amber-500 shadow-lg group-hover:shadow-yellow-300/50
    group-hover:scale-105 transition-all duration-300"
          >
            <ShoppingCart className="w-6 h-6 text-white" />
            <div className="absolute -bottom-1 -middle-1 w-3 h-3 bg-white rounded-full shadow-md animate-ping" />
          </div>

          {/* BRAND NAME */}
          <span className="text-2xl font-extrabold bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 bg-clip-text text-transparent tracking-wide">
            SrisCart
          </span>
        </div>
        <div className="flex items-center gap-5 text-gray-500">
          <p>Hi! {sellerName}</p>
          <button
            onClick={logout}
            className="border rounded-full text-sm px-4 py-1"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="flex">
        <div className="md:w-64 w-16 border-r h-[95vh] text-base border-gray-300 pt-4 flex flex-col ">
          {sidebarLinks.map((item, index) => (
            <NavLink
              to={item.path}
              key={item.name}
              end={item.path === "/seller"}
              className={({ isActive }) => `flex items-center justify-center md:justify-start py-3 px-2 md:px-4 gap-3 transition-all
                            ${
                              isActive
                                ? "border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary"
                                : "hover:bg-gray-100/90 border-white"
                            }`}
            >
              <img src={item.icon} alt="" className="w-6 h-6 md:w-7 md:h-7 shrink-0" />
              <p className="md:block hidden text-sm font-medium">{item.name}</p>
            </NavLink>
          ))}
        </div>
        <Outlet />
      </div>
    </>
  );
};

export default SellerLayout;
