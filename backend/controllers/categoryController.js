import categoryModel from "../models/categoryModel.js";

// Get all categories with subcategories
const getAllCategories = async (req, res) => {
  try {
    console.log("🔵 [CATEGORY] Fetching all categories");
    const categories = await categoryModel.find({}).sort({ name: 1 });
    console.log("✅ [CATEGORY] Categories fetched:", categories.length);
    res.json({ success: true, categories });
  } catch (error) {
    console.error("❌ [CATEGORY] Error fetching categories:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new category
const createCategory = async (req, res) => {
  try {
    console.log("🔵 [CATEGORY] Creating new category");
    const { name, subCategories } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Category name is required" 
      });
    }

    // Check if category already exists
    const existingCategory = await categoryModel.findOne({ 
      name: name.trim() 
    });

    if (existingCategory) {
      return res.status(400).json({ 
        success: false, 
        message: "Category already exists" 
      });
    }

    const categoryData = {
      name: name.trim(),
      subCategories: subCategories && Array.isArray(subCategories) 
        ? subCategories.map(sub => sub.trim()).filter(sub => sub.length > 0)
        : []
    };

    const category = new categoryModel(categoryData);
    await category.save();

    console.log("✅ [CATEGORY] Category created:", category._id);
    res.status(201).json({ 
      success: true, 
      message: "Category created successfully", 
      category 
    });
  } catch (error) {
    console.error("❌ [CATEGORY] Error creating category:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  try {
    console.log("🔵 [CATEGORY] Updating category");
    const { categoryId } = req.body;
    const { name, subCategories } = req.body;

    if (!categoryId) {
      return res.status(400).json({ 
        success: false, 
        message: "Category ID is required" 
      });
    }

    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }

    // If name is being changed, check if new name already exists
    if (name && name.trim() !== category.name) {
      const existingCategory = await categoryModel.findOne({ 
        name: name.trim(),
        _id: { $ne: categoryId }
      });

      if (existingCategory) {
        return res.status(400).json({ 
          success: false, 
          message: "Category name already exists" 
        });
      }
    }

    const updateData = {};
    if (name && name.trim()) {
      updateData.name = name.trim();
    }
    if (subCategories && Array.isArray(subCategories)) {
      updateData.subCategories = subCategories
        .map(sub => sub.trim())
        .filter(sub => sub.length > 0);
    }
    updateData.updatedAt = Date.now();

    const updatedCategory = await categoryModel.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true, runValidators: true }
    );

    console.log("✅ [CATEGORY] Category updated:", updatedCategory._id);
    res.json({ 
      success: true, 
      message: "Category updated successfully", 
      category: updatedCategory 
    });
  } catch (error) {
    console.error("❌ [CATEGORY] Error updating category:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  try {
    console.log("🔵 [CATEGORY] Deleting category");
    const { categoryId } = req.body;

    if (!categoryId) {
      return res.status(400).json({ 
        success: false, 
        message: "Category ID is required" 
      });
    }

    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }

    // Check if any products are using this category
    const productModel = (await import("../models/productModel.js")).default;
    const productsUsingCategory = await productModel.countDocuments({
      category: category.name
    });

    if (productsUsingCategory > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete category. ${productsUsingCategory} product(s) are using this category. Please update or delete those products first.` 
      });
    }

    await categoryModel.findByIdAndDelete(categoryId);
    console.log("✅ [CATEGORY] Category deleted:", categoryId);
    res.json({ 
      success: true, 
      message: "Category deleted successfully" 
    });
  } catch (error) {
    console.error("❌ [CATEGORY] Error deleting category:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add subcategory to a category
const addSubCategory = async (req, res) => {
  try {
    console.log("🔵 [CATEGORY] Adding subcategory");
    const { categoryId, subCategory } = req.body;

    if (!categoryId) {
      return res.status(400).json({ 
        success: false, 
        message: "Category ID is required" 
      });
    }

    if (!subCategory || !subCategory.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Subcategory name is required" 
      });
    }

    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }

    const subCategoryName = subCategory.trim();

    // Check if subcategory already exists
    if (category.subCategories.includes(subCategoryName)) {
      return res.status(400).json({ 
        success: false, 
        message: "Subcategory already exists" 
      });
    }

    category.subCategories.push(subCategoryName);
    category.updatedAt = Date.now();
    await category.save();

    console.log("✅ [CATEGORY] Subcategory added:", subCategoryName);
    res.json({ 
      success: true, 
      message: "Subcategory added successfully", 
      category 
    });
  } catch (error) {
    console.error("❌ [CATEGORY] Error adding subcategory:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove subcategory from a category
const removeSubCategory = async (req, res) => {
  try {
    console.log("🔵 [CATEGORY] Removing subcategory");
    const { categoryId, subCategory } = req.body;

    if (!categoryId) {
      return res.status(400).json({ 
        success: false, 
        message: "Category ID is required" 
      });
    }

    if (!subCategory || !subCategory.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Subcategory name is required" 
      });
    }

    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }

    // Check if any products are using this subcategory
    const productModel = (await import("../models/productModel.js")).default;
    const productsUsingSubCategory = await productModel.countDocuments({
      category: category.name,
      subCategory: subCategory.trim()
    });

    if (productsUsingSubCategory > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete subcategory. ${productsUsingSubCategory} product(s) are using this subcategory. Please update or delete those products first.` 
      });
    }

    category.subCategories = category.subCategories.filter(
      sub => sub !== subCategory.trim()
    );
    category.updatedAt = Date.now();
    await category.save();

    console.log("✅ [CATEGORY] Subcategory removed:", subCategory);
    res.json({ 
      success: true, 
      message: "Subcategory removed successfully", 
      category 
    });
  } catch (error) {
    console.error("❌ [CATEGORY] Error removing subcategory:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create multiple categories at once
const createMultipleCategories = async (req, res) => {
  try {
    console.log("🔵 [CATEGORY] Creating multiple categories");
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Categories array is required and must not be empty" 
      });
    }

    const results = {
      created: [],
      skipped: [],
      errors: []
    };

    // Get all existing categories to check for duplicates
    const existingCategories = await categoryModel.find({});
    const existingNames = new Set(existingCategories.map(cat => cat.name.toLowerCase()));

    for (const categoryData of categories) {
      try {
        const name = categoryData.name?.trim();
        const subCategories = categoryData.subCategories || [];

        if (!name) {
          results.errors.push({ 
            category: categoryData, 
            message: "Category name is required" 
          });
          continue;
        }

        // Check if category already exists
        if (existingNames.has(name.toLowerCase())) {
          results.skipped.push({ 
            name, 
            message: "Category already exists" 
          });
          continue;
        }

        const categoryToCreate = {
          name,
          subCategories: Array.isArray(subCategories) 
            ? subCategories.map(sub => sub.trim()).filter(sub => sub.length > 0)
            : []
        };

        const category = new categoryModel(categoryToCreate);
        await category.save();
        existingNames.add(name.toLowerCase()); // Add to set to prevent duplicates in same batch

        results.created.push(category);
        console.log("✅ [CATEGORY] Category created:", category._id);
      } catch (error) {
        results.errors.push({ 
          category: categoryData, 
          message: error.message 
        });
        console.error("❌ [CATEGORY] Error creating category:", error);
      }
    }

    const response = {
      success: true,
      message: `Created ${results.created.length} category/categories, skipped ${results.skipped.length}, errors: ${results.errors.length}`,
      results
    };

    console.log("✅ [CATEGORY] Bulk creation completed:", response.message);
    res.status(201).json(response);
  } catch (error) {
    console.error("❌ [CATEGORY] Error creating multiple categories:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add multiple subcategories to a category at once
const addMultipleSubCategories = async (req, res) => {
  try {
    console.log("🔵 [CATEGORY] Adding multiple subcategories");
    const { categoryId, subCategories } = req.body;

    if (!categoryId) {
      return res.status(400).json({ 
        success: false, 
        message: "Category ID is required" 
      });
    }

    if (!subCategories || !Array.isArray(subCategories) || subCategories.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Subcategories array is required and must not be empty" 
      });
    }

    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }

    const results = {
      added: [],
      skipped: [],
      errors: []
    };

    const existingSubCategories = new Set(
      category.subCategories.map(sub => sub.toLowerCase())
    );

    for (const subCategory of subCategories) {
      try {
        const subCategoryName = subCategory?.trim();
        
        if (!subCategoryName) {
          results.errors.push({ 
            subCategory, 
            message: "Subcategory name is required" 
          });
          continue;
        }

        // Check if subcategory already exists
        if (existingSubCategories.has(subCategoryName.toLowerCase())) {
          results.skipped.push({ 
            name: subCategoryName, 
            message: "Subcategory already exists" 
          });
          continue;
        }

        category.subCategories.push(subCategoryName);
        existingSubCategories.add(subCategoryName.toLowerCase());
        results.added.push(subCategoryName);
      } catch (error) {
        results.errors.push({ 
          subCategory, 
          message: error.message 
        });
      }
    }

    if (results.added.length > 0) {
      category.updatedAt = Date.now();
      await category.save();
    }

    const response = {
      success: true,
      message: `Added ${results.added.length} subcategory/subcategories, skipped ${results.skipped.length}, errors: ${results.errors.length}`,
      category,
      results
    };

    console.log("✅ [CATEGORY] Bulk subcategory addition completed:", response.message);
    res.json(response);
  } catch (error) {
    console.error("❌ [CATEGORY] Error adding multiple subcategories:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getAllCategories,
  createCategory,
  createMultipleCategories,
  updateCategory,
  deleteCategory,
  addSubCategory,
  addMultipleSubCategories,
  removeSubCategory
};
