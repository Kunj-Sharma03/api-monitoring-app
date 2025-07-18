# 🚀 AP-EYE: The API Monitor That Actually Cares

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-api--monitoring--app--5fob.vercel.app-blue?style=for-the-badge)](https://api-monitoring-app-5fob.vercel.app)
[![Backend Status](https://img.shields.io/badge/⚡_Backend-Railway.app-purple?style=for-the-badge)](https://api-monitoring-app-production.up.railway.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql)](https://postgresql.org/)

> *"Because your APIs deserve better than crossing your fingers and hoping for the best."*

## 🖼️ See It In Action

<div align="center">

### 📊 **Dashboard Overview**
![Dashboard Screenshot](screenshots/dashboard.png)
*Beautiful, responsive dashboard showing all your monitors at a glance*

### 📈 **Analytics & Insights**
![Analytics Screenshot](screenshots/analytics.png)
*Comprehensive analytics with real-time charts and performance metrics*

### 🚨 **Smart Alerts**
![Alerts Screenshot](screenshots/alerts.png)
*Intelligent alert system with detailed incident tracking*

<table>
<tr>
<td align="center">
<img src="screenshots/email-notification.png" alt="Email Notification" width="300"/>
<br><b>📧 Email Alerts</b>
<br><i>Professional email notifications</i>
</td>
<td align="center">
<img src="screenshots/alert-pdf.png" alt="PDF Report" width="300"/>
<br><b>📄 PDF Reports</b>
<br><i>Detailed incident reports</i>
</td>
</tr>
<tr>
<td align="center">
<img src="screenshots/mobile-dashboard.png" alt="Mobile View" width="300"/>
<br><b>📱 Mobile Ready</b>
<br><i>Responsive design for all devices</i>
</td>
<td align="center">
<img src="screenshots/landing-page.png" alt="Landing Page" width="300"/>
<br><b>🎨 Beautiful UI</b>
<br><i>Modern design with smooth animations</i>
</td>
</tr>
</table>

</div>

## 🎯 What Is This Thing?

Listen, we've all been there. You deploy your API, everything works perfectly on your machine (obviously), and then suddenly at 3 AM your users are flooding your inbox because your API decided to take an unscheduled vacation. **AP-EYE** is here to make sure you know about problems before your users do – because nobody likes angry customers, and nobody likes waking up to fire.

AP-EYE is a sleek, modern API monitoring application that watches your endpoints 24/7 and sends you beautiful PDF alerts via email when things go sideways. It's like having a very dedicated, never-sleeping intern whose only job is to ping your APIs and scream when they don't respond.

## 🌟 Features That'll Make You Go "Wow"

### 🔍 **Real-Time Monitoring**
- Monitor unlimited APIs (well, technically limited by your database, but who's counting?)
- Customizable check intervals (1-60 minutes, because checking every second is overkill)
- Smart failure detection with configurable thresholds
- Response time tracking because speed matters

### 📊 **Analytics Dashboard That Doesn't Suck**
- Beautiful charts that actually tell you useful information
- Uptime percentages that make you feel good (or bad) about your infrastructure
- Response time trends to spot performance issues before they become disasters
- Historical data because learning from the past is important

### 🚨 **Intelligent Alerting**
- Email notifications with gorgeous PDF reports (yes, we made PDFs pretty)
- 30-minute cooldown periods to prevent spam (your inbox will thank us)
- Detailed error messages that actually help you debug
- Status change tracking because context matters

### 🎨 **UI That Doesn't Make Your Eyes Bleed**
- Modern, responsive design that works on all devices
- Dark theme by default because we're not monsters
- Smooth animations powered by GSAP
- Mobile-first design with a collapsible sidebar

### 🔐 **Security That Actually Works**
- JWT-based authentication
- Bcrypt password hashing (because plaintext passwords are so 2005)
- Rate limiting to prevent abuse
- PostgreSQL with proper query sanitization

## ️ Tech Stack (The Good Stuff)

### Frontend
- **Next.js 15.3.4** - React framework that doesn't make you want to cry
- **Tailwind CSS** - Utility-first CSS that's actually useful
- **GSAP** - Animations so smooth they should be illegal
- **Chart.js** - Charts that look professional
- **ShadCN UI** - Components that don't need custom CSS to look good
- **SWR** - Data fetching that just works

### Backend
- **Node.js + Express** - The classic combo that never gets old
- **PostgreSQL** - A real database for real applications
- **JWT** - Authentication tokens that don't give you headaches
- **Nodemailer + Brevo** - Email that actually reaches inboxes
- **PDFKit** - PDF generation that doesn't require selling your soul
- **Node-cron** - Scheduled tasks that run when they're supposed to

### Infrastructure
- **Vercel** - Frontend hosting that deploys faster than you can say "build failed"
- **Railway** - Backend hosting that doesn't break the bank
- **PostgreSQL on Railway** - Database hosting that doesn't randomly disappear

## 🚀 Quick Start (For the Impatient)

### Prerequisites
- Node.js 18+ (because living in the past is overrated)
- PostgreSQL database (local or hosted, we don't judge)
- Email service credentials (Brevo/SendGrid/Gmail - pick your poison)
- A functioning keyboard and at least one working braincell

### 1. Clone & Install
```bash
git clone https://github.com/Kunj-Sharma03/api-monitoring-app.git
cd api-monitoring-app

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup
```sql
-- Create your PostgreSQL database and run the schema
-- (Check out the backend/db.js file for the complete schema)
-- Or use our setup script if you're feeling lazy
```

### 3. Environment Variables (The Boring But Important Part)

**Backend (.env):**
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication
JWT_SECRET=your-super-secret-jwt-key-that-is-at-least-32-characters-long

# Email Configuration (Brevo)
EMAIL_FROM=your-verified-email@domain.com
BREVO_SMTP_USER=your-brevo-smtp-user
BREVO_SMTP_PASS=your-brevo-smtp-password

# Monitoring
LOG_CLEANUP_DAYS=30
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### 4. Deploy & Pray
```bash
# Deploy backend to Railway
# Deploy frontend to Vercel
# Watch the magic happen
```

## 📱 How to Use (It's Easier Than You Think)

1. **Sign Up**: Create an account (we promise not to spam you)
2. **Add Monitors**: Enter your API endpoints to monitor
3. **Configure Settings**: Set check intervals and alert thresholds
4. **Watch the Magic**: Get beautiful email alerts when things break
5. **Analyze Trends**: Use the analytics dashboard to spot patterns
6. **Sleep Better**: Knowing your APIs are being watched 24/7

## 🏗️ Project Structure (For the Curious)

```
api-monitoring-app/
├── backend/                 # The brains of the operation
│   ├── routes/             # API endpoints that actually work
│   │   ├── auth.js         # Login/register magic
│   │   ├── monitor.js      # Monitor CRUD and PDF generation
│   │   └── analytics.js    # Data aggregation wizardry
│   ├── services/           # Background workers
│   │   └── monitorWorker.js # The hero that checks your APIs
│   ├── utils/              # Utility functions
│   │   ├── sendEmail.js    # Email sending that works
│   │   ├── generateAlertPDF.js # PDF generation artistry
│   │   └── validateEnv.js  # Environment validation
│   └── middleware/         # Request interceptors
│       ├── auth.js         # JWT validation
│       └── rateLimiter.js  # Spam prevention
├── frontend/               # The pretty face
│   ├── src/app/           # Next.js app directory
│   │   ├── dashboard/     # Main application interface
│   │   ├── login/         # Authentication pages
│   │   └── page.js        # Landing page with GSAP magic
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # ShadCN components
│   │   └── background/   # Fancy background effects
│   └── hooks/            # Custom React hooks
└── screenshots/          # Where you'll put the pretty pictures
```

## 🎨 Key Features Deep Dive

### Monitor Management
- **Create monitors** with custom names, URLs, and check intervals
- **Update settings** on the fly without downtime
- **Pause/resume** monitoring when you need to deploy
- **Delete monitors** with full cascade cleanup (no orphaned data)

### Smart Alerting System
- **Failure threshold detection**: Only alert after consecutive failures
- **Cooldown periods**: Prevent alert spam during extended outages
- **Rich email notifications**: HTML emails with PDF attachments
- **PDF reports**: Professional-looking incident reports with all the details

### Analytics & Insights
- **Uptime tracking**: See your availability over different time periods
- **Response time monitoring**: Track performance trends
- **Alert history**: Review past incidents and patterns
- **Monitor statistics**: Individual monitor performance metrics

### Email & PDF System
- **Professional PDF reports** with your branding
- **Email templates** that don't look like they're from 1995
- **Attachment support** for detailed incident reports
- **Multiple provider support** (Brevo, SendGrid, Gmail)

## 🚀 Deployment Guide

### Backend (Railway)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with automatic builds
4. Configure custom domain (optional but recommended)

### Frontend (Vercel)
1. Import project from GitHub
2. Set `NEXT_PUBLIC_API_URL` environment variable
3. Deploy with zero configuration
4. Enjoy automatic deployments on every push

### Database (Railway PostgreSQL)
1. Add PostgreSQL addon to your Railway project
2. Copy connection URL to your environment variables
3. Run database migrations (or let the app create tables automatically)

## 🐛 Troubleshooting (When Things Go Wrong)

### Common Issues & Solutions

**"CORS Error"**
- Solution: Update `CORS_ORIGIN` in backend environment variables

**"Email not sending"**
- Solution: Double-check your email provider credentials and quotas

**"Database connection failed"**
- Solution: Verify your `DATABASE_URL` format and network access

**"PDF generation failing"**
- Solution: Check file permissions and temp directory access

**"Charts not loading"**
- Solution: Clear browser cache and check console for JavaScript errors

## 🤝 Contributing (We Welcome New Victims)

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
6. Wait for our ruthless code review 😈

### Development Setup
```bash
# Backend development
cd backend
npm run dev  # Starts nodemon

# Frontend development
cd frontend
npm run dev  # Starts Next.js dev server with Turbopack
```

## 📊 Performance & Monitoring

- **Response Times**: Typically < 200ms for API endpoints
- **Uptime**: 99.9% uptime target (we practice what we preach)
- **Scalability**: Handles 1000+ monitors with 5-minute check intervals
- **Email Delivery**: < 30 seconds from alert trigger to inbox

## 🔮 Future Features (Coming Soon™)

- [ ] Slack/Discord integrations
- [ ] Custom alert rules with advanced conditions
- [ ] Multi-region monitoring
- [ ] Team collaboration features
- [ ] API for third-party integrations
- [ ] Mobile app (because everything needs an app)
- [ ] Webhook support for custom integrations
- [ ] Advanced analytics with AI-powered insights

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. Feel free to use it, modify it, break it, fix it, or whatever makes you happy.

## 🙋‍♂️ Support & Contact

- **Issues**: [GitHub Issues](https://github.com/Kunj-Sharma03/api-monitoring-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Kunj-Sharma03/api-monitoring-app/discussions)
- **Email**: [Contact the creator](mailto:your-email@domain.com)

## 🌟 Acknowledgments

- **ShadCN** for components that don't make us want to quit frontend development
- **Vercel** for hosting that just works
- **Railway** for backend hosting that doesn't break the bank
- **The open-source community** for building amazing tools we can stand on
- **Coffee** for keeping the developers alive during late-night coding sessions

---

<div align="center">

**Made with ❤️ and copious amounts of caffeine**

*If this project saved you from a 3 AM wake-up call, consider giving it a ⭐*

[⬆ Back to Top](#-ap-eye-the-api-monitor-that-actually-cares)

</div>
