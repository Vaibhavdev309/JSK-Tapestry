import Razorpay from "razorpay";
import crypto from "crypto";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import PriceRequest from "../models/PriceRequest.js";

// Initialize Razorpay instance (lazy initialization)
let razorpay = null;

const getRazorpayInstance = () => {
  if (!razorpay) {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    
    if (!keyId || !keySecret) {
      console.error("❌ Razorpay credentials not found in environment variables");
      console.error("Key ID present:", !!keyId);
      console.error("Key Secret present:", !!keySecret);
      return null;
    }

    // Validate key format (should start with rzp_test_ or rzp_live_)
    if (!keyId.startsWith("rzp_test_") && !keyId.startsWith("rzp_live_")) {
      console.error("❌ Invalid Razorpay Key ID format. Should start with 'rzp_test_' or 'rzp_live_'");
      return null;
    }

    try {
      razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      console.log("✅ Razorpay instance initialized with key:", keyId.substring(0, 12) + "...");
    } catch (error) {
      console.error("❌ Error initializing Razorpay:", error);
      console.error("Error details:", error.message);
      return null;
    }
  }
  return razorpay;
};

// Create Razorpay order
export const createRazorpayOrder = async (req, res) => {
  try {
    console.log("🔵 [RAZORPAY] Create order request received");
    const { amount, currency = "INR" } = req.body;
    const userId = req.body.userId;

    console.log("📦 Order data:", { amount, currency, userId });
    console.log("📦 Environment check:", {
      hasKeyId: !!process.env.RAZORPAY_KEY_ID,
      hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
      keyIdPrefix: process.env.RAZORPAY_KEY_ID?.substring(0, 8),
    });

    if (!amount || amount <= 0) {
      console.error("❌ Invalid amount:", amount);
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // Get Razorpay instance
    const razorpayInstance = getRazorpayInstance();
    if (!razorpayInstance) {
      console.error("❌ Razorpay instance not available");
      return res.status(500).json({
        success: false,
        message: "Payment gateway not configured. Please check Razorpay credentials.",
      });
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    if (amountInPaise < 100) {
      console.error("❌ Amount too small (minimum 1 INR = 100 paise):", amountInPaise);
      return res.status(400).json({
        success: false,
        message: "Minimum order amount is ₹1",
      });
    }

    // Generate receipt ID (max 40 characters as per Razorpay requirement)
    // Format: rcpt_<timestamp>_<userId_last8chars> (max 40 chars)
    const timestamp = Date.now().toString();
    const userIdStr = userId.toString();
    const userIdShort = userIdStr.length > 8 ? userIdStr.slice(-8) : userIdStr;
    const receiptId = `rcpt_${timestamp}_${userIdShort}`.slice(0, 40); // Ensure max 40 chars

    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: receiptId,
      notes: {
        userId: userId.toString(),
      },
    };

    console.log("📤 Creating Razorpay order with options:", options);

    let razorpayOrder;
    try {
      razorpayOrder = await razorpayInstance.orders.create(options);
      console.log("✅ Razorpay order created:", razorpayOrder.id);
    } catch (razorpayError) {
      console.error("❌ Razorpay API error:", razorpayError);
      console.error("Error details:", {
        message: razorpayError.message,
        statusCode: razorpayError.statusCode,
        error: razorpayError.error,
      });
      return res.status(500).json({
        success: false,
        message: razorpayError.error?.description || razorpayError.message || "Failed to create payment order",
      });
    }

    res.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("❌ [RAZORPAY] Unexpected error creating order:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment order",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Verify Razorpay payment and create order
export const verifyRazorpayPayment = async (req, res) => {
  try {
    console.log("🔵 [RAZORPAY] Verify payment request received");
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      amount,
      address,
      priceRequest,
    } = req.body;
    const userId = req.body.userId;

    console.log("📦 Payment verification data:", {
      razorpay_order_id,
      razorpay_payment_id,
      userId,
      amount,
    });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("❌ Missing payment details");
      return res.status(400).json({
        success: false,
        message: "Payment details are required",
      });
    }

    // Verify the payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    console.log("🔐 Signature verification:", {
      received: razorpay_signature,
      generated: generatedSignature,
      match: generatedSignature === razorpay_signature,
    });

    if (generatedSignature !== razorpay_signature) {
      console.error("❌ Payment signature verification failed");
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Get Razorpay instance
    const razorpayInstance = getRazorpayInstance();
    if (!razorpayInstance) {
      console.error("❌ Razorpay instance not available");
      return res.status(500).json({
        success: false,
        message: "Payment gateway not configured",
      });
    }

    // Verify payment with Razorpay API
    try {
      const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);
      console.log("📥 Payment details from Razorpay:", {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        order_id: payment.order_id,
      });

      if (payment.status !== "captured" && payment.status !== "authorized") {
        console.error("❌ Payment not captured:", payment.status);
        return res.status(400).json({
          success: false,
          message: "Payment not successful",
        });
      }
    } catch (error) {
      console.error("❌ Error fetching payment from Razorpay:", error);
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Create order in database
    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: "processing",
      priceRequest: priceRequest || null,
    };

    console.log("💾 Creating order in database:", orderData);

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Clear user cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Update price request status if exists
    if (priceRequest) {
      await PriceRequest.findByIdAndUpdate(
        priceRequest,
        { status: "completed" },
        { new: true }
      );
    }

    console.log("✅ Order created successfully:", newOrder._id);

    res.json({
      success: true,
      message: "Payment successful and order placed",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("❌ [RAZORPAY] Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment",
    });
  }
};

// Get Razorpay key (for frontend)
export const getRazorpayKey = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID) {
      return res.status(500).json({
        success: false,
        message: "Payment gateway not configured",
      });
    }

    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
