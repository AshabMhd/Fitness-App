import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Dumbbell, TrendingUp, User, Zap } from 'lucide-react'

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard',  badge: null },
  { to: '/workouts',  icon: Dumbbell,        label: 'Workouts',   badge: '3' },
  { to: '/progress',  icon: TrendingUp,      label: 'Progress',   badge: null },
  { to: '/profile',   icon: User,            label: 'Profile',    badge: null },
]

export default function Navbar() {
  return (
    <>
      {/* ── Sidebar (desktop) ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Zap size={20} color="white" fill="white" />
          </div>
          <span className="logo-text">FitPulse</span>
        </div>

        <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              aria-label={label}
            >
              <Icon size={20} className="nav-icon" />
              <span>{label}</span>
              {badge && <span className="nav-badge">{badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Goal</div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, marginBottom: 8 }}>8,000 Steps</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '62%' }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>4,960 / 8,000</div>
          </div>
        </div>
      </aside>

      {/* ── Bottom Nav (mobile) ── */}
      <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
        <div className="bottom-nav-inner">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
              aria-label={label}
            >
              <div className="bnav-icon">
                <Icon size={20} />
              </div>
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
