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

### CRITICAL: Force Nixpacks Usage
If Railway keeps generating Dockerfiles instead of using nixpacks.toml:

1. **In Railway service Settings → General**:
   - Set **Builder** to "Nixpacks" (not Docker)
   - **Root Directory**: Leave EMPTY
   - Clear any custom Build/Start commands

2. **Check Variables tab**:
   - Make sure NIXPACKS_CONFIG_PATH is NOT set
   - Railway should auto-detect ./nixpacks.toml

3. **If still using Docker**:
   - Delete the service and create a new one
   - Railway sometimes caches the builder type

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
