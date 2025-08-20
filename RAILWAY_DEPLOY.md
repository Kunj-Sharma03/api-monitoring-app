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

### Important: Railway Settings
1. Create new service in Railway
2. Connect your GitHub repo  
3. **CRITICAL**: Leave Root Directory EMPTY (don't set it to backend)
4. **CRITICAL**: In service settings, ensure Builder is set to "Nixpacks"
5. Railway will use nixpacks.toml which handles backend setup automatically

### If Railway still doesn't use nixpacks.toml:
1. Go to service Settings → General
2. Manually set Builder to "Nixpacks" 
3. Clear any custom Build/Start commands
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
