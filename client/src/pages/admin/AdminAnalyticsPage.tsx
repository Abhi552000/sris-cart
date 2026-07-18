import React, { useEffect, useState } from "react";
import { getAdminStats } from "../../services/adminService";
import { CURRENCY } from "../../constants";
import toast from "react-hot-toast";

// Components
import AdminAnalytics from "../../components/admin/AdminAnalytics";

const AdminAnalyticsPage = () => {
  const currency = CURRENCY;

  // States
  const [stats, setStats] = useState<any>(null);
  const [sellers, setSellers] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStatsAndCoordinates = async () => {
    try {
      setLoading(true);
      const data = await getAdminStats();
      if (data.success) {
        setStats(data.stats);
        setSellers(data.sellers || []);
        setRiders(data.riders || []);
        setOrders(data.orders || []);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load admin stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndCoordinates();
  }, []);

  return (
    <div className="md:p-10 p-4 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Platform Control Analytics</h2>
      
      <AdminAnalytics
        stats={stats}
        sellers={sellers}
        riders={riders}
        orders={orders}
        currency={currency}
        loading={loading}
      />
    </div>
  );
};

export default AdminAnalyticsPage;
