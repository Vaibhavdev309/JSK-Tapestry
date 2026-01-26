import React, { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import Title from "../components/Title";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(ShopContext);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("form"); // form, success, error
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid reset link. No token provided.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      console.log("🔵 [RESET PASSWORD] Resetting password");
      const response = await axios.post(
        `${backendUrl}/api/user/reset-password`,
        { token, newPassword: password }
      );

      console.log("📥 [RESET PASSWORD] Response:", response.data);

      if (response.data.success) {
        setStatus("success");
        setMessage("Password reset successfully! You can now login with your new password.");
        toast.success("Password reset successfully!");
      } else {
        setStatus("error");
        setMessage(response.data.message || "Failed to reset password");
        toast.error(response.data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("❌ [RESET PASSWORD] Error:", error);
      setStatus("error");
      setMessage(
        error.response?.data?.message ||
          "Failed to reset password. The link may have expired."
      );
      toast.error(
        error.response?.data?.message ||
          "Failed to reset password. The link may have expired."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "success") {
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <Title text1="Password" text2="Reset" />
          <h3 className="text-xl font-semibold text-stone-900 mb-2">Success!</h3>
          <p className="text-stone-600 mb-6">{message}</p>
          <Link to="/login" className="inline-block btn-primary px-6 py-2.5">
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-stone-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="card-tapestry w-full max-w-md p-6 sm:p-8 md:p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <Title text1="Reset" text2="Failed" />
          <h3 className="text-xl font-semibold text-stone-900 mb-2">Error</h3>
          <p className="text-stone-600 mb-6">{message}</p>
          <div className="space-y-3">
            <Link
              to="/forgot-password"
              className="inline-block w-full btn-primary py-2.5 text-center"
            >
              Request New Link
            </Link>
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
        <Title text1="Reset" text2="Password" />
        <p className="text-stone-600 text-center mb-6">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-tapestry"
                placeholder="Enter new password (min 8 characters)"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded p-1 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
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
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-tapestry"
                placeholder="Confirm new password"
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

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3.5"
            >
              {isLoading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                "Reset Password"
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

export default ResetPassword;
