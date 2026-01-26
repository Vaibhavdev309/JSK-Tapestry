# Quick Deployment Checklist

## 🚀 Backend Deployment (Render)

### Step 1: Create Web Service
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name**: `tapestry-backend`
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 2: Add Environment Variables
Add all these in Render dashboard → Environment tab:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tapestry
CLOUDINARY_API_KEY=your_key
CLOUDINARY_SECRET_KEY=your_secret
CLOUDINARY_NAME=your_name
JWT_SECRET=your_strong_secret
ADMIN_EMAIL=your_email
ADMIN_PASSWORD=your_password
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=https://your-vercel-app.vercel.app
```

**Note**: Update `FRONTEND_URL` after deploying frontend!

### Step 3: Deploy
- Click "Create Web Service"
- Wait for deployment
- Copy backend URL (e.g., `https://tapestry-backend.onrender.com`)

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Create Project
1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

### Step 2: Add Environment Variables
Add in Vercel dashboard → Settings → Environment Variables:

```
VITE_BACKEND_URL=https://your-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

**Replace** `https://your-backend.onrender.com` with your actual Render backend URL!

### Step 3: Deploy
- Click "Deploy"
- Wait for deployment
- Copy frontend URL (e.g., `https://tapestry-frontend.vercel.app`)

### Step 4: Update Backend FRONTEND_URL
1. Go back to Render dashboard
2. Update `FRONTEND_URL` environment variable to your Vercel URL
3. Save (auto-redeploys)

---

## ✅ Final Steps

1. **Update Google OAuth:**
   - Go to Google Cloud Console
   - Add Vercel URL to Authorized JavaScript origins
   - Add Vercel URL to Authorized redirect URIs

2. **Test Everything:**
   - Visit your Vercel URL
   - Test login/register
   - Test Google OAuth
   - Test product browsing
   - Test cart and checkout
   - Test payment (Razorpay)

---

## 📝 Important Notes

- **MongoDB**: Use MongoDB Atlas (not localhost)
- **Razorpay**: Use Live keys (not test keys) in production
- **Email**: Use Gmail App Password (not regular password)
- **CORS**: Already configured to work with Vercel URLs
- **Socket.IO**: Will work automatically with correct backend URL

---

## 🔧 Troubleshooting

**Backend not starting?**
- Check Render logs
- Verify all environment variables are set
- Check MongoDB connection string

**Frontend can't connect to backend?**
- Verify `VITE_BACKEND_URL` is correct
- Check CORS errors in browser console
- Ensure backend is deployed and running

**Google OAuth not working?**
- Verify OAuth Client ID matches
- Check Authorized JavaScript origins
- Ensure redirect URIs are configured
