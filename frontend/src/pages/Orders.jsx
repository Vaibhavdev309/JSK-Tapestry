import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import Title from "../components/Title";
import { toast } from "react-toastify";

const PLACEHOLDER_IMG = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect fill="#e7e5e4" width="80" height="80"/></svg>');

const Orders = () => {
  const { currency, backendUrl, token } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      if (!token) return;
      const response = await axios.get(`${backendUrl}/api/order/userorders`, {
        headers: { token },
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadOrders();
  }, [token, backendUrl]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-500";
      case "shipped":
        return "bg-blue-500";
      case "processing":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-w-0">
        <Title text1="Order" text2="History" />
        <div className="text-center py-8">
          <p className="text-stone-500">Loading orders...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-w-0">
      <Title text1="Order" text2="History" />

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-stone-500">No orders found</p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="card-tapestry p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold text-stone-900">
                    Order ID: {order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-stone-500">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  />
                  <span className="text-sm capitalize">{order.status}</span>
                </div>
              </div>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={`${order._id}-${item.productId}`}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 border-t pt-4"
                  >
                    <img
                      src={item.productId?.image?.[0] || PLACEHOLDER_IMG}
                      alt={item.productId?.name || "Product"}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl flex-shrink-0"
                      onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-stone-900">
                        {item.productId?.name || "Product"}
                      </h3>
                      <div className="text-sm text-stone-600 mt-1">
                        <p>Quantity: {item.quantity}</p>
                        <p>
                          Price: {currency}
                          {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                  <div className="text-sm">
                    <p className="font-medium text-stone-800">Total Amount:</p>
                    <p className="text-stone-600">
                      {currency}
                      {order.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-stone-800">Payment Method:</p>
                    <p className="text-stone-600 capitalize">
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Orders;
