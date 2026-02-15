import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";

const Profile = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  // User data
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Address management
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
  });

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Price requests
  const [priceRequests, setPriceRequests] = useState([]);
  const [priceRequestsLoading, setPriceRequestsLoading] = useState(false);

  // Fetch user profile
  const fetchProfile = async () => {
    console.log("🔵 [FRONTEND] Fetching profile started");
    console.log("📦 Token present:", token ? "Yes" : "No");
    console.log("📦 Backend URL:", backendUrl);
    
    if (!token) {
      console.error("❌ No token found, redirecting to login");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const url = `${backendUrl}/api/user/profile`;
      console.log("🌐 Making GET request to:", url);
      console.log("📤 Headers:", { token: token ? "Present" : "Missing" });
      
      const response = await axios.get(url, {
        headers: { token },
      });

      console.log("📥 Response received:", {
        status: response.status,
        success: response.data.success,
        hasUser: !!response.data.user,
      });

      if (response.data.success) {
        const userData = response.data.user;
        console.log("✅ Profile loaded successfully");
        console.log("👤 User data:", {
          name: userData.name,
          email: userData.email,
          phone: userData.phone || "Not set",
          addressesCount: userData.addresses?.length || 0,
        });
        
        setUser(userData);
        setName(userData.name || "");
        setEmail(userData.email || "");
        setPhone(userData.phone || "");
        setAddresses(userData.addresses || []);
      } else {
        console.error("❌ Backend returned success: false");
        console.error("📦 Response data:", response.data);
        toast.error(response.data.message || "Failed to load profile");
      }
    } catch (error) {
      console.error("❌ [FRONTEND] Error fetching profile:");
      console.error("Error object:", error);
      console.error("Response status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      console.error("Error message:", error.message);
      console.error("Request URL:", error.config?.url);
      
      toast.error(error.response?.data?.message || "Failed to load profile");
      if (error.response?.status === 401) {
        console.error("❌ Unauthorized, redirecting to login");
        navigate("/login");
      }
    } finally {
      setLoading(false);
      console.log("🏁 Profile fetch completed");
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    if (!token) {
      console.log("⚠️ No token for fetching orders");
      return;
    }
    try {
      console.log("🔵 [FRONTEND] Fetching orders");
      setOrdersLoading(true);
      const response = await axios.get(`${backendUrl}/api/order/userorders`, {
        headers: { token },
      });
      console.log("📥 Orders response:", {
        success: response.data.success,
        ordersCount: response.data.orders?.length || 0,
      });
      if (response.data.success) {
        setOrders(response.data.orders.slice(0, 5)); // Show only recent 5
        console.log("✅ Orders loaded:", response.data.orders.slice(0, 5).length);
      }
    } catch (error) {
      console.error("❌ [FRONTEND] Error fetching orders:", error);
      console.error("Response:", error.response?.data);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch price requests
  const fetchPriceRequests = async () => {
    if (!token) {
      console.log("⚠️ No token for fetching price requests");
      return;
    }
    try {
      console.log("🔵 [FRONTEND] Fetching price requests");
      setPriceRequestsLoading(true);
      const response = await axios.get(`${backendUrl}/api/price-requests/user`, {
        headers: { token },
      });
      console.log("📥 Price requests response:", {
        success: response.data.success,
        requestsCount: response.data.priceRequests?.length || 0,
      });
      if (response.data.success) {
        setPriceRequests(response.data.priceRequests || []);
        console.log("✅ Price requests loaded:", response.data.priceRequests?.length || 0);
      }
    } catch (error) {
      console.error("❌ [FRONTEND] Error fetching price requests:", error);
      console.error("Response:", error.response?.data);
    } finally {
      setPriceRequestsLoading(false);
    }
  };

  useEffect(() => {
    console.log("🔄 [FRONTEND] Profile useEffect triggered");
    console.log("📦 Token:", token ? "Present" : "Missing");
    console.log("📦 Active tab:", activeTab);
    
    if (token) {
      fetchProfile();
      if (activeTab === "orders") {
        console.log("📋 Fetching orders for orders tab");
        fetchOrders();
      }
      if (activeTab === "requests") {
        console.log("📋 Fetching price requests for requests tab");
        fetchPriceRequests();
      }
    } else {
      console.error("❌ No token, redirecting to login");
      navigate("/login");
    }
  }, [token, activeTab]);

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    console.log("🔵 [FRONTEND] Update profile started");
    
    if (!name.trim() || !email.trim()) {
      console.error("❌ Name or email missing");
      toast.error("Name and email are required");
      return;
    }

    try {
      const payload = { name: name.trim(), email: email.trim(), phone: phone.trim() };
      console.log("📤 Sending PUT request to:", `${backendUrl}/api/user/profile`);
      console.log("📦 Payload:", payload);
      
      const response = await axios.put(
        `${backendUrl}/api/user/profile`,
        payload,
        { headers: { token } }
      );

      console.log("📥 Response received:", {
        status: response.status,
        success: response.data.success,
      });

      if (response.data.success) {
        console.log("✅ Profile updated successfully");
        toast.success("Profile updated successfully");
        setUser(response.data.user);
      } else {
        console.error("❌ Update failed:", response.data.message);
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("❌ [FRONTEND] Error updating profile:");
      console.error("Error:", error);
      console.error("Response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    console.log("🔵 [FRONTEND] Change password started");
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      console.error("❌ Missing password fields");
      toast.error("All password fields are required");
      return;
    }
    if (newPassword.length < 8) {
      console.error("❌ Password too short");
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      console.error("❌ Passwords don't match");
      toast.error("New passwords do not match");
      return;
    }

    try {
      setChangingPassword(true);
      console.log("📤 Sending POST request to:", `${backendUrl}/api/user/change-password`);
      
      const response = await axios.post(
        `${backendUrl}/api/user/change-password`,
        { currentPassword, newPassword },
        { headers: { token } }
      );

      console.log("📥 Response received:", {
        status: response.status,
        success: response.data.success,
      });

      if (response.data.success) {
        console.log("✅ Password changed successfully");
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        console.error("❌ Password change failed:", response.data.message);
        toast.error(response.data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("❌ [FRONTEND] Error changing password:", error);
      console.error("Response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  // Address management
  const handleAddAddress = async (e) => {
    e.preventDefault();
    console.log("🔵 [FRONTEND] Add address started");
    console.log("📦 Address form data:", addressForm);
    
    if (!addressForm.fullName || !addressForm.phone || !addressForm.address || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      console.error("❌ Missing required address fields");
      toast.error("All address fields are required");
      return;
    }

    try {
      console.log("📤 Sending POST request to:", `${backendUrl}/api/user/address`);
      const response = await axios.post(
        `${backendUrl}/api/user/address`,
        addressForm,
        { headers: { token } }
      );

      console.log("📥 Response received:", {
        status: response.status,
        success: response.data.success,
      });

      if (response.data.success) {
        console.log("✅ Address added successfully");
        toast.success("Address added successfully");
        setShowAddressForm(false);
        setAddressForm({
          fullName: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          country: "India",
          isDefault: false,
        });
        fetchProfile();
      } else {
        console.error("❌ Add address failed:", response.data.message);
        toast.error(response.data.message || "Failed to add address");
      }
    } catch (error) {
      console.error("❌ [FRONTEND] Error adding address:", error);
      console.error("Response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to add address");
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    console.log("🔵 [FRONTEND] Update address started");
    console.log("📦 Editing address ID:", editingAddress?._id);
    
    if (!editingAddress) {
      console.error("❌ No address being edited");
      return;
    }

    try {
      const payload = { addressId: editingAddress._id, ...addressForm };
      console.log("📤 Sending PUT request to:", `${backendUrl}/api/user/address`);
      console.log("📦 Payload:", payload);
      
      const response = await axios.put(
        `${backendUrl}/api/user/address`,
        payload,
        { headers: { token } }
      );

      console.log("📥 Response received:", {
        status: response.status,
        success: response.data.success,
      });

      if (response.data.success) {
        console.log("✅ Address updated successfully");
        toast.success("Address updated successfully");
        setEditingAddress(null);
        setShowAddressForm(false);
        setAddressForm({
          fullName: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          country: "India",
          isDefault: false,
        });
        fetchProfile();
      } else {
        console.error("❌ Update address failed:", response.data.message);
        toast.error(response.data.message || "Failed to update address");
      }
    } catch (error) {
      console.error("❌ [FRONTEND] Error updating address:", error);
      console.error("Response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to update address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    console.log("🔵 [FRONTEND] Delete address initiated");
    console.log("📦 Address ID to delete:", addressId);
    
    if (!window.confirm("Are you sure you want to delete this address?")) {
      console.log("❌ User cancelled deletion");
      return;
    }

    try {
      console.log("📤 Sending POST request to:", `${backendUrl}/api/user/address/delete`);
      const response = await axios.post(
        `${backendUrl}/api/user/address/delete`,
        { addressId },
        { headers: { token } }
      );

      console.log("📥 Response received:", {
        status: response.status,
        success: response.data.success,
      });

      if (response.data.success) {
        console.log("✅ Address deleted successfully");
        toast.success("Address deleted successfully");
        fetchProfile();
      } else {
        console.error("❌ Delete address failed:", response.data.message);
        toast.error(response.data.message || "Failed to delete address");
      }
    } catch (error) {
      console.error("❌ [FRONTEND] Error deleting address:", error);
      console.error("Response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    console.log("🔵 [FRONTEND] Set default address started");
    console.log("📦 Address ID:", addressId);
    
    try {
      console.log("📤 Sending POST request to:", `${backendUrl}/api/user/address/default`);
      const response = await axios.post(
        `${backendUrl}/api/user/address/default`,
        { addressId },
        { headers: { token } }
      );

      console.log("📥 Response received:", {
        status: response.status,
        success: response.data.success,
      });

      if (response.data.success) {
        console.log("✅ Default address updated");
        toast.success("Default address updated");
        fetchProfile();
      } else {
        console.error("❌ Set default address failed:", response.data.message);
        toast.error(response.data.message || "Failed to update default address");
      }
    } catch (error) {
      console.error("❌ [FRONTEND] Error setting default address:", error);
      console.error("Response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to update default address");
    }
  };

  const startEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country || "India",
      isDefault: address.isDefault,
    });
    setShowAddressForm(true);
  };

  const cancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      isDefault: false,
    });
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-w-0">
        <Title text1="My" text2="Profile" />
        <div className="text-center py-12">
          <p className="text-stone-500">Loading profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-w-0">
      <Title text1="My" text2="Profile" />

      {/* Tabs */}
      <div className="mb-8 border-b border-stone-200">
        <div className="flex flex-wrap gap-2 sm:gap-4">
          {[
            { id: "profile", label: "Personal Info" },
            { id: "password", label: "Change Password" },
            { id: "addresses", label: "Addresses" },
            { id: "orders", label: "Order History" },
            { id: "requests", label: "Price Requests" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Personal Information Tab */}
      {activeTab === "profile" && (
        <div className="card-tapestry p-6">
          <h2 className="text-xl font-semibold text-stone-800 mb-6">Personal Information</h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 1234567890"
                className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === "password" && (
        <div className="card-tapestry p-6">
          <h2 className="text-xl font-semibold text-stone-800 mb-6">Change Password</h2>
          {user?.googleId ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">
                This account uses Google sign-in. Password cannot be changed.
              </p>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded p-1 transition-colors"
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.97 9.97 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded p-1 transition-colors"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.97 9.97 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-stone-500 mt-1">Must be at least 8 characters long</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded p-1 transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.97 9.97 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === "addresses" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-stone-800">Saved Addresses</h2>
            <button
              onClick={() => {
                if (showAddressForm) {
                  cancelAddressForm();
                } else {
                  setShowAddressForm(true);
                  setEditingAddress(null);
                }
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {showAddressForm ? "Cancel" : "+ Add Address"}
            </button>
          </div>

          {/* Address Form */}
          {showAddressForm && (
            <div className="card-tapestry p-6">
              <h3 className="text-lg font-semibold text-stone-800 mb-4">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h3>
              <form onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={addressForm.address}
                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none resize-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Country</label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-stone-300"
                  />
                  <label htmlFor="isDefault" className="text-sm text-stone-700">
                    Set as default address
                  </label>
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {editingAddress ? "Update Address" : "Add Address"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelAddressForm}
                    className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Address List */}
          {addresses.length === 0 ? (
            <div className="card-tapestry p-8 text-center">
              <p className="text-stone-500">No addresses saved. Add your first address above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className={`card-tapestry p-5 relative ${
                    address.isDefault ? "border-2 border-amber-500" : ""
                  }`}
                >
                  {address.isDefault && (
                    <span className="absolute top-3 right-3 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded">
                      Default
                    </span>
                  )}
                  <div className="pr-20">
                    <h3 className="font-semibold text-stone-800 mb-2">{address.fullName}</h3>
                    <p className="text-sm text-stone-600 mb-1">{address.phone}</p>
                    <p className="text-sm text-stone-600 mb-1">{address.address}</p>
                    <p className="text-sm text-stone-600">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    <p className="text-sm text-stone-600">{address.country}</p>
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefaultAddress(address._id)}
                        className="px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => startEditAddress(address)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address._id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-stone-800">Order History</h2>
            <Link
              to="/orders"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              View All Orders →
            </Link>
          </div>

          {ordersLoading ? (
            <div className="text-center py-8">
              <p className="text-stone-500">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="card-tapestry p-8 text-center">
              <p className="text-stone-500 mb-4">No orders found</p>
              <Link
                to="/collection"
                className="inline-block px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="card-tapestry p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-stone-900">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-stone-500">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-stone-900">
                        {currency}
                        {order.amount.toFixed(2)}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded mt-1 ${
                        order.status === "delivered" ? "bg-green-100 text-green-800" :
                        order.status === "shipped" ? "bg-blue-100 text-blue-800" :
                        order.status === "processing" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-stone-600">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {order.paymentMethod}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Requests Tab */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-stone-800">Price Requests</h2>

          {priceRequestsLoading ? (
            <div className="text-center py-8">
              <p className="text-stone-500">Loading price requests...</p>
            </div>
          ) : priceRequests.length === 0 ? (
            <div className="card-tapestry p-8 text-center">
              <p className="text-stone-500 mb-4">No price requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {priceRequests.map((request) => (
                <div key={request._id} className="card-tapestry p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-stone-900">
                        Request #{request._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-stone-500">
                        {new Date(request.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded ${
                      request.status === "approved" ? "bg-green-100 text-green-800" :
                      request.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="text-sm text-stone-600">
                    {request.items?.length || 0} item{request.items?.length !== 1 ? "s" : ""}
                  </div>
                  {request.status === "approved" && (
                    <Link
                      to={`/place-order/${request._id}`}
                      className="inline-block mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Place Order
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default Profile;
