import jwt from "jsonwebtoken";
import chatModel from "../models/chatModel.js";

/**
 * Protects GET /api/message/:chatId and GET /api/message/unread/:chatId.
 * Allows: admin (any chat) or the user who owns the chat (chat.userId === user.id).
 */
const authChatParticipant = async (req, res, next) => {
  try {
    const token = req.headers?.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const chatId = req.params.chatId;
    if (!chatId) {
      return res.status(400).json({ success: false, message: "Chat ID required" });
    }

    // Admin token: payload is { role: 'admin' }
    if (decoded?.role === "admin") {
      req.isAdmin = true;
      return next();
    }

    // User token: payload is { id }
    if (decoded && typeof decoded === "object" && decoded.id) {
      req.isAdmin = false;
      const chat = await chatModel.findById(chatId);
      if (!chat) {
        return res.status(404).json({ success: false, message: "Chat not found" });
      }
      if (chat.userId.toString() !== decoded.id) {
        return res.status(403).json({ success: false, message: "Not allowed to access this chat" });
      }
      return next();
    }

    return res.status(401).json({ success: false, message: "Not authorized" });
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message || "Not authorized" });
  }
};

export default authChatParticipant;
