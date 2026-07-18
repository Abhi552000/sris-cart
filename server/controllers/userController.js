import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import asyncHandler from "../utils/asyncHandler.js";

// Helper to generate access and refresh tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

// Helper to set cookie headers
const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 15 * 60 * 1000, // 15 mins
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Register User: /api/user/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing Details" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token in DB
  user.refreshToken = refreshToken;
  await user.save();

  setAuthCookies(res, accessToken, refreshToken);

  return res.json({
    success: true,
    user: { email: user.email, name: user.name },
  });
});

// Login User : /api/user/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid email and password" });
  }

  if (user.status === "Inactive") {
    return res.status(403).json({ success: false, message: "Your user account is deactivated. Contact support." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid email and password" });
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token in DB
  user.refreshToken = refreshToken;
  await user.save();

  setAuthCookies(res, accessToken, refreshToken);

  return res.json({
    success: true,
    user: { email: user.email, name: user.name },
  });
});

// Silent Access Token Rotation : /api/user/refresh
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "Refresh Token missing" });
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || user.refreshToken !== refreshToken) {
    return res.status(401).json({ success: false, message: "Invalid or revoked Refresh Token" });
  }

  if (user.status === "Inactive") {
    return res.status(403).json({ success: false, message: "Your user account is deactivated. Contact support." });
  }

  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 15 * 60 * 1000,
  });

  return res.json({ success: true, message: "Token refreshed successfully" });
});

// Check auth : api/user/is-auth
export const isAuth = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID missing from token" });
  }

  const user = await User.findById(userId).select("-password");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.json({ success: true, user });
});

// Logout User : /api/user/logout
export const logout = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: "" });
  }

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });

  return res.json({ success: true, message: "Logged Out" });
});

// Update User Profile : /api/user/profile/update
export const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { name, email, password } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID missing" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email is already in use by another account" });
    }
    user.email = email;
  }

  if (name) user.name = name;
  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id);

  // Update refresh token in DB
  user.refreshToken = refreshToken;
  await user.save();

  setAuthCookies(res, accessToken, refreshToken);

  return res.json({
    success: true,
    message: "Profile Updated Successfully",
    user: { name: user.name, email: user.email },
  });
});
