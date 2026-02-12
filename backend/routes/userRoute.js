import express from "express";
import {
  loginUser,
  registerUser,
  googleAuth,
  adminLogin,
  getUserProfile,
  updateUserProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  sendPhoneOtp,
  verifyPhoneOtp,
} from "../controllers/userController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/authUser.js";

const userRouter = express.Router();

// Public routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/google", googleAuth);
userRouter.get("/verify-email", verifyEmail);
userRouter.post("/resend-verification", authUser, resendVerificationEmail);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

// Admin routes
userRouter.post("/admin", adminLogin);
userRouter.get("/verify-admin", adminAuth, (req, res) => res.json({ success: true }));

// User profile routes (authenticated)
userRouter.get("/profile", authUser, getUserProfile);
userRouter.put("/profile", authUser, updateUserProfile);
userRouter.post("/change-password", authUser, changePassword);

// Address management routes
userRouter.post("/address", authUser, addAddress);
userRouter.put("/address", authUser, updateAddress);
userRouter.post("/address/delete", authUser, deleteAddress);
userRouter.post("/address/default", authUser, setDefaultAddress);

// Mobile OTP (for price request requirement)
userRouter.post("/send-phone-otp", authUser, sendPhoneOtp);
userRouter.post("/verify-phone-otp", authUser, verifyPhoneOtp);

export default userRouter;
