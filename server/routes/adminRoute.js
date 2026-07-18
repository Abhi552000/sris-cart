import express from "express";
import {
  adminLogin,
  isAdminAuth,
  adminLogout,
  getUsers,
  toggleUserStatus,
  getSellers,
  toggleSellerStatus,
  getRiders,
  toggleRiderStatus,
  getAdminStats,
} from "../controllers/adminController.js";
import authAdmin from "../middlewares/authAdmin.js";

const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);
adminRouter.get("/is-auth", authAdmin, isAdminAuth);
adminRouter.post("/logout", authAdmin, adminLogout);

adminRouter.get("/stats", authAdmin, getAdminStats);

adminRouter.get("/users", authAdmin, getUsers);
adminRouter.post("/user/toggle", authAdmin, toggleUserStatus);

adminRouter.get("/sellers", authAdmin, getSellers);
adminRouter.post("/seller/toggle", authAdmin, toggleSellerStatus);

adminRouter.get("/riders", authAdmin, getRiders);
adminRouter.post("/rider/toggle", authAdmin, toggleRiderStatus);

export default adminRouter;
