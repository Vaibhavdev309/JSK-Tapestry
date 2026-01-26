import orderModel from "../models/orderModel.js";
import messageModel from "../models/messageModel.js";
import PriceRequest from "../models/PriceRequest.js";
import Contact from "../models/contactModel.js";

// Mark orders as viewed by admin
export const markOrdersAsViewed = async (req, res) => {
  try {
    console.log("🔵 [ADMIN] Mark orders as viewed");
    // Mark all processing orders as viewed
    await orderModel.updateMany(
      { status: "processing", viewedByAdmin: false },
      { $set: { viewedByAdmin: true } }
    );
    res.json({ success: true, message: "Orders marked as viewed" });
  } catch (error) {
    console.error("❌ [ADMIN] Error marking orders as viewed:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to mark orders as viewed",
    });
  }
};

// Mark price requests as viewed by admin
export const markPriceRequestsAsViewed = async (req, res) => {
  try {
    console.log("🔵 [ADMIN] Mark price requests as viewed");
    // Mark all pending price requests as viewed
    await PriceRequest.updateMany(
      { status: "pending", viewedByAdmin: false },
      { $set: { viewedByAdmin: true } }
    );
    res.json({ success: true, message: "Price requests marked as viewed" });
  } catch (error) {
    console.error("❌ [ADMIN] Error marking price requests as viewed:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to mark price requests as viewed",
    });
  }
};

// Get counts for admin dashboard
export const getAdminCounts = async (req, res) => {
  try {
    console.log("🔵 [ADMIN] Get counts request");

    // Count new orders (status: processing AND not viewed by admin)
    const newOrdersCount = await orderModel.countDocuments({
      status: "processing",
      viewedByAdmin: false,
    });

    // Count unread messages from users (for admin)
    // Messages where sender="user" and read=false
    const unreadChatsCount = await messageModel.countDocuments({
      sender: "user",
      read: false,
    });

    // Count pending price requests (status: pending AND not viewed by admin)
    const pendingPriceRequestsCount = await PriceRequest.countDocuments({
      status: "pending",
      viewedByAdmin: false,
    });

    // Count new contact messages (status: new)
    const newContactMessagesCount = await Contact.countDocuments({
      status: "new",
    });

    console.log("✅ Admin counts retrieved:", {
      newOrders: newOrdersCount,
      unreadChats: unreadChatsCount,
      pendingPriceRequests: pendingPriceRequestsCount,
      newContactMessages: newContactMessagesCount,
    });

    res.json({
      success: true,
      counts: {
        orders: newOrdersCount,
        chats: unreadChatsCount,
        priceRequests: pendingPriceRequestsCount,
        contactMessages: newContactMessagesCount,
      },
    });
  } catch (error) {
    console.error("❌ [ADMIN] Error getting counts:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve counts",
    });
  }
};
