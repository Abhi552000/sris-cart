import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { getUserOrders } from "../services/orderService";
import { CURRENCY } from "../constants";
import { RootState } from "../store";
import { ChevronDown, ChevronUp, MapPin, CreditCard, ShoppingBag, Calendar, CheckCircle } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  order_placed: "Order Placed",
  order_accepted: "Order Accepted",
  rider_assigned: "Rider Assigned",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  
  const user = useSelector((state: RootState) => state.auth.user);
  const currency = CURRENCY;

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const data = await getUserOrders();
      if (data.success) {
        setMyOrders(data.orders);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="mt-20 pb-20 max-w-5xl mx-auto px-4">
      {/* Title */}
      <div className="flex flex-col items-start mb-8 space-y-1">
        <h1 className="text-3xl font-extrabold text-gray-800">My Orders</h1>
        <div className="w-16 h-1.5 bg-primary rounded-full"></div>
      </div>

      {myOrders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl shadow-xl text-gray-400">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-200 mb-3 animate-pulse" />
          <p className="font-bold text-sm">You haven't placed any orders yet.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-amber-500 transition cursor-pointer text-xs"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map((order) => {
            const isExpanded = !!expandedOrders[order._id];
            const totalItems = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
            const statusLower = order.status?.toLowerCase() || "order_placed";
            const isDelivered = statusLower === "delivered";
            
            // Payment details
            const isPrepaid = order.paymentType?.toUpperCase() !== "COD";
            const paymentText = isPrepaid ? "Prepaid (Paid)" : "Cash on Delivery (Payment Required)";

            return (
              <div
                key={order._id}
                className={`bg-white border rounded-3xl transition-all shadow-sm ${
                  isExpanded ? "border-primary/50 shadow-md ring-2 ring-primary/5" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Order Row Header */}
                <div
                  onClick={() => toggleExpand(order._id)}
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                    {/* Date */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" /> Date
                      </p>
                      <p className="text-xs font-bold text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Items count & Amount */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-gray-400" /> Items
                      </p>
                      <p className="text-xs font-bold text-gray-700">
                        {totalItems} {totalItems === 1 ? "Item" : "Items"} • <span className="text-primary">{currency}{order.amount}</span>
                      </p>
                    </div>

                    {/* Deliver to address */}
                    <div className="space-y-1 max-w-xs">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" /> Deliver To
                      </p>
                      <p className="text-xs text-gray-600 truncate font-semibold">
                        {order.address?.street || "No address"}, {order.address?.city}
                      </p>
                    </div>

                    {/* Prepaid vs cash */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-gray-400" /> Payment
                      </p>
                      <p className={`text-xs font-bold ${isPrepaid ? "text-emerald-600" : "text-purple-600"}`}>
                        {paymentText}
                      </p>
                    </div>
                  </div>

                  {/* Status, Track Button, Chevron Toggle */}
                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="flex items-center gap-3">
                      {/* Active Status Badge */}
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        statusLower === "order_placed" || statusLower === "order placed" ? "bg-slate-50 border-slate-200 text-slate-700" :
                        statusLower === "order_accepted" || statusLower === "order accepted" ? "bg-amber-50 border-amber-200 text-amber-800" :
                        statusLower === "rider_assigned" || statusLower === "rider assigned" ? "bg-blue-50 border-blue-200 text-blue-800" :
                        statusLower === "out_for_delivery" || statusLower === "out for delivery" ? "bg-purple-50 border-purple-200 text-purple-800" :
                        "bg-emerald-50 border-emerald-200 text-emerald-800"
                      }`}>
                        {STATUS_LABELS[order.status] || STATUS_LABELS[statusLower] || order.status}
                      </span>

                      {/* Dynamic Action Button based on Delivery state */}
                      {isDelivered ? (
                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-extrabold px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                          <CheckCircle className="w-4 h-4" /> Completed
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent row collapse
                            navigate(`/track-order/${order._id}`);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md shadow-amber-500/10 shrink-0"
                        >
                          Track Order
                        </button>
                      )}
                    </div>

                    <div className="text-gray-400 hidden sm:block">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details section */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-slate-50/50 p-5 sm:p-6 rounded-b-3xl space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Items</h3>
                    <div className="divide-y divide-gray-100 bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-inner">
                      {order.items.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-50 border border-gray-100 rounded-lg p-1.5 shrink-0 flex items-center justify-center">
                              <img
                                src={item.product?.image?.[0] || assets.box_icon}
                                alt={item.product?.name || "Product"}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{item.product?.name || "Deleted Product"}</p>
                              <p className="text-[10px] text-gray-400">Category: {item.product?.category || "N/A"}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end gap-8 text-xs font-bold text-gray-700">
                            <p className="text-gray-400">
                              Qty: <span className="text-gray-700 font-extrabold">{item.quantity}</span>
                            </p>
                            <p className="w-20 text-right text-primary">
                              {currency}{item.product ? (item.product.offerPrice * item.quantity) : 0}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Order summary details */}
                    <div className="flex justify-between items-center pt-2 text-xs text-gray-400">
                      <p>Order Reference: <span className="font-mono text-gray-500 font-bold">#{order._id}</span></p>
                      <p className="text-sm font-black text-gray-700">
                        Total Paid: <span className="text-primary text-base font-black">{currency}{order.amount}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
