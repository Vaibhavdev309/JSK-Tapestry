import React from "react";
import { Link } from "react-router-dom";

const CustomBulkBanner = ({ compact = false }) => {
  if (compact) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 flex flex-wrap items-center justify-center gap-2 text-center sm:justify-between sm:text-left">
          <p className="text-stone-700 text-sm font-medium">
            Custom and bulk orders welcome – get in touch.
          </p>
          <Link
            to="/contact"
            className="text-sm font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2"
          >
            Contact us
          </Link>
        </div>
      </section>
    );
  }
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 border border-amber-100/80 p-6 sm:p-8 text-center">
        <h2 className="text-lg sm:text-xl font-bold text-stone-900 prata-regular mb-2">
          Custom and bulk orders welcome
        </h2>
        <p className="text-stone-600 text-sm sm:text-base mb-4 max-w-lg mx-auto">
          Need a specific design, size, or quantity? We’d love to help. Get in touch and we’ll get back to you as soon as we can.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center justify-center h-11 px-6 font-medium text-amber-800 bg-amber-200 hover:bg-amber-300 rounded-xl transition-colors"
        >
          Get in touch
        </Link>
      </div>
    </section>
  );
};

export default CustomBulkBanner;
