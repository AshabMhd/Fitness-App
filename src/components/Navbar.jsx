import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Dumbbell, TrendingUp, User } from 'lucide-react'

const navItems = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/workouts', icon: Dumbbell,        label: 'Workouts'  },
  { to: '/progress', icon: TrendingUp,      label: 'Progress'  },
  { to: '/profile',  icon: User,            label: 'Profile'   },
]

export default function Navbar() {
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
          <button className="streak-chip">
            <span style={{ display:'inline-block', animation:'flameDance 1.6s ease-in-out infinite' }}>🔥</span>
            Get Free Trial
          </button>
          <div className="avatar-btn" title="Ashab">A</div>
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
