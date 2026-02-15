# Backend Ko Hamesha Active Kaise Rakhein (Cron / Uptime)

Render free tier par backend **15 minute** inactivity ke baad sleep ho jata hai. Uske baad pehla request slow (cold start) hota hai.

## Server ke andar: node-cron (self-ping)

Backend me **node-cron** laga diya hai: jab server **chal raha** hota hai tab har **14 minute** par apne aap **`/api/health`** hit karta hai. Isse server ko idle hone par bhi activity dikhti hai.

- **Render** par `RENDER_EXTERNAL_URL` automatically set hota hai – isi ko use karke self-ping chalegi.
- Agar kisi aur host par deploy ho (jaise Railway, etc.) to env me **`BACKEND_PUBLIC_URL`** set karo (e.g. `https://your-backend.onrender.com`).

**Important:** Jab server **bilkul so chuka** ho (cold), tab process band hota hai isliye andar ki cron bhi nahi chalti. Isliye **ek baar** bahar se ping (cron-job.org / UptimeRobot) set kar lena better hai – wo cold wake-up ke liye. Uske baad andar wala node-cron server ko active rakhega.

---

## Bahar se ping (optional but recommended)

Backend pe **`GET /api/health`** – ye sirf `{ ok: true }` return karta hai. Cold start ke liye isi ko bahar se hit karna helpful hai.

---

## Option 1: cron-job.org (Free, Sabse Simple)

1. **https://cron-job.org** pe jao (free account banao).
2. **Create Cronjob** pe click karo.
3. **URL:** apna backend URL daalo, jaise:
   ```text
   https://your-backend.onrender.com/api/health
   ```
4. **Schedule:** "Every 14 minutes" ya "Every 10 minutes" choose karo.
5. **Request method:** GET.
6. Save karo.

Ab har 10–14 minute par backend ping hoga aur Render use ko active consider karega.

---

## Option 2: UptimeRobot (Free)

1. **https://uptimerobot.com** pe jao, free account banao.
2. **Add New Monitor**:
   - **Monitor Type:** HTTP(s).
   - **Friendly Name:** Backend Keep Alive (jaise bhi naam do).
   - **URL:** `https://your-backend.onrender.com/api/health`
   - **Monitoring Interval:** 5 minutes (free me 5 min hi milta hai).
3. Create Monitor.

Ye bhi har 5 minute par URL hit karega aur backend awake rahega.

---

## Option 3: GitHub Actions (Repo ke andar Cron)

Agar backend ka code GitHub par hai to ek workflow bana sakte ho jo har 14 minute par backend ping kare.

1. Repo me **`.github/workflows/keep-backend-awake.yml`** banao (path neeche diya hai).
2. **Secret** me `BACKEND_URL` set karo (GitHub repo → Settings → Secrets and variables → Actions):
   - Name: `BACKEND_URL`
   - Value: `https://your-backend.onrender.com`
3. Workflow enable rehne do; ye schedule ke hisaab se chalega.

**Note:** GitHub Actions free tier me limit hoti hai; zyada frequent (e.g. har 5 min) mat set karna, 10–15 min theek hai.

---

## Backend URL Kya Daalu?

- **Render:** Dashboard → apna Web Service → jo URL diya hai (e.g. `https://tapestry-backend.onrender.com`).
- Ping URL hamesha: **`https://YOUR-BACKEND-URL/api/health`**

---

## Summary

| Service       | Interval | Kaise use karein                    |
|---------------|----------|-------------------------------------|
| cron-job.org  | 10–14 min| Create cronjob, URL = `/api/health` |
| UptimeRobot   | 5 min    | New Monitor, URL = `/api/health`    |
| GitHub Action | 10–15 min| Workflow file + BACKEND_URL secret  |

Koi bhi ek option use karo – backend ko regular ping milte rahega aur Render free tier par bhi wo zyada der tak active rahega.
