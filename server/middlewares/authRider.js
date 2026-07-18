import jwt from "jsonwebtoken";
import Rider from "../models/rider.js";

const authRider = async (req, res, next) => {
  const { riderAccessToken } = req.cookies;

  if (!riderAccessToken) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }

  try {
    const tokenDecoded = jwt.verify(riderAccessToken, process.env.JWT_SECRET);
    const rider = await Rider.findOne({ email: tokenDecoded?.email });

    if (rider) {
      if (rider.status === "Inactive" && req.path !== "/logout") {
        return res.status(403).json({ success: false, message: "Your rider account is deactivated. Contact admin." });
      }
      req.rider = rider;
      return next();
    } else {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }
  } catch (error) {
    console.error("JWT Rider Auth Error:", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "TokenExpiredError", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default authRider;
