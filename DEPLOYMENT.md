# TE Platform — Deployment Guide

## Architecture

```
Browser  →  /api/*          (Next.js frontend, same origin)
Next.js  →  BACKEND_API_URL/api/*  (server-side proxy)
Express  →  MongoDB, Redis, SMTP
```

The browser **never** calls `localhost:4000` directly. All API traffic goes through `/api`.

## Environment variables

### Frontend (Next.js on Render / Vercel / local)

| Variable | Required | Example |
|----------|----------|---------|
| `BACKEND_API_URL` | Yes | `https://te-backend-dxbx.onrender.com` |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | `/api` |

**Do not** set `NEXT_PUBLIC_API_BASE_URL` to `http://localhost:4000/api` — that causes `Failed to fetch` when Express is not running on the user's machine.

### Backend (Express on Render)

| Variable | Required | Example |
|----------|----------|---------|
| `PORT` | Yes | `4000` |
| `DB` | Yes | MongoDB Atlas URI |
| `JWT_TOKEN` | Yes | long random string |
| `REFRESH_TOKEN` | Yes | long random string |
| `EMAIL_USER` / `EMAIL_PASS` | For OTP | Gmail + app password |
| `REDIS_URL` | Recommended | Render Redis URL |
| `CORS_ORIGIN` or `FRONTEND_URL` | Production | `https://your-frontend.onrender.com` |

## Local development

### Terminal 1 — API (optional if using remote Render API)

```bash
cd server
cp .env.example .env
# Edit .env with DB, JWT_TOKEN, etc.
npm install
npm run dev
```

### Terminal 2 — Frontend

```bash
cd client
cp .env.example .env.local
```

**Using remote API (no local Express):**

```env
BACKEND_API_URL=https://te-backend-dxbx.onrender.com
NEXT_PUBLIC_API_BASE_URL=/api
```

**Using local Express:**

```env
BACKEND_API_URL=http://127.0.0.1:4000
NEXT_PUBLIC_API_BASE_URL=/api
```

```bash
npm install
npm run dev
```

Restart the dev server after any `.env` change.

### Verify connectivity

```bash
curl http://localhost:3000/api/status
curl http://localhost:3000/api/health
```

Both should return `"ok": true` when configured correctly.

## Render deployment

### 1. Web Service — API (`server/`)

- **Build:** `npm install && npm run build`
- **Start:** `npm start`
- **Root directory:** `server`
- Set all backend env vars from `server/.env.example`

### 2. Web Service — Frontend (`client/`)

- **Build:** `npm install && npm run build`
- **Start:** `npm start`
- **Root directory:** `client`
- **Required env:**
  - `BACKEND_API_URL=https://<your-api-service>.onrender.com`
  - `NEXT_PUBLIC_API_BASE_URL=/api`

### 3. CORS on API

Set on the API service:

```env
CORS_ORIGIN=https://<your-frontend-service>.onrender.com
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Unable to reach the backend. Failed to fetch` | Set `NEXT_PUBLIC_API_BASE_URL=/api`, restart Next.js |
| `502` from `/api/*` | Set `BACKEND_API_URL` on frontend service; ensure API is running |
| OTP not sent | Set `EMAIL_USER` + `EMAIL_PASS` on API service |
| Stale env after edit | Stop all `next dev` processes and restart |

```bash
# Find and stop old Next dev servers
pkill -f "next dev" || true
cd client && npm run dev
```
