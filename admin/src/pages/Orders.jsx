import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { ParcelIcon } from "../utils/icons";
import { useAdminContext } from "../Context/AdminContext";

const Orders = ({ token }) => {
  const { refreshCounts } = useAdminContext();
  const [orders, setOrders] = useState([]);
  const hasMarkedAsViewed = useRef(false);

  const fetchAllOrders = async () => {
    if (!token) return;
    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );
      response.data.success
        ? setOrders(response.data.orders)
        : toast.error(response.data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleStatusChange = async (orderId, event) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        await fetchAllOrders();
        toast.success(response.data.message);
        // Refresh counts when order status changes (if it was "processing", it's no longer new)
        if (refreshCounts) {
          refreshCounts();
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  // Mark orders as viewed when page loads (only once per mount)
  useEffect(() => {
    if (!token || hasMarkedAsViewed.current) return;
    
    const markAsViewed = async () => {
      try {
        hasMarkedAsViewed.current = true;
        await axios.post(
          `${backendUrl}/api/admin/mark-orders-viewed`,
          {},
          { headers: { token } }
        );
        // Refresh counts after marking as viewed
        if (refreshCounts) {
          refreshCounts();
        }
      } catch (error) {
        console.error("Error marking orders as viewed:", error);
        hasMarkedAsViewed.current = false; // Reset on error so we can retry
      }
    };
    
    markAsViewed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only depend on token, not refreshCounts

  return (
    <div className="p-4 lg:p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Order Management
      </h2>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200">
            No orders found
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-[60px_2fr_1fr_1fr_120px] gap-3 sm:gap-4 lg:gap-6 items-start">
                {/* Order Icon */}
                <div className="flex justify-center md:justify-start">
                  <ParcelIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
                </div>

                {/* Order Details */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-xs sm:text-sm text-gray-600 break-words">
                        {item.name} × {item.quantity}{" "}
                        {item.size && `(${item.size})`}
                      </p>
                    ))}
                  </div>
                  <div className="pt-2 space-y-1">
                    <p className="text-sm sm:text-base font-medium text-gray-800">
                      {order.address.firstName} {order.address.lastName}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">
                      {order.address.street}, {order.address.city}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">
                      {order.address.state}, {order.address.country} -{" "}
                      {order.address.zipcode}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {order.address.phone}
                    </p>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-800">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}
                  </p>
                  <div className="text-xs sm:text-sm space-y-1">
                    <p className="text-gray-600">
                      Method: {order.paymentMethod}
                    </p>
                    <p className="flex items-center gap-1 flex-wrap">
                      Payment:
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.payment
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.payment ? "Completed" : "Pending"}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Date: {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center">
                  <p className="text-base sm:text-lg font-semibold text-gray-800">
                    {currency}
                    {order.amount.toFixed(2)}
                  </p>
                </div>

                {/* Status Selector */}
                <div className="md:col-span-1">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm text-gray-800 bg-white"
                  >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Packing">Packing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out For Delivery">Out For Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
