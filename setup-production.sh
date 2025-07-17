#!/bin/bash

# Production Environment Setup Script
# Run this script to set up your production environment variables

echo "🚀 API Monitoring App - Production Setup"
echo "========================================"

# Frontend Environment Variables
echo ""
echo "📱 Frontend Environment Setup (Vercel)"
echo "Copy and paste these in your Vercel Dashboard:"
echo ""
echo "NEXT_PUBLIC_API_URL=https://your-backend-app.onrender.com"
echo ""

# Backend Environment Variables
echo "🔧 Backend Environment Setup (Render)"
echo "Copy and paste these in your Render Dashboard:"
echo ""

# Generate secure secrets
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

echo "NODE_ENV=production"
echo "PORT=8000"
echo "JWT_SECRET=$JWT_SECRET"
echo "SESSION_SECRET=$SESSION_SECRET"
echo ""
echo "# Database (will be auto-populated if using Render PostgreSQL)"
echo "DATABASE_URL=postgresql://username:password@host:port/database"
echo ""
echo "# Email Configuration (required for alerts)"
echo "EMAIL_USER=your-email@gmail.com"
echo "EMAIL_PASS=your-gmail-app-password"
echo "EMAIL_FROM=your-email@gmail.com"
echo "ALERT_EMAIL_TO=admin@yourcompany.com"
echo "SMTP_HOST=smtp.gmail.com"
echo "SMTP_PORT=587"
echo "SMTP_SECURE=false"
echo ""
echo "# Security"
echo "CORS_ORIGIN=https://your-frontend.vercel.app"
echo ""
echo "# Performance"
echo "RATE_LIMIT_WINDOW_MS=900000"
echo "RATE_LIMIT_MAX=100"
echo "MONITOR_INTERVAL=60000"
echo "DEFAULT_TIMEOUT=30000"
echo ""

echo "📝 Next Steps:"
echo "1. Replace placeholder values with your actual configuration"
echo "2. Set up Gmail App Password: https://support.google.com/accounts/answer/185833"
echo "3. Deploy backend to Render with these environment variables"
echo "4. Deploy frontend to Vercel with the frontend environment variable"
echo "5. Update CORS_ORIGIN and NEXT_PUBLIC_API_URL with actual URLs"
echo ""
echo "🔗 Quick Links:"
echo "- Render Dashboard: https://dashboard.render.com"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- Gmail App Passwords: https://myaccount.google.com/apppasswords"
echo ""
echo "✅ Ready for deployment!"
