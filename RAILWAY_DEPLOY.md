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

### Method 1: Let nixpacks.toml handle everything (Recommended)
1. Create new service in Railway
2. Connect your GitHub repo  
3. **Do NOT set Root Directory** - leave it empty
4. Railway will use our nixpacks.toml which copies backend files to app root
5. The root package.json files are renamed so Railway won't detect frontend deps

### Method 2: Use Root Directory (Alternative)
1. Create new service in Railway
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. This makes Railway treat backend folder as project root

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
