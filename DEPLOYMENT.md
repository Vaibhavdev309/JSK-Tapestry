# Deployment Guide

This guide will help you deploy the Tapestry e-commerce project:
- **Frontend**: Vercel
- **Backend**: Render

## Prerequisites

1. GitHub account with your code pushed
2. Vercel account (free tier available)
3. Render account (free tier available)
4. MongoDB Atlas account (free tier available) or your MongoDB instance
5. Cloudinary account (free tier available)
6. Google Cloud Console project (for OAuth)
7. Razorpay account (for payments)

---

## Step 1: Deploy Backend on Render

### 1.1 Prepare Backend

1. **Push your code to GitHub** (make sure `.env` files are NOT committed)

2. **Create a new Web Service on Render:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure the service:**
   - **Name**: `tapestry-backend` (or any name you prefer)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend` (important!)

4. **Add Environment Variables in Render Dashboard:**
   Click "Environment" tab and add these variables:

   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_atlas_connection_string
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
   CLOUDINARY_NAME=your_cloudinary_name
   JWT_SECRET=your_strong_random_secret_key
   ADMIN_EMAIL=your_admin_email
   ADMIN_PASSWORD=your_admin_password
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

   **Important Notes:**
   - Use MongoDB Atlas connection string (not localhost)
   - Use production Razorpay keys (not test keys)
   - `FRONTEND_URL` should be your Vercel frontend URL (you'll update this after deploying frontend)
   - For Gmail, use App Password (not regular password)

5. **Deploy:**
   - Click "Create Web Service"
   - Render will build and deploy your backend
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://tapestry-backend.onrender.com`)

### 1.2 Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" → "Credentials"
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   - `https://your-vercel-app.vercel.app`
   - `https://your-custom-domain.com` (if using custom domain)
5. Add to **Authorized redirect URIs**:
   - `https://your-vercel-app.vercel.app`
   - `https://your-backend.onrender.com/api/user/google`

---

## Step 2: Deploy Frontend on Vercel

### 2.1 Prepare Frontend

1. **Create a new project on Vercel:**
   - Go to https://vercel.com
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository

2. **Configure the project:**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (important!)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `dist` (should auto-detect)
   - **Install Command**: `npm install` (should auto-detect)

3. **Add Environment Variables:**
   Click "Environment Variables" and add:

   ```
   VITE_BACKEND_URL=https://your-backend.onrender.com
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

   **Important:**
   - Replace `https://your-backend.onrender.com` with your actual Render backend URL
   - Use the same `VITE_GOOGLE_CLIENT_ID` as in backend

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your frontend URL (e.g., `https://tapestry-frontend.vercel.app`)

### 2.2 Update Backend Environment Variables

After getting your Vercel frontend URL:

1. Go back to Render dashboard
2. Navigate to your backend service
3. Go to "Environment" tab
4. Update `FRONTEND_URL` to your Vercel frontend URL:
   ```
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
5. Save and redeploy (Render will auto-redeploy)

---

## Step 3: Update Google OAuth (Final Step)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Update your OAuth 2.0 Client ID with production URLs:
   - **Authorized JavaScript origins**: Add your Vercel URL
   - **Authorized redirect URIs**: Add your Vercel URL

---

## Step 4: Test Your Deployment

1. **Test Frontend:**
   - Visit your Vercel URL
   - Try logging in
   - Test Google OAuth login

2. **Test Backend:**
   - Visit `https://your-backend.onrender.com` (should show "API working")
   - Test API endpoints

3. **Test Features:**
   - User registration/login
   - Product browsing
   - Cart functionality
   - Price requests
   - Payment (Razorpay)
   - Chat functionality

---

## Important Notes

### MongoDB Atlas Setup

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist IP addresses (for Render, use `0.0.0.0/0` to allow all)
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net`
5. Add `/tapestry` at the end: `mongodb+srv://username:password@cluster.mongodb.net/tapestry`

### Razorpay Production Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Switch to "Live Mode"
3. Go to Settings → API Keys
4. Generate/use Live API keys
5. Update in Render environment variables

### Email Configuration

- For Gmail, you MUST use App Password, not regular password
- Generate App Password: https://myaccount.google.com/apppasswords
- Enable 2-Step Verification first if not already enabled

### CORS Configuration

The backend is configured to:
- Allow requests from your Vercel frontend URL
- Allow localhost for development
- Automatically allow any `*.vercel.app` domain

### Socket.IO

Socket.IO is configured to work with your frontend URL. Make sure:
- Frontend uses the correct backend URL for Socket.IO connection
- CORS is properly configured (already done)

---

## Troubleshooting

### Backend Issues

1. **Build fails:**
   - Check that `package.json` has correct `start` script
   - Ensure all dependencies are listed in `package.json`

2. **Database connection fails:**
   - Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
   - Check connection string format
   - Ensure database user has correct permissions

3. **CORS errors:**
   - Verify `FRONTEND_URL` in backend environment variables matches your Vercel URL
   - Check that frontend is using correct `VITE_BACKEND_URL`

### Frontend Issues

1. **Build fails:**
   - Check that all environment variables are set
   - Verify `vite.config.js` is correct

2. **API calls fail:**
   - Verify `VITE_BACKEND_URL` is set correctly
   - Check browser console for CORS errors
   - Ensure backend is deployed and running

3. **Google OAuth fails:**
   - Verify OAuth Client ID is correct
   - Check Authorized JavaScript origins in Google Console
   - Ensure redirect URIs are configured

### Payment Issues

1. **Razorpay not working:**
   - Verify you're using Live keys (not test keys) in production
   - Check Razorpay dashboard for any errors
   - Verify webhook URLs if using webhooks

---

## Environment Variables Summary

### Backend (Render)
- `NODE_ENV=production`
- `PORT=10000`
- `MONGODB_URI`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_SECRET_KEY`
- `CLOUDINARY_NAME`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_SECURE`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `FRONTEND_URL`

### Frontend (Vercel)
- `VITE_BACKEND_URL`
- `VITE_GOOGLE_CLIENT_ID`

---

## Post-Deployment Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] All environment variables set
- [ ] MongoDB Atlas connected
- [ ] Google OAuth configured with production URLs
- [ ] Razorpay Live keys configured
- [ ] Email service working
- [ ] CORS configured correctly
- [ ] Socket.IO working
- [ ] All features tested

---

## Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Function Logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
