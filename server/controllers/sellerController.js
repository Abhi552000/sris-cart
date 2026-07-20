import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Seller from "../models/seller.js";
import asyncHandler from "../utils/asyncHandler.js";

// Helper to generate access and refresh tokens
const generateSellerTokens = (email) => {
  const accessToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

// Helper to set auth cookies
const setSellerCookies = (res, accessToken, refreshToken) => {
  res.cookie("sellerAccessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 15 * 60 * 1000, // 15 mins
  });
  res.cookie("sellerRefreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Seller Self-Onboarding Registration : /api/seller/register
export const sellerRegister = asyncHandler(async (req, res) => {
  const { name, storeName, email, password, gstNumber, branch, phone, address, latitude, longitude } = req.body;

  if (!name || !storeName || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing required onboarding details" });
  }

  const existingSeller = await Seller.findOne({ email });
  if (existingSeller) {
    return res.status(400).json({ success: false, message: "Seller already exists with this email" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newSeller = await Seller.create({
    name,
    storeName,
    email,
    password: hashedPassword,
    gstNumber: gstNumber || "",
    branch: branch || "",
    phone: phone || "",
    address: address || "",
    latitude: latitude || 22.6030,
    longitude: longitude || 88.3660,
    status: "Active",
  });

  const { accessToken, refreshToken } = generateSellerTokens(newSeller.email);

  // Save refresh token in DB
  newSeller.refreshToken = refreshToken;
  await newSeller.save();

  setSellerCookies(res, accessToken, refreshToken);

  const sellerData = newSeller.toObject();
  delete sellerData.password;

  return res.json({
    success: true,
    message: "Seller account created successfully",
    seller: sellerData,
  });
});

// Seller Login : /api/seller/login
export const sellerLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const seller = await Seller.findOne({ email });

  if (!seller) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  if (seller.status === "Inactive") {
    return res.status(403).json({ success: false, message: "Your seller account is deactivated. Contact admin." });
  }

  const isMatch = await bcrypt.compare(password, seller.password);
  if (isMatch) {
    const { accessToken, refreshToken } = generateSellerTokens(seller.email);

    // Save refresh token in DB
    seller.refreshToken = refreshToken;
    await seller.save();

    setSellerCookies(res, accessToken, refreshToken);

    return res.json({ success: true, message: "Seller logged in" });
  } else {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Silent Access Token Rotation : /api/seller/refresh
export const sellerRefresh = asyncHandler(async (req, res) => {
  const { sellerRefreshToken } = req.cookies;
  if (!sellerRefreshToken) {
    return res.status(401).json({ success: false, message: "Refresh Token missing" });
  }

  const decoded = jwt.verify(sellerRefreshToken, process.env.JWT_SECRET);
  const seller = await Seller.findOne({ email: decoded.email });

  if (!seller || seller.refreshToken !== sellerRefreshToken) {
    return res.status(401).json({ success: false, message: "Invalid or revoked Refresh Token" });
  }

  if (seller.status === "Inactive") {
    return res.status(403).json({ success: false, message: "Your seller account is deactivated. Contact admin." });
  }

  const accessToken = jwt.sign({ email: seller.email }, process.env.JWT_SECRET, { expiresIn: "15m" });

  res.cookie("sellerAccessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 15 * 60 * 1000,
  });

  return res.json({ success: true, message: "Token refreshed successfully" });
});

// Check seller auth : api/seller/is-auth
export const isSellerAuth = asyncHandler(async (req, res) => {
  return res.json({ success: true });
});

// Get Seller Profile : /api/seller/profile
export const getSellerProfile = asyncHandler(async (req, res) => {
  if (req.seller) {
    const sellerData = req.seller.toObject();
    delete sellerData.password;
    return res.json({ success: true, seller: sellerData });
  }
  return res.status(404).json({ success: false, message: "Seller not found" });
});

// Update Seller Profile : /api/seller/profile/update
export const updateSellerProfile = asyncHandler(async (req, res) => {
  const { name, storeName, phone, address, latitude, longitude, gstNumber, branch, password } = req.body;
  const currentEmail = req.seller.email;

  const seller = await Seller.findOne({ email: currentEmail });

  if (!seller) {
    return res.status(404).json({ success: false, message: "Seller not found" });
  }

  if (name !== undefined) seller.name = name;
  if (storeName !== undefined) seller.storeName = storeName;
  if (phone !== undefined) seller.phone = phone;
  if (address !== undefined) seller.address = address;
  if (latitude !== undefined) seller.latitude = Number(latitude);
  if (longitude !== undefined) seller.longitude = Number(longitude);
  if (gstNumber !== undefined) seller.gstNumber = gstNumber;
  if (branch !== undefined) seller.branch = branch;
  
  if (password) {
    seller.password = await bcrypt.hash(password, 10);
  }
  
  await seller.save();

  const { accessToken, refreshToken } = generateSellerTokens(seller.email);

  // Update refresh token in DB
  seller.refreshToken = refreshToken;
  await seller.save();

  setSellerCookies(res, accessToken, refreshToken);

  const sellerData = seller.toObject();
  delete sellerData.password;

  return res.json({ success: true, message: "Profile Updated Successfully", seller: sellerData });
});

// Logout Seller : /api/seller/logout
export const sellerlogout = asyncHandler(async (req, res) => {
  if (req.seller) {
    await Seller.findByIdAndUpdate(req.seller._id, { refreshToken: "" });
  }

  res.clearCookie("sellerAccessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });
  res.clearCookie("sellerRefreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });

  return res.json({ success: true, message: "Logged Out" });
});
