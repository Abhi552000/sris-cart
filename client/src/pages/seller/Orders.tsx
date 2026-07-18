import React, { useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import toast from "react-hot-toast";
import { getSellerOrders, updateOrderStatus } from "../../services/orderService";
import { CURRENCY } from "../../constants";

const STATUS_LABELS: Record<string, string> = {
  order_placed: "Order Placed",
  order_accepted: "Order Accepted",
  rider_assigned: "Rider Assigned",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

const Orders = () => {
  const currency = CURRENCY;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      const data = await updateOrderStatus(orderId, status);
      if (data.success) {
        toast.success("Order status updated!");
        fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getSellerOrders();
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] flex-1">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary"></div>
      </div>
    );
  }

  // Filter orders case-insensitively with status groupings
  const filteredOrders = orders.filter((order: any) => {
    const status = order.status?.toLowerCase() || "order_placed";
    if (filterStatus === "all") return true;
    if (filterStatus === "order_placed") {
      return status === "order_placed" || status === "order placed";
    }
    if (filterStatus === "order_accepted") {
      return (
        status === "order_accepted" ||
        status === "order accepted" ||
        status === "rider_assigned" ||
        status === "rider assigned" ||
        status === "out_for_delivery" ||
        status === "out for delivery"
      );
    }
    if (filterStatus === "delivered") {
      return status === "delivered";
    }
    return false;
  });

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 space-y-4">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-medium text-gray-800">Orders List</h2>
          
          {/* Status Filter Tabs (Simplified to: All, Placed, Accepted, Delivered) */}
          <div className="flex flex-wrap gap-2 pb-2">
            {[
              { id: "all", label: "All Orders" },
              { id: "order_placed", label: "Order Placed" },
              { id: "order_accepted", label: "Order Accepted" },
              { id: "delivered", label: "Delivered" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-4 py-2 rounded-full border text-xs font-bold transition cursor-pointer ${
                  filterStatus === tab.id
                    ? "bg-primary border-primary text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-lg border border-gray-200">
            No orders found under this status.
          </div>
        ) : (
          filteredOrders.map((order: any, index) => {
            const statusLower = order.status?.toLowerCase() || "order_placed";
            const isPlaced = statusLower === "order_placed" || statusLower === "order placed";

            return (
              <div
                key={index}
                className="flex flex-col md:items-center md:flex-row gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300 bg-white"
              >
                <div className="flex gap-5 max-w-80">
                  <img
                    className="w-12 h-12 object-cover"
                    src={assets.box_icon}
                    alt="boxIcon"
                  />
                  <div>
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex flex-col">
                        <p className="font-medium text-sm text-gray-800">
                          {item.product?.name || "Deleted Product"}{" "}
                          <span className={"text-primary font-bold"}>x {item.quantity}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  {order.address ? (
                    <>
                      <p className="text-gray-800 font-bold">
                        {order.address.firstName} {order.address.lastName}
                      </p>
                      <p>
                        {order.address.street}, {order.address.city},
                      </p>
                      <p>
                        {order.address.state}, {order.address.zipcode}, {order.address.country}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Phone: {order.address.phone}</p>
                    </>
                  ) : (
                    <p className="text-red-500 italic text-xs">No address specified</p>
                  )}
                </div>

                <p className="font-medium text-lg text-gray-800 my-auto">
                  {currency}
                  {order.amount}
                </p>

                <div className="flex flex-col gap-2 text-sm text-gray-500">
                  <div>
                    <p>Method: {order.paymentType}</p>
                    <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 border-t border-gray-100 pt-1.5">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status:</span>
                    {isPlaced ? (
                      <select
                        value={statusLower === "order placed" ? "order_placed" : order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="outline-none border border-gray-200 rounded-lg px-2 py-1 bg-white text-xs font-bold text-gray-700 cursor-pointer focus:border-primary transition"
                      >
                        <option value="order_placed">Order Placed</option>
                        <option value="order_accepted">Order Accepted</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 border rounded text-[10px] font-black uppercase tracking-wider ${
                        statusLower === "order_accepted" || statusLower === "order accepted" ? "bg-amber-50 border-amber-200 text-amber-800" :
                        statusLower === "rider_assigned" || statusLower === "rider assigned" ? "bg-blue-50 border-blue-200 text-blue-800" :
                        statusLower === "out_for_delivery" || statusLower === "out for delivery" ? "bg-purple-50 border-purple-200 text-purple-800" :
                        "bg-emerald-50 border-emerald-200 text-emerald-800"
                      }`}>
                        {STATUS_LABELS[order.status] || STATUS_LABELS[statusLower] || order.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Orders;
