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

// Helper to extract user ID from headers
function getUserId(req) {
  const userIdHeader = req.headers['x-user-id'];
  if (!userIdHeader) return null;
  const parsed = parseInt(userIdHeader, 10);
  return isNaN(parsed) ? null : parsed;
}

// Database Initialization Helper
async function initDb() {
  try {
    const client = await pool.connect();
    console.log('Connected to Neon PostgreSQL database.');

    // 1. Create Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        pin VARCHAR(255) NOT NULL,
        phone VARCHAR(255)
      );
    `);

    // 2. Pre-seed User Account arimail@duck.com with PIN 1718
    await client.query(`
      INSERT INTO app_users (email, pin, phone)
      VALUES ('arimail@duck.com', '1718', '')
      ON CONFLICT (email) DO NOTHING;
    `);

    // 3. User Profile Table
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

    // Alter user_profile to add user_id and voice settings if they don't exist
    await client.query(`
      ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS user_id INTEGER UNIQUE REFERENCES app_users(id);
      ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS voice_rate REAL DEFAULT 1.0;
      ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS voice_pitch REAL DEFAULT 1.0;
      ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS unlocked_badges JSONB DEFAULT '[]'::jsonb;
    `);

    // Insert default profile if not exists (fallback row)
    await client.query(`
      INSERT INTO user_profile (id, name, xp, daily_minutes_goal, daily_stretches_goal, weight_kg, unlocked_badges)
      VALUES (1, 'Champion Athlete', 0, 15, 1, 70, '[]'::jsonb)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 4. Custom Routines Table
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

    // Alter custom_routines to add user_id column
    await client.query(`
      ALTER TABLE custom_routines ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES app_users(id);
    `);

    // 5. Workout Logs Table
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

    // Alter workout_logs to add user_id column
    await client.query(`
      ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES app_users(id);
    `);

    client.release();
    console.log('Database schemas initialized successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

// REST API Endpoints

// AUTH ENDPOINTS

// 1. Signup Route
app.post('/api/auth/signup', async (req, res) => {
  const { email, pin, phone } = req.body;
  if (!email || !pin) {
    return res.status(400).json({ error: 'Email and PIN are required' });
  }
  try {
    const existing = await pool.query('SELECT id FROM app_users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const result = await pool.query(
      'INSERT INTO app_users (email, pin, phone) VALUES ($1, $2, $3) RETURNING id, email, phone',
      [email.toLowerCase().trim(), pin, phone || '']
    );
    const user = result.rows[0];

    // Seed default profile for this new user
    await pool.query(
      `INSERT INTO user_profile (id, user_id, name, xp, daily_minutes_goal, daily_stretches_goal, weight_kg, unlocked_badges, voice_rate, voice_pitch)
       VALUES ($1, $1, 'Champion Athlete', 0, 15, 1, 70, '[]'::jsonb, 1.0, 1.0)
       ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id`,
      [user.id]
    );

    res.status(201).json({
      userId: user.id.toString(),
      email: user.email,
      phone: user.phone
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error registering user' });
  }
});

// 2. Login Route
app.post('/api/auth/login', async (req, res) => {
  const { email, pin } = req.body;
  if (!email || !pin) {
    return res.status(400).json({ error: 'Email and PIN are required' });
  }
  try {
    const result = await pool.query(
      'SELECT id, email, pin, phone FROM app_users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or PIN' });
    }

    const user = result.rows[0];
    if (user.pin !== pin) {
      return res.status(401).json({ error: 'Invalid email or PIN' });
    }

    res.json({
      userId: user.id.toString(),
      email: user.email,
      phone: user.phone
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error logging in' });
  }
});

// 3. Sync Route (saves local storage data into cloud user account)
app.post('/api/auth/sync', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No active session' });
  }

  const { profile, customRoutines, logs } = req.body;

  try {
    // 3.1 Sync profile
    if (profile) {
      const profileCheck = await pool.query('SELECT id FROM user_profile WHERE user_id = $1', [userId]);
      if (profileCheck.rows.length > 0) {
        await pool.query(
          `UPDATE user_profile 
           SET name = $1, xp = $2, daily_minutes_goal = $3, daily_stretches_goal = $4, weight_kg = $5, 
               unlocked_badges = $6, voice_rate = $7, voice_pitch = $8
           WHERE user_id = $9`,
          [
            profile.name,
            profile.xp,
            profile.dailyMinutesGoal,
            profile.dailyStretchesGoal,
            profile.weightKg,
            JSON.stringify(profile.unlockedBadges || []),
            profile.voiceRate || 1.0,
            profile.voicePitch || 1.0,
            userId
          ]
        );
      } else {
        const idCheck = await pool.query('SELECT id FROM user_profile WHERE id = $1', [userId]);
        if (idCheck.rows.length > 0) {
          await pool.query(
            `UPDATE user_profile 
             SET user_id = $1, name = $2, xp = $3, daily_minutes_goal = $4, daily_stretches_goal = $5, 
                 weight_kg = $6, unlocked_badges = $7, voice_rate = $8, voice_pitch = $9
             WHERE id = $1`,
            [
              userId,
              profile.name,
              profile.xp,
              profile.dailyMinutesGoal,
              profile.dailyStretchesGoal,
              profile.weightKg,
              JSON.stringify(profile.unlockedBadges || []),
              profile.voiceRate || 1.0,
              profile.voicePitch || 1.0
            ]
          );
        } else {
          await pool.query(
            `INSERT INTO user_profile (id, user_id, name, xp, daily_minutes_goal, daily_stretches_goal, weight_kg, unlocked_badges, voice_rate, voice_pitch)
             VALUES ($1, $1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              userId,
              profile.name,
              profile.xp,
              profile.dailyMinutesGoal,
              profile.dailyStretchesGoal,
              profile.weightKg,
              JSON.stringify(profile.unlockedBadges || []),
              profile.voiceRate || 1.0,
              profile.voicePitch || 1.0
            ]
          );
        }
      }
    }

    // 3.2 Sync routines
    if (Array.isArray(customRoutines)) {
      for (const routine of customRoutines) {
        await pool.query(
          `INSERT INTO custom_routines (id, user_id, title, description, duration, difficulty, image, exercises, is_custom)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             user_id = EXCLUDED.user_id,
             title = EXCLUDED.title,
             description = EXCLUDED.description,
             duration = EXCLUDED.duration,
             difficulty = EXCLUDED.difficulty,
             image = EXCLUDED.image,
             exercises = EXCLUDED.exercises,
             is_custom = EXCLUDED.is_custom`,
          [
            routine.id,
            userId,
            routine.title,
            routine.description,
            routine.duration,
            routine.difficulty,
            routine.image,
            JSON.stringify(routine.exercises),
            routine.isCustom ?? true
          ]
        );
      }
    }

    // 3.3 Sync logs
    if (Array.isArray(logs)) {
      for (const log of logs) {
        await pool.query(
          `INSERT INTO workout_logs (id, user_id, routine_id, routine_title, date, duration, exercises_completed, calories_burned, xp_earned, weights_used)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
             user_id = EXCLUDED.user_id,
             routine_id = EXCLUDED.routine_id,
             routine_title = EXCLUDED.routine_title,
             date = EXCLUDED.date,
             duration = EXCLUDED.duration,
             exercises_completed = EXCLUDED.exercises_completed,
             calories_burned = EXCLUDED.calories_burned,
             xp_earned = EXCLUDED.xp_earned,
             weights_used = EXCLUDED.weights_used`,
          [
            log.id,
            userId,
            log.routineId,
            log.routineTitle,
            log.date,
            log.duration,
            log.exercisesCompleted,
            log.caloriesBurned,
            log.xpEarned,
            JSON.stringify(log.weightsUsed || {})
          ]
        );
      }
    }

    res.json({ message: 'Sync completed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error syncing user data' });
  }
});


// USER SCOPED ENDPOINTS

// 1. Profile Route Handlers
app.get('/api/profile', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    let result = await pool.query(
      `SELECT name, xp, daily_minutes_goal as "dailyMinutesGoal", daily_stretches_goal as "dailyStretchesGoal", 
              weight_kg as "weightKg", unlocked_badges as "unlockedBadges", voice_rate as "voiceRate", voice_pitch as "voicePitch" 
       FROM user_profile 
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Seed default profile for this user on-the-fly if it was somehow skipped
      await pool.query(
        `INSERT INTO user_profile (id, user_id, name, xp, daily_minutes_goal, daily_stretches_goal, weight_kg, unlocked_badges, voice_rate, voice_pitch)
         VALUES ($1, $1, 'Champion Athlete', 0, 15, 1, 70, '[]'::jsonb, 1.0, 1.0)
         ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id`,
        [userId]
      );
      result = await pool.query(
        `SELECT name, xp, daily_minutes_goal as "dailyMinutesGoal", daily_stretches_goal as "dailyStretchesGoal", 
                weight_kg as "weightKg", unlocked_badges as "unlockedBadges", voice_rate as "voiceRate", voice_pitch as "voicePitch" 
         FROM user_profile 
         WHERE user_id = $1`,
        [userId]
      );
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

app.put('/api/profile', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { name, xp, dailyMinutesGoal, dailyStretchesGoal, weightKg, unlockedBadges, voiceRate, voicePitch } = req.body;
  try {
    const result = await pool.query(
      `UPDATE user_profile 
       SET name = $1, xp = $2, daily_minutes_goal = $3, daily_stretches_goal = $4, weight_kg = $5, 
           unlocked_badges = $6, voice_rate = $7, voice_pitch = $8 
       WHERE user_id = $9 
       RETURNING name, xp, daily_minutes_goal as "dailyMinutesGoal", daily_stretches_goal as "dailyStretchesGoal", 
                 weight_kg as "weightKg", unlocked_badges as "unlockedBadges", voice_rate as "voiceRate", voice_pitch as "voicePitch"`,
      [name, xp, dailyMinutesGoal, dailyStretchesGoal, weightKg, JSON.stringify(unlockedBadges || []), voiceRate || 1.0, voicePitch || 1.0, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// 2. Custom Routines Route Handlers
app.get('/api/custom-routines', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = await pool.query(
      `SELECT id, title, description, duration, difficulty, image, exercises, is_custom as "isCustom" 
       FROM custom_routines 
       WHERE user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching custom routines' });
  }
});

app.post('/api/custom-routines', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id, title, description, duration, difficulty, image, exercises, isCustom } = req.body;
  try {
    await pool.query(
      `INSERT INTO custom_routines (id, user_id, title, description, duration, difficulty, image, exercises, is_custom) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         user_id = EXCLUDED.user_id,
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         duration = EXCLUDED.duration,
         difficulty = EXCLUDED.difficulty,
         image = EXCLUDED.image,
         exercises = EXCLUDED.exercises,
         is_custom = EXCLUDED.is_custom`,
      [id, userId, title, description, duration, difficulty, image, JSON.stringify(exercises), isCustom]
    );
    res.status(201).json(req.body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating custom routine' });
  }
});

// 3. Workout Logs Route Handlers
app.get('/api/logs', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = await pool.query(
      `SELECT id, routine_id as "routineId", routine_title as "routineTitle", date, duration, 
              exercises_completed as "exercisesCompleted", calories_burned as "caloriesBurned", 
              xp_earned as "xpEarned", weights_used as "weightsUsed" 
       FROM workout_logs 
       WHERE user_id = $1 
       ORDER BY date DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching logs' });
  }
});

app.post('/api/logs', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id, routineId, routineTitle, date, duration, exercisesCompleted, caloriesBurned, xpEarned, weightsUsed } = req.body;
  try {
    await pool.query(
      `INSERT INTO workout_logs (id, user_id, routine_id, routine_title, date, duration, exercises_completed, calories_burned, xp_earned, weights_used) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         user_id = EXCLUDED.user_id,
         routine_id = EXCLUDED.routine_id,
         routine_title = EXCLUDED.routine_title,
         date = EXCLUDED.date,
         duration = EXCLUDED.duration,
         exercises_completed = EXCLUDED.exercises_completed,
         calories_burned = EXCLUDED.calories_burned,
         xp_earned = EXCLUDED.xp_earned,
         weights_used = EXCLUDED.weights_used`,
      [id, userId, routineId, routineTitle, date, duration, exercisesCompleted, caloriesBurned, xpEarned, JSON.stringify(weightsUsed || {})]
    );
    res.status(201).json(req.body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error saving log' });
  }
});

app.delete('/api/logs/:id', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM workout_logs WHERE id = $1 AND user_id = $2', [id, userId]);
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

