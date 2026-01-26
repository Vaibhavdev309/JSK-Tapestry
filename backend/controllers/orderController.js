import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import PriceRequest from "../models/PriceRequest.js";

const placeOrder = async (req, res) => {
  try {
    console.log("🔵 [PLACE ORDER] Request received");
    const { userId, items, amount, address, paymentMethod = "COD" } = req.body;
    
    console.log("📦 Order data:", {
      userId,
      itemsCount: items?.length,
      amount,
      paymentMethod,
    });

    // For COD orders only (Razorpay orders are created via payment verification)
    if (paymentMethod !== "COD") {
      console.error("❌ Invalid payment method for this endpoint:", paymentMethod);
      return res.status(400).json({
        success: false,
        message: "Use payment gateway endpoints for online payments",
      });
    }

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: "COD",
      paymentStatus: "pending",
      status: "processing",
      priceRequest: req.body.priceRequest || null,
    };

    console.log("💾 Creating COD order in database");
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Clear user cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Update price request status if exists
    if (req.body.priceRequest) {
      await PriceRequest.findByIdAndUpdate(
        req.body.priceRequest,
        { status: "completed" },
        { new: true }
      );
    }

    console.log("✅ COD order created successfully:", newOrder._id);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("❌ [PLACE ORDER] Error:", error);
    res.json({ success: false, message: error.message });
  }
};

const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

const userOrders = async (req, res) => {
  try {
    console.log("i ma er");
    console.log(req.body.userId);
    const orders = await orderModel
      .find({ userId: req.body.userId })
      .populate({
        path: "items.productId",
        select: "name image",
      })
      .sort({ createdAt: -1 });
    console.log(orders);
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export { placeOrder, allOrders, userOrders, updateStatus };
