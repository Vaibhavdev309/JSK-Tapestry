import React, { useState } from "react";

// Upload area placeholder SVG
export const UploadAreaIcon = ({ className = "w-full h-full" }) => (
  <svg className={className} fill="none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" strokeDasharray="8 4" rx="8"/>
    <path d="M100 70v40m-20-20h40" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round"/>
    <text x="100" y="140" textAnchor="middle" fill="#6b7280" fontSize="14" fontFamily="system-ui">Upload</text>
  </svg>
);

// Add icon SVG
export const AddIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

// Order/List icon SVG
export const OrderIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

// Parcel icon SVG
export const ParcelIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

// Contact/Message icon SVG
export const ContactIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

// Logo component - supports both image and text
// Set VITE_LOGO_URL in .env to use an image logo, or leave empty for text logo
const LOGO_URL = import.meta.env.VITE_LOGO_URL || "/images/logo.png";

export const Logo = ({ className = "w-[120px] max-w-[140px]" }) => {
  const [imgError, setImgError] = useState(false);
  
  if (imgError) {
    // Fallback to text logo if image fails
    return (
      <div className={`${className} flex items-center justify-center font-bold text-xl text-gray-800`}>
        Tapestry
      </div>
    );
  }
  
  return (
    <img 
      src={LOGO_URL} 
      alt="Tapestry" 
      className={className}
      onError={() => setImgError(true)}
    />
  );
};

// Upload area as data URI for img src
export const UPLOAD_AREA_DATA_URI = "data:image/svg+xml," + encodeURIComponent(`
  <svg width="200" height="200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8 4" rx="8"/>
    <path d="M100 70v40m-20-20h40" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>
    <text x="100" y="140" text-anchor="middle" fill="#6b7280" font-size="14" font-family="system-ui">Upload</text>
  </svg>
`);
