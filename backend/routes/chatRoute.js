import express from "express";
import data from "../data/data.js";
import adminAuth from "../middleware/adminAuth.js";
import authChatAccess from "../middleware/authChatAccess.js";
import {
  accessChat,
  fetchChats,
  searchUser,
} from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.get("/", (req, res) => {
  res.json(data);
});

chatRouter.get("/searchuser", adminAuth, searchUser);
chatRouter.get("/fetchchats", adminAuth, fetchChats);
chatRouter.post("/accesschat", authChatAccess, accessChat);

export default chatRouter;
