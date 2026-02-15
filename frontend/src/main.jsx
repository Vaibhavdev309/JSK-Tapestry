import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import ShopContextProvider from './context/ShopContext.jsx'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

// Google OAuth origin_mismatch fix: add this exact origin in Cloud Console → Credentials → Authorized JavaScript origins
if (googleClientId && import.meta.env.DEV) {
  console.log('[Google OAuth] Add this Authorized JavaScript origin in Google Cloud Console:', window.location.origin)
}

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <BrowserRouter>
      <ShopContextProvider>
        <App />
      </ShopContextProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>,
)
