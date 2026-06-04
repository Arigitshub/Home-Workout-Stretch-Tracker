# FitTrack: Interactive Home Workout & Stretch Tracker

FitTrack is a premium, state-of-the-art web application designed to guide users through home workouts, dynamic stretching routines, and bicep/shoulder dumbbell resistance training. 

Featuring fully interactive countdowns, Web Audio synthesizers, speech instructions, custom routine playlist builders, streaks tracker, and an automatic sync connection with a Neon PostgreSQL cloud database.

---

## ✨ Features

- **🏠 Interactive Dashboard**: Tracks your daily goals (Active Minutes, Stretches, Calories Burned) via a sleek glassmorphic target activity ring dashboard. Displays active streaks and level XP.
- **🔊 Guided Workout Player**: Walk step-by-step through exercises. Integrates:
  - **Speech Synthesis**: Speaks out exercise instructions and rest transitions ("Next up: Goblet Squats with 20 pounds. Go!").
  - **Audio Synthesis**: Synthesizes count-down beeps for final seconds using the Web Audio API.
  - **Player Controls**: Pause, skip, jump back, and live progress bars.
- **🏋️ Pre-Workout Dumbbell Weight Config**: Automatically detects dumbbell movements and opens a pre-workout overlay to adjust weights (in lbs) for individual steps.
- **➕ Custom Routine Builder**: Search the exercise catalog, add steps, specify custom durations (seconds), configure dumbbell weights, and drag/arrange sequence order.
- **📈 Analytics & History**: Weekly performance bars using Recharts, coupled with a searchable, filterable historical log of completed workouts.
- **🟢 Neon PostgreSQL Database Integration**: Syncs profile settings, custom routines, and workout logs automatically to Neon. Falls back to LocalStorage cache if offline.

---

## 🛠️ Technology Stack

- **Frontend**: React (v18), TypeScript, TailwindCSS (v3.4), Recharts (v2.15), Lucide Icons
- **Backend API**: Node.js, Express, CORS
- **Database**: PostgreSQL (hosted on [Neon.tech](https://neon.tech))
- **Environment**: Dotenv, Concurrently

---

## 📅 Database Schema

The database automatically provisions these tables on backend startup:

### 1. `user_profile`
- `id` (INTEGER PRIMARY KEY)
- `name` (VARCHAR)
- `xp` (INTEGER)
- `daily_minutes_goal` (INTEGER)
- `daily_stretches_goal` (INTEGER)
- `weight_kg` (INTEGER)

### 2. `custom_routines`
- `id` (VARCHAR PRIMARY KEY)
- `title` (VARCHAR)
- `description` (TEXT)
- `duration` (VARCHAR)
- `difficulty` (VARCHAR)
- `image` (TEXT)
- `exercises` (JSONB)
- `is_custom` (BOOLEAN)

### 3. `workout_logs`
- `id` (VARCHAR PRIMARY KEY)
- `routine_id` (VARCHAR)
- `routine_title` (VARCHAR)
- `date` (TIMESTAMPTZ)
- `duration` (INTEGER)
- `exercises_completed` (INTEGER)
- `calories_burned` (INTEGER)
- `xp_earned` (INTEGER)
- `weights_used` (JSONB)

---

## 🚀 Getting Started

### 1. Install Dependencies
Clone the repository and install packages:
```bash
npm install
```

### 2. Configure environment variables
Create a `.env` file in the root folder of the project (this is automatically ignored by `.gitignore` to protect credentials):
```env
PORT=3001
DATABASE_URL=postgresql://neondb_owner:npg_9YK7bxBeLHOG@ep-polished-art-apzs9tib-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 3. Start Development Servers
Start both the Express backend server (on port `3001`) and the Vite React frontend client concurrently:
```bash
npm run dev
```

The application will start on:
- **Frontend URL**: [http://localhost:5174/](http://localhost:5174/) or [http://localhost:5173/](http://localhost:5173/)
- **Backend API URL**: [http://localhost:3001/api/](http://localhost:3001/api/)

### 4. Build & Lint
Verify typescript compliance and build the production bundle:
```bash
# Run ESLint checks
npm run lint

# Build production assets
npm run build
```