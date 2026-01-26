import express from "express";
import {
  getAdminCounts,
  markOrdersAsViewed,
  markPriceRequestsAsViewed,
} from "../controllers/adminController.js";
import adminAuth from "../middleware/adminAuth.js";

const adminRouter = express.Router();

// Get admin dashboard counts (requires admin authentication)
adminRouter.get("/counts", adminAuth, getAdminCounts);

// Mark orders as viewed (requires admin authentication)
adminRouter.post("/mark-orders-viewed", adminAuth, markOrdersAsViewed);

// Mark price requests as viewed (requires admin authentication)
adminRouter.post("/mark-requests-viewed", adminAuth, markPriceRequestsAsViewed);

export default adminRouter;
