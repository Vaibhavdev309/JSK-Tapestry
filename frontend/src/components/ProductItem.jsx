import React from "react";
import { Link } from "react-router-dom";

const FALLBACK_IMG = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect fill="#e7e5e4" width="120" height="120"/></svg>');

const ProductItem = ({ id, _id, image, name, compact }) => {
  const productId = id || _id;
  const img = image?.[0];

  const content = (
    <>
      <div className="overflow-hidden rounded-xl bg-stone-100">
        {img ? (
          <img
            className={`object-contain object-center w-full max-w-full transition-transform duration-300 hover:scale-105 ${
              compact ? "aspect-square w-full" : "h-48 sm:h-56 md:h-60"
            }`}
            src={img}
            alt={name || "Tapestry"}
            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
          />
        ) : (
          <div
            className={`flex items-center justify-center text-stone-400 bg-stone-100 ${
              compact ? "aspect-square w-full min-h-[5rem]" : "h-48 sm:h-56 md:h-60"
            }`}
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
          </div>
        )}
      </div>
      <p className={`text-stone-800 font-medium text-center tracking-tight leading-snug ${compact ? "pt-2.5 px-1 text-xs" : "pt-5 px-3 text-sm sm:text-base line-clamp-2"}`}>
        {name || "Tapestry"}
      </p>
    </>
  );

  if (compact) {
    return <div className="text-stone-700">{content}</div>;
  }

  return (
    <Link
      to={`/collection/${productId}`}
      className="block text-stone-700 rounded-xl overflow-hidden border border-stone-200 bg-white shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 min-w-0 p-3 sm:p-4"
    >
      {content}
    </Link>
  );
};

export default ProductItem;
