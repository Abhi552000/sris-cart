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
        const msg = user.statusRemarks 
          ? `Your user account is deactivated. Reason: ${user.statusRemarks}. Contact support.`
          : "Your user account is deactivated. Contact support.";
        return res.status(403).json({ success: false, message: msg });
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
