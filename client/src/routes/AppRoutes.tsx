import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import RootLayout from "../components/layouts/RootLayout";
import ClientLayout from "../components/layouts/ClientLayout";

// Light Client Pages (direct imports for fast initial load)
import Home from "../pages/Home";
import AllProducts from "../pages/AllProducts";
import ProductCategory from "../pages/ProductCategory";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import AddAddress from "../pages/AddAddress";
import MyOrders from "../pages/MyOrders";
import UserProfile from "../pages/UserProfile";
import Contact from "../pages/Contact";
import FAQ from "../pages/FAQ";
import Offers from "../pages/Offers";
import DeliveryInfo from "../pages/DeliveryInfo";
import ReturnRefund from "../pages/ReturnRefund";
import Loading from "../components/Loading";

// Heavy Views & guards (lazy-loaded to reduce bundle size)
const TrackOrder = lazy(() => import("../pages/TrackOrder"));
const SellerGuard = lazy(() => import("../components/layouts/SellerGuard"));
const AddProduct = lazy(() => import("../pages/seller/AddProduct"));
const ProductList = lazy(() => import("../pages/seller/ProductList"));
const Orders = lazy(() => import("../pages/seller/Orders"));
const SellerProfile = lazy(() => import("../pages/seller/SellerProfile"));
const SellerChangePassword = lazy(() => import("../pages/seller/SellerChangePassword"));

const RiderGuard = lazy(() => import("../components/layouts/RiderGuard"));
const ActiveDeliveries = lazy(() => import("../pages/rider/ActiveDeliveries"));
const RiderEarnings = lazy(() => import("../pages/rider/RiderEarnings"));
const RiderProfilePage = lazy(() => import("../pages/rider/RiderProfilePage"));
const RiderChangePassword = lazy(() => import("../pages/rider/RiderChangePassword"));

const AdminGuard = lazy(() => import("../components/layouts/AdminGuard"));
const AdminAnalyticsPage = lazy(() => import("../pages/admin/AdminAnalyticsPage"));
const ManageUsersPage = lazy(() => import("../pages/admin/ManageUsersPage"));
const ManageSellersPage = lazy(() => import("../pages/admin/ManageSellersPage"));
const ManageRidersPage = lazy(() => import("../pages/admin/ManageRidersPage"));

import { ROUTES } from "../constants";

const SuspenseSpinner = () => (
  <div className="flex justify-center items-center h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary"></div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<SuspenseSpinner />}>
      <Routes>
        <Route element={<RootLayout />}>
          {/* Client Routes */}
          <Route element={<ClientLayout />}>
            <Route path={ROUTES.HOME} element={<Home />} />
            <Route path={ROUTES.PRODUCTS} element={<AllProducts />} />
            <Route path={ROUTES.PRODUCT_CATEGORY} element={<ProductCategory />} />
            <Route path={ROUTES.PRODUCT_DETAILS} element={<ProductDetails />} />
            <Route path={ROUTES.CART} element={<Cart />} />
            <Route path={ROUTES.ADD_ADDRESS} element={<AddAddress />} />
            <Route path={ROUTES.MY_ORDERS} element={<MyOrders />} />
            <Route path={ROUTES.TRACK_ORDER} element={<TrackOrder />} />
            <Route path={ROUTES.PROFILE} element={<UserProfile />} />
            <Route path={ROUTES.CONTACT} element={<Contact />} />
            <Route path={ROUTES.FAQ} element={<FAQ />} />
            <Route path={ROUTES.OFFERS} element={<Offers />} />
            <Route path={ROUTES.DELIVERY_INFO} element={<DeliveryInfo />} />
            <Route path={ROUTES.RETURN_REFUND} element={<ReturnRefund />} />
            <Route path={ROUTES.LOADER} element={<Loading />} />
          </Route>

          {/* Rider Routes */}
          <Route path={ROUTES.RIDER.ROOT} element={<RiderGuard />}>
            <Route index element={<ActiveDeliveries />} />
            <Route path={ROUTES.RIDER.EARNINGS} element={<RiderEarnings />} />
            <Route path={ROUTES.RIDER.PROFILE} element={<RiderProfilePage />} />
            <Route path={ROUTES.RIDER.CHANGE_PASSWORD} element={<RiderChangePassword />} />
          </Route>

          {/* Admin Routes */}
          <Route path={ROUTES.ADMIN.ROOT} element={<AdminGuard />}>
            <Route index element={<AdminAnalyticsPage />} />
            <Route path={ROUTES.ADMIN.USERS} element={<ManageUsersPage />} />
            <Route path={ROUTES.ADMIN.SELLERS} element={<ManageSellersPage />} />
            <Route path={ROUTES.ADMIN.RIDERS} element={<ManageRidersPage />} />
          </Route>

          {/* Seller Routes */}
          <Route path={ROUTES.SELLER.ROOT} element={<SellerGuard />}>
            <Route index element={<AddProduct />} />
            <Route path={ROUTES.SELLER.PRODUCT_LIST} element={<ProductList />} />
            <Route path={ROUTES.SELLER.ORDERS} element={<Orders />} />
            <Route path={ROUTES.SELLER.PROFILE} element={<SellerProfile />} />
            <Route path={ROUTES.SELLER.CHANGE_PASSWORD} element={<SellerChangePassword />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
