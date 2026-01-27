import express from "express";
import {
  getAllCategories,
  createCategory,
  createMultipleCategories,
  updateCategory,
  deleteCategory,
  addSubCategory,
  addMultipleSubCategories,
  removeSubCategory
} from "../controllers/categoryController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Get all categories (public - for product forms)
router.get("/list", getAllCategories);

// Admin only routes
router.post("/create", adminAuth, createCategory);
router.post("/create-multiple", adminAuth, createMultipleCategories);
router.post("/update", adminAuth, updateCategory);
router.post("/delete", adminAuth, deleteCategory);
router.post("/add-subcategory", adminAuth, addSubCategory);
router.post("/add-multiple-subcategories", adminAuth, addMultipleSubCategories);
router.post("/remove-subcategory", adminAuth, removeSubCategory);

export default router;
