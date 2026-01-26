import express from "express";
import {
  sendMessage,
  allMessages,
  markMessagesRead,
  getUnreadCount,
} from "../controllers/messageController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/authUser.js";
import authChatParticipant from "../middleware/authChatParticipant.js";

const messageRouter = express.Router();

const verifySender = (req, res, next) => {
  const { isAdmin } = req.body;

  if (isAdmin) {
    return adminAuth(req, res, next);
  } else {
    return authUser(req, res, next);
  }
};

messageRouter.post("/send", verifySender, sendMessage);
messageRouter.post("/mark-read", verifySender, markMessagesRead);
// More specific route first so /unread/:chatId is not matched by /:chatId
messageRouter.get("/unread/:chatId", authChatParticipant, getUnreadCount);
messageRouter.get("/:chatId", authChatParticipant, allMessages);

export default messageRouter;
