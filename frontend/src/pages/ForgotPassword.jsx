import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import Title from "../components/Title";

const ForgotPassword = () => {
  const { backendUrl } = useContext(ShopContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      console.log("🔵 [FORGOT PASSWORD] Requesting password reset for:", email);
      const response = await axios.post(
        `${backendUrl}/api/user/forgot-password`,
        { email: email.trim() }
      );

      console.log("📥 [FORGOT PASSWORD] Response:", response.data);

      if (response.data.success) {
        setEmailSent(true);
        toast.success(response.data.message || "Password reset link sent to your email");
      } else {
        toast.error(response.data.message || "Failed to send password reset email");
      }
    } catch (error) {
      console.error("❌ [FORGOT PASSWORD] Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to send password reset email. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-stone-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="card-tapestry w-full max-w-md p-6 sm:p-8 md:p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <Title text1="Check Your" text2="Email" />
          <p className="text-stone-600 mb-6">
            If an account exists with this email, a password reset link has been sent. Please check your inbox and follow the instructions.
          </p>
          <p className="text-sm text-stone-500 mb-6">
            The link will expire in 1 hour. If you don't see the email, check your spam folder.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
              className="w-full btn-primary py-2.5"
            >
              Send Another Email
            </button>
            <Link
              to="/login"
              className="inline-block w-full text-stone-600 hover:text-amber-600 py-2.5 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="card-tapestry w-full max-w-md p-6 sm:p-8 md:p-10">
        <Title text1="Forgot" text2="Password" />
        <p className="text-stone-600 text-center mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-tapestry"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3.5"
            >
              {isLoading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                "Send Reset Link"
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ForgotPassword;
