import React from "react";
import { Routes, Route } from "react-router-dom";
import RootLayout from "../components/layouts/RootLayout";
import ClientLayout from "../components/layouts/ClientLayout";
import SellerGuard from "../components/layouts/SellerGuard";

// Pages
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

// Seller dashboard pages
import AddProduct from "../pages/seller/AddProduct";
import ProductList from "../pages/seller/ProductList";
import Orders from "../pages/seller/Orders";
import SellerProfile from "../pages/seller/SellerProfile";

import { ROUTES } from "../constants";

const AppRoutes = () => {
  return (
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
          <Route path={ROUTES.PROFILE} element={<UserProfile />} />
          <Route path={ROUTES.CONTACT} element={<Contact />} />
          <Route path={ROUTES.FAQ} element={<FAQ />} />
          <Route path={ROUTES.OFFERS} element={<Offers />} />
          <Route path={ROUTES.DELIVERY_INFO} element={<DeliveryInfo />} />
          <Route path={ROUTES.RETURN_REFUND} element={<ReturnRefund />} />
          <Route path={ROUTES.LOADER} element={<Loading />} />
        </Route>

        {/* Seller Routes */}
        <Route path={ROUTES.SELLER.ROOT} element={<SellerGuard />}>
          <Route index element={<AddProduct />} />
          <Route path={ROUTES.SELLER.PRODUCT_LIST} element={<ProductList />} />
          <Route path={ROUTES.SELLER.ORDERS} element={<Orders />} />
          <Route path={ROUTES.SELLER.PROFILE} element={<SellerProfile />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
