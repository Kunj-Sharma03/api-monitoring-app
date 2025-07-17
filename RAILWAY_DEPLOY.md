# Railway Deployment Instructions

## 🚂 Quick Fix for Module Error

If you're getting "Cannot find module 'express-session'" error, follow these steps:

### 1. Railway Dashboard Settings
In your Railway project dashboard:

**Settings → Build & Deploy:**
- **Build Command**: `cd backend && npm ci --only=production`
- **Start Command**: `cd backend && npm start`
- **Root Directory**: Leave empty (use repository root)

### 2. Environment Variables
Add these in Railway Dashboard → Variables tab:

⚠️ **Copy values from your local `backend/.env` file:**

```
NODE_ENV=production
PORT=8000
DATABASE_URL=(copy from .env)
JWT_SECRET=(copy from .env)
EMAIL_FROM=(copy from .env)
BREVO_SMTP_USER=(copy from .env)
BREVO_SMTP_PASS=(copy from .env)
LOG_CLEANUP_DAYS=7
GOOGLE_CLIENT_ID=(copy from .env)
GOOGLE_CLIENT_SECRET=(copy from .env)
SESSION_SECRET=(copy from .env)
```

### 3. Manual Redeploy
After updating settings:
- Go to **Deployments** tab
- Click **"Redeploy"** to trigger a fresh build

### 4. Common Issues & Solutions

**Problem**: "Cannot find module" errors
**Solution**: Make sure build command includes `cd backend &&` prefix

**Problem**: Build fails
**Solution**: Use `npm ci --only=production` instead of `npm install`

**Problem**: Wrong directory
**Solution**: Ensure all commands start with `cd backend &&`

### 5. Testing
Once deployed successfully:
- Health check: `https://your-app.railway.app/health`
- Should return: `{"status":"OK", ...}`

---
**Next Step**: Deploy frontend to Vercel pointing to your Railway URL!
