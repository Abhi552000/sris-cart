import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Seller from "../models/seller.js";
import Rider from "../models/rider.js";
import Order from "../models/Order.js";
import asyncHandler from "../utils/asyncHandler.js";

// Admin Login
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL || "admin@sriscart.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (email === adminEmail && password === adminPassword) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ success: true, message: "Logged in successfully" });
  } else {
    return res.status(401).json({ success: false, message: "Invalid admin credentials" });
  }
});

// Check if Admin Auth is valid
export const isAdminAuth = asyncHandler(async (req, res) => {
  return res.json({ success: true, message: "Authenticated" });
});

// Logout Admin
export const adminLogout = asyncHandler(async (req, res) => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });
  return res.json({ success: true, message: "Logged out" });
});

// Get Users list
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}, "-password").sort({ createdAt: -1 });
  return res.json({ success: true, users });
});

// Toggle User Status
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { userId, remarks } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  user.status = user.status === "Active" ? "Inactive" : "Active";
  user.statusRemarks = user.status === "Inactive" ? (remarks || "No reason specified") : "";
  await user.save();
  return res.json({ success: true, message: `User status changed to ${user.status}`, status: user.status });
});

// Get Sellers list
export const getSellers = asyncHandler(async (req, res) => {
  const sellers = await Seller.find({}, "-password").sort({ createdAt: -1 });
  return res.json({ success: true, sellers });
});

// Toggle Seller Status
export const toggleSellerStatus = asyncHandler(async (req, res) => {
  const { sellerId, remarks } = req.body;
  const seller = await Seller.findById(sellerId);
  if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });

  seller.status = seller.status === "Active" ? "Inactive" : "Active";
  seller.statusRemarks = seller.status === "Inactive" ? (remarks || "No reason specified") : "";
  await seller.save();
  return res.json({ success: true, message: `Seller status changed to ${seller.status}`, status: seller.status });
});

// Get Riders list
export const getRiders = asyncHandler(async (req, res) => {
  const riders = await Rider.find({}, "-password").sort({ createdAt: -1 });
  return res.json({ success: true, riders });
});

// Toggle Rider Status
export const toggleRiderStatus = asyncHandler(async (req, res) => {
  const { riderId, remarks } = req.body;
  const rider = await Rider.findById(riderId);
  if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

  rider.status = rider.status === "Active" ? "Inactive" : "Active";
  rider.statusRemarks = rider.status === "Inactive" ? (remarks || "No reason specified") : "";
  await rider.save();
  return res.json({ success: true, message: `Rider status changed to ${rider.status}`, status: rider.status });
});

// Get Admin Stats/Analytics
export const getAdminStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalSellers = await Seller.countDocuments();
  const totalRiders = await Rider.countDocuments();

  const orders = await Order.find({})
    .populate("address")
    .populate({
      path: "items.product",
      model: "product",
    });
  const totalOrders = orders.length;

  const totalSales = orders
    .filter((o) => o.status?.toLowerCase() === "delivered")
    .reduce((sum, o) => sum + o.amount, 0);

  const sellers = await Seller.find({}, "name storeName latitude longitude status");
  const riders = await Rider.find({}, "name latitude longitude status image");

  return res.json({
    success: true,
    stats: {
      totalUsers,
      totalSellers,
      totalRiders,
      totalOrders,
      totalSales,
    },
    sellers,
    riders,
    orders,
  });
});
