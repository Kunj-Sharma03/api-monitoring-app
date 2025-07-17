# Deployment Guide

This guide covers deploying the API Monitoring App to Vercel (frontend) and Render (backend).

## 🚀 Quick Deployment Steps

### Frontend Deployment (Vercel)

1. **Connect to Vercel**:
   ```bash
   cd frontend
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Configure Environment Variables in Vercel Dashboard**:
   - `NEXT_PUBLIC_API_URL`: Your backend URL (e.g., `https://your-app.onrender.com`)

3. **Automatic Deployment**: Vercel will auto-deploy on GitHub pushes

### Backend Deployment (Render)

1. **Connect Repository to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the repository root

2. **Configure Service**:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Node
   - **Plan**: Starter (free tier)

3. **Environment Variables** (Add in Render Dashboard):
   ```
   NODE_ENV=production
   PORT=8000
   JWT_SECRET=your-jwt-secret-here
   SESSION_SECRET=your-session-secret-here
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   ALERT_EMAIL_TO=admin@yourcompany.com
   CORS_ORIGIN=https://your-frontend.vercel.app
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   ```

4. **Database Setup**:
   - In Render, create a PostgreSQL database
   - Copy the `DATABASE_URL` to your environment variables

## 🔧 Manual Setup Alternative

### Option 1: Using Render Blueprint (Recommended)

1. Copy `render.yaml` to repository root
2. Update `CORS_ORIGIN` in `render.yaml` with your Vercel URL
3. Connect repository to Render using Blueprint

### Option 2: Docker Deployment

Backend includes a `Dockerfile` for container deployment:

```bash
cd backend
docker build -t api-monitoring-backend .
docker run -p 8000:8000 --env-file .env api-monitoring-backend
```

## 📝 Pre-Deployment Checklist

### Backend Security
- [ ] Set strong `JWT_SECRET` and `SESSION_SECRET`
- [ ] Configure proper `CORS_ORIGIN`
- [ ] Set up email service (Gmail App Password recommended)
- [ ] Configure database connection
- [ ] Test health endpoint: `/health`

### Frontend Configuration
- [ ] Update `NEXT_PUBLIC_API_URL` to point to deployed backend
- [ ] Verify Aurora background performance
- [ ] Test responsive design on mobile devices

### Database Setup
```sql
-- Create required tables (run in your PostgreSQL database)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE monitors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  method VARCHAR(10) DEFAULT 'GET',
  interval_minutes INTEGER DEFAULT 5,
  timeout_seconds INTEGER DEFAULT 30,
  expected_status INTEGER DEFAULT 200,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE monitor_logs (
  id SERIAL PRIMARY KEY,
  monitor_id INTEGER REFERENCES monitors(id),
  status VARCHAR(20) NOT NULL,
  response_time INTEGER,
  status_code INTEGER,
  error_message TEXT,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**: Update `CORS_ORIGIN` environment variable
2. **Database Connection**: Verify `DATABASE_URL` format
3. **Email Alerts**: Use Gmail App Password, not regular password
4. **Health Check Fails**: Ensure `/health` endpoint is accessible

### Environment Variable Format
```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=minimum-32-character-random-string
EMAIL_PASS=gmail-app-specific-password
CORS_ORIGIN=https://your-exact-frontend-url.vercel.app
```

### Testing Deployment

1. **Health Check**: `curl https://your-backend.onrender.com/health`
2. **CORS**: Test API calls from frontend
3. **Authentication**: Test login/register flows
4. **Monitoring**: Create a test monitor and verify alerts

## 📊 Production Monitoring

- **Backend Health**: Monitor `/health` endpoint
- **Database**: Track connection pool and query performance
- **Email Service**: Monitor alert delivery
- **Frontend**: Use Vercel Analytics for performance

## 🔐 Security Recommendations

1. **Secrets Management**: Use Render/Vercel secret management
2. **HTTPS Only**: Ensure all traffic uses HTTPS
3. **Rate Limiting**: Monitor API usage patterns
4. **Database**: Use connection pooling and read replicas if needed
5. **Monitoring**: Set up uptime monitoring for your monitoring app!

## 📈 Scaling Considerations

- **Database**: Consider connection pooling optimization
- **Background Jobs**: Monitor cron job performance
- **Email Queue**: Implement queue for high-volume alerts
- **Caching**: Add Redis for frequently accessed data

---

**Need Help?** Check the logs in Render Dashboard and Vercel Dashboard for detailed error information.
