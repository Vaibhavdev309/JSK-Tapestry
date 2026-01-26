import React, { useEffect, useState, useContext } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import Title from "../components/Title";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { backendUrl, token, setToken } = useContext(ShopContext);
  const [status, setStatus] = useState("verifying"); // verifying, success, error, already-verified
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. No token provided.");
        return;
      }

      try {
        console.log("🔵 [VERIFY EMAIL] Verifying email with token");
        const response = await axios.get(
          `${backendUrl}/api/user/verify-email?token=${token}`
        );

        console.log("📥 Verification response:", response.data);

        if (response.data.success) {
          if (response.data.alreadyVerified) {
            setStatus("already-verified");
            setMessage("Your email is already verified!");
          } else {
            setStatus("success");
            setMessage("Email verified successfully!");
            
            // Auto-login if token is provided
            if (response.data.token) {
              setToken(response.data.token);
              localStorage.setItem("token", response.data.token);
              toast.success("Email verified! You are now logged in.");
            }
          }
        } else {
          setStatus("error");
          setMessage(response.data.message || "Verification failed");
        }
      } catch (error) {
        console.error("❌ [VERIFY EMAIL] Error:", error);
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Verification failed. The link may have expired."
        );
      }
    };

    verifyEmail();
  }, [searchParams, backendUrl, setToken]);

  const handleResendVerification = async () => {
    if (!token) {
      toast.error("Please log in to resend verification email");
      navigate("/login");
      return;
    }

    try {
      console.log("🔵 [RESEND VERIFICATION] Requesting resend");
      const response = await axios.post(
        `${backendUrl}/api/user/resend-verification`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Verification email sent!");
        setMessage("Verification email sent! Please check your inbox.");
      } else {
        toast.error(response.data.message || "Failed to resend verification email");
      }
    } catch (error) {
      console.error("❌ [RESEND VERIFICATION] Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to resend verification email"
      );
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="card-tapestry w-full max-w-md p-6 sm:p-8 md:p-10 text-center">
        <Title text1="Email" text2="Verification" />

        {status === "verifying" && (
          <div className="mt-8">
            <div className="inline-block w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-stone-600">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="mt-8">
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
            <h3 className="text-xl font-semibold text-stone-900 mb-2">
              Email Verified!
            </h3>
            <p className="text-stone-600 mb-6">{message}</p>
            <Link
              to="/"
              className="inline-block btn-primary px-6 py-2.5"
            >
              Go to Home
            </Link>
          </div>
        )}

        {status === "already-verified" && (
          <div className="mt-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">
              Already Verified
            </h3>
            <p className="text-stone-600 mb-6">{message}</p>
            <Link
              to="/"
              className="inline-block btn-primary px-6 py-2.5"
            >
              Go to Home
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="mt-8">
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
            <h3 className="text-xl font-semibold text-stone-900 mb-2">
              Verification Failed
            </h3>
            <p className="text-stone-600 mb-6">{message}</p>
            <div className="space-y-3">
              {token ? (
                <button
                  onClick={handleResendVerification}
                  className="w-full btn-primary py-2.5"
                >
                  Resend Verification Email
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-block w-full btn-primary py-2.5 text-center"
                >
                  Log In to Resend
                </Link>
              )}
              <Link
                to="/"
                className="inline-block w-full text-stone-600 hover:text-stone-900 py-2.5"
              >
                Go to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default VerifyEmail;
