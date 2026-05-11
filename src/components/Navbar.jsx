import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Dumbbell, TrendingUp, User, Camera, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/workouts', icon: Dumbbell,        label: 'Workouts'  },
  { to: '/camera',   icon: Camera,          label: 'Live Trainer' },
  { to: '/progress', icon: TrendingUp,      label: 'Progress'  },
  { to: '/profile',  icon: User,            label: 'Profile'   },
]

function userInitial(user) {
  if (!user) return 'U'
  const name = typeof user.name === 'string' ? user.name.trim() : ''
  if (name) return name[0].toUpperCase()
  const email = typeof user.email === 'string' ? user.email.trim() : ''
  if (email) return email[0].toUpperCase()
  return 'U'
}

export default function Navbar() {
  const { logout, user } = useAuth()
  const initial = userInitial(user)

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="topnav"
      >
        {/* Logo */}
        <div className="topnav-left">
          <img
            src="/fitness-logo.png"
            alt="FitPulse"
            style={{ height: 40, width: 'auto', objectFit: 'contain' }}
          />
        </div>


        {/* Center nav — exact PulseFit pill style, text only */}
        <nav className="topnav-nav" role="navigation" aria-label="Main navigation">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `topnav-item ${isActive ? 'active' : ''}`}
              aria-label={label}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right — CTA style button + avatar */}
        <div className="topnav-right">
          <button
            onClick={logout}
            className="streak-chip"
            style={{ background: '#ef4444', borderColor: '#ef4444' }}
          >
            <LogOut size={14} style={{ marginRight: '4px' }} />
            Logout
          </button>
          <NavLink
            to="/profile"
            className="avatar-btn"
            title="Profile"
            aria-label="Go to profile"
          >
            {initial}
          </NavLink>
        </div>
      </motion.header>

      {/* Mobile nav */}
      <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
        <div className="bottom-nav-inner">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}
              aria-label={label}
            >
              <div className="bnav-icon"><Icon size={20} /></div>
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
