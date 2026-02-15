# Google Sign-In (OAuth 2.0) – origin_mismatch fix

**Error:** `The given origin is not allowed for the given client ID` / `Error 400: origin_mismatch`

Google ko **exact** origin chahiye. Ye steps follow karo.

---

## 1. Google Cloud Console mein jao

1. [Google Cloud Console](https://console.cloud.google.com/) → apna project select karo  
2. **APIs & Services** → **Credentials**  
3. **OAuth 2.0 Client IDs** list mein apna **Web application** wala client open karo (wohi jiska Client ID tumne `VITE_GOOGLE_CLIENT_ID` mein dala hai)

---

## 2. Authorized JavaScript origins – exact URLs add karo

**Important:**  
- **Trailing slash mat do** – `https://krishnatapestry.com/` ❌, `https://krishnatapestry.com` ✅  
- **Path mat do** – sirf scheme + domain + port (e.g. `https://krishnatapestry.com`)  
- **http vs https** – jis se site open ho rahi hai wahi use karo  

**Add these one by one (jahan se login use karoge):**

| Origin (copy exactly)      | Use case        |
|---------------------------|-----------------|
| `http://localhost:5173`   | Local dev (Vite)|
| `https://krishnatapestry.com` | Production (without www) |
| `https://www.krishnatapestry.com` | Production (with www)   |

- Agar site **sirf** `https://krishnatapestry.com` se open hoti hai → dono add karo: `https://krishnatapestry.com` aur `https://www.krishnatapestry.com` (redirect ho sakta hai)  
- Agar **Vercel/Netlify** pe custom URL hai (e.g. `https://xyz.vercel.app`) → woh bhi add karo

**Steps in Console:**  
- **Authorized JavaScript origins** section → **+ ADD URI**  
- Ek ek karke upar wale URIs add karo (no slash at end)  
- **Save** karo  

---

## 3. Authorized redirect URIs (agar dikhe)

Agar **Authorized redirect URIs** section hai:  
- Same origins add kar sakte ho, e.g. `https://krishnatapestry.com` (no trailing slash)  
- `@react-oauth/google` credential flow ke liye usually **JavaScript origins** hi kaafi hote hain, redirect URI optional

---

## 4. Client ID verify karo

- Jo Client ID Console mein dikh raha hai (Credentials page pe), wahi **exactly** frontend `.env` mein hona chahiye:

```env
VITE_GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
```

- Agar tumne 2 OAuth clients banaye (e.g. ek dev, ek prod), to **jis client ke andar origins add kiye**, usi ka Client ID `.env` mein hona chahiye.

---

## 5. Changes propagate

- Save ke baad **5–10 minute** wait karo  
- Browser cache clear karke ya incognito mein dobara try karo  
- Phir login page refresh karke Google sign-in try karo

---

## 6. Kaun sa origin use ho raha hai (debug)

Browser console mein ye run karo (login page open karke):

```js
console.log('Current origin:', window.location.origin);
```

Jo value aaye (e.g. `https://www.krishnatapestry.com`), **wahi exact string** Authorized JavaScript origins mein honi chahiye (without trailing slash).

---

## Checklist

- [ ] OAuth client type = **Web application** (na ki Desktop/Android)  
- [ ] **Authorized JavaScript origins** mein exact URL (no `/` at end)  
- [ ] Local test ke liye `http://localhost:5173` add kiya  
- [ ] Live site ke liye `https://krishnatapestry.com` (aur agar www use ho to `https://www.krishnatapestry.com`)  
- [ ] `.env` mein wahi Client ID jo isi OAuth client ka hai  
- [ ] Save ke baad 5–10 min wait, phir incognito/clear cache se try

Ab Google login try karo; agar phir bhi 403/origin_mismatch aaye to Console ka screenshot (Credentials page – Client ID + Authorized origins) bhejo.
