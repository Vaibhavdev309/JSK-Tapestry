import React, { useContext, useEffect, useState } from "react";
import CartTotal from "../components/CartTotal";
import Title from "../components/Title";
import { RazorpayLogo } from "../utils/icons.jsx";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

// Load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const [priceRequest, setPriceRequest] = useState(null);
  const { priceRequestId } = useParams();
  const { navigate, token, backendUrl } = useContext(ShopContext);

  // Saved addresses from profile
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [saveNewAddress, setSaveNewAddress] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  // Fetch user profile and saved addresses
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) return;
      
      try {
        console.log("🔵 [PLACE ORDER] Fetching user profile");
        const response = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: { token },
        });

        if (response.data.success) {
          const user = response.data.user;
          const email = user.email || "";
          const addresses = user.addresses || [];
          
          console.log("📦 User profile loaded:", {
            email,
            addressesCount: addresses.length,
          });

          setUserEmail(email);
          setSavedAddresses(addresses);
          
          // Auto-select default address if available
          const defaultAddress = addresses.find(addr => addr.isDefault);
          if (defaultAddress) {
            console.log("✅ Default address found, auto-selecting");
            // Use setTimeout to ensure state is set before calling handleSelectAddress
            setTimeout(() => {
              handleSelectAddress(defaultAddress._id);
            }, 100);
          } else if (addresses.length > 0) {
            // If no default, select first address
            console.log("✅ No default address, selecting first address");
            setTimeout(() => {
              handleSelectAddress(addresses[0]._id);
            }, 100);
          } else {
            // No saved addresses, use manual form
            console.log("⚠️ No saved addresses, using manual form");
            setUseSavedAddress(false);
            // Pre-fill email if available
            if (email) {
              setFormData(prev => ({ ...prev, email }));
            }
          }
        }
      } catch (error) {
        console.error("❌ Error fetching user profile:", error);
        // Continue with manual form if profile fetch fails
        setUseSavedAddress(false);
      }
    };

    if (token) fetchUserProfile();
  }, [token, backendUrl]);

  // Fetch price request
  useEffect(() => {
    const fetchPriceRequest = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/price-requests/user/${priceRequestId}`,
          { headers: { token } }
        );

        if (response.data.success) {
          if (response.data.priceRequest.status !== "approved") {
            toast.error("This price request is not approved");
            navigate("/cart");
          }
          setPriceRequest(response.data.priceRequest);
        }
      } catch (error) {
        toast.error("Error fetching price request");
        navigate("/cart");
      }
    };

    if (priceRequestId) fetchPriceRequest();
  }, [priceRequestId, token, backendUrl, navigate]);

  // Handle address selection
  const handleSelectAddress = (addressId) => {
    console.log("🔵 [PLACE ORDER] Selecting address:", addressId);
    const address = savedAddresses.find(addr => addr._id === addressId);
    if (!address) {
      console.error("❌ Address not found:", addressId);
      return;
    }

    console.log("📦 Selected address:", address);
    console.log("📦 User email:", userEmail);

    setSelectedAddressId(addressId);
    setUseSavedAddress(true);

    // Split fullName into firstName and lastName
    const nameParts = address.fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Ensure email is set - use userEmail from profile, or keep existing email
    const emailToUse = userEmail || formData.email || "";

    // Map address fields to form data
    const newFormData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: emailToUse.trim(),
      street: (address.address || "").trim(),
      city: (address.city || "").trim(),
      state: (address.state || "").trim(),
      zipcode: (address.pincode || "").trim(),
      country: (address.country || "India").trim(),
      phone: (address.phone || "").trim(),
    };

    console.log("📦 New form data:", newFormData);

    // Validate that all required fields are present
    const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'zipcode', 'country', 'phone'];
    const missing = requiredFields.filter(field => !newFormData[field]);
    
    if (missing.length > 0) {
      console.error("❌ Missing fields in address:", missing);
      toast.error(`Address is missing required fields: ${missing.join(", ")}`);
      return;
    }

    setFormData(newFormData);
    console.log("✅ Address selected and form filled successfully");
  };

  // Handle switching to manual form
  const handleUseManualForm = () => {
    setUseSavedAddress(false);
    setSelectedAddressId(null);
    // Keep current form data or clear it
  };

  // Handle Razorpay payment
  const handleRazorpayPayment = async () => {
    try {
      console.log("🔵 [RAZORPAY] Initiating payment");
      
      if (!priceRequest) {
        toast.error("Price request not found");
        return;
      }

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway");
        return;
      }

      // Create Razorpay order on backend
      console.log("📤 Creating Razorpay order on backend");
      const orderResponse = await axios.post(
        `${backendUrl}/api/payment/razorpay/create-order`,
        {
          amount: priceRequest.totalAmount,
          currency: "INR",
        },
        { headers: { token } }
      );

      console.log("📥 Order response:", orderResponse.data);

      if (!orderResponse.data.success) {
        console.error("❌ Order creation failed:", orderResponse.data);
        toast.error(orderResponse.data.message || "Failed to create payment order");
        return;
      }

      // Extract order data from response
      const razorpayOrderData = orderResponse.data?.order;
      if (!razorpayOrderData?.id) {
        console.error("❌ Invalid order data in response:", razorpayOrderData);
        toast.error("Invalid response from payment gateway");
        return;
      }

      const order = {
        id: razorpayOrderData.id,
        amount: razorpayOrderData.amount,
        currency: razorpayOrderData.currency,
      };
      const key = razorpayOrderData.key;

      console.log("✅ Razorpay order created:", order.id);
      console.log("🔑 Razorpay key:", key ? "Present" : "Missing");

      // Prepare order data for verification
      const orderData = {
        address: formData,
        items: priceRequest.items.map((item) => ({
          productId: item.productId._id,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        })),
        amount: priceRequest.totalAmount,
        priceRequest: priceRequestId,
      };

      // Validate required data
      if (!key) {
        console.error("❌ Razorpay key is missing");
        toast.error("Payment gateway configuration error");
        return;
      }

      if (!order.id) {
        console.error("❌ Razorpay order ID is missing");
        toast.error("Failed to create payment order");
        return;
      }

      // Initialize Razorpay checkout
      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: "Tapestry",
        description: `Order for ${priceRequest.items.length} item(s)`,
        order_id: order.id,
        handler: async function (response) {
          console.log("🔵 [RAZORPAY] Payment response received:", response);
          
          try {
            // Verify payment on backend
            console.log("📤 Verifying payment on backend");
            const verifyResponse = await axios.post(
              `${backendUrl}/api/payment/razorpay/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                ...orderData,
              },
              { headers: { token } }
            );

            if (verifyResponse.data.success) {
              console.log("✅ Payment verified and order created");
              toast.success("Payment successful! Order placed.");
              navigate("/orders");
            } else {
              console.error("❌ Payment verification failed:", verifyResponse.data.message);
              toast.error(verifyResponse.data.message || "Payment verification failed");
            }
          } catch (error) {
            console.error("❌ [RAZORPAY] Error verifying payment:", error);
            toast.error(error.response?.data?.message || "Payment verification failed");
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#D97706", // Amber color matching your theme
        },
        modal: {
          ondismiss: function () {
            console.log("⚠️ Payment cancelled by user");
            toast.info("Payment cancelled");
          },
        },
      };

      console.log("🚀 Opening Razorpay checkout");
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("❌ [RAZORPAY] Error:", error);
      toast.error(error.response?.data?.message || "Payment initialization failed");
    }
  };

  // Save new address if checkbox is checked
  const saveAddressIfNeeded = async () => {
    if (!saveNewAddress || useSavedAddress) return;

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const addressData = {
        fullName,
        phone: formData.phone,
        address: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.zipcode,
        country: formData.country || "India",
        isDefault: savedAddresses.length === 0, // Set as default if it's the first address
      };

      console.log("💾 Saving new address:", addressData);
      const response = await axios.post(
        `${backendUrl}/api/user/address`,
        addressData,
        { headers: { token } }
      );

      if (response.data.success) {
        console.log("✅ Address saved successfully");
        // Refresh addresses list
        const profileResponse = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: { token },
        });
        if (profileResponse.data.success) {
          setSavedAddresses(profileResponse.data.user.addresses || []);
        }
      }
    } catch (error) {
      console.error("❌ Error saving address:", error);
      // Don't block order placement if address save fails
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    console.log("🔵 [PLACE ORDER] Form submission started");
    console.log("📦 Form data:", formData);
    console.log("📦 Using saved address:", useSavedAddress);
    console.log("📦 Selected address ID:", selectedAddressId);
    
    // Validate form - check all required fields
    const missingFields = [];
    if (!formData.firstName?.trim()) missingFields.push("First Name");
    if (!formData.lastName?.trim()) missingFields.push("Last Name");
    if (!formData.email?.trim()) missingFields.push("Email");
    if (!formData.street?.trim()) missingFields.push("Street Address");
    if (!formData.city?.trim()) missingFields.push("City");
    if (!formData.state?.trim()) missingFields.push("State");
    if (!formData.zipcode?.trim()) missingFields.push("Zipcode");
    if (!formData.country?.trim()) missingFields.push("Country");
    if (!formData.phone?.trim()) missingFields.push("Phone");

    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields);
      toast.error(`Please fill all required fields: ${missingFields.join(", ")}`);
      return;
    }

    try {
      if (!priceRequest) {
        toast.error("Price request not found");
        return;
      }

      // Save address if user checked the option
      if (saveNewAddress && !useSavedAddress) {
        await saveAddressIfNeeded();
      }

      // Handle different payment methods
      if (method === "razorpay") {
        console.log("💳 Processing Razorpay payment");
        await handleRazorpayPayment();
        return;
      }

      // For COD, use existing flow
      if (method === "cod") {
        console.log("💵 Processing COD order");
        const orderData = {
          address: formData,
          items: priceRequest.items.map((item) => ({
            productId: item.productId._id,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
          })),
          amount: priceRequest.totalAmount,
          priceRequest: priceRequestId,
          paymentMethod: "COD",
        };

        const response = await axios.post(
          `${backendUrl}/api/order/placeorder`,
          orderData,
          { headers: { token } }
        );

        if (response.data.success) {
          toast.success(response.data.message);
          navigate("/orders");
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error("❌ [PLACE ORDER] Error:", error);
      toast.error(error.response?.data?.message || "Order placement failed");
    }
  };

  const onChangeHandler = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!priceRequest) return (
    <main className="min-h-[60vh] flex items-center justify-center">
      <p className="text-stone-500">Loading…</p>
    </main>
  );

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-10 md:pt-14 pb-10 sm:pb-12 min-w-0">
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col sm:flex-row justify-between gap-8 sm:gap-12 border-t border-stone-200 pt-8"
      >
        <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
          <div className="text-xl sm:text-2xl my-3">
            <Title text1={"Delivery"} text2={"Information"} />
          </div>

          {/* Saved Addresses Section */}
          {savedAddresses.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-stone-700">
                  Select Saved Address
                </label>
                {useSavedAddress && (
                  <button
                    type="button"
                    onClick={handleUseManualForm}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Use Different Address
                  </button>
                )}
              </div>
              
              {!useSavedAddress && (
                <button
                  type="button"
                  onClick={() => {
                    const defaultAddr = savedAddresses.find(addr => addr.isDefault) || savedAddresses[0];
                    if (defaultAddr) handleSelectAddress(defaultAddr._id);
                  }}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium mb-3"
                >
                  ← Use Saved Address
                </button>
              )}

              {useSavedAddress && (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {savedAddresses.map((address) => (
                    <button
                      key={address._id}
                      type="button"
                      onClick={() => handleSelectAddress(address._id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectAddress(address._id);
                        }
                      }}
                      className={`w-full p-4 rounded-lg border-2 cursor-pointer transition-all text-left ${
                        selectedAddressId === address._id
                          ? "border-amber-500 bg-amber-50/80"
                          : "border-stone-200 hover:border-stone-300 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-stone-800">
                              {address.fullName}
                            </span>
                            {address.isDefault && (
                              <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-medium rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-stone-600 mb-1">
                            {address.phone}
                          </p>
                          <p className="text-sm text-stone-600 mb-1">
                            {address.address}
                          </p>
                          <p className="text-sm text-stone-600">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="text-sm text-stone-600">
                            {address.country}
                          </p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 ${
                            selectedAddressId === address._id
                              ? "border-amber-500 bg-amber-500"
                              : "border-stone-300 bg-transparent"
                          }`}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Manual Address Form */}
          {(!useSavedAddress || savedAddresses.length === 0) && (
            <>
              {savedAddresses.length === 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    No saved addresses. <button
                      type="button"
                      onClick={() => navigate("/profile?tab=addresses")}
                      className="text-amber-600 hover:text-amber-700 font-medium underline"
                    >
                      Add address in profile
                    </button> to save time on future orders.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              className="input-tapestry"
              value={formData.firstName}
              onChange={onChangeHandler}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              className="input-tapestry"
              value={formData.lastName}
              onChange={onChangeHandler}
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="input-tapestry"
            value={formData.email}
            onChange={onChangeHandler}
            required
          />

          <input
            type="text"
            name="street"
            placeholder="Street Address"
            className="input-tapestry"
            value={formData.street}
            onChange={onChangeHandler}
            required
          />

          <div className="flex gap-3">
            <input
              type="text"
              name="city"
              placeholder="City"
              className="input-tapestry"
              value={formData.city}
              onChange={onChangeHandler}
              required
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              className="input-tapestry"
              value={formData.state}
              onChange={onChangeHandler}
              required
            />
          </div>

          <div className="flex gap-3">
            <input
              type="number"
              name="zipcode"
              placeholder="Zipcode"
              className="input-tapestry"
              value={formData.zipcode}
              onChange={onChangeHandler}
              required
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              className="input-tapestry"
              value={formData.country}
              onChange={onChangeHandler}
              required
            />
          </div>

          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            className="input-tapestry"
            value={formData.phone}
            onChange={onChangeHandler}
            required
          />

          {/* Save address option (only if not using saved address) */}
          {!useSavedAddress && (
            <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg border border-stone-200">
              <input
                type="checkbox"
                id="saveAddress"
                checked={saveNewAddress}
                onChange={(e) => setSaveNewAddress(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-stone-300"
              />
              <label htmlFor="saveAddress" className="text-sm text-stone-700 cursor-pointer">
                Save this address for future orders
              </label>
            </div>
          )}
            </>
          )}
        </div>

        <div className="mt-0 sm:mt-8 flex-shrink-0 w-full sm:w-auto sm:min-w-[18rem]">
          <div className="w-full card-tapestry p-4 sm:p-6">
            <CartTotal
              total={priceRequest.totalAmount}
              items={priceRequest.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              }))}
            />
          </div>

          <div className="mt-6 sm:mt-8 card-tapestry p-4 sm:p-6">
            <Title text1={"Payment"} text2={"Method"} />

            <div className="flex flex-col sm:flex-row lg:flex-row gap-3 mt-4">
              <button
                type="button"
                onClick={() => setMethod("razorpay")}
                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all text-left border-2 ${
                  method === "razorpay"
                    ? "border-amber-500 bg-amber-50/80"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${
                    method === "razorpay"
                      ? "border-amber-500 bg-amber-500"
                      : "border-stone-300 bg-transparent"
                  }`}
                />
                <RazorpayLogo className="h-5" />
              </button>

              <button
                type="button"
                onClick={() => setMethod("cod")}
                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all text-left border-2 ${
                  method === "cod"
                    ? "border-amber-500 bg-amber-50/80"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${
                    method === "cod"
                      ? "border-amber-500 bg-amber-500"
                      : "border-stone-300 bg-transparent"
                  }`}
                />
                <span className="text-stone-700 font-medium">Cash on delivery</span>
              </button>
            </div>

            <div className="w-full text-end mt-8">
              <button type="submit" className="btn-primary px-12">
                Place order
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
};

export default PlaceOrder;
