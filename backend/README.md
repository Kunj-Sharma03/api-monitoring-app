# 🔧 AP-EYE Backend

The backend API server for AP-EYE API monitoring application, built with Node.js, Express, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (local or hosted)
- Email service credentials (Brevo/SendGrid/Gmail)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database - Replace with your PostgreSQL connection string
DATABASE_URL=postgresql://username:password@localhost:5432/api_monitoring

# Authentication - Generate a secure random string (32+ characters)
JWT_SECRET=your-super-secret-jwt-key-that-is-at-least-32-characters-long

# Email Configuration (using Brevo as example)
EMAIL_FROM=your-verified-email@domain.com
BREVO_SMTP_USER=your-brevo-smtp-user
BREVO_SMTP_PASS=your-brevo-smtp-password

# Monitoring Settings
LOG_CLEANUP_DAYS=30
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
MONITOR_INTERVAL=60000
DEFAULT_TIMEOUT=30000
```

### 3. Database Setup

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# Create database
createdb api_monitoring

# The app will automatically create tables on first run
```

**Option B: Use Railway/Supabase/etc.**
```bash
# Just update the DATABASE_URL in your .env file
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

### 4. Email Provider Setup

**Brevo (Recommended):**
1. Sign up at [brevo.com](https://brevo.com)
2. Get SMTP credentials from Settings > SMTP & API
3. Add credentials to `.env` file

**Gmail Alternative:**
```env
EMAIL_FROM=your-gmail@gmail.com
BREVO_SMTP_USER=your-gmail@gmail.com
BREVO_SMTP_PASS=your-app-specific-password
```

### 5. Run the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/me` - Get current user (requires auth)

### Monitors
- `GET /api/monitor/all` - Get all user monitors
- `POST /api/monitor/create` - Create new monitor
- `PUT /api/monitor/:id/update` - Update monitor
- `DELETE /api/monitor/:id` - Delete monitor
- `GET /api/monitor/:id/stats` - Get monitor statistics
- `GET /api/monitor/:id/logs` - Get monitor logs

### Alerts
- `GET /api/monitor/alerts` - Get all user alerts
- `DELETE /api/monitor/alert/:id` - Delete alert
- `GET /api/monitor/:monitorId/alert/:alertId/pdf` - Download alert PDF

### Analytics
- `GET /api/analytics/overview` - Overview statistics
- `GET /api/analytics/monitor-stats` - Monitor performance stats
- `GET /api/analytics/uptime-history` - Uptime trends
- `GET /api/analytics/response-time` - Response time trends
- `GET /api/analytics/alerts-history` - Alert history

## 🏗️ Project Structure

```
backend/
├── index.js                 # Main server entry point
├── db.js                   # Database connection & queries
├── worker.js               # Background monitoring cron job
├── routes/                 # API route handlers
│   ├── auth.js            # Authentication endpoints
│   ├── monitor.js         # Monitor CRUD & alerts
│   └── analytics.js       # Analytics & reporting
├── middleware/            # Express middleware
│   ├── auth.js           # JWT authentication
│   └── rateLimiter.js    # Request rate limiting
├── services/             # Background services
│   └── monitorWorker.js  # Monitor checking logic
└── utils/               # Utility functions
    ├── sendEmail.js     # Email sending
    ├── generateAlertPDF.js # PDF generation
    └── validateEnv.js   # Environment validation
```

## 🔍 Key Features

### Monitor Worker
- Runs every 5 seconds to check all active monitors
- Configurable check intervals per monitor (1-60 minutes)
- Smart failure detection with consecutive failure thresholds
- Response time tracking and status code monitoring

### Email Alerts
- Beautiful HTML email notifications
- PDF attachment with detailed incident reports
- 30-minute cooldown to prevent spam
- Multiple email provider support

### Database Schema
- **users** - User accounts with bcrypt password hashing
- **monitors** - API endpoints to monitor
- **monitor_logs** - Historical check results
- **alerts** - Alert records with status changes

### Security Features
- JWT token authentication
- Bcrypt password hashing
- SQL injection prevention with parameterized queries
- Rate limiting on all endpoints
- CORS configuration

## 🐛 Development Tips

### Testing Email Locally
```bash
# Test email sending
node testEmail.js
```

### Database Debugging
```bash
# Connect to your database
psql $DATABASE_URL

# View tables
\dt

# Check monitor logs
SELECT * FROM monitor_logs ORDER BY timestamp DESC LIMIT 10;
```

### Environment Validation
The app validates all required environment variables on startup. If something's missing, you'll see a clear error message.

### Background Worker
The monitor worker runs automatically when you start the server. Check the console for monitoring activity:
```
[2025-07-18T10:30:00.000Z] Running monitor check...
✅ Monitor check completed - 5 monitors checked
```

## 🚀 Production Deployment

### Railway (Recommended)
1. Connect your GitHub repository
2. Add environment variables in Railway dashboard
3. Deploy automatically on push

### Manual Deployment
```bash
# Build and start
npm install --production
npm start
```

### Health Check
```bash
curl http://localhost:5000/health
# Should return: {"status":"OK","timestamp":"..."}
```

## 🔧 Troubleshooting

**Database Connection Issues:**
```bash
# Test connection
node -e "const {pool} = require('./db'); pool.query('SELECT NOW()').then(r => console.log('✅ DB Connected:', r.rows[0]))"
```

**Email Not Sending:**
- Check email provider credentials
- Verify `EMAIL_FROM` is a verified sender
- Check rate limits and quotas

**Worker Not Running:**
- Check console for cron job logs
- Verify monitors exist in database
- Check for JavaScript errors

## 📝 License

MIT License - see the main project README for details.
