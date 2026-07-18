import React, { useEffect, useState } from "react";
import { getAdminRiders, toggleRiderStatus } from "../../services/adminService";
import toast from "react-hot-toast";

// Components
import ManageRiders from "../../components/admin/ManageRiders";

const ManageRidersPage = () => {
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const data = await getAdminRiders();
      if (data.success) {
        setRiders(data.riders || []);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load riders list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const handleRiderToggle = async (riderId: string) => {
    try {
      const data = await toggleRiderStatus(riderId);
      if (data.success) {
        toast.success(data.message);
        fetchRiders();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle rider status");
    }
  };

  return (
    <div className="md:p-10 p-4 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Manage Riders</h2>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary"></div>
        </div>
      ) : (
        <ManageRiders
          riders={riders}
          handleRiderToggle={handleRiderToggle}
          loading={loading}
        />
      )}
    </div>
  );
};

export default ManageRidersPage;
