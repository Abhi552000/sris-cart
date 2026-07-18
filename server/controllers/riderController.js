import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Rider from "../models/rider.js";
import Order from "../models/Order.js";
import asyncHandler from "../utils/asyncHandler.js";

// Helper to seed default riders if database is empty
const seedRiders = async () => {
  const count = await Rider.countDocuments();
  if (count === 0) {
    const hashedPassword = await bcrypt.hash("rider123", 10);
    
    // Seed Rider 1 (Rahul - near Baghbazar)
    await Rider.create({
      name: "Rahul (Rider 1)",
      email: "rider1@sriscart.com",
      password: hashedPassword,
      phone: "+91 99999 88888",
      status: "Active",
      latitude: 22.6010,
      longitude: 88.3690,
    });

    // Seed Rider 2 (Amit - further away)
    await Rider.create({
      name: "Amit (Rider 2)",
      email: "rider2@sriscart.com",
      password: hashedPassword,
      phone: "+91 99999 77777",
      status: "Active",
      latitude: 22.5600,
      longitude: 88.3500,
    });

    console.log("Default riders seeded successfully.");
  }
};

// Helper to generate access and refresh tokens
const generateRiderTokens = (email) => {
  const accessToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

// Helper to set cookies
const setRiderCookies = (res, accessToken, refreshToken) => {
  res.cookie("riderAccessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 15 * 60 * 1000, // 15 mins
  });
  res.cookie("riderRefreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Rider Register : /api/rider/register
export const riderRegister = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing required details" });
  }

  const existingRider = await Rider.findOne({ email });
  if (existingRider) {
    return res.status(400).json({ success: false, message: "Rider already exists with this email" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Default coordinates in Baghbazar Kolkata
  const newRider = await Rider.create({
    name,
    email,
    password: hashedPassword,
    phone: phone || "",
    status: "Active",
    latitude: 22.6030,
    longitude: 88.3660,
  });

  const { accessToken, refreshToken } = generateRiderTokens(newRider.email);

  // Save refresh token in DB
  newRider.refreshToken = refreshToken;
  await newRider.save();

  setRiderCookies(res, accessToken, refreshToken);

  const riderData = newRider.toObject();
  delete riderData.password;

  return res.json({ success: true, message: "Rider account created successfully", rider: riderData });
});

// Rider Login : /api/rider/login
export const riderLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Seed if empty
  await seedRiders();

  let rider = await Rider.findOne({ email });

  if (!rider) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  if (rider.status === "Inactive") {
    return res.status(403).json({ success: false, message: "Your rider account is deactivated. Contact admin." });
  }

  const isMatch = await bcrypt.compare(password, rider.password);
  if (isMatch) {
    const { accessToken, refreshToken } = generateRiderTokens(rider.email);

    // Save refresh token in DB
    rider.refreshToken = refreshToken;
    await rider.save();

    setRiderCookies(res, accessToken, refreshToken);

    // Don't return password
    const riderData = rider.toObject();
    delete riderData.password;

    return res.json({ success: true, message: "Rider logged in", rider: riderData });
  } else {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Silent Access Token Rotation : /api/rider/refresh
export const riderRefresh = asyncHandler(async (req, res) => {
  const { riderRefreshToken } = req.cookies;
  if (!riderRefreshToken) {
    return res.status(401).json({ success: false, message: "Refresh Token missing" });
  }

  const decoded = jwt.verify(riderRefreshToken, process.env.JWT_SECRET);
  const rider = await Rider.findOne({ email: decoded.email });

  if (!rider || rider.refreshToken !== riderRefreshToken) {
    return res.status(401).json({ success: false, message: "Invalid or revoked Refresh Token" });
  }

  if (rider.status === "Inactive") {
    return res.status(403).json({ success: false, message: "Your rider account is deactivated. Contact admin." });
  }

  const accessToken = jwt.sign({ email: rider.email }, process.env.JWT_SECRET, { expiresIn: "15m" });

  res.cookie("riderAccessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 15 * 60 * 1000,
  });

  return res.json({ success: true, message: "Token refreshed successfully" });
});

// Check Rider Auth : /api/rider/is-auth
export const isRiderAuth = asyncHandler(async (req, res) => {
  return res.json({ success: true });
});

// Get Rider Profile : /api/rider/profile
export const getRiderProfile = asyncHandler(async (req, res) => {
  if (req.rider) {
    const riderData = req.rider.toObject();
    delete riderData.password;
    return res.json({ success: true, rider: riderData });
  }
  return res.status(404).json({ success: false, message: "Rider not found" });
});

// Update Rider Location : /api/rider/location/update
export const updateRiderLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;
  req.rider.latitude = latitude;
  req.rider.longitude = longitude;
  await req.rider.save();

  // Also update any active order currently assigned to this rider
  await Order.updateMany(
    { riderId: req.rider._id.toString(), status: "out_for_delivery" },
    { riderLatitude: latitude, riderLongitude: longitude }
  );

  return res.json({ success: true, message: "Location updated successfully" });
});

// Get Rider Orders : /api/rider/orders/available
export const getAvailableOrders = asyncHandler(async (req, res) => {
  const riderId = req.rider._id.toString();

  // Orders available are:
  // 1. Status is "Order Accepted" (Not assigned to anyone yet)
  // 2. Status is "Rider Assigned" or "Out for Delivery" and assigned to THIS rider
  const orders = await Order.find({
    $or: [
      { status: "order_accepted", riderId: null },
      { riderId: riderId, status: { $in: ["rider_assigned", "out_for_delivery"] } }
    ]
  })
    .populate("items.product address")
    .sort({ updatedAt: -1 });

  return res.json({ success: true, orders });
});

// Accept Order : /api/rider/order/accept
export const acceptOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const riderId = req.rider._id.toString();

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  if (order.status !== "order_accepted" || order.riderId) {
    return res.status(400).json({ success: false, message: "Order already accepted by another rider" });
  }

  order.riderId = riderId;
  order.status = "rider_assigned";
  // Start rider position at store
  order.riderLatitude = 22.6030;
  order.riderLongitude = 88.3660;
  await order.save();

  return res.json({ success: true, message: "Order accepted successfully", order });
});

// Update Delivery Step / Progress : /api/rider/order/delivery-step
export const updateOrderDeliveryStep = asyncHandler(async (req, res) => {
  const { orderId, status, latitude, longitude } = req.body;
  const riderId = req.rider._id.toString();

  const order = await Order.findOne({ _id: orderId, riderId });
  if (!order) {
    return res.status(404).json({ success: false, message: "Active order not found for this rider" });
  }

  if (status) order.status = status;
  if (latitude !== undefined) order.riderLatitude = latitude;
  if (longitude !== undefined) order.riderLongitude = longitude;
  
  await order.save();

  return res.json({ success: true, message: "Delivery progress updated", order });
});

// Logout Rider : /api/rider/logout
export const riderLogout = asyncHandler(async (req, res) => {
  if (req.rider) {
    await Rider.findByIdAndUpdate(req.rider._id, { refreshToken: "" });
  }

  res.clearCookie("riderAccessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });
  res.clearCookie("riderRefreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });
  return res.json({ success: true, message: "Logged Out" });
});

// Update Rider Profile/Duty Status : /api/rider/profile/update
export const updateRiderProfile = asyncHandler(async (req, res) => {
  const { status, name, phone, image } = req.body;
  if (status !== undefined) req.rider.status = status;
  if (name !== undefined) req.rider.name = name;
  if (phone !== undefined) req.rider.phone = phone;
  if (image !== undefined) req.rider.image = image;

  await req.rider.save();

  const { accessToken, refreshToken } = generateRiderTokens(req.rider.email);

  // Update refresh token in DB
  req.rider.refreshToken = refreshToken;
  await req.rider.save();

  setRiderCookies(res, accessToken, refreshToken);

  const riderData = req.rider.toObject();
  delete riderData.password;

  return res.json({ success: true, message: "Profile updated successfully", rider: riderData });
});

// Get Rider History & Earnings : /api/rider/orders/history
export const getRiderHistory = asyncHandler(async (req, res) => {
  const riderId = req.rider._id.toString();
  const orders = await Order.find({
    riderId,
    status: "delivered"
  })
    .populate("items.product address")
    .sort({ updatedAt: -1 });

  return res.json({ success: true, orders });
});
