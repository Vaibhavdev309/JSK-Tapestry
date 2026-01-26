import React, { useState } from "react";

// Search icon SVG
export const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Cart icon SVG
export const CartIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

// Profile icon SVG
export const ProfileIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

// Bin/Delete icon SVG
export const BinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// Cross/Close icon SVG
export const CrossIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Menu icon SVG
export const MenuIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// Logo component - supports both image and text
// Set VITE_LOGO_URL in .env to use an image logo, or leave empty for text logo
const LOGO_URL = import.meta.env.VITE_LOGO_URL || "/images/logo.png";

export const Logo = ({ className = "w-24 sm:w-28 md:w-32 lg:w-36 h-auto max-h-10 sm:max-h-none" }) => {
  const [imgError, setImgError] = useState(false);
  
  if (imgError) {
    // Fallback to text logo if image fails
    return (
      <div className={`${className} flex items-center justify-center font-bold text-xl sm:text-2xl text-amber-600`}>
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

// Placeholder images as data URIs (fallback)
export const PLACEHOLDER_IMAGE = "data:image/svg+xml," + encodeURIComponent(`
  <svg width="400" height="400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="400" fill="#e7e5e4"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#a8a29e" font-size="14" font-family="system-ui">No image</text>
  </svg>
`);

// Image paths - Update these to use your actual images
// Option 1: Use public folder (recommended) - images go in frontend/public/images/
// Option 2: Use environment variables - set VITE_HERO_IMG_URL, etc. in .env
// Option 3: Use CDN URLs - replace with your CDN URLs

export const HERO_IMAGE = import.meta.env.VITE_HERO_IMG_URL || "/images/hero_img.png";
export const ABOUT_IMAGE = import.meta.env.VITE_ABOUT_IMG_URL || "/images/about_img.png";
export const CONTACT_IMAGE = import.meta.env.VITE_CONTACT_IMG_URL || "/images/contact_img.png";

// Fallback placeholders if images don't load
export const HERO_PLACEHOLDER = "data:image/svg+xml," + encodeURIComponent(`
  <svg width="800" height="600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#f5f5f4"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#78716c" font-size="24" font-family="system-ui">Hero Image</text>
  </svg>
`);

export const ABOUT_PLACEHOLDER = "data:image/svg+xml," + encodeURIComponent(`
  <svg width="600" height="400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="400" fill="#f5f5f4"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#78716c" font-size="20" font-family="system-ui">About Image</text>
  </svg>
`);

export const CONTACT_PLACEHOLDER = "data:image/svg+xml," + encodeURIComponent(`
  <svg width="600" height="400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="400" fill="#f5f5f4"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#78716c" font-size="20" font-family="system-ui">Contact Image</text>
  </svg>
`);

// Payment logos as SVGs
export const StripeLogo = ({ className = "h-5" }) => (
  <svg className={className} viewBox="0 0 468 222.32" xmlns="http://www.w3.org/2000/svg">
    <path fill="#635bff" d="M414 113.4c0-25.6-12.4-45.8-36.1-45.8-23.8 0-38.2 20.2-38.2 45.6 0 30.1 17 45.3 41.4 45.3 11.9 0 20.9-2.7 27.7-6.5V136c-6.8 3.4-14.6 5.5-24.5 5.5-9.7 0-18.3-3.4-19.4-15.2h48.9c0-1.3.2-6.5.2-6.5zm-49.4-9.2c0-11.3 6.9-16 13.2-16 6.1 0 12.6 4.7 12.6 16h-25.8z"/>
    <path fill="#635bff" d="M301.1 67.6c-9.8 0-16.1 4.6-19.6 7.8l-1.3-6.2h-22v116.6l25-5.3.1-28.3c3.6 2.6 8.9 6.3 17.7 6.3 17.9 0 34.2-14.4 34.2-46.1-.1-29-15.6-45.8-34.1-45.8zm-6 68.9c-5.9 0-9.4-2.1-11.8-4.7l-.1-37.1c2.6-2.9 6.2-4.9 11.9-4.9 9.1 0 15.4 10.2 15.4 23.3 0 13.4-6.2 23.4-15.4 23.4z"/>
    <path fill="#635bff" d="M223.3 61.3l25.1-5.4V36.4l-25.1 5.3v19.6zm.1 55.7l.1-70 25-5.4.1 70-25.2 5.4z"/>
    <path fill="#635bff" d="M196.9 76.7l-24.4 5.2-.1-14.2c.5-3.8 1.8-6.3 5.1-8.2 3.3-1.9 8.1-2.9 13.3-2.9l6.1-.6v20.7zm0 40.3l.1-28.3-6.1.6c-5.2 0-10 .9-13.3 2.9-3.3 1.9-4.6 4.4-5.1 8.2l-.1 14.2 24.4-5.2v6.6z"/>
    <path fill="#635bff" d="M146.9 47.6l-24.7 5.3-.1 62.1c0 14.8 11.1 25.7 25.9 25.7 8.2 0 14.2-1.5 17.5-3.3V135c-3.2 1.3-19 5.9-19-8.9V90.3h19V72.5h-19V47.6z"/>
    <path fill="#635bff" d="M79.3 94.7c0-3.9 3.2-5.4 8.5-5.4 7.6 0 17.2 2.3 24.8 6.4V72.2c-8.3-3.3-16.5-4.6-24.8-4.6C67.5 67.6 54 78.2 54 95.9c0 27.6 38 23.2 38 35.1 0 4.6-4 6.1-9.6 6.1-8.3 0-18.9-2.4-27.3-6.9v23.8c9.3 4 18.7 5.7 27.3 5.7 20.8 0 35.1-10.3 35.1-28.2-.1-29.8-38.2-25.6-38.2-35.8z"/>
  </svg>
);

export const RazorpayLogo = ({ className = "h-5" }) => (
  <svg className={className} viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
    <text x="10" y="40" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="#3F83F8">Razorpay</text>
  </svg>
);
