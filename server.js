import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'

// Database setup
const dbPath = process.env.DB_PATH || path.join(__dirname, 'fitness.db')
const db = new Database(dbPath)

// Middleware
app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'fitpulse-api' })
})


// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    age INTEGER,
    height REAL,
    weight REAL,
    goal TEXT,
    streak INTEGER DEFAULT 0,
    last_workout_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    duration INTEGER,
    calories INTEGER,
    difficulty INTEGER,
    description TEXT,
    muscles TEXT,
    secondary_muscles TEXT,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS workout_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    exercises TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS workout_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    workout_id INTEGER,
    start_time DATETIME,
    end_time DATETIME,
    duration INTEGER,
    calories_burned INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (workout_id) REFERENCES workouts(id)
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date DATE,
    steps INTEGER DEFAULT 0,
    calories_burned INTEGER DEFAULT 0,
    active_minutes INTEGER DEFAULT 0,
    heart_rate_avg INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    achievement_type TEXT,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS personal_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    exercise_name TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    achieved_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, exercise_name)
  );
`)

// Seed initial workout data
const seedWorkouts = () => {
  const workouts = [
    { name:'Treadmill Run', category:'cardio', duration:30, calories:320, difficulty:3, description:'Steady-state cardio for endurance and fat burn.', muscles:'quads,calves', secondary_muscles:'hamstrings,core', image_url:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=240&fit=crop' },
    { name:'Barbell Squat', category:'strength', duration:45, calories:280, difficulty:4, description:'Compound lower body — quads, glutes & core under load.', muscles:'quads,glutes', secondary_muscles:'hamstrings,core,back', image_url:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=240&fit=crop' },
    { name:'Sun Salutation', category:'yoga', duration:20, calories:120, difficulty:1, description:'Flowing sun salutation sequence to energize the body.', muscles:'core', secondary_muscles:'shoulders,back,hamstrings', image_url:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=240&fit=crop' },
    { name:'Tabata Intervals', category:'hiit', duration:20, calories:380, difficulty:5, description:'20 sec max effort / 10 sec rest — 8 rounds each exercise.', muscles:'quads,core,shoulders', secondary_muscles:'chest,calves', image_url:'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=240&fit=crop' },
    { name:'Jump Rope', category:'cardio', duration:15, calories:220, difficulty:2, description:'High-efficiency cardio improving coordination & rhythm.', muscles:'calves,shoulders', secondary_muscles:'core,forearms', image_url:'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=240&fit=crop' },
    { name:'Push-up Circuit', category:'strength', duration:25, calories:200, difficulty:3, description:'Upper-body push circuit: standard → wide → diamond.', muscles:'chest,triceps', secondary_muscles:'shoulders,core', image_url:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=240&fit=crop' },
    { name:'Vinyasa Flow', category:'yoga', duration:40, calories:180, difficulty:2, description:'Dynamic flowing yoga linking breath with movement.', muscles:'core,back', secondary_muscles:'shoulders,hamstrings', image_url:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=240&fit=crop' },
    { name:'Burpee Blaster', category:'hiit', duration:15, calories:290, difficulty:5, description:'Full-body explosive HIIT — max calorie burn per minute.', muscles:'chest,quads,core', secondary_muscles:'shoulders,triceps', image_url:'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=240&fit=crop' },
    { name:'Deadlift', category:'strength', duration:40, calories:310, difficulty:5, description:'King of posterior chain lifts — back, glutes & hamstrings.', muscles:'back,glutes,hamstrings', secondary_muscles:'traps,forearms,core', image_url:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=240&fit=crop' },
    { name:'Pull-up Circuit', category:'strength', duration:20, calories:180, difficulty:4, description:'Back & biceps — standard, chin-up & wide grip variations.', muscles:'back,biceps', secondary_muscles:'traps,core,forearms', image_url:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=240&fit=crop' },
  ]

  const insert = db.prepare(`
    INSERT OR IGNORE INTO workouts (name, category, duration, calories, difficulty, description, muscles, secondary_muscles, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  workouts.forEach(workout => {
    insert.run(
      workout.name,
      workout.category,
      workout.duration,
      workout.calories,
      workout.difficulty,
      workout.description,
      workout.muscles,
      workout.secondary_muscles,
      workout.image_url
    )
  })
}

seedWorkouts()

const ensureColumn = (table, column, definition) => {
  const info = db.prepare(`PRAGMA table_info(${table})`).all()
  if (!info.some(col => col.name === column)) {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run()
  }
}

ensureColumn('users', 'streak', 'INTEGER DEFAULT 0')
ensureColumn('users', 'last_workout_date', 'DATE')
ensureColumn('workouts', 'user_id', 'INTEGER')

const STEP_RATES_BY_CATEGORY = {
  cardio: 115,
  hiit: 90,
  sports: 95,
  strength: 45,
  flexibility: 30,
  yoga: 25,
}

const estimateSteps = ({ duration = 0, caloriesBurned = 0, category = '' }) => {
  const minutes = Math.max(0, Number(duration) || 0)
  if (minutes <= 0) return 0

  const normalizedCategory = String(category || '').toLowerCase()
  const categoryRate = STEP_RATES_BY_CATEGORY[normalizedCategory]
  if (categoryRate) return Math.round(minutes * categoryRate)

  const caloriesPerMinute = (Number(caloriesBurned) || 0) / minutes
  if (caloriesPerMinute >= 9) return Math.round(minutes * 95)
  if (caloriesPerMinute >= 6) return Math.round(minutes * 70)
  if (caloriesPerMinute >= 4) return Math.round(minutes * 45)
  return Math.round(minutes * 30)
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    console.log('No auth token provided')
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Invalid token:', err.message)
      return res.status(403).json({ error: 'Invalid token' })
    }
    console.log('Authenticated user:', user.id)
    req.user = user
    next()
  })
}

// Routes

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const result = db.prepare(`
      INSERT INTO users (email, password_hash, name)
      VALUES (?, ?, ?)
    `).run(email, passwordHash, name)

    const token = jwt.sign({ id: result.lastInsertRowid, email }, JWT_SECRET)

    res.json({ token, user: { id: result.lastInsertRowid, email, name, streak: 0 } })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET)

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        height: user.height,
        weight: user.weight,
        goal: user.goal,
        streak: user.streak || 0
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

// User routes
app.get('/api/user/profile', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, email, name, age, height, weight, goal, streak FROM users WHERE id = ?').get(req.user.id)
  const workoutStats = db.prepare(
    'SELECT COUNT(*) AS completedWorkouts, IFNULL(SUM(calories_burned), 0) AS totalCalories, IFNULL(SUM(duration), 0) AS totalMinutes FROM workout_sessions WHERE user_id = ? AND completed = 1'
  ).get(req.user.id)
  const stepStats = db.prepare(
    'SELECT IFNULL(SUM(steps), 0) AS totalSteps FROM user_progress WHERE user_id = ?'
  ).get(req.user.id)

  res.json({
    ...user,
    completed_workouts: workoutStats.completedWorkouts || 0,
    total_steps: stepStats.totalSteps || 0,
    total_xp: workoutStats.completedWorkouts * 100 + workoutStats.totalCalories,
    hours_logged: Math.round((workoutStats.totalMinutes || 0) / 60),
  })
})

app.put('/api/user/profile', authenticateToken, (req, res) => {
  const { name, age, height, weight, goal } = req.body

  db.prepare(`
    UPDATE users SET name = ?, age = ?, height = ?, weight = ?, goal = ?
    WHERE id = ?
  `).run(name, age, height, weight, goal, req.user.id)

  res.json({ message: 'Profile updated' })
})

// Workout routes
app.get('/api/workouts', (req, res) => {
  const { category } = req.query

  let query = 'SELECT * FROM workouts'
  let params = []

  if (category && category !== 'all') {
    query += ' WHERE category = ?'
    params.push(category)
  }

  const workouts = db.prepare(query).all(...params)
  res.json(workouts)
})

app.get('/api/workouts/:id', (req, res) => {
  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(req.params.id)
  if (!workout) return res.status(404).json({ error: 'Workout not found' })
  res.json(workout)
})

app.post('/api/workouts', authenticateToken, (req, res) => {
  const { name, category, duration, calories, difficulty, description, muscles, secondary_muscles, image_url } = req.body
  if (!name || !category) {
    return res.status(400).json({ error: 'Workout name and category are required' })
  }

  const result = db.prepare(`
    INSERT INTO workouts (user_id, name, category, duration, calories, difficulty, description, muscles, secondary_muscles, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, name, category, duration || 20, calories || 150, difficulty || 3, description || '', muscles || '', secondary_muscles || '', image_url || '')

  const createdWorkout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(result.lastInsertRowid)
  res.json(createdWorkout)
})

app.post('/api/plans', authenticateToken, (req, res) => {
  const { name, exercises } = req.body
  if (!name || !Array.isArray(exercises) || exercises.length === 0) {
    return res.status(400).json({ error: 'A plan name and at least one exercise are required' })
  }

  const result = db.prepare(`
    INSERT INTO workout_plans (user_id, name, exercises)
    VALUES (?, ?, ?)
  `).run(req.user.id, name, JSON.stringify(exercises))

  res.json({ id: result.lastInsertRowid, name, exercises })
})

app.get('/api/plans', authenticateToken, (req, res) => {
  const plans = db.prepare('SELECT * FROM workout_plans WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id)
  res.json(plans.map(plan => ({ ...plan, exercises: JSON.parse(plan.exercises) })))
})

app.delete('/api/plans/:id', authenticateToken, (req, res) => {
  const plan = db.prepare('SELECT * FROM workout_plans WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' })
  }

  db.prepare('DELETE FROM workout_plans WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

app.delete('/api/plans', authenticateToken, (req, res) => {
  const { planId } = req.body
  if (!planId) {
    return res.status(400).json({ error: 'Plan ID is required' })
  }

  const plan = db.prepare('SELECT * FROM workout_plans WHERE id = ? AND user_id = ?').get(planId, req.user.id)
  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' })
  }

  db.prepare('DELETE FROM workout_plans WHERE id = ?').run(planId)
  res.json({ success: true })
})

// Session routes
app.post('/api/sessions', authenticateToken, (req, res) => {
  console.log('Session creation called for user:', req.user.id)
  const { workoutId, startTime, endTime, duration = 0, caloriesBurned = 0, completed = false } = req.body
  console.log('Session data:', { workoutId, startTime, endTime, duration, caloriesBurned, completed })
  const workout = workoutId
    ? db.prepare('SELECT category FROM workouts WHERE id = ?').get(workoutId)
    : null
  const stepsAdded = completed
    ? estimateSteps({ duration, caloriesBurned, category: workout?.category })
    : 0

  const result = db.prepare(`
    INSERT INTO workout_sessions (user_id, workout_id, start_time, end_time, duration, calories_burned, completed)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, workoutId || null, startTime, endTime, duration, caloriesBurned, completed ? 1 : 0)

  console.log('Session created with ID:', result.lastInsertRowid)

  const today = new Date().toISOString().split('T')[0]
  console.log('Today date:', today)

  const userRow = db.prepare('SELECT streak, last_workout_date FROM users WHERE id = ?').get(req.user.id)
  console.log('Current user streak data:', userRow)

  let newStreak = 1
  if (userRow?.last_workout_date) {
    const lastDate = new Date(userRow.last_workout_date)
    const nextDate = new Date(lastDate)
    nextDate.setDate(nextDate.getDate() + 1)
    if (nextDate.toISOString().split('T')[0] === today) {
      newStreak = (userRow.streak || 0) + 1
    }
  }

  console.log('New streak:', newStreak)

  db.prepare('UPDATE users SET streak = ?, last_workout_date = ? WHERE id = ?').run(newStreak, today, req.user.id)

  const progress = db.prepare('SELECT * FROM user_progress WHERE user_id = ? AND date = ?').get(req.user.id, today)
  console.log('Existing progress for today:', progress)

  const updatedSteps = (progress ? progress.steps : 0) + stepsAdded
  const updatedCalories = (progress ? progress.calories_burned : 0) + caloriesBurned
  const updatedActive = (progress ? progress.active_minutes : 0) + duration
  const updatedHeart = progress ? progress.heart_rate_avg : null

  console.log('Updated progress values:', { updatedSteps, stepsAdded, updatedCalories, updatedActive, updatedHeart })

  db.prepare(`
    INSERT OR REPLACE INTO user_progress (user_id, date, steps, calories_burned, active_minutes, heart_rate_avg)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.user.id, today, updatedSteps, updatedCalories, updatedActive, updatedHeart)

  console.log('Progress updated for user', req.user.id, 'on date', today)

  const unlockAchievement = (type) => {
    const exists = db.prepare('SELECT id FROM achievements WHERE user_id = ? AND achievement_type = ?').get(req.user.id, type)
    if (!exists) {
      db.prepare('INSERT INTO achievements (user_id, achievement_type) VALUES (?, ?)').run(req.user.id, type)
    }
  }

  unlockAchievement('First Workout')
  if (newStreak === 7) unlockAchievement('7-Day Streak')
  if (newStreak === 14) unlockAchievement('14-Day Streak')

  res.json({ id: result.lastInsertRowid, streak: newStreak, caloriesBurned, duration, stepsAdded, totalSteps: updatedSteps })
})

app.get('/api/sessions', authenticateToken, (req, res) => {
  const sessions = db.prepare(`
    SELECT ws.*, w.name, w.category, w.image_url
    FROM workout_sessions ws
    LEFT JOIN workouts w ON ws.workout_id = w.id
    WHERE ws.user_id = ?
    ORDER BY ws.start_time DESC
    LIMIT 10
  `).all(req.user.id)

  res.json(sessions)
})

// Progress routes
app.post('/api/progress', authenticateToken, (req, res) => {
  const { date, steps, caloriesBurned, activeMinutes, heartRateAvg } = req.body
  const existing = db.prepare('SELECT * FROM user_progress WHERE user_id = ? AND date = ?').get(req.user.id, date)
  const nextSteps = Number.isFinite(Number(steps)) ? Number(steps) : (existing?.steps || 0)
  const nextCalories = Number.isFinite(Number(caloriesBurned)) ? Number(caloriesBurned) : (existing?.calories_burned || 0)
  const nextActive = Number.isFinite(Number(activeMinutes)) ? Number(activeMinutes) : (existing?.active_minutes || 0)
  const nextHeart = Number.isFinite(Number(heartRateAvg)) ? Number(heartRateAvg) : (existing?.heart_rate_avg || null)

  db.prepare(`
    INSERT OR REPLACE INTO user_progress (user_id, date, steps, calories_burned, active_minutes, heart_rate_avg)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.user.id, date, nextSteps, nextCalories, nextActive, nextHeart)

  res.json({ message: 'Progress updated', steps: nextSteps })
})

app.get('/api/progress', authenticateToken, (req, res) => {
  console.log('Progress API called for user:', req.user.id)
  const { startDate, endDate } = req.query
  console.log('Date range:', startDate, 'to', endDate)
  console.log('Server current date:', new Date().toISOString().split('T')[0])

  let query = 'SELECT * FROM user_progress WHERE user_id = ?'
  let params = [req.user.id]

  if (startDate && endDate) {
    query += ' AND date BETWEEN ? AND ?'
    params.push(startDate, endDate)
  }

  query += ' ORDER BY date DESC'

  const progress = db.prepare(query).all(...params)
  console.log('Progress data found:', progress.length, 'records')
  console.log('Progress data:', progress)

  res.json(progress)
})

// Achievement routes
app.get('/api/achievements', authenticateToken, (req, res) => {
  const achievements = db.prepare('SELECT * FROM achievements WHERE user_id = ?').all(req.user.id)
  res.json(achievements)
})

app.post('/api/achievements', authenticateToken, (req, res) => {
  const { achievementType } = req.body

  const existing = db.prepare('SELECT id FROM achievements WHERE user_id = ? AND achievement_type = ?').get(req.user.id, achievementType)
  if (existing) return res.status(400).json({ error: 'Achievement already unlocked' })

  const result = db.prepare('INSERT INTO achievements (user_id, achievement_type) VALUES (?, ?)').run(req.user.id, achievementType)
  res.json({ id: result.lastInsertRowid })
})

// Personal Records routes
app.get('/api/personal-records', authenticateToken, (req, res) => {
  console.log('Fetching personal records for user:', req.user.id)
  const records = db.prepare('SELECT * FROM personal_records WHERE user_id = ? ORDER BY exercise_name').all(req.user.id)
  console.log('Personal records found:', records)
  res.json(records)
})

app.post('/api/personal-records', authenticateToken, (req, res) => {
  const { exercise_name, value, unit } = req.body

  if (!exercise_name || value === undefined || !unit) {
    return res.status(400).json({ error: 'Exercise name, value, and unit are required' })
  }

  const today = new Date().toISOString().split('T')[0]

  const result = db.prepare(`
    INSERT INTO personal_records (user_id, exercise_name, value, unit, achieved_date, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, exercise_name) DO UPDATE SET 
      value = excluded.value,
      achieved_date = excluded.achieved_date,
      updated_at = datetime('now')
  `).run(req.user.id, exercise_name, value, unit, today)

  console.log('Personal record saved/updated:', exercise_name, value, unit)
  res.json({ success: true, message: 'Personal record updated' })
})

// Dashboard data
app.get('/api/dashboard', authenticateToken, (req, res) => {
  const today = new Date().toISOString().split('T')[0]

  // Get today's progress
  const todayProgress = db.prepare('SELECT * FROM user_progress WHERE user_id = ? AND date = ?').get(req.user.id, today) || {
    steps: 0, calories_burned: 0, active_minutes: 0, heart_rate_avg: 0
  }

  // Get recent sessions
  const recentSessions = db.prepare(`
    SELECT ws.*, w.name, w.category
    FROM workout_sessions ws
    JOIN workouts w ON ws.workout_id = w.id
    WHERE ws.user_id = ? AND ws.completed = 1
    ORDER BY ws.end_time DESC
    LIMIT 3
  `).all(req.user.id)

  // Get weekly progress
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekStart = weekAgo.toISOString().split('T')[0]

  const weeklyProgress = db.prepare(`
    SELECT date, steps, calories_burned, active_minutes
    FROM user_progress
    WHERE user_id = ? AND date >= ?
    ORDER BY date
  `).all(req.user.id, weekStart)

  const user = db.prepare('SELECT streak FROM users WHERE id = ?').get(req.user.id)

  res.json({
    todayProgress,
    recentSessions,
    weeklyProgress,
    streak: user?.streak || 0,
  })
})

// Debug endpoint to check database state
app.get('/api/debug', authenticateToken, (req, res) => {
  console.log('Debug endpoint called for user:', req.user.id)

  const sessions = db.prepare('SELECT * FROM workout_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(req.user.id)
  const progress = db.prepare('SELECT * FROM user_progress WHERE user_id = ? ORDER BY date DESC LIMIT 10').all(req.user.id)
  const user = db.prepare('SELECT id, username, streak, last_workout_date FROM users WHERE id = ?').get(req.user.id)

  console.log('Debug data:', { sessions: sessions.length, progress: progress.length, user })

  res.json({
    user,
    sessions,
    progress
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  // Don't exit the process, just log the error
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  // Don't exit the process, just log the error
})
