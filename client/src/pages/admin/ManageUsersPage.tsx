import React, { useEffect, useState } from "react";
import { getAdminUsers, toggleUserStatus } from "../../services/adminService";
import toast from "react-hot-toast";

// Components
import ManageUsers from "../../components/admin/ManageUsers";

const ManageUsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load users list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserToggle = async (userId: string) => {
    try {
      const data = await toggleUserStatus(userId);
      if (data.success) {
        toast.success(data.message);
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle user status");
    }
  };

  return (
    <div className="md:p-10 p-4 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Manage Users</h2>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary"></div>
        </div>
      ) : (
        <ManageUsers
          users={users}
          handleUserToggle={handleUserToggle}
          loading={loading}
        />
      )}
    </div>
  );
};

export default ManageUsersPage;
