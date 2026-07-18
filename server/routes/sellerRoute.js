import express from "express";
import {
  isSellerAuth,
  sellerLogin,
  sellerlogout,
  getSellerProfile,
  updateSellerProfile,
  sellerRefresh,
} from "../controllers/sellerController.js";
import authSeller from "../middlewares/authSeller.js";

const sellerRouter = express.Router();

sellerRouter.post("/login", sellerLogin);
sellerRouter.get("/refresh", sellerRefresh);
sellerRouter.get("/is-auth", authSeller, isSellerAuth);
sellerRouter.post("/logout", authSeller, sellerlogout);
sellerRouter.get("/profile", authSeller, getSellerProfile);
sellerRouter.post("/profile/update", authSeller, updateSellerProfile);

export default sellerRouter;
