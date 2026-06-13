import jwt from "jsonwebtoken";
import Seller from "../models/seller.js";

const authSeller = async (req, res, next) => {
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }

  try {
    const tokenDecoded = jwt.verify(sellerToken, process.env.JWT_SECRET);

    const seller = await Seller.findOne({ email: tokenDecoded?.email });

    if (seller) {
      req.seller = seller;
      return next();
    } else if (tokenDecoded?.email === process.env.SELLER_EMAIL) {
      return next();
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized" });
    }
  } catch (error) {
    console.error("JWT Error:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export default authSeller;
