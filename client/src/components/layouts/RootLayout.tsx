import React from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "../ScrollToTop";

const RootLayout = () => {
  return (
    <div className="text-default max-h-screen to-gray-700 bg-white">
      <ScrollToTop />
      <Toaster />
      <Outlet />
    </div>
  );
};

export default RootLayout;
