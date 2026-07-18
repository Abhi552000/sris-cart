import jwt from "jsonwebtoken";
import User from "../models/user.js";

const authUser = async (req, res, next) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    if (decoded?.id) {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: "Not Authorized" });
      }
      if (user.status === "Inactive" && req.path !== "/logout") {
        return res.status(403).json({ success: false, message: "Your user account is deactivated. Contact support." });
      }
      req.user = { id: decoded.id };
      return next();
    }

    return res.status(401).json({ success: false, message: "Not Authorized" });
  } catch (error) {
    console.error("JWT User Auth Error:", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "TokenExpiredError", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default authUser;
