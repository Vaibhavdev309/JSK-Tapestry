import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { BinIcon } from "../utils/icons.jsx";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";

const PLACEHOLDER_IMG = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect fill="#e7e5e4" width="160" height="160"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#a8a29e" font-size="14" font-family="system-ui">No image</text></svg>');

const ChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const Cart = () => {
  const {
    products,
    cartItems,
    navigate,
    currency,
    updateQuantity,
    token,
    backendUrl,
  } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const [priceRequests, setPriceRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);

  useEffect(() => {
    const tempData = [];
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          tempData.push({
            _id: items,
            size: item,
            quantity: cartItems[items][item],
          });
        }
      }
    }
    setCartData(tempData);
  }, [cartItems]);

  useEffect(() => {
    const fetchUserRequests = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/price-requests/user`,
          { headers: { token } }
        );
        if (response.data.success) {
          const filteredRequests = response.data.priceRequests.filter(
            (req) => req.status !== "completed"
          );
          setPriceRequests(filteredRequests);
        }
      } catch (error) {
        console.error("Error fetching price requests:", error);
      }
    };

    if (token) fetchUserRequests();
  }, [token, backendUrl]);

  const handleRequestToAdmin = async () => {
    const items = cartData.map((item) => ({
      productId: item._id,
      quantity: item.quantity,
      size: item.size,
    }));

    try {
      const response = await axios.post(
        `${backendUrl}/api/price-requests/create`,
        { items },
        { headers: { token } }
      );

      if (response.data.success) {
        setPriceRequests([response.data.priceRequest, ...priceRequests]);
        toast.success("Price request submitted to admin");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting request");
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this request?"
      );
      if (!confirmDelete) return;

      const response = await axios.delete(
        `${backendUrl}/api/price-requests/${requestId}`,
        { headers: { token } }
      );

      if (response.data.success) {
        setPriceRequests((prev) => prev.filter((req) => req._id !== requestId));
        if (activeRequest === requestId) setActiveRequest(null);
        toast.success("Request deleted successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting request");
    }
  };

  const handleResubmitRequest = async (requestId) => {
    try {
      const originalRequest = priceRequests.find(
        (req) => req._id === requestId
      );
      if (!originalRequest) return;

      const response = await axios.post(
        `${backendUrl}/api/price-requests/create`,
        { items: originalRequest.items },
        { headers: { token } }
      );

      if (response.data.success) {
        setPriceRequests([response.data.priceRequest, ...priceRequests]);
        toast.success("Request resubmitted successfully");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error resubmitting request"
      );
    }
  };

  return (
    <main className="max-w-4xl mx-auto pt-6 sm:pt-8 md:pt-14 px-4 sm:px-6 lg:px-8 min-w-0 pb-12">
      <div className="mb-6 sm:mb-10">
        <Title text1="Your" text2="Cart" />
        <p className="text-stone-500 mt-1.5 text-sm">
          {cartData.length === 0
            ? "Your cart is empty"
            : `${cartData.length} ${cartData.length === 1 ? "item" : "items"} in your cart`}
        </p>
      </div>

      {/* Price Requests — only when logged in */}
      {token && (
        <section className="mb-8 sm:mb-10">
          <h2 className="text-lg font-semibold text-stone-800 mb-3">Price requests</h2>
          {priceRequests.length === 0 ? (
            <div className="card-tapestry p-6 text-center">
              <p className="text-stone-500 text-sm">No price requests yet.</p>
              <p className="text-stone-400 text-sm mt-1">Add items and request a quote below.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {priceRequests.map((request) => (
                <div
                  key={request._id}
                  className="card-tapestry overflow-hidden"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      setActiveRequest(
                        activeRequest === request._id ? null : request._id
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveRequest(activeRequest === request._id ? null : request._id);
                      }
                    }}
                    className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 text-left hover:bg-stone-50/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:ring-inset"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-stone-900">
                        Request #{request._id.slice(-6).toUpperCase()} · {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                      <span
                        className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          request.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : request.status === "rejected"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {request.status === "rejected" && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleResubmitRequest(request._id); }}
                          className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Resubmit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteRequest(request._id); }}
                        className="p-2 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <span className="text-stone-400" aria-hidden>
                        {activeRequest === request._id ? <ChevronDown /> : <ChevronRight />}
                      </span>
                    </div>
                  </div>

                  {activeRequest === request._id && (
                    <div className="border-t border-stone-100 px-4 sm:px-5 py-4 bg-stone-50/50">
                      <div className="space-y-3">
                        {request.items.map((item) => (
                          <div
                            key={`${item.productId._id}-${item.size}`}
                            className="flex justify-between gap-4 text-sm"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-stone-800 truncate">{item.productId?.name || "Product"}</p>
                              <p className="text-stone-500">Size {item.size} · Qty {item.quantity}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              {request.status === "approved" ? (
                                <p className="font-medium text-stone-800">{currency}{(item.price * item.quantity).toFixed(2)}</p>
                              ) : request.status === "rejected" ? (
                                <p className="text-rose-600 text-xs max-w-[140px]">{item.rejectionReason || "Rejected"}</p>
                              ) : (
                                <p className="text-stone-500">Pending</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {request.status === "approved" && (
                        <div className="mt-4 pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <p className="font-semibold text-stone-900">Total: {currency}{request.totalAmount.toFixed(2)}</p>
                          <button
                            onClick={() => navigate(`/place-order/${request._id}`)}
                            className="btn-primary px-6 py-2.5 w-full sm:w-auto text-sm"
                          >
                            Proceed to checkout
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Current cart items or empty state */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-stone-800 mb-3">Cart items</h2>
        {cartData.length === 0 ? (
          <div className="card-tapestry p-8 sm:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-stone-800 mb-1">Your cart is empty</h3>
            <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">Add tapestries you love and we’ll prepare a custom quote for you.</p>
            <Link to="/collection" className="btn-primary inline-flex">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {cartData.map((item) => {
              const productData = products.find((p) => p._id === item._id);
              const imgSrc = productData?.image?.[0] || PLACEHOLDER_IMG;
              const name = productData?.name || "Tapestry";

              return (
                <div
                  key={`${item._id}-${item.size}`}
                  className="card-tapestry overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 p-4 sm:p-5">
                    <Link
                      to={`/collection/${item._id}`}
                      className="w-full sm:w-28 flex-shrink-0 aspect-square sm:aspect-auto sm:h-28 rounded-xl overflow-hidden bg-stone-100 block focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2"
                    >
                      <img
                        src={imgSrc}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
                      />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:justify-between gap-4">
                      <div>
                        <Link to={`/collection/${item._id}`} className="font-semibold text-stone-900 hover:text-amber-700 transition-colors line-clamp-2">
                          {name}
                        </Link>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2.5 py-1 bg-stone-100 text-stone-600 rounded-lg text-xs font-medium">Size {item.size}</span>
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">Price on request</span>
                        </div>
                        {productData?.material && (
                          <p className="text-stone-500 text-sm mt-1.5">{productData.material}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item._id, item.size, Math.max(1, item.quantity - 1))}
                            className="w-9 h-9 rounded-lg border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 hover:border-stone-300 transition-colors"
                          >
                            −
                          </button>
                          <input
                            value={item.quantity}
                            onChange={(e) => {
                              const v = Math.max(1, parseInt(e.target.value, 10) || 1);
                              updateQuantity(item._id, item.size, v);
                            }}
                            type="number"
                            min={1}
                            className="w-14 px-1 py-2 border border-stone-200 rounded-lg text-center text-sm focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                            className="w-9 h-9 rounded-lg border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 hover:border-stone-300 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item._id, item.size, 0)}
                          className="p-2 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Remove"
                        >
                          <BinIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Request price CTA */}
      {cartData.length > 0 && (
        <section className="rounded-2xl p-5 sm:p-6 bg-stone-900 border border-stone-800 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-white font-semibold">Get a custom quote</h3>
              <p className="text-stone-400 text-sm mt-1">We’ll review your cart and send you a personalised price.</p>
            </div>
            <button
              type="button"
              onClick={handleRequestToAdmin}
              className="btn-primary bg-white text-stone-900 hover:bg-stone-100 flex-shrink-0 w-full sm:w-auto"
            >
              Request price approval
            </button>
          </div>
        </section>
      )}
    </main>
  );
};

export default Cart;
