import express from "express";
import {
  riderLogin,
  riderRegister,
  isRiderAuth,
  getRiderProfile,
  updateRiderLocation,
  getAvailableOrders,
  acceptOrder,
  updateOrderDeliveryStep,
  riderLogout,
  updateRiderProfile,
  getRiderHistory,
  riderRefresh,
} from "../controllers/riderController.js";
import authRider from "../middlewares/authRider.js";

const riderRouter = express.Router();

riderRouter.post("/login", riderLogin);
riderRouter.post("/register", riderRegister);
riderRouter.get("/refresh", riderRefresh);
riderRouter.get("/is-auth", authRider, isRiderAuth);
riderRouter.get("/profile", authRider, getRiderProfile);
riderRouter.post("/profile/update", authRider, updateRiderProfile);
riderRouter.post("/location/update", authRider, updateRiderLocation);
riderRouter.get("/orders/available", authRider, getAvailableOrders);
riderRouter.get("/orders/history", authRider, getRiderHistory);
riderRouter.post("/order/accept", authRider, acceptOrder);
riderRouter.post("/order/delivery-step", authRider, updateOrderDeliveryStep);
riderRouter.post("/logout", authRider, riderLogout);

export default riderRouter;
