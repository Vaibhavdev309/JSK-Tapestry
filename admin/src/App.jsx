import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "./components/Navbar";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Add from "./pages/Add";
import List from "./pages/List";
import Edit from "./pages/Edit";
import Orders from "./pages/Orders";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import Chat from "./pages/Chat";
import Request from "./pages/Request";
import Contact from "./pages/Contact";
import { AdminProvider } from "./Context/AdminContext";

export const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
export const currency = "$";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [counts, setCounts] = useState({
    orders: 0,
    chats: 0,
    priceRequests: 0,
    contactMessages: 0,
  });

  // Sync token to localStorage; remove when logged out
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Validate admin token on load; clear if expired or invalid
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    axios
      .get(backendUrl + "/api/user/verify-admin", { headers: { token } })
      .catch((err) => {
        if (!cancelled && err.response?.status === 401) {
          setToken("");
          toast.info("Session expired. Please sign in again.");
        }
      });
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch admin counts function
  const fetchCounts = async () => {
    if (!token) return;
    try {
      console.log("🔵 [ADMIN] Fetching counts...");
      const response = await axios.get(`${backendUrl}/api/admin/counts`, {
        headers: { token },
      });
      console.log("📥 [ADMIN] Counts response:", response.data);
      if (response.data.success) {
        setCounts(response.data.counts);
        console.log("✅ [ADMIN] Counts updated:", response.data.counts);
      }
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching admin counts:", error);
      console.error("Error details:", error.response?.data);
    }
  };

  // Fetch admin counts only on initial page load
  useEffect(() => {
    if (!token) return;
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only fetch when token changes (on initial load or login)

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ToastContainer position="top-center" autoClose={3000} />

      {!token ? (
        <Login setToken={setToken} />
      ) : (
        <AdminProvider refreshCounts={fetchCounts}>
          <Navbar
            setToken={setToken}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isMobile={isMobile}
          />

          <div className="flex flex-1 overflow-hidden relative">
            {/* Backdrop overlay for mobile */}
            {isMobile && isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
                aria-hidden="true"
              />
            )}

            {/* Responsive Sidebar */}
            <aside
              className={`transform top-0 left-0 w-64 bg-white fixed lg:relative h-full border-r-2 z-30 transition-all duration-300
              ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              } lg:translate-x-0`}
            >
              <Sidebar
                isMobile={isMobile}
                closeSidebar={() => setIsSidebarOpen(false)}
                counts={counts}
              />
            </aside>

            {/* Main Content Area */}
            <main
              className={`flex-1 overflow-y-auto transition-margin duration-300
              ${isSidebarOpen ? "ml-0" : "ml-0"}`}
            >
              <div className="p-4 lg:p-6">
                <Routes>
                  <Route path="/" element={<Navigate to="/add" replace />} />
                  <Route path="/add" element={<Add token={token} />} />
                  <Route path="/list" element={<List token={token} />} />
                  <Route path="/edit/:id" element={<Edit token={token} />} />
                  <Route path="/orders" element={<Orders token={token} />} />
                  <Route path="/chats" element={<Chat token={token} isAdmin={true} />} />
                  <Route path="/request" element={<Request token={token} />} />
                  <Route path="/contact" element={<Contact token={token} />} />
                </Routes>
              </div>
            </main>
          </div>
        </AdminProvider>
      )}
    </div>
  );
};

export default App;
