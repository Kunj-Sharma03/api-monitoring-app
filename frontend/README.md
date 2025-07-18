# 🎨 AP-EYE Frontend

The frontend React application for AP-EYE API monitoring, built with Next.js 15, Tailwind CSS, and modern animations.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Running backend server (see backend README)

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the frontend directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run Development Server
```bash
# Development with Turbopack (faster builds)
npm run dev

# Opens at http://localhost:3000
```

### 4. Build for Production
```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

## 🎯 Key Features

### 🔐 Authentication
- **Login/Register** - JWT-based authentication with form validation
- **Protected Routes** - Automatic redirection for unauthorized users
- **Token Management** - Secure token storage and auto-refresh

### 📊 Dashboard
- **Monitor Overview** - Cards showing all your monitored APIs
- **Real-time Status** - Live status indicators (UP/DOWN)
- **Quick Actions** - Edit, delete, pause monitors
- **Statistics** - Total monitors, active count, recent alerts

### 📈 Analytics
- **Interactive Charts** - Powered by Chart.js with custom styling
- **Time Range Selection** - 7 days, 30 days, 90 days views
- **Uptime Trends** - Visual uptime percentage over time
- **Response Time** - Performance tracking with averages
- **Alert History** - Historical incident data

### 🚨 Alerts Management
- **Alert List** - All incidents with search and filtering
- **Alert Details** - Modal with full incident information
- **PDF Downloads** - Download detailed incident reports
- **Delete/Archive** - Manage old alerts

### 🎨 UI/UX Features
- **Responsive Design** - Works perfectly on mobile and desktop
- **Dark Theme** - Easy on the eyes, professional look
- **Smooth Animations** - GSAP-powered transitions and effects
- **Loading States** - Skeleton loaders and smooth transitions
- **Error Handling** - User-friendly error messages

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.js            # Landing page with animations
│   │   ├── login/             # Authentication pages
│   │   ├── register/          
│   │   └── dashboard/         # Main application
│   │       ├── page.js        # Dashboard home
│   │       ├── analytics/     # Analytics & charts
│   │       ├── alerts/        # Alert management
│   │       ├── monitors/      # Monitor management
│   │       └── layout.js      # Dashboard layout with sidebar
│   ├── components/            # Reusable components
│   │   ├── ui/               # ShadCN UI components
│   │   │   ├── button.jsx    # Custom button component
│   │   │   ├── Chart.jsx     # Chart wrapper component
│   │   │   ├── cardSwap.jsx  # Animated card component
│   │   │   └── sidebar.jsx   # Navigation sidebar
│   │   └── background/       # Background effects
│   │       ├── Aurora.jsx    # Aurora background effect
│   │       └── Silk.jsx      # Silk shader background
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuthToken.js   # Authentication state
│   │   └── useMonitorsSWR.js # SWR data fetching
│   └── utils/                # Utility functions
│       └── api.js            # API helper functions
├── public/                   # Static assets
│   └── logo192.png          # App logo
└── tailwind.config.js       # Tailwind configuration
```

## 🎨 Design System

### Colors & Theming
```css
/* CSS Variables used throughout the app */
:root {
  --color-bg: #0f0f23;           /* Background */
  --color-surface: #1a1a2e;      /* Cards & surfaces */
  --color-border: #16213e;       /* Borders */
  --color-primary: #3b82f6;      /* Primary blue */
  --color-text-primary: #f9fafb; /* Main text */
  --color-text-secondary: #9ca3af; /* Secondary text */
  --color-hover: #374151;        /* Hover states */
  --color-error: #ef4444;        /* Error states */
}
```

### Components
- **ShadCN UI** - High-quality, accessible components
- **Custom Animations** - GSAP-powered smooth transitions
- **Responsive Grid** - CSS Grid and Flexbox layouts
- **Mobile-First** - Designed for mobile, enhanced for desktop

## 🛠️ Development

### Available Scripts
```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Key Dependencies
- **Next.js 15.3.4** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **Tailwind CSS** - Utility-first CSS framework
- **GSAP** - Professional animation library
- **Chart.js** - Beautiful charts and graphs
- **SWR** - Data fetching with caching
- **Lucide React** - Beautiful icon library

### Development Tips

**Hot Reload:**
```bash
# Turbopack gives near-instant hot reloads
npm run dev
```

**Component Development:**
```bash
# Components are in src/components/ui/
# Use ShadCN patterns for consistency
```

**API Integration:**
```javascript
// All API calls go through utils/api.js
import { loginUser } from '@/utils/api';
```

**Styling Guidelines:**
```javascript
// Use Tailwind classes, CSS variables for colors
className="bg-[var(--color-surface)] text-[var(--color-text-primary)]"
```

## 📱 Pages & Features

### Landing Page (`/`)
- **Hero Section** - Animated introduction with GSAP
- **CardSwap Demo** - Interactive card animation
- **Features Overview** - What the app does
- **CTA Buttons** - Sign up / Learn more

### Authentication (`/login`, `/register`)
- **Form Validation** - Real-time validation feedback
- **Error Handling** - Clear error messages
- **Auto-redirect** - After successful auth
- **Responsive Design** - Works on all devices

### Dashboard (`/dashboard`)
- **Monitor Cards** - Visual status of all monitors
- **Statistics** - Key metrics at a glance
- **Quick Actions** - Add, edit, delete monitors
- **Recent Activity** - Latest alerts and status changes

### Analytics (`/dashboard/analytics`)
- **Time Range Picker** - 7d, 30d, 90d views
- **Uptime Charts** - Line charts with trends
- **Response Time** - Performance over time
- **Alert History** - Bar charts of incidents

### Alerts (`/dashboard/alerts`)
- **Alert List** - Searchable and filterable
- **Status Badges** - Visual status indicators
- **Alert Details** - Modal with full information
- **PDF Downloads** - Incident reports

## 🔧 Configuration

### Environment Variables
```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:5000

# Optional (for production)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Tailwind Configuration
Custom configuration in `tailwind.config.js`:
- Extended color palette
- Custom animations
- Component-specific utilities

### Next.js Configuration
Optimized `next.config.mjs`:
- Image optimization
- Bundle analysis
- Performance optimizations

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Connect GitHub repository
# Set NEXT_PUBLIC_API_URL environment variable
# Deploy automatically on push
```

### Manual Deployment
```bash
npm run build
npm start
# Serves on configured port
```

### Build Optimization
- **Automatic Bundle Splitting** - Next.js optimizes bundles
- **Image Optimization** - Built-in image optimization
- **Static Generation** - Pre-renders pages where possible

## 🐛 Troubleshooting

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**API Connection Issues:**
```bash
# Check backend is running
curl http://localhost:5000/health

# Verify environment variables
echo $NEXT_PUBLIC_API_URL
```

**Animation Issues:**
```bash
# GSAP requires client-side rendering
# Ensure components using GSAP are marked 'use client'
```

**Chart Not Loading:**
```bash
# Chart.js needs window object
# Components with charts need 'use client' directive
```

## 🎨 Customization

### Adding New Pages
```bash
# Create new page in src/app/
mkdir src/app/new-page
touch src/app/new-page/page.js
```

### Custom Components
```bash
# Add to src/components/
# Follow ShadCN patterns for consistency
```

### Styling Changes
```bash
# Update CSS variables in globals.css
# Use Tailwind utilities in components
```

## 📝 License

MIT License - see the main project README for details.
