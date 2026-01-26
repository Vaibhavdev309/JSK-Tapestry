# Test the app on your phone (same Wi‑Fi as your Mac)

Use these steps to open the site on your phone while it runs on your Mac.

## 1. Same Wi‑Fi

Your Mac and phone must be on the **same Wi‑Fi network**.

## 2. Find your Mac’s IP

On your Mac, run:

```bash
ipconfig getifaddr en0
```

If that’s empty, try `en1` or `en2`, or run:

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Use the `192.168.x.x` or `10.x.x.x` address (e.g. `192.168.1.5`). Call this `<MAC_IP>`.

## 3. Start backend and frontend on the Mac

**Terminal 1 – backend**

```bash
cd backend && npm run server
```

**Terminal 2 – frontend**

```bash
cd frontend && npm run dev
```

The frontend runs on port **5174** and is reachable on your local network.

## 4. Open the app on your phone

In the phone’s browser go to:

```
http://<MAC_IP>:5174
```

Example: `http://192.168.1.5:5174`

The app will use `http://<MAC_IP>:4000` for the API when it sees a local IP in the URL.

## 5. Google Sign‑In on the phone

For “Sign up with Google” / “Sign in with Google” to work from the phone:

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Open your **OAuth 2.0 Client ID** (Web application).
3. Under **Authorized JavaScript origins**, add:
   ```text
   http://<MAC_IP>:5174
   ```
   Example: `http://192.168.1.5:5174`
4. Save.

If your Mac’s IP changes (new Wi‑Fi, DHCP, etc.), add the new `http://<NEW_IP>:5174` as well, or remove the old one.

## 6. Firewall (if the phone can’t connect)

If the phone can’t reach the Mac:

- **Mac:** System Settings → Network → Firewall (or Security & Privacy → Firewall). Allow incoming connections for **Node** and/or your **terminal/app** that runs `npm run dev` and `npm run server`, or temporarily turn the firewall off to test.

## Summary

| What        | URL / value                    |
|------------|---------------------------------|
| App on Mac | http://localhost:5174           |
| App on phone | http://\<MAC_IP\>:5174        |
| API (from phone) | http://\<MAC_IP\>:4000 (chosen automatically) |
| Google origin to add | http://\<MAC_IP\>:5174        |
