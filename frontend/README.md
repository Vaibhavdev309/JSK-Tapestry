# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Google Sign-In

Sign up / log in with Google is supported. To enable:

1. **Google Cloud Console:** Create an OAuth 2.0 Client ID (Web application). Add `http://localhost:5173` (and your production URL) to **Authorized JavaScript origins**.
2. **Backend:** Set `GOOGLE_CLIENT_ID` in `backend/.env` (see `backend/.env.example`).
3. **Frontend:** Set `VITE_GOOGLE_CLIENT_ID` in `frontend/.env` to the same Client ID (see `frontend/.env.example`).
4. Run `npm install` in both `backend` and `frontend` to install `google-auth-library` and `@react-oauth/google`.
