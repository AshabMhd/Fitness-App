import { useState } from 'react'
import { Bell, Moon, Eye, Accessibility, ChevronRight, Shield, Smartphone } from 'lucide-react'

const achievements = [
  { id: 1, icon: '🏅', name: 'First Workout',   desc: 'Completed your first session',   unlocked: true  },
  { id: 2, icon: '🔥', name: '7-Day Streak',    desc: 'Worked out 7 days in a row',      unlocked: true  },
  { id: 3, icon: '💪', name: 'Strength Master', desc: 'Lifted 1000 kg total',            unlocked: true  },
  { id: 4, icon: '🏃', name: 'Marathon Ready',  desc: 'Ran 42 km this month',            unlocked: false },
  { id: 5, icon: '⚡', name: 'HIIT Champion',   desc: 'Complete 20 HIIT sessions',       unlocked: false },
  { id: 6, icon: '🧘', name: 'Zen Master',      desc: 'Complete 15 yoga sessions',       unlocked: false },
]

const goals = [
  { id: 'weight_loss',    label: 'Weight Loss',    icon: '⚖️'  },
  { id: 'muscle_gain',   label: 'Muscle Gain',    icon: '💪'  },
  { id: 'endurance',     label: 'Endurance',      icon: '🏃'  },
  { id: 'flexibility',   label: 'Flexibility',    icon: '🧘'  },
  { id: 'general',       label: 'Stay Active',    icon: '⚡'  },
]

export default function Profile() {
  const [darkMode,      setDarkMode]      = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [privacyMode,   setPrivacyMode]   = useState(false)
  const [wearableSync,  setWearableSync]  = useState(false)
  const [fontSize,      setFontSize]      = useState('md')
  const [activeGoal,    setActiveGoal]    = useState('muscle_gain')

  const fontSizes = ['sm', 'md', 'lg', 'xl']

  return (
    <div>
      <div className="page-header anim-fade-up">
        <h1 className="page-title">My <span className="gradient-text">Profile</span></h1>
        <p className="page-subtitle">Personalize your fitness experience</p>
      </div>

      {/* ── User Card ── */}
      <div className="card card-glow anim-fade-up delay-1"
        style={{ marginBottom: 28, background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.06))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'var(--grad-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, boxShadow: 'var(--shadow-glow)',
              border: '3px solid rgba(139,92,246,0.5)',
              animation: 'pulse-ring 2.5s infinite',
            }}>
              🧑‍💼
            </div>
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 22, height: 22, background: 'var(--green)',
              borderRadius: '50%', border: '2px solid var(--bg-card)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10,
            }}>✓</div>
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 4 }}>Alex Johnson</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 12 }}>alex.johnson@fitness.com</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-purple">💪 Muscle Gain</span>
              <span className="badge badge-green">🔥 14-Day Streak</span>
              <span className="badge badge-orange">⭐ Level 12</span>
            </div>
          </div>

          <button className="btn btn-secondary" style={{ flexShrink: 0 }}>Edit Profile</button>
        </div>

        <div className="divider" />

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Workouts',  value: '147' },
            { label: 'Following', value: '32'  },
            { label: 'Followers', value: '89'  },
            { label: 'XP Points', value: '4.2k' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Fitness Goal Selector ── */}
      <div className="card anim-fade-up delay-2" style={{ marginBottom: 24 }}>
        <h2 className="section-heading" style={{ marginBottom: 16 }}>🎯 Fitness Goal</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {goals.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGoal(g.id)}
              aria-pressed={activeGoal === g.id}
              style={{
                padding: '10px 18px', borderRadius: 'var(--radius-full)',
                border: `1px solid ${activeGoal === g.id ? 'rgba(139,92,246,0.5)' : 'var(--border)'}`,
                background: activeGoal === g.id ? 'rgba(139,92,246,0.15)' : 'transparent',
                color: activeGoal === g.id ? 'var(--purple-light)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'var(--transition-bounce)', fontFamily: 'Inter, sans-serif',
                transform: activeGoal === g.id ? 'scale(1.04)' : 'scale(1)',
                boxShadow: activeGoal === g.id ? '0 0 20px rgba(139,92,246,0.2)' : 'none',
              }}
            >
              {g.icon} {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2 anim-fade-up delay-3" style={{ marginBottom: 24 }}>
        {/* ── Settings & Accessibility ── */}
        <div className="card">
          <h2 className="section-heading" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Accessibility size={18} color="var(--purple)" /> Accessibility & Settings
          </h2>

          <div className="toggle-row">
            <div className="toggle-label">
              <span className="toggle-label-title"><Moon size={14} style={{ display: 'inline', marginRight: 6 }} />Dark Mode</span>
              <span className="toggle-label-desc">Easier on eyes in low light</span>
            </div>
            <label className="toggle" aria-label="Toggle dark mode">
              <input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="toggle-row">
            <div className="toggle-label">
              <span className="toggle-label-title"><Bell size={14} style={{ display: 'inline', marginRight: 6 }} />Notifications</span>
              <span className="toggle-label-desc">Workout reminders & alerts</span>
            </div>
            <label className="toggle" aria-label="Toggle notifications">
              <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="toggle-row">
            <div className="toggle-label">
              <span className="toggle-label-title"><Eye size={14} style={{ display: 'inline', marginRight: 6 }} />Privacy Mode</span>
              <span className="toggle-label-desc">Hide personal metrics</span>
            </div>
            <label className="toggle" aria-label="Toggle privacy mode">
              <input type="checkbox" checked={privacyMode} onChange={e => setPrivacyMode(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="toggle-row">
            <div className="toggle-label">
              <span className="toggle-label-title"><Smartphone size={14} style={{ display: 'inline', marginRight: 6 }} />Wearable Sync</span>
              <span className="toggle-label-desc">Sync with smartwatch</span>
            </div>
            <label className="toggle" aria-label="Toggle wearable sync">
              <input type="checkbox" checked={wearableSync} onChange={e => setWearableSync(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>

          {/* Font Size Accessibility Control */}
          <div style={{ marginTop: 16, padding: '14px 0', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 12 }}>
              Text Size
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {fontSizes.map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  aria-pressed={fontSize === size}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${fontSize === size ? 'rgba(139,92,246,0.5)' : 'var(--border)'}`,
                    background: fontSize === size ? 'rgba(139,92,246,0.15)' : 'transparent',
                    color: fontSize === size ? 'var(--purple-light)' : 'var(--text-muted)',
                    fontSize: size === 'sm' ? 11 : size === 'md' ? 13 : size === 'lg' ? 15 : 17,
                    fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Account ── */}
        <div className="card">
          <h2 className="section-heading" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={18} color="var(--cyan)" /> Account
          </h2>
          {[
            { label: 'Personal Information', icon: '👤', sub: 'Name, age, height, weight' },
            { label: 'Health Data',          icon: '❤️', sub: 'Connect health apps' },
            { label: 'Privacy & Security',   icon: '🔒', sub: 'Data sharing preferences' },
            { label: 'Notifications',        icon: '🔔', sub: 'Manage alerts' },
            { label: 'Help & Support',       icon: '💬', sub: 'FAQ, contact us' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 0', borderBottom: '1px solid var(--border)',
              cursor: 'pointer', transition: 'var(--transition)',
            }}
              tabIndex={0} role="button" aria-label={item.label}
            >
              <div style={{ fontSize: 18 }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.sub}</div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Achievements ── */}
      <div className="card anim-fade-up delay-5">
        <h2 className="section-heading" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          🏆 Achievements
          <span className="badge badge-purple" style={{ marginLeft: 8 }}>{achievements.filter(a => a.unlocked).length}/{achievements.length}</span>
        </h2>
        <div className="grid-3">
          {achievements.map((ach, i) => (
            <div key={ach.id}
              className={`card card-sm anim-bounce-in delay-${i + 1}`}
              style={{
                textAlign: 'center',
                background: ach.unlocked ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
                borderColor: ach.unlocked ? 'rgba(245,158,11,0.25)' : 'var(--border)',
                opacity: ach.unlocked ? 1 : 0.45,
                filter: ach.unlocked ? 'none' : 'grayscale(1)',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8, display: 'block', animation: ach.unlocked ? 'float 3s ease-in-out infinite' : 'none', animationDelay: `${i * 0.2}s` }}>
                {ach.icon}
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{ach.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{ach.desc}</div>
              {ach.unlocked && (
                <span className="badge badge-green" style={{ marginTop: 10, fontSize: 11 }}>✓ Unlocked</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
