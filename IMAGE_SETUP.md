# Image Setup Guide

This guide explains how to add your images to the project after removing the assets folder dependency.

## Option 1: Using Public Folder (Recommended for Static Images)

The `public` folder is the easiest way to add static images that don't need processing.

### Steps:

1. **Create images folder in public:**
   ```bash
   mkdir -p frontend/public/images
   ```

2. **Copy your images to the public/images folder:**
   - `hero_img.png` → `frontend/public/images/hero_img.png`
   - `about_img.png` → `frontend/public/images/about_img.png`
   - `contact_img.png` → `frontend/public/images/contact_img.png`

3. **Images are automatically available at:**
   - `/images/hero_img.png`
   - `/images/about_img.png`
   - `/images/contact_img.png`

The code is already configured to use these paths by default!

## Option 2: Using Environment Variables (For CDN or Custom URLs)

If you want to host images on a CDN or use different URLs:

1. **Add to `frontend/.env`:**
   ```env
   VITE_HERO_IMG_URL=https://your-cdn.com/images/hero_img.png
   VITE_ABOUT_IMG_URL=https://your-cdn.com/images/about_img.png
   VITE_CONTACT_IMG_URL=https://your-cdn.com/images/contact_img.png
   ```

2. **Restart your dev server** after adding environment variables.

## Option 3: Using Existing Assets Folder (If You Want to Keep It)

If you prefer to keep using the assets folder:

1. **Update `frontend/src/utils/icons.jsx`:**
   ```javascript
   import heroImg from "../assets/hero_img.png";
   import aboutImg from "../assets/about_img.png";
   import contactImg from "../assets/contact_img.png";

   export const HERO_IMAGE = heroImg;
   export const ABOUT_IMAGE = aboutImg;
   export const CONTACT_IMAGE = contactImg;
   ```

2. **Update the components to use these imports.**

## Option 4: Using Cloudinary or Other CDN

1. **Upload images to Cloudinary** (or your preferred CDN)

2. **Get the URLs** and add them to `.env`:
   ```env
   VITE_HERO_IMG_URL=https://res.cloudinary.com/your-cloud/image/upload/hero_img.png
   VITE_ABOUT_IMG_URL=https://res.cloudinary.com/your-cloud/image/upload/about_img.png
   VITE_CONTACT_IMG_URL=https://res.cloudinary.com/your-cloud/image/upload/contact_img.png
   ```

## Quick Start (Recommended)

**Easiest method - Use Public Folder:**

1. Create the folder:
   ```bash
   cd frontend
   mkdir -p public/images
   ```

2. Copy your images:
   ```bash
   # Copy from assets folder to public folder
   cp src/assets/hero_img.png public/images/
   cp src/assets/about_img.png public/images/
   cp src/assets/contact_img.png public/images/
   ```

3. That's it! The images will work automatically.

## Logo Setup

The logo is currently a text-based component. To use an image logo:

1. **Add logo to public folder:**
   ```bash
   cp src/assets/logo.png frontend/public/images/logo.png
   ```

2. **Update `frontend/src/utils/icons.jsx` Logo component:**
   ```javascript
   export const Logo = ({ className = "w-24 sm:w-28 md:w-32 lg:w-36 h-auto max-h-10 sm:max-h-none" }) => (
     <img 
       src="/images/logo.png" 
       alt="Tapestry" 
       className={className}
       onError={(e) => {
         e.target.onerror = null;
         e.target.alt = "Tapestry";
         e.target.style.display = "none";
       }}
     />
   );
   ```

## Notes

- **Public folder**: Files in `public/` are served at the root path (`/images/...`)
- **Environment variables**: Must start with `VITE_` to be accessible in frontend
- **Fallback**: All images have fallback placeholders if they fail to load
- **Git**: Add `public/images/` to git if you want to version control images, or use `.gitignore` if hosting on CDN
