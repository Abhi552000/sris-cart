import React, { useEffect, useState } from "react";
import { getAdminSellers, toggleSellerStatus } from "../../services/adminService";
import toast from "react-hot-toast";

// Components
import ManageSellers from "../../components/admin/ManageSellers";

const ManageSellersPage = () => {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const data = await getAdminSellers();
      if (data.success) {
        setSellers(data.sellers || []);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load sellers list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleSellerToggle = async (sellerId: string) => {
    try {
      const data = await toggleSellerStatus(sellerId);
      if (data.success) {
        toast.success(data.message);
        fetchSellers();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle seller status");
    }
  };

  return (
    <div className="md:p-10 p-4 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Manage Sellers</h2>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary"></div>
        </div>
      ) : (
        <ManageSellers
          sellers={sellers}
          handleSellerToggle={handleSellerToggle}
          loading={loading}
        />
      )}
    </div>
  );
};

export default ManageSellersPage;
