import jwt from "jsonwebtoken";

const authAdmin = async (req, res, next) => {
  const { adminToken } = req.cookies;

  if (!adminToken) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }

  try {
    const tokenDecoded = jwt.verify(adminToken, process.env.JWT_SECRET);
    if (tokenDecoded && tokenDecoded.email === "admin@sriscart.com") {
      req.admin = tokenDecoded;
      return next();
    } else {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }
  } catch (error) {
    console.error("Admin JWT Error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default authAdmin;
