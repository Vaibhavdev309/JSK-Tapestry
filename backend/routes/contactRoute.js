import express from "express";
import {
  submitContact,
  getAllContacts,
  getContact,
  updateContactStatus,
  deleteContact,
} from "../controllers/contactController.js";
import adminAuth from "../middleware/adminAuth.js";

const contactRouter = express.Router();

// Public route - anyone can submit contact form (token optional)
// We'll handle userId extraction manually in the controller
contactRouter.post("/submit", submitContact);

// Admin routes - require admin authentication
contactRouter.get("/", adminAuth, getAllContacts);
contactRouter.get("/:id", adminAuth, getContact);
contactRouter.put("/:id/status", adminAuth, updateContactStatus);
contactRouter.delete("/:id", adminAuth, deleteContact);

export default contactRouter;
