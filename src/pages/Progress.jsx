import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import { TrendingUp, Award, Target, Activity } from 'lucide-react'

const weeklyData = [
  { day: 'Mon', steps: 6200, calories: 1800, active: 35 },
  { day: 'Tue', steps: 8100, calories: 2100, active: 55 },
  { day: 'Wed', steps: 5400, calories: 1650, active: 28 },
  { day: 'Thu', steps: 9300, calories: 2400, active: 68 },
  { day: 'Fri', steps: 7800, calories: 2050, active: 50 },
  { day: 'Sat', steps: 11200, calories: 2700, active: 82 },
  { day: 'Sun', steps: 4960, calories: 1840, active: 47 },
]

const monthlyCalories = [
  { week: 'W1', burned: 12400, consumed: 14200 },
  { week: 'W2', burned: 13800, consumed: 14800 },
  { week: 'W3', burned: 15200, consumed: 15400 },
  { week: 'W4', burned: 14100, consumed: 14900 },
]

const personalRecords = [
  { exercise: 'Bench Press',    record: '85 kg',  date: 'Mar 8',  icon: '🏋️', trend: '+5kg this month' },
  { exercise: '5K Run',         record: '24:32',  date: 'Mar 5',  icon: '🏃', trend: '-1:20 this month' },
  { exercise: 'Push-ups',       record: '52 reps',date: 'Mar 10', icon: '💪', trend: '+8 this month' },
  { exercise: 'Plank Duration', record: '3:45',   date: 'Mar 7',  icon: '⚡', trend: '+45s this month' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ fontSize: 12, color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value.toLocaleString()}{p.name === 'steps' ? ' steps' : p.name === 'calories' ? ' kcal' : ' min'}
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function Progress() {
  return (
    <div>
      <div className="page-header anim-fade-up">
        <h1 className="page-title">Progress & <span className="gradient-text">Analytics</span></h1>
        <p className="page-subtitle">Track your fitness journey over time</p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid-4 anim-fade-up delay-1" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Workouts', value: '47',    sub: 'this month',  icon: <Activity size={20} />, color: 'var(--purple)' },
          { label: 'Calories Burned', value: '54.8k', sub: 'this month', icon: '🔥',                  color: 'var(--pink)' },
          { label: 'Avg. Active Min', value: '52',   sub: 'per day',     icon: <Target size={20} />,  color: 'var(--cyan)' },
          { label: 'Best Streak',     value: '14',   sub: 'days',        icon: '🔥',                  color: 'var(--orange)' },
        ].map((s, i) => (
          <div key={s.label} className={`card card-sm anim-fade-up delay-${i + 1}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ color: s.color }}>{typeof s.icon === 'string' ? <span style={{ fontSize: 20 }}>{s.icon}</span> : s.icon}</div>
              <span className="badge" style={{ fontSize: 10, background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                <TrendingUp size={10} /> +12%
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)' }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>({s.sub})</div>
          </div>
        ))}
      </div>

      {/* ── Weekly Steps Bar Chart ── */}
      <div className="card anim-fade-up delay-2" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 className="section-heading" style={{ marginBottom: 0 }}>Weekly Steps</h2>
          <span className="badge badge-purple">This Week</span>
        </div>
        <div className="chart-container" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139,92,246,0.06)' }} />
              <Bar dataKey="steps" name="steps" fill="url(#stepsGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="stepsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Active Minutes Area Chart ── */}
      <div className="grid-2 anim-fade-up delay-3" style={{ marginBottom: 28 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 className="section-heading" style={{ marginBottom: 0 }}>Active Minutes</h2>
            <span className="badge badge-green">Daily</span>
          </div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="active" name="active" stroke="#06b6d4" strokeWidth={2.5} fill="url(#activeGrad)" dot={{ fill: '#06b6d4', r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 className="section-heading" style={{ marginBottom: 0 }}>Calorie Balance</h2>
            <span className="badge badge-pink">Monthly</span>
          </div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyCalories}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Line type="monotone" dataKey="burned"   name="calories" stroke="#ec4899" strokeWidth={2.5} dot={{ fill: '#ec4899', r: 4 }} />
                <Line type="monotone" dataKey="consumed" name="calories" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4 }} strokeDasharray="5 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <div style={{ width: 16, height: 2, background: '#ec4899', borderRadius: 2 }} /> Burned
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <div style={{ width: 16, height: 2, background: '#8b5cf6', borderRadius: 2, borderTop: '2px dashed #8b5cf6' }} /> Consumed
            </div>
          </div>
        </div>
      </div>

      {/* ── Personal Records ── */}
      <div className="card anim-fade-up delay-4" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Award size={20} color="var(--orange)" />
          <h2 className="section-heading" style={{ marginBottom: 0 }}>Personal Records</h2>
        </div>
        <div className="grid-2">
          {personalRecords.map((pr, i) => (
            <div key={pr.exercise} className={`card card-sm anim-fade-up delay-${i + 1}`}
              style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 28, animation: 'bounceIn 0.6s ease', animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}>{pr.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>{pr.exercise}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#fbbf24' }}>{pr.record}</div>
                  <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 2 }}>{pr.trend}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>{pr.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Wearable Sync Placeholder ── */}
      <div className="card anim-fade-up delay-5"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(6,182,212,0.06))', borderColor: 'rgba(59,130,246,0.25)', textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 12, animation: 'float 3s ease-in-out infinite' }}>⌚</div>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Wearable Device Sync</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>Connect your smartwatch or fitness band for real-time biometric data, heart rate zones, and sleep tracking.</div>
        <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', fontSize: 13, padding: '6px 16px' }}>
          🔜 Coming Soon
        </span>
      </div>
    </div>
  )
}
