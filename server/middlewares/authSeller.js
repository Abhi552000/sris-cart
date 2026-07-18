import jwt from "jsonwebtoken";
import Seller from "../models/seller.js";

const authSeller = async (req, res, next) => {
  const { sellerAccessToken } = req.cookies;

  if (!sellerAccessToken) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }

  try {
    const tokenDecoded = jwt.verify(sellerAccessToken, process.env.JWT_SECRET);

    const seller = await Seller.findOne({ email: tokenDecoded?.email });

    if (seller) {
      if (seller.status === "Inactive" && req.path !== "/logout") {
        return res.status(403).json({ success: false, message: "Your seller account is deactivated. Contact admin." });
      }
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
    console.error("JWT Seller Auth Error:", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "TokenExpiredError", code: "TOKEN_EXPIRED" });
    }
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export default authSeller;
