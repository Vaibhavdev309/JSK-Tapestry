import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { UPLOAD_AREA_DATA_URI } from "../utils/icons";
import { useAdminContext } from "../Context/AdminContext";

const Request = ({ token }) => {
  const { refreshCounts } = useAdminContext();
  const [priceRequests, setPriceRequests] = useState([]);
  const [prices, setPrices] = useState({});
  const hasMarkedAsViewed = useRef(false);

  useEffect(() => {
    fetchPriceRequests();
  }, [token]);

  // Mark price requests as viewed when page loads (only once per mount)
  useEffect(() => {
    if (!token || hasMarkedAsViewed.current) return;
    
    const markAsViewed = async () => {
      try {
        hasMarkedAsViewed.current = true;
        await axios.post(
          `${backendUrl}/api/admin/mark-requests-viewed`,
          {},
          { headers: { token } }
        );
        // Refresh counts after marking as viewed
        if (refreshCounts) {
          refreshCounts();
        }
      } catch (error) {
        console.error("Error marking price requests as viewed:", error);
        hasMarkedAsViewed.current = false; // Reset on error so we can retry
      }
    };
    
    markAsViewed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only depend on token, not refreshCounts

  const fetchPriceRequests = async () => {
    try {
      console.log("i am heddre");
      const response = await axios.get(
        `${backendUrl}/api/price-requests/admin`,
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        setPriceRequests(response.data.priceRequests);
      }
    } catch (error) {
      console.log(error.message);
      console.error("Error fetching price requests:", error);
    }
  };

  const handlePriceChange = (requestId, productId, price) => {
    setPrices((prev) => ({
      ...prev,
      [`${requestId}-${productId}`]: parseFloat(price) || 0,
    }));
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      const requestPrices = Object.entries(prices)
        .filter(([key]) => key.startsWith(requestId))
        .reduce((acc, [key, value]) => {
          const productId = key.split("-")[1];
          acc[productId] = value;
          return acc;
        }, {});

      const response = await axios.post(
        `${backendUrl}/api/price-requests/${action}/${requestId}`,
        { prices: requestPrices },
        { headers: { token } }
      );

      if (response.data.success) {
        fetchPriceRequests();
        // Refresh counts when price request status changes (from pending to approved/rejected)
        if (refreshCounts) {
          refreshCounts();
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing price request:`, error);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Price Requests</h2>
        <p className="text-sm text-gray-500 mt-1">Review and approve price requests from customers</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {priceRequests.map((request) => (
          <div key={request._id} className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 break-words">
                    Request from {request.userId?.name || "Unknown User"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Created: {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="px-2 sm:px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full self-start sm:self-auto">
                  Pending
                </span>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {(request.items || [])
                .filter((item) => item?.productId != null)
                .map((item) => {
                  const product = item.productId;
                  const img = product?.image;
                  const productImage =
                    img && Array.isArray(img) && img.length > 0
                      ? img[0]
                      : (typeof img === "string" ? img : UPLOAD_AREA_DATA_URI);

                  return (
                    <div
                      key={product._id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex-shrink-0 self-center sm:self-auto">
                        <img
                          src={productImage}
                          alt={product?.name || "Product"}
                          className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = UPLOAD_AREA_DATA_URI;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <h4 className="font-medium text-sm sm:text-base text-gray-800 break-words">{product?.name || "Unnamed Product"}</h4>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          Quantity: <span className="font-medium">{item.quantity}</span>
                        </p>
                        {product?.price != null && product?.price !== "" && (
                          <p className="text-xs text-gray-400 mt-1">
                            Current: ${product.price}
                          </p>
                        )}
                      </div>
                      <div className="w-full sm:w-32 flex-shrink-0">
                        <label className="block text-xs text-gray-600 mb-1">Set Price</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={
                            prices[`${request._id}-${product._id}`] || ""
                          }
                          onChange={(e) =>
                            handlePriceChange(
                              request._id,
                              product._id,
                              e.target.value
                            )
                          }
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-sm"
                        />
                      </div>
                    </div>
                  );
                })}

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 sm:space-x-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to reject this price request?")) {
                      handleRequestAction(request._id, "reject");
                    }
                  }}
                  className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors font-medium text-sm sm:text-base"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    const hasPrices = (request.items || []).some(
                      (item) => item?.productId && prices[`${request._id}-${item.productId._id}`]
                    );
                    if (!hasPrices) {
                      alert("Please set prices for at least one product before approving.");
                      return;
                    }
                    if (window.confirm("Approve this price request with the set prices?")) {
                      handleRequestAction(request._id, "approve");
                    }
                  }}
                  className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm text-sm sm:text-base"
                >
                  Approve with Prices
                </button>
              </div>
            </div>
          </div>
        ))}

        {priceRequests.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No pending price requests
          </p>
        )}
      </div>
    </div>
  );
};

export default Request;
