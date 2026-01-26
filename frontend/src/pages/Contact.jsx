import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { CONTACT_IMAGE, CONTACT_PLACEHOLDER } from "../utils/icons.jsx";

const Contact = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("🔵 [CONTACT] Form submission started");
    
    // Validation
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.warning("Please fill in name, email, and message.");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("📤 Sending contact form to backend");

      const response = await axios.post(
        `${backendUrl}/api/contact/submit`,
        {
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim() || "General Inquiry",
          message: form.message.trim(),
        },
        {
          headers: token ? { token } : {}, // Include token if user is logged in
        }
      );

      console.log("📥 Response received:", response.data);

      if (response.data.success) {
        toast.success(response.data.message || "Thank you for contacting us! We'll get back to you within 24–48 hours.");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(response.data.message || "Failed to submit contact form");
      }
    } catch (error) {
      console.error("❌ [CONTACT] Error submitting form:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to submit contact form. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50/80 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 lg:py-20 min-w-0">
        {/* Header */}
        <header className="text-center mb-12 lg:mb-16">
          <span className="inline-block px-3 py-1.5 mb-4 text-xs font-semibold tracking-wider text-amber-800 uppercase rounded-full bg-amber-200/80">
            Get in touch
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 prata-regular mb-4">
            Contact us
          </h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Have a question, custom request, or feedback? We’d love to hear from you. Drop a message and we’ll reply within 24–48 hours.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Image + contact details */}
          <div className="space-y-8">
            <img
              src={CONTACT_IMAGE}
              alt="Contact Tapestry"
              className="w-full rounded-2xl shadow-lg object-cover aspect-[4/3] lg:aspect-[3/4] lg:max-h-[480px]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = CONTACT_PLACEHOLDER;
              }}
            />
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Reach us directly</h2>
              <ul className="space-y-4">
                <li>
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">Email</p>
                  <a
                    href="mailto:hello@tapestry.in"
                    className="text-stone-800 hover:text-amber-600 transition-colors"
                  >
                    hello@tapestry.in
                  </a>
                </li>
                <li>
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">Phone</p>
                  <a
                    href="tel:+919876543210"
                    className="text-stone-800 hover:text-amber-600 transition-colors"
                  >
                    +91 XXXXX XXXXX
                  </a>
                </li>
                <li>
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">Address</p>
                  <p className="text-stone-700">India</p>
                </li>
              </ul>
              <p className="mt-6 text-sm text-stone-500 border-t border-stone-100 pt-6">
                We typically reply within 24–48 hours on business days.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-stone-800 mb-6">Send a message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Name <span className="text-amber-600">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none transition-all"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Email <span className="text-amber-600">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none transition-all"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="e.g. Order enquiry, Custom request"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none transition-all"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Message <span className="text-amber-600">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none transition-all resize-y min-h-[120px]"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send message"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
