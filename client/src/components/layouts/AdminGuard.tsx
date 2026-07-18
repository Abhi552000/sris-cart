import React, { useEffect, useState } from "react";
import { isAdminAuth } from "../../services/adminService";
import AdminLayout from "./AdminLayout";
import AdminLogin from "../admin/AdminLogin";

const AdminGuard = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setAuthLoading(true);
      const data = await isAdminAuth();
      if (data.success) {
        setIsAuth(true);
      }
    } catch (error) {
      console.log("Admin not authorized");
      setIsAuth(false);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary"></div>
      </div>
    );
  }

  return isAuth ? (
    <AdminLayout setIsAuth={setIsAuth} />
  ) : (
    <AdminLogin onLoginSuccess={() => setIsAuth(true)} />
  );
};

export default AdminGuard;
