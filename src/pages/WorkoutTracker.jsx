import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Plus, Minus, CheckCircle2, Mic, Clock, Zap, ChevronRight } from 'lucide-react'
import treadmillRun from '../assets/treadmill.jpeg'
import barbellSquat from '../assets/barbell.jpeg'
import sunSalutation from '../assets/sun_salutaion.jpeg'
import tabataIntervals from '../assets/tabata.jpeg'

import jumpRope from '../assets/jumprope.jpeg'
import pushupCircuit from '../assets/pushup.jpeg'
import vinyasaFlow from '../assets/vf.jpeg'
import burpeeBlaster from '../assets/burpee.jpeg'

const categories = [
  { id: 'all',      label: 'All' },
  { id: 'cardio',   label: 'Cardio',   icon: '🏃' },
  { id: 'strength', label: 'Strength', icon: '💪' },
  { id: 'yoga',     label: 'Yoga',     icon: '🧘' },
  { id: 'hiit',     label: 'HIIT',     icon: '🔥' },
]

const workouts = [
  { id: 1, name: 'Treadmill Run', category: 'cardio', duration: 30, calories: 320, difficulty: 3, image: treadmillRun, desc: 'Steady-state cardio for endurance and fat burn.' },
  { id: 2, name: 'Barbell Squat', category: 'strength', duration: 45, calories: 280, difficulty: 4,image:barbellSquat, desc: 'Compound lower body exercise targeting quads and glutes.' },
  { id: 3, name: 'Sun Salutation', category: 'yoga', duration: 20, calories: 120, difficulty: 1,image:sunSalutation, desc: 'Gentle flowing sequence to energize body and mind.' },
  { id: 4, name: 'Tabata Intervals', category: 'hiit', duration: 20, calories: 380, difficulty: 5,image:tabataIntervals, desc: '20 sec on / 10 sec off high intensity intervals.' },
  { id: 5, name: 'Jump Rope', category: 'cardio', duration: 15, calories: 220, difficulty: 2, image: jumpRope, desc: 'High-efficiency cardio improving coordination.' },
  { id: 6, name: 'Push-up Circuit', category: 'strength', duration: 25, calories: 200, difficulty: 3,image:pushupCircuit,  desc: 'Upper body push circuit for chest and triceps.' },
  { id: 7, name: 'Vinyasa Flow', category: 'yoga', duration: 40, calories: 180, difficulty: 2, image:vinyasaFlow, desc: 'Dynamic flowing yoga linking breath with movement.' },
  { id: 8, name: 'Burpee Blaster', category: 'hiit', duration: 15, calories: 290, difficulty: 5, image: burpeeBlaster, desc: 'Full body explosive HIIT for max calorie burn.' },
]

const sessionExercises = [
  { id: 1, name: 'Warm-up Jog',   sets: 1, reps: '5 min', done: true  },
  { id: 2, name: 'Push-ups',      sets: 3, reps: 15,       done: true  },
  { id: 3, name: 'Squats',        sets: 3, reps: 20,       done: false },
  { id: 4, name: 'Plank',         sets: 3, reps: '45 sec', done: false },
  { id: 5, name: 'Jumping Jacks', sets: 3, reps: 30,       done: false },
]

function DifficultyDots({ level }) {
  return (
    <div className="difficulty">
      {[1,2,3,4,5].map(d => (
        <div key={d} className={`diff-dot ${d <= level ? 'active' : ''}`} />
      ))}
    </div>
  )
}

function Timer({ running }) {
  const [seconds, setSeconds] = useState(0)
  const ref = useRef()

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } else {
      clearInterval(ref.current)
    }
    return () => clearInterval(ref.current)
  }, [running])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{mm}:{ss}</span>
}

export default function WorkoutTracker() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeWorkout, setActiveWorkout]   = useState(null)
  const [timerRunning, setTimerRunning]     = useState(false)
  const [exercises, setExercises]           = useState(sessionExercises)

  const filtered = workouts.filter(w => activeCategory === 'all' || w.category === activeCategory)

  const toggleExercise = (id) => {
    setExercises(prev => prev.map(e => e.id === id ? { ...e, done: !e.done } : e))
  }

  const doneCount = exercises.filter(e => e.done).length
  const sessionProgress = Math.round((doneCount / exercises.length) * 100)

  return (
    <div>
      <div className="page-header anim-fade-up">
        <h1 className="page-title">Workout <span className="gradient-text">Tracker</span></h1>
        <p className="page-subtitle">Choose a workout or continue your active session</p>
      </div>

      {/* ── Active Session Panel ── */}
      <div className="card card-glow anim-fade-up delay-1" style={{ marginBottom: 28, background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--purple-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Active Session</div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>Morning Power Circuit</h2>
          </div>
          <div style={{ display: 'flex', align: 'center', gap: 8 }}>
            {/* Voice hint badge for multimodal HCI */}
            <span className="badge badge-purple" title="Say 'next exercise' or 'pause workout'">
              <Mic size={12} /> Voice Ready
            </span>
            <span className="badge badge-green">
              <Zap size={12} /> In Progress
            </span>
          </div>
        </div>

        {/* Timer */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 56, fontWeight: 900, background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
            <Timer running={timerRunning} />
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Elapsed Time</div>
        </div>

        {/* Timer Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
          <button className="btn btn-primary btn-lg" id="timer-toggle" onClick={() => setTimerRunning(r => !r)} aria-label={timerRunning ? 'Pause workout' : 'Start workout'}>
            {timerRunning ? <><Pause size={20} /> Pause</> : <><Play size={20} fill="white" /> Start</>}
          </button>
          <button className="btn btn-ghost" onClick={() => setTimerRunning(false)} aria-label="Reset timer">
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Session Progress</span>
            <span style={{ fontWeight: 700 }}>{doneCount}/{exercises.length} exercises</span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${sessionProgress}%` }} />
          </div>
        </div>

        {/* Exercise Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {exercises.map(ex => (
            <div
              key={ex.id}
              onClick={() => toggleExercise(ex.id)}
              role="checkbox"
              aria-checked={ex.done}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && toggleExercise(ex.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 'var(--radius-md)',
                background: ex.done ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${ex.done ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.07)'}`,
                cursor: 'pointer', transition: 'var(--transition)',
                opacity: ex.done ? 0.7 : 1,
              }}
            >
              <CheckCircle2 size={20} color={ex.done ? 'var(--green)' : 'var(--text-muted)'} fill={ex.done ? 'rgba(16,185,129,0.2)' : 'none'} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500, textDecoration: ex.done ? 'line-through' : 'none', color: ex.done ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                {ex.name}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ex.sets} × {ex.reps}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Browse Workouts ── */}
      <div style={{ marginBottom: 20 }}>
        <h2 className="section-heading anim-fade-up">Browse Workouts</h2>
        <div className="tab-group anim-fade-up delay-1" style={{ flexWrap: 'wrap', width: 'fit-content', marginBottom: 24 }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`tab-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
              aria-pressed={activeCategory === cat.id}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-3">
        {filtered.map((w, i) => (
          <div
            key={w.id}
            className={`card anim-fade-up delay-${(i % 3) + 1}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveWorkout(w.id === activeWorkout ? null : w.id)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <img 
  src={w.image} 
  alt={w.name} 
  style={{ 
    width: 250, 
    height: 250, 
    borderRadius: 12, 
    objectFit: 'cover',
    background: 'rgba(255,255,255,0.05)',
    padding: 6
  }} 
/>
              <div style={{ display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-end' }}>
                <span className="badge badge-purple" style={{ fontSize: 11 }}><Clock size={10} />{w.duration} min</span>
                <span className="badge badge-orange" style={{ fontSize: 11 }}>🔥 {w.calories} kcal</span>
              </div>
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{w.name}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>{w.desc}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <DifficultyDots level={w.difficulty} />
              <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation() }}>
                <Play size={12} /> Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
