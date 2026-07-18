import express from "express";
import {
  isAuth,
  login,
  logout,
  register,
  updateUserProfile,
  refresh,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";

const userRouter = express.Router();
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/refresh", refresh);
userRouter.get("/is-auth", authUser, isAuth);
userRouter.get("/logout", authUser, logout);
userRouter.post("/profile/update", authUser, updateUserProfile);

export default userRouter;
