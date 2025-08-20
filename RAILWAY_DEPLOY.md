# Railway Deployment Guide - Nixpacks Setup

## Prerequisites

### Required Environment Variables
Set these in Railway's Variables tab:

**Critical (Required):**
- `DATABASE_URL` - PostgreSQL connection string (e.g., from Supabase)
- `JWT_SECRET` - At least 32 characters long for token signing
- `PORT` - Automatically provided by Railway, don't set manually

**Optional (for full functionality):**
- `SESSION_SECRET` - Session encryption key (32+ chars recommended)
- `EMAIL_FROM` - Default: noreply@apimonitoring.app
- `BREVO_SMTP_USER` - For email alerts
- `BREVO_SMTP_PASS` - For email alerts
- `GOOGLE_CLIENT_ID` - For OAuth login
- `GOOGLE_CLIENT_SECRET` - For OAuth login
- `GOOGLE_CALLBACK_URL` - OAuth callback URL
- `FRONTEND_URL` - Frontend URL for redirects

**Debug flags:**
- `DISABLE_CRONS=true` - Disable background jobs during debugging

## Railway Service Setup

### Critical: Set Root Directory
**You MUST set Root Directory to `backend` in Railway settings:**

1. Go to your Railway service Settings
2. Set **Root Directory** to `backend` 
3. This makes Railway treat the backend folder as the project root
4. Railway will then use `backend/package.json` and `backend/package-lock.json`

### Option 1: New Service (Recommended)
1. Create new service in Railway
2. Connect your GitHub repo
3. **IMPORTANT**: Set **Root Directory** to `backend`
4. Railway will auto-detect Node.js and use our nixpacks.toml config

### Option 2: Update Existing Service
1. Go to your service Settings
2. **IMPORTANT**: Change **Root Directory** to `backend`
3. Ensure **Builder** is set to Nixpacks (should auto-detect)
4. Redeploy

## Build Process
- Nixpacks will use Node.js 18 with native build tools (python, gcc, make)
- Installs production dependencies with `npm ci`
- Starts with `npm start` (runs `node index.js`)

## Health Check
Once deployed, check: `https://your-app.railway.app/health`

## Troubleshooting
- If build fails: Check that `backend/package.json` and `backend/package-lock.json` are in sync
- If deploy crashes: Check Railway logs for environment validation errors
- For native module issues: bcrypt fallback to bcryptjs is built-in

## Expected Logs
After successful deployment, you should see:
```
🔍 Railway Environment Check:
✅ Environment validation passed
🚀 Server running on port 5000
💓 heartbeat [timestamp]
```
