import { useState, useEffect } from 'react'
import { Flame, Target, Zap, Heart, Clock, ChevronRight, Play, Star } from 'lucide-react'

const quotes = [
  { text: "Every rep, every step — you're building the best version of yourself.", author: "FitPulse AI" },
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Strength doesn't come from what you can do. It comes from overcoming what you thought you couldn't.", author: "Rikki Rogers" },
  { text: "Push yourself because no one else is going to do it for you.", author: "Unknown" },
]

const quickWorkouts = [
  { id: 1, name: 'Morning HIIT',   duration: '20 min', intensity: 'High',   icon: '🔥', color: 'var(--grad-warm)' },
  { id: 2, name: 'Core Strength',  duration: '15 min', intensity: 'Medium', icon: '💪', color: 'var(--grad-primary)' },
  { id: 3, name: 'Yoga Flow',      duration: '30 min', intensity: 'Low',    icon: '🧘', color: 'var(--grad-success)' },
  { id: 4, name: '5K Run',         duration: '25 min', intensity: 'High',   icon: '🏃', color: 'var(--grad-secondary)' },
]

const activityData = [
  { label: 'Steps',    value: 4960,  target: 8000,  unit: '',     icon: '👟', color: '#8b5cf6', percent: 62 },
  { label: 'Calories', value: 1840,  target: 2200,  unit: 'kcal', icon: '🔥', color: '#ec4899', percent: 84 },
  { label: 'Active',   value: 47,    target: 60,    unit: 'min',  icon: '⚡', color: '#06b6d4', percent: 78 },
  { label: 'Heart',    value: 72,    target: 140,   unit: 'bpm',  icon: '❤️', color: '#10b981', percent: 51 },
]

function AnimatedRing({ percent, color, size = 100, stroke = 10 }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (percent / 100) * circumference)
    }, 300)
    return () => clearTimeout(timer)
  }, [percent, circumference])

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return { text: 'Good Morning', emoji: '☀️', sub: "Let's start strong today!" }
  if (h < 17) return { text: 'Good Afternoon', emoji: '🌤️', sub: "Keep the momentum going!" }
  return { text: 'Good Evening', emoji: '🌙', sub: "Time to wind down and recover." }
}

export default function Dashboard() {
  const greeting = getGreeting()
  const quote = quotes[new Date().getDay() % quotes.length]
  const streak = 14

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header anim-fade-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>
              {greeting.emoji} {greeting.text}
            </div>
            <h1 className="page-title">
              Hey, <span className="gradient-text">Alex!</span>
            </h1>
            <p className="page-subtitle">{greeting.sub}</p>
          </div>
          {/* Streak Badge */}
          <div className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', padding: '12px 20px' }}>
            <span style={{ fontSize: 28, animation: 'streakFlame 1.5s ease-in-out infinite', display: 'block' }}>🔥</span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fbbf24' }}>{streak}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Day Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Today's Activity Stats ── */}
      <div style={{ marginBottom: 28 }}>
        <h2 className="section-heading anim-fade-up delay-1">Today's Activity</h2>
        <div className="grid-4">
          {activityData.map((item, i) => (
            <div key={item.label} className={`card card-sm anim-fade-up delay-${i + 1}`} style={{ textAlign: 'center' }}>
              <div className="stat-ring-container" style={{ marginBottom: 12 }}>
                <AnimatedRing percent={item.percent} color={item.color} size={80} stroke={8} />
                <div className="stat-ring-label">
                  <div style={{ fontSize: 16 }}>{item.icon}</div>
                </div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                {item.value.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 2 }}>{item.unit}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.label}</div>
              <div className="progress-bar" style={{ marginTop: 8 }}>
                <div className="progress-fill" style={{ width: `${item.percent}%`, background: item.color }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{item.percent}% of goal</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Motivational Quote ── */}
      <div className="card card-glow anim-fade-up delay-3" style={{ marginBottom: 28, background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.06 }}>"</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Star size={18} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--purple-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Daily Motivation</div>
            <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic' }}>"{quote.text}"</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>— {quote.author}</p>
          </div>
        </div>
      </div>

      {/* ── Quick Start Workouts ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 className="section-heading anim-fade-up" style={{ marginBottom: 0 }}>Quick Start</h2>
          <a href="/workouts" style={{ fontSize: 13, color: 'var(--purple-light)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            See all <ChevronRight size={16} />
          </a>
        </div>
        <div className="grid-4">
          {quickWorkouts.map((w, i) => (
            <div key={w.id} className={`card card-sm anim-fade-up delay-${i + 2}`} style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: w.color, borderRadius: '14px 14px 0 0' }} />
              <div style={{ fontSize: 28, marginBottom: 10, display: 'block', animation: 'float 3s ease-in-out infinite', animationDelay: `${i * 0.3}s` }}>{w.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{w.name}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <span className="badge badge-purple" style={{ fontSize: 11 }}><Clock size={10} />{w.duration}</span>
                <span className={`badge`} style={{ fontSize: 11, background: w.intensity === 'High' ? 'rgba(239,68,68,0.12)' : w.intensity === 'Low' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: w.intensity === 'High' ? '#f87171' : w.intensity === 'Low' ? '#34d399' : '#fbbf24', border: 'none' }}>
                  {w.intensity}
                </span>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}>
                <Play size={14} fill="white" /> Start
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Weekly Summary ── */}
      <div className="grid-2 anim-fade-up delay-4">
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={18} color="var(--purple)" /> Weekly Goals
          </div>
          {[
            { label: 'Workouts Completed', done: 4, total: 5, color: 'var(--purple)' },
            { label: 'Calories Burned',    done: 3, total: 5, color: 'var(--pink)' },
            { label: 'Active Minutes',     done: 5, total: 7, color: 'var(--cyan)' },
          ].map(g => (
            <div key={g.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{g.label}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{g.done}/{g.total}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(g.done/g.total)*100}%`, background: g.color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={18} color="var(--orange)" /> Body Metrics
          </div>
          {[
            { label: 'Body Weight',   value: '74.2 kg',  change: '-0.8 kg',  up: false },
            { label: 'Body Fat',      value: '18.4%',    change: '-0.3%',    up: false },
            { label: 'Muscle Mass',   value: '42.1 kg',  change: '+0.5 kg',  up: true  },
            { label: 'Hydration',     value: '62%',      change: '+2%',      up: true  },
          ].map(m => (
            <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{m.label}</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{m.value}</div>
                <div style={{ fontSize: 12, color: m.up ? 'var(--green)' : '#f87171', fontWeight: 600 }}>{m.change}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
