const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - Allow Vite frontend dev server
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true
}));

app.use(express.json());

// Initialize PostgreSQL Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon cloud database connection
  }
});

// Database Initialization Helper
async function initDb() {
  try {
    const client = await pool.connect();
    console.log('Connected to Neon PostgreSQL database.');

    // 1. User Profile Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY,
        name VARCHAR(255) DEFAULT 'Champion Athlete',
        xp INTEGER DEFAULT 0,
        daily_minutes_goal INTEGER DEFAULT 15,
        daily_stretches_goal INTEGER DEFAULT 1,
        weight_kg INTEGER DEFAULT 70,
        unlocked_badges JSONB DEFAULT '[]'::jsonb
      );
    `);

    // Retroactively add column to existing user tables
    await client.query(`
      ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS unlocked_badges JSONB DEFAULT '[]'::jsonb;
    `);

    // Insert default profile if not exists
    await client.query(`
      INSERT INTO user_profile (id, name, xp, daily_minutes_goal, daily_stretches_goal, weight_kg, unlocked_badges)
      VALUES (1, 'Champion Athlete', 0, 15, 1, 70, '[]'::jsonb)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 2. Custom Routines Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS custom_routines (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        duration VARCHAR(50),
        difficulty VARCHAR(50),
        image TEXT,
        exercises JSONB NOT NULL,
        is_custom BOOLEAN DEFAULT TRUE
      );
    `);

    // 3. Workout Logs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS workout_logs (
        id VARCHAR(255) PRIMARY KEY,
        routine_id VARCHAR(255),
        routine_title VARCHAR(255),
        date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        duration INTEGER,
        exercises_completed INTEGER,
        calories_burned INTEGER,
        xp_earned INTEGER,
        weights_used JSONB
      );
    `);

    client.release();
    console.log('Database schemas initialized successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

// REST API Endpoints

// 1. Profile Route Handlers
app.get('/api/profile', async (req, res) => {
  try {
    const result = await pool.query('SELECT name, xp, daily_minutes_goal as "dailyMinutesGoal", daily_stretches_goal as "dailyStretchesGoal", weight_kg as "weightKg", unlocked_badges as "unlockedBadges" FROM user_profile WHERE id = 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

app.put('/api/profile', async (req, res) => {
  const { name, xp, dailyMinutesGoal, dailyStretchesGoal, weightKg, unlockedBadges } = req.body;
  try {
    const result = await pool.query(
      `UPDATE user_profile 
       SET name = $1, xp = $2, daily_minutes_goal = $3, daily_stretches_goal = $4, weight_kg = $5, unlocked_badges = $6 
       WHERE id = 1 
       RETURNING name, xp, daily_minutes_goal as "dailyMinutesGoal", daily_stretches_goal as "dailyStretchesGoal", weight_kg as "weightKg", unlocked_badges as "unlockedBadges"`,
      [name, xp, dailyMinutesGoal, dailyStretchesGoal, weightKg, JSON.stringify(unlockedBadges || [])]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// 2. Custom Routines Route Handlers
app.get('/api/custom-routines', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, title, description, duration, difficulty, image, exercises, is_custom as "isCustom" FROM custom_routines');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching custom routines' });
  }
});

app.post('/api/custom-routines', async (req, res) => {
  const { id, title, description, duration, difficulty, image, exercises, isCustom } = req.body;
  try {
    await pool.query(
      `INSERT INTO custom_routines (id, title, description, duration, difficulty, image, exercises, is_custom) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, title, description, duration, difficulty, image, JSON.stringify(exercises), isCustom]
    );
    res.status(201).json(req.body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating custom routine' });
  }
});

// 3. Workout Logs Route Handlers
app.get('/api/logs', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, routine_id as "routineId", routine_title as "routineTitle", date, duration, 
              exercises_completed as "exercisesCompleted", calories_burned as "caloriesBurned", 
              xp_earned as "xpEarned", weights_used as "weightsUsed" 
       FROM workout_logs 
       ORDER BY date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching logs' });
  }
});

app.post('/api/logs', async (req, res) => {
  const { id, routineId, routineTitle, date, duration, exercisesCompleted, caloriesBurned, xpEarned, weightsUsed } = req.body;
  try {
    await pool.query(
      `INSERT INTO workout_logs (id, routine_id, routine_title, date, duration, exercises_completed, calories_burned, xp_earned, weights_used) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, routineId, routineTitle, date, duration, exercisesCompleted, caloriesBurned, xpEarned, JSON.stringify(weightsUsed || {})]
    );
    res.status(201).json(req.body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error saving log' });
  }
});

app.delete('/api/logs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM workout_logs WHERE id = $1', [id]);
    res.json({ message: 'Log deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting log' });
  }
});

// Initialize database then start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
