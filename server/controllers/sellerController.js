import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Seller from "../models/seller.js";

// Seller Login : /api/seller/login
export const sellerLogin = async (req, res) => {
  try {
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
          address: "123 Fresh Way, Food District, Bengaluru, Karnataka 560001",
        });
      }
    }

    if (!seller) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (isMatch) {
      const token = jwt.sign({ email: seller.email }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("sellerToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({ success: true, message: "Seller logged in" });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check seller auth : api/seller/is-auth
export const isSellerAuth = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    console.error("error", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Seller Profile : /api/seller/profile
export const getSellerProfile = async (req, res) => {
  try {
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
        address: "123 Fresh Way, Food District, Bengaluru, Karnataka 560001",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Seller Profile : /api/seller/profile/update
export const updateSellerProfile = async (req, res) => {
  try {
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

    const token = jwt.sign({ email: seller.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("sellerToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: "Profile Updated Successfully", seller });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logout Seller : /api/seller/logout
export const sellerlogout = async (req, res) => {
  try {
    res.clearCookie("sellerToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    console.log("error", error.message);
    res.json({ success: false, message: error.message });
  }
};
