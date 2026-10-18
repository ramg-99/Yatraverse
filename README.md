# 🌍 Yatraverse (GlobeTrotter) — Personalised Travel Planning Universe

> An intelligent, full-stack travel planning platform built with React 18, Vite, Tailwind CSS, Express.js, Prisma, and Gemini AI.

---

## ✨ Features

- 🗺️ **Multi-City Itinerary Builder**: Visual stop planner with drag-and-drop reordering (`@dnd-kit`), interactive Leaflet route maps, and timeline scheduling.
- 🤖 **AI Travel Assistant**: Generates customized multi-city itineraries from natural language prompts, with 1-click conversion to active trips.
- ⚡ **AI Itinerary Optimizer**: Analyzes existing itineraries to eliminate geographic backtracking, balance pacing, and reduce accommodation expenses.
- 📊 **Dynamic Budget Analytics**: Real-time spending breakdown (Stays, Transport, Food, Activities) with Recharts pie/bar charts and overbudget alerts.
- 🔗 **Public Shared Itineraries**: Shareable `/s/:slug` routes with interactive maps, day-by-day itineraries, instant "Clone Trip" capability, and SVG QR codes.
- 📍 **Catalog & Wishlist**: Search 15+ curated world cities and 25+ activities with cost, duration, and category filters.
- 👤 **Traveller Profile & Settings**: Custom avatars, multilingual interface (English, Hindi, Spanish, French), currency selector, and saved wishlist.
- 🛡️ **Admin Analytics Dashboard**: System KPI metrics (active users, trips, average duration), trip volume charts, and user account management.
- 💬 **Conversational AI Dock**: Persistent contextual assistant with awareness of active trip details.

---

## 🛠️ Tech Stack & 100% Free Production Architecture

| Layer | Technology | Free Tier / Production Provider |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion, Recharts, React-Leaflet | **Vercel / Netlify / Render** (Unlimited free deployments) |
| **Backend API** | Node.js, Express.js, REST API | **Render** (Free Web Service tier) |
| **Database** | Relational SQL via **Prisma ORM** (SQLite for local dev, PostgreSQL for production) | **Neon.tech / Supabase** (500MB free PostgreSQL) |
| **AI / GenAI** | Google Gemini 1.5 Flash + Heuristic Fallback Engine | **Google AI Studio** (100% Free: 1,500 req/day) |
| **Auth** | JWT (JSON Web Tokens) with bcrypt password hashing | Self-hosted Express (Free) |
| **Maps & QR** | OpenStreetMap / Leaflet, `qrcode.react` | Open-source, zero API cost |

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ installed
- npm or pnpm

### 2. Frontend Setup
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/yatraverse.git
cd yatraverse

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

### 3. Backend Setup
```bash
cd server

# Install dependencies
npm install

# Initialize and seed database
npm run setup

# Start Express API server (runs on http://localhost:5000)
npm run dev
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Demo Traveler** | `demo@yatraverse.app` | `demo1234` |
| **Admin User** | `admin@yatraverse.app` | `admin1234` |

*(You can also click **"Explore as Guest"** on the login page for instant 1-click access!)*

---

## ☁️ Zero-Cost Cloud Deployment Guide

### Step 1: Free Cloud Database (Neon / Supabase)
1. Sign up at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com) (free PostgreSQL, no credit card required).
2. Create a project named `yatraverse`.
3. Copy your PostgreSQL connection string into `server/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host/yatraverse?sslmode=require"
   ```
4. Run `npx prisma db push` to create all tables in seconds.

### Step 2: Deploy Backend to Render (Free Web Service)
1. Go to [render.com](https://render.com) and create a **Web Service** connected to your repo.
2. Root Directory: `server`
3. Build Command: `npm install && npx prisma generate`
4. Start Command: `node index.js`
5. Add Environment Variables:
   - `DATABASE_URL`: Your Neon/Supabase PostgreSQL connection string
   - `JWT_SECRET`: A secure random secret
   - `GEMINI_API_KEY`: Your free Gemini API key from Google AI Studio

### Step 3: Deploy Frontend to Vercel (Free)
1. Go to [vercel.com](https://vercel.com) and import the repo.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: Your deployed Render API URL (e.g. `https://yatraverse-api.onrender.com`)

---

## 📄 License
MIT License. Built for hackathons & competitions.
