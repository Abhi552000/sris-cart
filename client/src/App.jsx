import React from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import { useAppContext } from "./context/AppContext";
import Login from "./components/Login";
import AllProducts from "./pages/AllProducts";
import ProductCategory from "./pages/ProductCategory";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import AddAddress from "./pages/AddAddress";
import MyOrders from "./pages/MyOrders";
import SellerLogin from "./components/seller/SellerLogin";
import SellerLayout from "./pages/seller/sellerLayout";
import ProductList from "./pages/seller/ProductList";
import AddProduct from "./pages/seller/AddProduct";
import Orders from "./pages/seller/Orders";
import Loading from "./components/Loading";
import Contact from "./pages/Contact";
import ChatAssistant from "./components/ChatAssistant";
import FAQ from "./pages/FAQ";
import Offers from "./pages/Offers";
import DeliveryInfo from "./pages/DeliveryInfo";
import ReturnRefund from "./pages/ReturnRefund";
import ScrollToTop from "./components/ScrollToTop";
import UserProfile from "./pages/UserProfile";
import SellerProfile from "./pages/seller/SellerProfile";

const App = () => {
  const isSellerPath = useLocation().pathname.includes("seller");
  const { showUserLogin, isSeller, isAppLoading } = useAppContext();

  if (isAppLoading) {
    return <Loading />;
  }

  return (
    <div className="text-default max-h-screen to-gray-700 bg-white">
      <ScrollToTop />
      {isSellerPath ? null : <Navbar />}
      {showUserLogin ? <Login /> : null}
      <Toaster />
      <div
        className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/products/:category" element={<ProductCategory />} />
          <Route path="/products/:category/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/add-address" element={<AddAddress />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/delivery-info" element={<DeliveryInfo />} />
          <Route path="/return-refund" element={<ReturnRefund />} />
          <Route path="/loader" element={<Loading />} />
          <Route
            path="/seller"
            element={isSeller ? <SellerLayout /> : <SellerLogin />}
          >
            <Route index element={isSeller ? <AddProduct /> : null} />
            <Route path="product-list" element={<ProductList />} />
            <Route path="orders" element={<Orders />} />
            <Route path="profile" element={<SellerProfile />} />
          </Route>
        </Routes>
      </div>
      {!isSellerPath && <Footer />}
      {!isSellerPath && <ChatAssistant />}
    </div>
  );
};

export default App;
