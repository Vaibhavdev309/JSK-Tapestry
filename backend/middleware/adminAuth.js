import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers?.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded?.role !== "admin") {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

export default adminAuth;
