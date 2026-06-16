import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import SellerLayout from "../../pages/seller/sellerLayout";
import SellerLogin from "../seller/SellerLogin";

const SellerGuard = () => {
  const isSeller = useSelector((state: RootState) => state.auth.isSeller);

  return isSeller ? <SellerLayout /> : <SellerLogin />;
};

export default SellerGuard;
