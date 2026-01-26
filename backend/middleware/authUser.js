import jwt from "jsonwebtoken";
const authUser = async (req, res, next) => {
  console.log("🔐 [AUTH USER] Middleware called");
  console.log("📦 Request method:", req.method);
  console.log("📦 Request path:", req.path);
  
  const token = req.headers?.token;
  console.log("🔑 Token present:", token ? "Yes" : "No");
  
  if (!token) {
    console.error("❌ No token provided");
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
  
  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified successfully");
    console.log("👤 Decoded token:", { id: token_decode?.id, role: token_decode?.role });
    
    req.body.userId = token_decode?.id;
    console.log("📝 userId set in req.body:", req.body.userId);
    
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    return res.status(401).json({ success: false, message: error.message || "Invalid token" });
  }
};

export default authUser;
