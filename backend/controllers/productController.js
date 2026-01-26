import cloudinary from "cloudinary";
import productModel from "../models/productModel.js";
const addProduct = async (req, res) => {
  try {
    console.log("📥 Product addition request received");
    console.log("📋 Request body:", req.body);
    console.log("📁 Request files:", req.files ? Object.keys(req.files) : "No files");
    
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestSeller,
    } = req.body;

    // Validation
    if (!name || !name.trim()) {
      console.error("❌ Validation Error: Name is missing or empty");
      return res.status(400).json({ success: false, message: "Product name is required" });
    }
    if (!price || isNaN(price) || Number(price) <= 0) {
      console.error("❌ Validation Error: Invalid price:", price);
      return res.status(400).json({ success: false, message: "Valid price is required" });
    }
    if (!category || !category.trim()) {
      console.error("❌ Validation Error: Category is missing");
      return res.status(400).json({ success: false, message: "Category is required" });
    }
    if (!subCategory || !subCategory.trim()) {
      console.error("❌ Validation Error: SubCategory is missing");
      return res.status(400).json({ success: false, message: "SubCategory is required" });
    }

    const image1 = req.files?.image1 && req.files.image1[0];
    const image2 = req.files?.image2 && req.files.image2[0];
    const image3 = req.files?.image3 && req.files.image3[0];
    const image4 = req.files?.image4 && req.files.image4[0];

    console.log("🖼️ Images received:", {
      image1: image1 ? `${image1.originalname} (${image1.size} bytes)` : "Not provided",
      image2: image2 ? `${image2.originalname} (${image2.size} bytes)` : "Not provided",
      image3: image3 ? `${image3.originalname} (${image3.size} bytes)` : "Not provided",
      image4: image4 ? `${image4.originalname} (${image4.size} bytes)` : "Not provided",
    });

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined && item !== null
    );

    if (images.length === 0) {
      console.error("❌ Validation Error: No images provided");
      return res.status(400).json({ success: false, message: "At least one image is required" });
    }

    console.log(`📤 Uploading ${images.length} image(s) to Cloudinary...`);
    let imagesUrl = [];
    try {
      imagesUrl = await Promise.all(
        images.map(async (item, index) => {
          try {
            console.log(`  📤 Uploading image ${index + 1}: ${item.originalname}`);
            let result = await cloudinary.uploader.upload(item.path, {
              resource_type: "image",
            });
            console.log(`  ✅ Image ${index + 1} uploaded: ${result.secure_url}`);
            return result.secure_url;
          } catch (uploadError) {
            console.error(`  ❌ Failed to upload image ${index + 1}:`, uploadError.message);
            throw new Error(`Failed to upload image ${index + 1}: ${uploadError.message}`);
          }
        })
      );
      console.log("✅ All images uploaded successfully");
    } catch (uploadError) {
      console.error("❌ Cloudinary upload error:", uploadError.message);
      return res.status(500).json({ success: false, message: `Image upload failed: ${uploadError.message}` });
    }

    // Parse sizes
    let parsedSizes = [];
    try {
      if (sizes) {
        parsedSizes = JSON.parse(sizes);
        if (!Array.isArray(parsedSizes)) {
          throw new Error("Sizes must be an array");
        }
      }
    } catch (parseError) {
      console.error("❌ Error parsing sizes:", parseError.message);
      return res.status(400).json({ success: false, message: `Invalid sizes format: ${parseError.message}` });
    }

    if (parsedSizes.length === 0) {
      console.error("❌ Validation Error: No sizes provided");
      return res.status(400).json({ success: false, message: "At least one size is required" });
    }

    const productData = {
      name: name.trim(),
      description: description?.trim() || "",
      category: category.trim(),
      price: Number(price),
      subCategory: subCategory.trim(),
      bestSeller: bestSeller === "true" || bestSeller === true,
      sizes: parsedSizes,
      image: imagesUrl,
      date: Date.now(),
    };

    console.log("💾 Saving product to database:", {
      name: productData.name,
      category: productData.category,
      subCategory: productData.subCategory,
      price: productData.price,
      sizes: productData.sizes,
      imageCount: productData.image.length,
    });

    const product = new productModel(productData);
    await product.save();
    
    console.log("✅ Product saved successfully with ID:", product._id);
    res.json({ success: true, message: "Product Added", productId: product._id });
  } catch (error) {
    console.error("❌ Error in addProduct controller:");
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};
const listProduct = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, message: products });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Prouct Removed" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
const singleProduct = async (req, res) => {
  try {
    console.log("📥 Single product request received");
    console.log("📋 Request body:", req.body);
    
    const { productId } = req.body;
    
    if (!productId) {
      console.error("❌ Validation Error: Product ID is missing");
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    // Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
      console.error("❌ Validation Error: Invalid product ID format:", productId);
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    console.log("🔍 Searching for product with ID:", productId);
    const product = await productModel.findById(productId);
    
    if (!product) {
      console.error("❌ Product not found for ID:", productId);
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    console.log("✅ Product found:", {
      id: product._id,
      name: product.name,
      category: product.category,
      subCategory: product.subCategory,
      price: product.price,
      imageCount: product.image?.length || 0,
    });
    
    res.json({ success: true, message: product });
  } catch (error) {
    console.error("❌ Error in singleProduct controller:");
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    console.log("📥 Product update request received");
    console.log("📋 Request body:", req.body);
    console.log("📁 Request files:", req.files ? Object.keys(req.files) : "No files");
    
    const { productId } = req.body;
    if (!productId) {
      console.error("❌ Validation Error: Product ID is required");
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const existingProduct = await productModel.findById(productId);
    if (!existingProduct) {
      console.error("❌ Product not found:", productId);
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestSeller,
      existingImages, // JSON array of existing image URLs to keep
    } = req.body;

    // Validation
    if (!name || !name.trim()) {
      console.error("❌ Validation Error: Name is missing or empty");
      return res.status(400).json({ success: false, message: "Product name is required" });
    }
    if (!price || isNaN(price) || Number(price) <= 0) {
      console.error("❌ Validation Error: Invalid price:", price);
      return res.status(400).json({ success: false, message: "Valid price is required" });
    }
    if (!category || !category.trim()) {
      console.error("❌ Validation Error: Category is missing");
      return res.status(400).json({ success: false, message: "Category is required" });
    }
    if (!subCategory || !subCategory.trim()) {
      console.error("❌ Validation Error: SubCategory is missing");
      return res.status(400).json({ success: false, message: "SubCategory is required" });
    }

    // Handle existing images
    let existingImagesArray = [];
    try {
      if (existingImages) {
        existingImagesArray = JSON.parse(existingImages);
        if (!Array.isArray(existingImagesArray)) {
          existingImagesArray = [];
        }
      }
    } catch (e) {
      console.warn("⚠️ Could not parse existingImages, using empty array");
      existingImagesArray = [];
    }

    // Handle new image uploads
    const image1 = req.files?.image1 && req.files.image1[0];
    const image2 = req.files?.image2 && req.files.image2[0];
    const image3 = req.files?.image3 && req.files.image3[0];
    const image4 = req.files?.image4 && req.files.image4[0];

    console.log("🖼️ Images received:", {
      existingImagesCount: existingImagesArray.length,
      image1: image1 ? `${image1.originalname} (${image1.size} bytes)` : "Not provided",
      image2: image2 ? `${image2.originalname} (${image2.size} bytes)` : "Not provided",
      image3: image3 ? `${image3.originalname} (${image3.size} bytes)` : "Not provided",
      image4: image4 ? `${image4.originalname} (${image4.size} bytes)` : "Not provided",
    });

    const newImages = [image1, image2, image3, image4].filter(
      (item) => item !== undefined && item !== null
    );

    let newImagesUrl = [];
    if (newImages.length > 0) {
      console.log(`📤 Uploading ${newImages.length} new image(s) to Cloudinary...`);
      try {
        newImagesUrl = await Promise.all(
          newImages.map(async (item, index) => {
            try {
              console.log(`  📤 Uploading image ${index + 1}: ${item.originalname}`);
              let result = await cloudinary.uploader.upload(item.path, {
                resource_type: "image",
              });
              console.log(`  ✅ Image ${index + 1} uploaded: ${result.secure_url}`);
              return result.secure_url;
            } catch (uploadError) {
              console.error(`  ❌ Failed to upload image ${index + 1}:`, uploadError.message);
              throw new Error(`Failed to upload image ${index + 1}: ${uploadError.message}`);
            }
          })
        );
        console.log("✅ All new images uploaded successfully");
      } catch (uploadError) {
        console.error("❌ Cloudinary upload error:", uploadError.message);
        return res.status(500).json({ success: false, message: `Image upload failed: ${uploadError.message}` });
      }
    }

    // Combine existing and new images
    const allImages = [...existingImagesArray, ...newImagesUrl];
    if (allImages.length === 0) {
      console.error("❌ Validation Error: At least one image is required");
      return res.status(400).json({ success: false, message: "At least one image is required" });
    }

    // Parse sizes
    let parsedSizes = [];
    try {
      if (sizes) {
        parsedSizes = JSON.parse(sizes);
        if (!Array.isArray(parsedSizes)) {
          throw new Error("Sizes must be an array");
        }
      }
    } catch (parseError) {
      console.error("❌ Error parsing sizes:", parseError.message);
      return res.status(400).json({ success: false, message: `Invalid sizes format: ${parseError.message}` });
    }

    if (parsedSizes.length === 0) {
      console.error("❌ Validation Error: No sizes provided");
      return res.status(400).json({ success: false, message: "At least one size is required" });
    }

    const updateData = {
      name: name.trim(),
      description: description?.trim() || "",
      category: category.trim(),
      price: Number(price),
      subCategory: subCategory.trim(),
      bestSeller: bestSeller === "true" || bestSeller === true,
      sizes: parsedSizes,
      image: allImages,
    };

    console.log("💾 Updating product in database:", {
      productId,
      name: updateData.name,
      category: updateData.category,
      subCategory: updateData.subCategory,
      price: updateData.price,
      sizes: updateData.sizes,
      imageCount: updateData.image.length,
    });

    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      console.error("❌ Failed to update product");
      return res.status(500).json({ success: false, message: "Failed to update product" });
    }

    console.log("✅ Product updated successfully:", updatedProduct._id);
    res.json({ success: true, message: "Product Updated", product: updatedProduct });
  } catch (error) {
    console.error("❌ Error in updateProduct controller:");
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

export { addProduct, listProduct, singleProduct, removeProduct, updateProduct };
