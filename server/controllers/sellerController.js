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

// Seller Login : /api/seller/login
export const sellerLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  let seller = await Seller.findOne({ email });

  // Seed default seller if DB is empty and email matches process.env
  if (!seller && email === process.env.SELLER_EMAIL) {
    if (password === process.env.SELLER_PASSWORD) {
      const hashedPassword = await bcrypt.hash(password, 10);
      seller = await Seller.create({
        name: "Admin",
        storeName: "SrisCart Store",
        email,
        password: hashedPassword,
        phone: "+91 98765 43210",
        address: "12 Baghbazar Street, Near Baghbazar Ghat, Kolkata, West Bengal 700003",
        latitude: 22.6030,
        longitude: 88.3660,
      });
    }
  }

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
    return res.json({ success: true, seller: req.seller });
  }
  // Fallback if database record doesn't exist yet but user is validated via ENV
  return res.json({
    success: true,
    seller: {
      name: "Admin",
      storeName: "SrisCart Store",
      email: process.env.SELLER_EMAIL,
      phone: "+91 98765 43210",
      address: "12 Baghbazar Street, Near Baghbazar Ghat, Kolkata, West Bengal 700003",
      latitude: 22.6030,
      longitude: 88.3660,
    },
  });
});

// Update Seller Profile : /api/seller/profile/update
export const updateSellerProfile = asyncHandler(async (req, res) => {
  const { name, storeName, email, phone, address, password } = req.body;
  const currentEmail = req.seller ? req.seller.email : process.env.SELLER_EMAIL;

  let seller = await Seller.findOne({ email: currentEmail });

  if (!seller) {
    const defaultPassword = await bcrypt.hash(process.env.SELLER_PASSWORD, 10);
    seller = await Seller.create({
      name: name || "Admin",
      storeName: storeName || "SrisCart Store",
      email: email || currentEmail,
      password: defaultPassword,
      phone: phone || "",
      address: address || "",
    });
  } else {
    if (name) seller.name = name;
    if (storeName) seller.storeName = storeName;
    if (email) seller.email = email;
    if (phone) seller.phone = phone;
    if (address) seller.address = address;
    if (password) {
      seller.password = await bcrypt.hash(password, 10);
    }
    await seller.save();
  }

  const { accessToken, refreshToken } = generateSellerTokens(seller.email);

  // Update refresh token in DB
  seller.refreshToken = refreshToken;
  await seller.save();

  setSellerCookies(res, accessToken, refreshToken);

  return res.json({ success: true, message: "Profile Updated Successfully", seller });
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
