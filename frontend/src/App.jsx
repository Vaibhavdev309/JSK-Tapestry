import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Collection from "./pages/Collection";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import PlaceOrder from "./pages/PlaceOrder";
import Product from "./pages/Product";
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastContainer, toast } from "react-toastify";
import Chat from "./pages/Chat";
import CategoryProducts from "./components/CategoryProducts";

const App = () => {
  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden px-4 sm:px-6 md:px-8 lg:px-10">
      <Chat />
      <ToastContainer />
      <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/collection" element={<Collection />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/place-order/:priceRequestId" element={<PlaceOrder />} />
                  <Route path="/collection/:productId" element={<Product />} />
                  <Route
                    path="/collection/:category/:subCategory"
                    element={<CategoryProducts />}
                  />
                  <Route
                    path="/collection/:category/:subCategory/:productId?"
                    element={<CategoryProducts />}
                  />
                </Routes>
      <Footer />
    </div>
  );
};

export default App;
