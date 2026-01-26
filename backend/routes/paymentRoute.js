import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getRazorpayKey,
} from "../controllers/paymentController.js";
import authUser from "../middleware/authUser.js";

const paymentRouter = express.Router();

// Get Razorpay key (public, but can be protected if needed)
paymentRouter.get("/razorpay/key", getRazorpayKey);

// Create Razorpay order (authenticated)
paymentRouter.post("/razorpay/create-order", authUser, createRazorpayOrder);

// Verify Razorpay payment and create order (authenticated)
paymentRouter.post("/razorpay/verify", authUser, verifyRazorpayPayment);

export default paymentRouter;
