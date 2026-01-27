import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Categories = ({ token }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Category states
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [bulkCategoryMode, setBulkCategoryMode] = useState(false);
  const [bulkCategoryInput, setBulkCategoryInput] = useState("");
  
  // Subcategory states
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [showAddSubCategoryForm, setShowAddSubCategoryForm] = useState(false);
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [oldSubCategoryName, setOldSubCategoryName] = useState("");
  const [bulkSubCategoryMode, setBulkSubCategoryMode] = useState(false);
  const [bulkSubCategoryInput, setBulkSubCategoryInput] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/category/list`);
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  // ========== CATEGORY FUNCTIONS ==========
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/category/create`,
        { name: categoryName.trim(), subCategories: [] },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Category added successfully");
        setCategoryName("");
        setShowAddCategoryForm(false);
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add category");
    }
  };

  const handleBulkAddCategories = async (e) => {
    e.preventDefault();
    if (!bulkCategoryInput.trim()) {
      toast.error("Please enter at least one category name");
      return;
    }

    // Parse input - support both comma-separated and newline-separated
    const lines = bulkCategoryInput
      .split(/[,\n]/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      toast.error("Please enter at least one valid category name");
      return;
    }

    // Convert to array of category objects
    const categories = lines.map(name => ({
      name,
      subCategories: []
    }));

    try {
      const response = await axios.post(
        `${backendUrl}/api/category/create-multiple`,
        { categories },
        { headers: { token } }
      );

      if (response.data.success) {
        const { created, skipped, errors } = response.data.results;
        let message = `Successfully created ${created.length} category/categories`;
        if (skipped.length > 0) {
          message += `. Skipped ${skipped.length} (already exist)`;
        }
        if (errors.length > 0) {
          message += `. ${errors.length} error(s) occurred`;
        }
        toast.success(message);
        setBulkCategoryInput("");
        setBulkCategoryMode(false);
        setShowAddCategoryForm(false);
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add categories");
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/category/update`,
        {
          categoryId: editingCategory._id,
          name: categoryName.trim()
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Category updated successfully");
        setEditingCategory(null);
        setCategoryName("");
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category? This will also delete all its subcategories. This action cannot be undone.")) {
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/category/delete`,
        { categoryId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Category deleted successfully");
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  const startEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setShowAddCategoryForm(false);
  };

  const cancelCategoryEdit = () => {
    setEditingCategory(null);
    setCategoryName("");
    setBulkCategoryInput("");
    setBulkCategoryMode(false);
    setShowAddCategoryForm(false);
  };

  // ========== SUBCATEGORY FUNCTIONS ==========
  const handleAddSubCategory = async (e) => {
    e.preventDefault();
    if (!selectedCategoryForSub) {
      toast.error("Please select a category");
      return;
    }
    if (!subCategoryName.trim()) {
      toast.error("Subcategory name is required");
      return;
    }

    try {
      const category = categories.find(cat => cat._id === selectedCategoryForSub);
      if (!category) {
        toast.error("Category not found");
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/category/add-subcategory`,
        {
          categoryId: selectedCategoryForSub,
          subCategory: subCategoryName.trim()
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Subcategory added successfully");
        setSubCategoryName("");
        setSelectedCategoryForSub("");
        setShowAddSubCategoryForm(false);
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add subcategory");
    }
  };

  const handleBulkAddSubCategories = async (e) => {
    e.preventDefault();
    if (!selectedCategoryForSub) {
      toast.error("Please select a category");
      return;
    }
    if (!bulkSubCategoryInput.trim()) {
      toast.error("Please enter at least one subcategory name");
      return;
    }

    // Parse input - support both comma-separated and newline-separated
    const subCategories = bulkSubCategoryInput
      .split(/[,\n]/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (subCategories.length === 0) {
      toast.error("Please enter at least one valid subcategory name");
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/category/add-multiple-subcategories`,
        {
          categoryId: selectedCategoryForSub,
          subCategories
        },
        { headers: { token } }
      );

      if (response.data.success) {
        const { added, skipped, errors } = response.data.results;
        let message = `Successfully added ${added.length} subcategory/subcategories`;
        if (skipped.length > 0) {
          message += `. Skipped ${skipped.length} (already exist)`;
        }
        if (errors.length > 0) {
          message += `. ${errors.length} error(s) occurred`;
        }
        toast.success(message);
        setBulkSubCategoryInput("");
        setBulkSubCategoryMode(false);
        setShowAddSubCategoryForm(false);
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add subcategories");
    }
  };

  const handleUpdateSubCategory = async (e) => {
    e.preventDefault();
    if (!selectedCategoryForSub) {
      toast.error("Please select a category");
      return;
    }
    if (!subCategoryName.trim()) {
      toast.error("Subcategory name is required");
      return;
    }

    try {
      const category = categories.find(cat => cat._id === selectedCategoryForSub);
      if (!category) {
        toast.error("Category not found");
        return;
      }

      // First remove old subcategory, then add new one
      if (oldSubCategoryName) {
        await axios.post(
          `${backendUrl}/api/category/remove-subcategory`,
          {
            categoryId: selectedCategoryForSub,
            subCategory: oldSubCategoryName
          },
          { headers: { token } }
        );
      }

      const response = await axios.post(
        `${backendUrl}/api/category/add-subcategory`,
        {
          categoryId: selectedCategoryForSub,
          subCategory: subCategoryName.trim()
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Subcategory updated successfully");
        setEditingSubCategory(null);
        setSubCategoryName("");
        setOldSubCategoryName("");
        setSelectedCategoryForSub("");
        setShowAddSubCategoryForm(false);
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update subcategory");
    }
  };

  const handleRemoveSubCategory = async (categoryId, subCategory) => {
    if (!window.confirm(`Are you sure you want to remove "${subCategory}"?`)) {
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/category/remove-subcategory`,
        {
          categoryId,
          subCategory
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Subcategory removed successfully");
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove subcategory");
    }
  };

  const startEditSubCategory = (categoryId, subCategory) => {
    setEditingSubCategory({ categoryId, subCategory });
    setSelectedCategoryForSub(categoryId);
    setSubCategoryName(subCategory);
    setOldSubCategoryName(subCategory);
    setShowAddSubCategoryForm(true);
  };

  const cancelSubCategoryEdit = () => {
    setEditingSubCategory(null);
    setSubCategoryName("");
    setOldSubCategoryName("");
    setBulkSubCategoryInput("");
    setBulkSubCategoryMode(false);
    setSelectedCategoryForSub("");
    setShowAddSubCategoryForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Category & Subcategory Management</h1>
      </div>

      {/* ========== CATEGORY SECTION ========== */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Categories ({categories.length})</h2>
          <button
            onClick={() => {
              cancelCategoryEdit();
              setShowAddCategoryForm(!showAddCategoryForm);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            {showAddCategoryForm ? "Cancel" : "+ Add Category"}
          </button>
        </div>

        {/* Add/Edit Category Form */}
        {(showAddCategoryForm || editingCategory) && !editingCategory && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Add New Category</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBulkCategoryMode(false)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    !bulkCategoryMode
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => setBulkCategoryMode(true)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    bulkCategoryMode
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Bulk
                </button>
              </div>
            </div>
            {!bulkCategoryMode ? (
              <form onSubmit={handleAddCategory}>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter category name (e.g., Ganesha, Home Decor)"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleBulkAddCategories}>
                <div className="space-y-3">
                  <textarea
                    value={bulkCategoryInput}
                    onChange={(e) => setBulkCategoryInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter multiple categories, one per line or separated by commas&#10;Example:&#10;Ganesha&#10;Home Decor&#10;Wall Hangings"
                    rows={6}
                    required
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add All
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBulkCategoryInput("");
                        setBulkCategoryMode(false);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Enter one category per line or separate by commas. Empty lines will be ignored.
                  </p>
                </div>
              </form>
            )}
          </div>
        )}
        {editingCategory && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium mb-3">Edit Category</h3>
            <form onSubmit={handleUpdateCategory}>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter category name (e.g., Ganesha, Home Decor)"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={cancelCategoryEdit}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        <div className="divide-y divide-gray-200">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No categories found. Add your first category to get started.
            </div>
          ) : (
            categories.map((category) => (
              <div key={category._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {category.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      ({category.subCategories.length} subcategories)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditCategory(category)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========== SUBCATEGORY SECTION ========== */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Subcategories</h2>
          <button
            onClick={() => {
              cancelSubCategoryEdit();
              setShowAddSubCategoryForm(!showAddSubCategoryForm);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            {showAddSubCategoryForm ? "Cancel" : "+ Add Subcategory"}
          </button>
        </div>

        {/* Add/Edit Subcategory Form */}
        {(showAddSubCategoryForm || editingSubCategory) && !editingSubCategory && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Add New Subcategory</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBulkSubCategoryMode(false)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    !bulkSubCategoryMode
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => setBulkSubCategoryMode(true)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    bulkSubCategoryMode
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Bulk
                </button>
              </div>
            </div>
            {!bulkSubCategoryMode ? (
              <form onSubmit={handleAddSubCategory}>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Category *
                    </label>
                    <select
                      value={selectedCategoryForSub}
                      onChange={(e) => setSelectedCategoryForSub(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">Choose a category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={subCategoryName}
                      onChange={(e) => setSubCategoryName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter subcategory name (e.g., 1X1, 2X2, Small, Large)"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleBulkAddSubCategories}>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Category *
                    </label>
                    <select
                      value={selectedCategoryForSub}
                      onChange={(e) => setSelectedCategoryForSub(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">Choose a category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={bulkSubCategoryInput}
                    onChange={(e) => setBulkSubCategoryInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter multiple subcategories, one per line or separated by commas&#10;Example:&#10;1X1&#10;2X2&#10;Small&#10;Large"
                    rows={6}
                    required
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add All
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBulkSubCategoryInput("");
                        setBulkSubCategoryMode(false);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Enter one subcategory per line or separate by commas. Empty lines will be ignored.
                  </p>
                </div>
              </form>
            )}
          </div>
        )}
        {editingSubCategory && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium mb-3">Edit Subcategory</h3>
            <form onSubmit={handleUpdateSubCategory}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Category *
                  </label>
                  <select
                    value={selectedCategoryForSub}
                    onChange={(e) => setSelectedCategoryForSub(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Choose a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={subCategoryName}
                    onChange={(e) => setSubCategoryName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter subcategory name (e.g., 1X1, 2X2, Small, Large)"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={cancelSubCategoryEdit}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Subcategories List */}
        <div className="divide-y divide-gray-200">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No categories found. Add categories first to add subcategories.
            </div>
          ) : categories.every(cat => cat.subCategories.length === 0) ? (
            <div className="p-8 text-center text-gray-500">
              No subcategories found. Add your first subcategory to get started.
            </div>
          ) : (
            categories.map((category) => {
              if (category.subCategories.length === 0) return null;
              return (
                <div key={category._id} className="p-6">
                  <div className="mb-3">
                    <h3 className="text-md font-semibold text-gray-700 mb-2">
                      {category.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {category.subCategories.map((sub, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {sub}
                          <button
                            onClick={() => startEditSubCategory(category._id, sub)}
                            className="text-green-600 hover:text-green-800 font-medium"
                            title="Edit subcategory"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleRemoveSubCategory(category._id, sub)}
                            className="text-red-600 hover:text-red-800"
                            title="Remove subcategory"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
