# Yatraverse (GlobeTrotter) - Comprehensive Implementation Plan

> **File Location**: `implementation_plan.md`  
> **Paired With**: `progress.md` (which tracks real-time execution status)  
> **Objective**: Complete all features from Problem Statement 1 (GlobeTrotter) with a full relational database backend and 100% free production deployment.

---

## 1. Executive Summary & Architecture

GlobeTrotter (Yatraverse) is an end-to-end personalized travel planning platform. This plan details how all missing frontend features, relational database models, REST API endpoints, AI enhancements, and free deployment pipelines are engineered.

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (SPA)                       │
│  React 18 + Vite + Tailwind CSS + Lucide + Leaflet + i18n   │
│  Deployed on Vercel / Render Static (100% Free)             │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API LAYER                        │
│  Node.js + Express.js + JWT Auth + Prisma ORM               │
│  Deployed on Render Web Service (100% Free Tier)            │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│    RELATIONAL DATABASE       │ │      AI / GENAI LAYER      │
│  SQLite (dev)                │ │  Google Gemini 1.5 Flash   │
│  Supabase/Neon Postgres(prod)│ │  via Google AI Studio      │
│  (500MB Free Tier forever)   │ │  (100% Free: 15 RPM, 0$)   │
└──────────────────────────────┘ └────────────────────────────┘
```

---

## 2. Tools & Technologies Matrix (With Free-Tier Guarantees)

| Tool / Technology | Purpose | Free-Tier Details |
|---|---|---|
| **React 18 + Vite** | High-performance SPA frontend | Open-source, zero cost |
| **Tailwind CSS + Glassmorphism** | Responsive styling, dark theme, modern typography | Open-source, zero cost |
| **Leaflet & React-Leaflet** | Interactive route maps & destination markers | OpenStreetMap tiles (100% free, no API keys or billing) |
| **Recharts** | Expense breakdown donut/bar charts & admin analytics | Open-source, zero cost |
| **@dnd-kit** | Drag-and-drop reordering for itinerary stops & timeline | Open-source, zero cost |
| **qrcode.react** | Dynamic QR code generation for trip sharing | Open-source, zero cost |
| **date-fns** | Date manipulation, calendar generation, formatting | Open-source, zero cost |
| **i18next + react-i18next** | Multi-language localization (EN, HI, ES, FR) | Open-source, zero cost |
| **Node.js + Express.js** | Backend REST API server | Open-source, zero cost |
| **Prisma ORM** | Type-safe relational database schema & migrations | Open-source, zero cost |
| **SQLite (Local Dev)** | Zero-configuration relational database file | Embedded, zero cost |
| **Neon.tech / Supabase (Prod DB)** | Cloud PostgreSQL relational database | Permanent 500MB free PostgreSQL tier (No credit card) |
| **Google Gemini 1.5 Flash** | AI Natural Language Itinerary Generation & Optimization | Google AI Studio free tier (15 requests/min, $0) |
| **Vercel / Render** | Production deployment of frontend & backend | Permanent free tiers with SSL and automatic CI/CD |

---

## 3. Relational Database Schema Design (`server/prisma/schema.prisma`)

```prisma
datasource db {
  provider = "sqlite" // Easily changed to "postgresql" via DATABASE_URL in production
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String             @id @default(uuid())
  email         String             @unique
  passwordHash  String
  name          String
  avatarUrl     String?
  role          String             @default("user") // "user" | "admin"
  persona       String?
  language      String             @default("en")
  currency      String             @default("INR")
  isSuspended   Boolean            @default(false)
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt
  trips         Trip[]
  savedCities   SavedDestination[]
}

model City {
  id          String             @id
  name        String
  country     String
  iata        String
  lat         Float
  lng         Float
  image       String
  description String
  costIndex   Int
  popularity  Int
  region      String
  bestSeason  String
  activities  Activity[]
  stops       Stop[]
  savedBy     SavedDestination[]
}

model Activity {
  id             String         @id
  cityId         String
  city           City           @relation(fields: [cityId], references: [id], onDelete: Cascade)
  name           String
  type           String         // "sightseeing", "food", "adventure", "culture", "nightlife"
  cost           Float
  durationMin    Int
  rating         Float
  description    String
  image          String
  stopActivities StopActivity[]
}

model Trip {
  id           String        @id @default(uuid())
  userId       String
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  name         String
  description  String?
  startDate    String
  endDate      String
  coverUrl     String
  isPublic     Boolean       @default(false)
  shareSlug    String        @unique
  budgetCap    Float         @default(200000)
  notes        String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  stops        Stop[]
  expenses     Expense[]
}

model Stop {
  id             String         @id @default(uuid())
  tripId         String
  trip           Trip           @relation(fields: [tripId], references: [id], onDelete: Cascade)
  cityId         String
  city           City           @relation(fields: [cityId], references: [id])
  startDate      String
  endDate        String
  orderIndex     Int
  stopActivities StopActivity[]
}

model StopActivity {
  id           String   @id @default(uuid())
  stopId       String
  stop         Stop     @relation(fields: [stopId], references: [id], onDelete: Cascade)
  activityId   String
  activity     Activity @relation(fields: [activityId], references: [id])
  dayDate      String
  startTime    String
  notes        String?
  costOverride Float?
  orderIndex   Int      @default(0)
}

model Expense {
  id       String   @id @default(uuid())
  tripId   String
  trip     Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  category String   // "stay", "transport", "food", "activities", "other"
  amount   Float
  currency String   @default("INR")
  notes    String?
  date     String
}

model SavedDestination {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  cityId    String
  city      City     @relation(fields: [cityId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, cityId])
}
```

---

## 4. Work Breakdown Structure (Phases & Deliverables)

### Phase 1: Missing Frontend Screens & AI Enhancements (Immediate)

#### 1.1 Public Shared Itinerary Screen (`/s/:slug`)
- **File**: `src/pages/PublicTripPage.jsx`
- **Route**: `<Route path="/s/:slug" element={<PublicTripPage />} />` (Open to guests & logged-in users)
- **Features**:
  - Read-only visual day-by-day plan with weather, stops, and activities.
  - Interactive Leaflet route map showing city connections.
  - Cost summary and budget highlights.
  - **"Copy Trip" CTA**: Clones the full itinerary into the user's account using `cloneTrip()` or prompts signup/login.
  - **Social Sharing**: One-click sharing buttons for WhatsApp, X (Twitter), LinkedIn, native Web Share, and a QR code modal.

#### 1.2 User Profile & Settings Screen (`/profile`)
- **File**: `src/pages/ProfilePage.jsx`
- **Route**: `<Route path="/profile" element={<ProfilePage />} />` (inside `ProtectedShell`)
- **Features**:
  - Editable user profile: Name, Email, Avatar URL / file picker.
  - Language preference selector with `react-i18next` support.
  - Currency selector (`INR`, `USD`, `EUR`, `GBP`).
  - Travel persona badge and option to retake the quiz.
  - Saved Destinations (wishlist) list with quick "Plan Trip" button.
  - Danger zone: "Delete Account" modal with confirmation.

#### 1.3 AI Travel Assistant Screen (`/ai`)
- **File**: `src/pages/AIAssistantPage.jsx`
- **Route**: `<Route path="/ai" element={<AIAssistantPage />} />`
- **Features**:
  - Natural language prompt: e.g., *"10-day food and cultural trip to Southeast Asia under ₹1,50,000 for 2 people"*.
  - Guided parameter chips: Destination, Duration, Budget, Travelers, Persona/Interests.
  - Streaming AI response generating full multi-city stop schedule and activity recommendations.
  - **"Turn into Itinerary" button**: Parses the AI output and directly creates a real trip record in the database, navigating straight to the builder.

#### 1.4 AI Itinerary Optimizer (in Trip Builder)
- **File**: `src/features/ai/TripOptimizerModal.jsx` embedded in `TripBuildPage.jsx` & `TripViewPage.jsx`
- **Features**:
  - Triggers AI analysis on current stops, travel dates, and activity distribution.
  - Provides 4 actionable suggestions:
    1. Geographic reordering (eliminating backtracking).
    2. Cost reduction (switching stay tiers).
    3. Pacing balance (avoiding overloaded days).
    4. Activity personalization (tailoring to user's persona).
  - "Apply Suggestions" button that instantly recalculates and reorders stops in the database.

#### 1.5 Admin / Analytics Dashboard (`/admin`)
- **File**: `src/pages/AdminPage.jsx`
- **Route**: `<Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />`
- **Features**:
  - Platform KPI cards: Total registered users, total trips created, DAU, MAU, average trip duration.
  - Trips growth over time chart (Recharts Area/Bar chart).
  - Top visited cities and top booked activities leaderboards.
  - User management table with Suspend/Unsuspend toggle and Delete user action.

---

### Phase 2: Relational Database & Express Backend (`server/`)

#### 2.1 Backend Project Setup
- Path: `server/`
- Dependencies: `express`, `cors`, `dotenv`, `bcryptjs`, `jsonwebtoken`, `@prisma/client`, `prisma`.
- Scripts: `npm run dev`, `npm run seed`, `npm run migrate`.

#### 2.2 REST API Specification
- **Auth**:
  - `POST /api/auth/register` - Create account with hashed password
  - `POST /api/auth/login` - Authenticate & return JWT
  - `GET /api/auth/me` - Get current session
  - `PUT /api/auth/profile` - Update profile & preferences
  - `DELETE /api/auth/account` - Delete account and cascade delete trips
- **Trips**:
  - `GET /api/trips` - Get user trips
  - `POST /api/trips` - Create trip
  - `GET /api/trips/:id` - Get trip with stops and activities
  - `PUT /api/trips/:id` - Update trip details / budget
  - `DELETE /api/trips/:id` - Delete trip
  - `GET /api/trips/share/:slug` - Public view by slug
  - `POST /api/trips/:id/clone` - Duplicate trip to authenticated user
- **Stops & Activities**:
  - `POST /api/trips/:id/stops` - Add stop
  - `PUT /api/trips/:id/stops/reorder` - Reorder stops array
  - `POST /api/stops/:id/activities` - Pin activity to stop
  - `DELETE /api/stops/activities/:id` - Remove activity from stop
- **Catalog & Wishlist**:
  - `GET /api/cities` - List all cities with filters
  - `GET /api/activities` - List activities with filters
  - `POST /api/saved-destinations` - Toggle wishlist
- **AI Endpoints**:
  - `POST /api/ai/generate` - Generate itinerary with Gemini / Heuristic engine
  - `POST /api/ai/optimize` - Optimize trip itinerary
  - `POST /api/ai/chat` - Context-aware chatbot
- **Admin**:
  - `GET /api/admin/stats` - Analytics metrics
  - `PUT /api/admin/users/:id/suspend` - Suspend/activate user
  - `DELETE /api/admin/users/:id` - Remove user

#### 2.3 Resilient Hybrid Client
- The frontend client checks if the backend API is reachable at `http://localhost:5000/api` (or production URL).
- If connected, it queries the relational database.
- If offline, it smoothly uses the Zustand local store, guaranteeing zero downtime or demo failure.

---

### Phase 3: Zero-Cost Deployment Guide

#### 1. Free Cloud Database (PostgreSQL)
1. Go to **Neon.tech** or **Supabase** (both offer 100% free PostgreSQL without credit card).
2. Create a free project named `yatraverse`.
3. Copy the database connection URL into `server/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host/yatraverse?sslmode=require"
   ```
4. Run `npx prisma db push` to create all tables in seconds.

#### 2. Free Backend Hosting (Render)
1. Go to **render.com** and create a free Web Service connected to the GitHub repo.
2. Root directory: `server`
3. Build command: `npm install && npx prisma generate`
4. Start command: `node index.js`
5. Environment Variables:
   - `DATABASE_URL`: Your Supabase/Neon PostgreSQL URL
   - `JWT_SECRET`: A secure random string
   - `GEMINI_API_KEY`: Google AI Studio free API key

#### 3. Free Frontend Hosting (Vercel)
1. Go to **vercel.com** and import the GitHub repo.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment Variables:
   - `VITE_API_URL`: Your deployed Render backend URL (e.g. `https://yatraverse-api.onrender.com`)
   - `VITE_AI_API_KEY`: Your free Gemini API key (optional for client fallback)

---

## 5. Continuity & Handover Instructions for Agents

If any token limit is hit or another AI agent is opened:
1. **Read `progress.md`** first to check current status and recently completed items.
2. **Read `implementation_plan.md`** (this file) for architectural specifications, schema, and API contracts.
3. Every task finished should update the checklist in `progress.md`.
