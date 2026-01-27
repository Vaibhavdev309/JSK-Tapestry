import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UPLOAD_AREA_DATA_URI } from "../utils/icons";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Edit = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form state
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [price, setPrice] = useState("");
  const [bestSeller, setBestSeller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/category/list`);
        if (response.data.success) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (category) {
      const selectedCategory = categories.find(cat => cat.name === category);
      if (selectedCategory) {
        setSubCategories(selectedCategory.subCategories || []);
        // If current subcategory is not in the list, keep it (might be from old data)
        if (selectedCategory.subCategories.length > 0) {
          if (!selectedCategory.subCategories.includes(subCategory)) {
            // If subcategory doesn't exist in new list, set to first available
            setSubCategory(selectedCategory.subCategories[0]);
          }
        }
      }
    } else {
      setSubCategories([]);
    }
  }, [category, categories]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        console.error("❌ Product ID is missing from URL params");
        toast.error("Product ID is missing");
        navigate("/list");
        return;
      }

      // Validate MongoDB ObjectId format (24 hex characters)
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        console.error("❌ Invalid product ID format:", id);
        toast.error("Invalid product ID format");
        navigate("/list");
        return;
      }

      try {
        console.log("📥 Fetching product data for ID:", id);
        console.log("🌐 Request URL:", backendUrl + "/api/product/single");
        console.log("📦 Request payload:", { productId: id });
        setFetching(true);
        
        const response = await axios.post(backendUrl + "/api/product/single", {
          productId: id,
        });

        console.log("📥 Response received:", {
          status: response.status,
          success: response.data.success,
          hasMessage: !!response.data.message,
        });

        if (response.data.success && response.data.message) {
          const product = response.data.message;
          console.log("✅ Product data received:", {
            id: product._id,
            name: product.name,
            category: product.category,
            subCategory: product.subCategory,
            price: product.price,
            sizes: product.sizes,
            imageCount: product.image?.length || 0,
          });

          setName(product.name || "");
          setDescription(product.description || "");
          setCategory(product.category || "");
          setSubCategory(product.subCategory || "");
          setPrice(product.price?.toString() || "");
          setBestSeller(product.bestSeller || false);
          setSizes(product.sizes || []);
          setExistingImages(product.image || []);

          console.log("📋 Form pre-filled successfully");
        } else {
          console.error("❌ Backend returned success: false or no message");
          console.error("❌ Response data:", response.data);
          const errorMessage = response.data?.message || "Product not found";
          toast.error(errorMessage);
          navigate("/list");
        }
      } catch (error) {
        console.error("❌ Error fetching product:");
        console.error("❌ Error type:", error.name);
        console.error("❌ Error message:", error.message);
        
        if (error.response) {
          // Server responded with error status
          console.error("❌ Response status:", error.response.status);
          console.error("❌ Response data:", error.response.data);
          const errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
          toast.error(errorMessage);
        } else if (error.request) {
          // Request made but no response
          console.error("❌ No response received from server");
          console.error("❌ Request config:", error.config);
          toast.error("Network error: Could not reach server. Check if backend is running.");
        } else {
          // Error setting up request
          console.error("❌ Error setting up request:", error.message);
          toast.error(`Request error: ${error.message}`);
        }
        navigate("/list");
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const removeExistingImage = (indexToRemove) => {
    console.log("🗑️ Removing existing image at index:", indexToRemove);
    const updated = existingImages.filter((_, index) => index !== indexToRemove);
    setExistingImages(updated);
    console.log("✅ Remaining existing images:", updated.length);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!name.trim()) {
      console.error("❌ Validation Error: Product name is required");
      toast.error("Please enter a product name");
      setLoading(false);
      return;
    }
    if (!price || Number(price) <= 0) {
      console.error("❌ Validation Error: Valid price is required");
      toast.error("Please enter a valid price");
      setLoading(false);
      return;
    }
    if (sizes.length === 0) {
      console.error("❌ Validation Error: At least one size is required");
      toast.error("Please select at least one size");
      setLoading(false);
      return;
    }
    if (existingImages.length === 0 && !image1 && !image2 && !image3 && !image4) {
      console.error("❌ Validation Error: At least one image is required");
      toast.error("Please keep at least one image or upload a new one");
      setLoading(false);
      return;
    }

    try {
      console.log("📤 Starting product update...");
      console.log("📋 Form Data:", {
        productId: id,
        name,
        description,
        category,
        subCategory,
        price,
        bestSeller,
        sizes,
        existingImagesCount: existingImages.length,
        newImages: {
          image1: image1 ? `${image1.name} (${(image1.size / 1024).toFixed(2)} KB)` : "Not provided",
          image2: image2 ? `${image2.name} (${(image2.size / 1024).toFixed(2)} KB)` : "Not provided",
          image3: image3 ? `${image3.name} (${(image3.size / 1024).toFixed(2)} KB)` : "Not provided",
          image4: image4 ? `${image4.name} (${(image4.size / 1024).toFixed(2)} KB)` : "Not provided",
        },
      });

      const formData = new FormData();
      formData.append("productId", id);
      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("price", price);
      formData.append("bestSeller", bestSeller);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("existingImages", JSON.stringify(existingImages));

      console.log("🌐 Sending request to:", backendUrl + "/api/product/update");
      console.log("🔑 Token present:", !!token);
      console.log("📦 FormData entries:", Array.from(formData.entries()).map(([key, value]) =>
        [key, value instanceof File ? `${value.name} (${(value.size / 1024).toFixed(2)} KB)` : value]
      ));

      const response = await axios.put(
        backendUrl + "/api/product/update",
        formData,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Response received:", response.data);

      if (response.data.success) {
        console.log("✅ Product updated successfully!");
        toast.success("Product Updated Successfully");
        navigate("/list");
      } else {
        console.error("❌ Backend returned success: false");
        console.error("❌ Error message:", response.data.message);
        toast.error(response.data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("❌ Error occurred during product update:");
      console.error("❌ Error type:", error.name);
      console.error("❌ Error message:", error.message);

      if (error.response) {
        console.error("❌ Response status:", error.response.status);
        console.error("❌ Response data:", error.response.data);
        console.error("❌ Response headers:", error.response.headers);
        toast.error(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        console.error("❌ No response received from server");
        console.error("❌ Request config:", error.config);
        toast.error("Network error: Could not reach server. Check if backend is running.");
      } else {
        console.error("❌ Error setting up request:", error.message);
        toast.error(`Request error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4 sm:space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-24 bg-gray-200 rounded" />
            </div>
            <p className="text-center text-gray-500">Loading product data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Edit Product</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
              Update product information and images
              {id && (
                <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">
                  ID: {id.substring(0, 8)}...
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => navigate("/list")}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to List
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 lg:p-6">
          <form onSubmit={onSubmitHandler} className="space-y-4 sm:space-y-6">
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Current Images</h3>
                <span className="text-xs text-gray-500">{existingImages.length} image(s)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {existingImages.map((imgUrl, index) => (
                  <div key={`existing-${imgUrl}-${index}`} className="relative group">
                    <img
                      src={imgUrl}
                      alt={`Current ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                      aria-label="Remove image"
                      title="Remove this image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Image {index + 1}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Hover over images to remove them. Upload new images below to add more.
              </p>
            </div>
          )}

          {/* New Image Upload Section */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Add New Images (Optional)</h3>
              <span className="text-xs text-gray-500">Up to 4 images</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4].map((num) => {
                const imageState = num === 1 ? image1 : num === 2 ? image2 : num === 3 ? image3 : image4;
                const setImageState = num === 1 ? setImage1 : num === 2 ? setImage2 : num === 3 ? setImage3 : setImage4;
                const hasImage = !!imageState;
                return (
                  <label
                    key={`new-image-${num}`}
                    htmlFor={`image${num}`}
                    className={`group relative aspect-square cursor-pointer border-2 border-dashed rounded-lg transition-all ${
                      hasImage
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-300 hover:border-blue-500"
                    }`}
                  >
                    <img
                      className="w-full h-full object-cover rounded-lg"
                      src={
                        imageState
                          ? URL.createObjectURL(imageState)
                          : UPLOAD_AREA_DATA_URI
                      }
                      alt={`Preview ${num}`}
                    />
                    <input
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setImageState(file);
                          console.log(`📸 Image ${num} selected:`, file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
                        }
                      }}
                      type="file"
                      id={`image${num}`}
                      className="hidden"
                      accept="image/*"
                    />
                    {!hasImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    )}
                    {hasImage && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setImageState(null);
                          const input = document.getElementById(`image${num}`);
                          if (input) input.value = "";
                          console.log(`🗑️ Image ${num} removed`);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                        aria-label={`Remove image ${num}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Product Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Product description..."
            />
          </div>

          {/* Category Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-red-500">
                  No categories available. Please add categories first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Sub Category <span className="text-red-500">*</span>
              </label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!category || subCategories.length === 0}
              >
                <option value="">
                  {!category 
                    ? "Select category first" 
                    : subCategories.length === 0 
                      ? "No subcategories available" 
                      : "Select Sub Category"}
                </option>
                {subCategories.map((sub, index) => (
                  <option key={index} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
              {category && subCategories.length === 0 && (
                <p className="text-xs text-yellow-600">
                  No subcategories for this category. You can add subcategories in Categories page.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          {/* Sizes Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Available Sizes <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {["S", "M", "L", "XL", "XXL"].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    setSizes((prev) =>
                      prev.includes(size)
                        ? prev.filter((s) => s !== size)
                        : [...prev, size]
                    )
                  }
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-md transition-colors ${
                    sizes.includes(size)
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Best Seller */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="bestseller"
              checked={bestSeller}
              onChange={() => setBestSeller(!bestSeller)}
              className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="bestseller" className="text-sm text-gray-700">
              Mark as Best Seller
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Updating Product...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Update Product</span>
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/list")}
              className="flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default Edit;
