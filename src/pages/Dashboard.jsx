import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Play, Target, Zap, TrendingUp, Activity, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { dashboard, workouts } from '../utils/api'

const quotes = [
  { text: "Every set, every rep — you're forging a stronger version of yourself.", author: "FitPulse" },
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Strength doesn't come from what you can do — it comes from overcoming what you thought you couldn't.", author: "Rikki Rogers" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
]

function AnimatedRing({ pct, color, size=92, stroke=8, label, value, unit }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const [offset, setOffset] = useState(circ)

  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (pct / 100) * circ), 400)
    return () => clearTimeout(t)
  }, [pct, circ])

  return (
    <div style={{ textAlign:'center' }}>
      <div className="ring-wrap" style={{ width:size, height:size }}>
        <svg width={size} height={size} style={{ transform:'rotate(-90deg)', display:'block' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} />
          <circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition:'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="ring-center">
          <div style={{ fontFamily:'Inter, sans-serif', fontSize:14, fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.5px' }}>
            {value.toLocaleString()}
          </div>
          {unit && <div style={{ fontSize:9, color:'var(--text-faint)', fontWeight:500, marginTop:1 }}>{unit}</div>}
        </div>
      </div>
      <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:8, fontWeight:500 }}>{label}</div>
      <div style={{ fontSize:10, color:'var(--text-faint)', marginTop:2 }}>{pct}% of goal</div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return { text:'Good Morning', emoji:'☀️', sub:"Let's crush today's training!" }
  if (h < 17) return { text:'Good Afternoon', emoji:'🌤️', sub:"Keep the momentum going!" }
  return { text:'Good Evening', emoji:'🌙', sub:"Recovery is part of the plan." }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12, ease: [0.4,0,0.2,1] } }),
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [quickWorkouts, setQuickWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [dashboardResult, workoutsResult] = await Promise.all([
          dashboard.getData(),
          workouts.getAll()
        ])

        setDashboardData(dashboardResult)
        // Get 4 random workouts for quick access
        const shuffled = workoutsResult.sort(() => 0.5 - Math.random())
        const transformedWorkouts = shuffled.slice(0, 4).map(w => ({
          name: w.name,
          duration: `${w.duration} min`,
          intensity: w.difficulty <= 2 ? 'Low' : w.difficulty <= 3 ? 'Medium' : 'High',
          emoji: w.category === 'cardio' ? '🏃' : w.category === 'strength' ? '💪' : w.category === 'yoga' ? '🧘' : '⚡',
          color: w.category === 'cardio' ? '#F43F5E' : w.category === 'strength' ? '#3B82F6' : w.category === 'yoga' ? '#10B981' : '#F59E0B',
          image: w.image_url,
          category: w.category.toUpperCase()
        }))
        setQuickWorkouts(transformedWorkouts)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const greeting = getGreeting()
  const quote = quotes[new Date().getDay() % quotes.length]

  if (loading) {
    return (
      <div className="page-inner">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Loading dashboard...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-inner">
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          Error loading dashboard: {error}
        </div>
      </div>
    )
  }

  const todayProgress = dashboardData?.todayProgress || { steps: 0, calories_burned: 0, active_minutes: 0, heart_rate_avg: 0 }
  const recentSessions = dashboardData?.recentSessions || []

  const activityData = [
    { label:'Steps', value:todayProgress.steps, target:8000, unit:'', emoji:'👟', color:'#3B82F6', pct:Math.min(100, Math.round((todayProgress.steps / 8000) * 100)) },
    { label:'Calories', value:todayProgress.calories_burned, target:2200, unit:'kcal', emoji:'🔥', color:'#F59E0B', pct:Math.min(100, Math.round((todayProgress.calories_burned / 2200) * 100)) },
    { label:'Active', value:todayProgress.active_minutes, target:60, unit:'min', emoji:'⚡', color:'#10B981', pct:Math.min(100, Math.round((todayProgress.active_minutes / 60) * 100)) },
    { label:'Heart', value:todayProgress.heart_rate_avg || 72, target:140, unit:'bpm', emoji:'❤️', color:'#8B5CF6', pct:Math.min(100, Math.round(((todayProgress.heart_rate_avg || 72) / 140) * 100)) },
  ]

  const recentActivity = recentSessions.map(session => ({
    icon: session.category === 'cardio' ? '🏃' : session.category === 'strength' ? '💪' : session.category === 'yoga' ? '🧘' : '⚡',
    title: session.name,
    sub: `${session.duration} min completed`,
    time: new Date(session.end_time).toLocaleDateString(),
    color: session.category === 'cardio' ? '#F43F5E' : session.category === 'strength' ? '#3B82F6' : session.category === 'yoga' ? '#10B981' : '#F59E0B'
  }))

  return (
    <div className="page-inner">

      {/* ── Hero greeting ── */}
      <motion.div
        initial={{ opacity:0, y:30 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.8, ease:[0.4,0,0.2,1] }}
        style={{ marginBottom:32 }}
      >
        <div
          style={{
            background: 'linear-gradient(180deg, #E8F0FF 0%, #F5F9FF 60%, #FFFFFF 100%)',
            borderRadius: 24,
            padding: '40px 40px 36px',
            border: '1px solid rgba(226,232,240,0.6)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {/* bg radial glows */}
          <div style={{ position:'absolute', top:-60, right:-40, width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-40, left:-30, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />

          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:20, position:'relative' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, color:'var(--text-muted)', marginBottom:10, fontWeight:400 }}>
                {greeting.emoji} {greeting.text}
              </div>
              <h1 style={{ fontFamily:'Inter', fontSize:'clamp(30px, 4vw, 48px)', fontWeight:800, letterSpacing:'-0.03em', marginBottom:10, lineHeight:1.1, color:'var(--text-primary)' }}>
                Train smarter,{' '}
                <span style={{ background:'linear-gradient(135deg, #3B82F6, #6366F1)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                  {greeting.text === 'Good Morning' ? 'start strong.' : greeting.text === 'Good Afternoon' ? 'keep going.' : 'rest well.'}
                </span>
              </h1>
              <p style={{ fontSize:16, color:'var(--text-secondary)', fontWeight:400, maxWidth:520, lineHeight:1.6, marginBottom:28 }}>
                {greeting.sub} Guided fitness sessions tailored to your goals — accessible 24/7.
              </p>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                <Link to="/workouts">
                  <motion.button
                    whileHover={{ scale:1.04 }}
                    whileTap={{ scale:0.97 }}
                    style={{
                      display:'flex', alignItems:'center', gap:8,
                      padding:'14px 28px', borderRadius:9999,
                      background:'#1a1a1a', color:'#FFFFFF',
                      fontFamily:'Inter', fontSize:16, fontWeight:500,
                      border:'none', cursor:'pointer',
                      boxShadow:'0 4px 16px rgba(0,0,0,0.15)',
                    }}
                  >
                    <Play size={16} fill="white" /> Start training
                    <ArrowRight size={16} />
                  </motion.button>
                </Link>
                <Link to="/workouts">
                  <motion.button
                    whileHover={{ scale:1.04 }}
                    whileTap={{ scale:0.97 }}
                    style={{
                      display:'flex', alignItems:'center', gap:8,
                      padding:'14px 28px', borderRadius:9999,
                      background:'transparent', color:'#1a1a1a',
                      fontFamily:'Inter', fontSize:16, fontWeight:500,
                      border:'1px solid #cbd5e0', cursor:'pointer',
                    }}
                  >
                    Browse programs
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* Streak card — right side */}
            <motion.div
              animate={{ y:[0,-6,0] }}
              transition={{ duration:3.5, repeat:Infinity, ease:'easeInOut' }}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'20px 24px', borderRadius:20, background:'rgba(255,255,255,0.9)', border:'1px solid rgba(226,232,240,0.8)', backdropFilter:'blur(12px)', boxShadow:'0 8px 32px rgba(0,0,0,0.08)', flexShrink:0 }}
            >
              <span style={{ fontSize:36, animation:'flameDance 1.5s ease-in-out infinite' }}>🔥</span>
              <div style={{ fontFamily:'Inter', fontSize:32, fontWeight:800, color:'#F59E0B', lineHeight:1, letterSpacing:'-1px' }}>{dashboardData?.streak || 0}</div>
              <div style={{ fontSize:10, color:'var(--text-faint)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>Day Streak</div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Activity Rings ── */}
      <motion.div
        custom={0} variants={cardVariants} initial="hidden" animate="visible"
        className="card" style={{ marginBottom:24 }}
      >
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <div className="accent-line" />
            <h2 className="section-title" style={{ marginBottom:0 }}>Today's Activity</h2>
          </div>
          <span className="neon-tag neon-tag-fire">● Live</span>
        </div>

        <div style={{ display:'flex', justifyContent:'space-around', flexWrap:'wrap', gap:20, marginBottom:24 }}>
          {activityData.map(item => (
            <AnimatedRing key={item.label} pct={item.pct} color={item.color} label={item.label} value={item.value} unit={item.unit} />
          ))}
        </div>

        <div className="divider" />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'12px 32px' }}>
          {activityData.map(item => (
            <div key={item.label}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:7 }}>
                <span style={{ color:'var(--text-secondary)', fontWeight:500 }}>{item.emoji} {item.label}</span>
                <span style={{ color:'var(--text-primary)', fontWeight:700 }}>
                  {item.value.toLocaleString()}{item.unit && ` ${item.unit}`}
                  <span style={{ color:'var(--text-faint)', fontWeight:400 }}> / {item.target.toLocaleString()}</span>
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width:`${item.pct}%`, background:item.color }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Programs carousel (PulseFit style) ── */}
      <motion.div
        custom={1} variants={cardVariants} initial="hidden" animate="visible"
        style={{ marginBottom:24 }}
      >
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div className="accent-line" />
            <h2 className="section-title" style={{ marginBottom:0 }}>Quick Start Programs</h2>
          </div>
          <Link to="/workouts" style={{ fontSize:14, color:'var(--text-secondary)', textDecoration:'none', fontWeight:500, display:'flex', alignItems:'center', gap:4 }}>
            All programs <ChevronRight size={16} />
          </Link>
        </div>

        {/* Scrolling cards row — exact PulseFit carousel */}
        <div style={{ position:'relative', overflow:'hidden' }}>
          {/* Left fade */}
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:80, zIndex:10, pointerEvents:'none', background:'linear-gradient(90deg, var(--bg-page) 0%, transparent 100%)' }} />
          {/* Right fade */}
          <div style={{ position:'absolute', right:0, top:0, bottom:0, width:80, zIndex:10, pointerEvents:'none', background:'linear-gradient(270deg, var(--bg-page) 0%, transparent 100%)' }} />

          <motion.div
            animate={{ x:[0, -(quickWorkouts.length * 304)] }}
            transition={{ x:{ repeat:Infinity, repeatType:'loop', duration:quickWorkouts.length * 4, ease:'linear' } }}
            style={{ display:'flex', gap:24, paddingBottom:8 }}
          >
            {[...quickWorkouts, ...quickWorkouts].map((w, i) => (
              <motion.div
                key={i}
                whileHover={{ scale:1.05, y:-10 }}
                transition={{ duration:0.3 }}
                className="program-card"
                style={{ flexShrink:0 }}
              >
                <img src={w.image} alt={w.name} />
                <div className="program-card-overlay" />
                <div className="program-card-text">
                  <div className="program-card-category">{w.category}</div>
                  <div className="program-card-title">{w.name}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ── Quick Start + Weekly Goals ── */}
      <div className="g2 anim-up d2" style={{ marginBottom:24 }}>
        {/* Quick workouts */}
        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" className="card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <h2 className="section-title" style={{ marginBottom:0 }}>Quick Start</h2>
            <Link to="/workouts" style={{ fontSize:14, color:'var(--text-secondary)', textDecoration:'none', fontWeight:500, display:'flex', alignItems:'center', gap:3 }}>
              All workouts <ChevronRight size={15} />
            </Link>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {quickWorkouts.map((w, i) => (
              <Link key={w.name} to="/workouts" style={{ textDecoration:'none' }}>
                <motion.div
                  whileHover={{ x:4, boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}
                  style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:16, background:'var(--bg-subtle)', border:'1px solid var(--border)', cursor:'pointer' }}
                >
                  <div style={{ width:42, height:42, borderRadius:12, overflow:'hidden', flexShrink:0 }}>
                    <img src={w.image} alt={w.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>{w.name}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{w.duration}</div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:9999, background:`${w.color}12`, color:w.color, border:`1px solid ${w.color}30` }}>
                    {w.intensity}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Weekly Goals */}
        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible" className="card">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
            <Target size={18} color="var(--blue)" />
            <h2 className="section-title" style={{ marginBottom:0 }}>Weekly Goals</h2>
          </div>
          {[
            { label:'Workouts Completed', done:4, total:5, color:'#3B82F6' },
            { label:'Active Minutes',     done:5, total:7, color:'#10B981' },
            { label:'Calorie Target',     done:3, total:5, color:'#8B5CF6' },
          ].map(g => (
            <div key={g.label} style={{ marginBottom:18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8 }}>
                <span style={{ color:'var(--text-secondary)', fontWeight:500 }}>{g.label}</span>
                <span style={{ color:'var(--text-primary)', fontWeight:700 }}>
                  {g.done}<span style={{ color:'var(--text-faint)', fontWeight:400 }}>/{g.total}</span>
                </span>
              </div>
              <div className="progress-track">
                <motion.div
                  className="progress-fill"
                  initial={{ width:0 }}
                  animate={{ width:`${(g.done/g.total)*100}%` }}
                  transition={{ duration:1.2, delay:0.5 }}
                  style={{ background:g.color }}
                />
              </div>
            </div>
          ))}
          <div className="divider" />
          <div style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
            <Zap size={14} color="var(--amber)" /> Body Metrics
          </div>
          {[
            { label:'Body Weight', v:'74.2 kg', delta:'-0.8 kg', up:false },
            { label:'Muscle Mass', v:'42.1 kg', delta:'+0.5 kg', up:true  },
            { label:'Body Fat',    v:'18.4%',   delta:'-0.3%',   up:false },
          ].map(m => (
            <div key={m.label} className="metric-row">
              <span style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:500 }}>{m.label}</span>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>{m.v}</div>
                <div style={{ fontSize:11, color: m.up ? '#10B981' : '#3B82F6', fontWeight:600 }}>{m.delta}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Quote + Recent ── */}
      <div className="g2">
        {/* Quote */}
        <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" className="card" style={{ background:'linear-gradient(135deg, #EEF4FF 0%, #F5F9FF 100%)', border:'1px solid rgba(59,130,246,0.15)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-10, right:10, fontSize:100, opacity:0.06, fontFamily:'Georgia', color:'#3B82F6', lineHeight:1 }}>"</div>
          <div style={{ fontSize:11, color:'var(--blue)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>Daily Fuel ⚡</div>
          <p style={{ fontSize:16, lineHeight:1.75, fontStyle:'italic', color:'var(--text-primary)', marginBottom:14, position:'relative' }}>
            "{quote.text}"
          </p>
          <p style={{ fontSize:13, color:'var(--text-muted)', fontWeight:500 }}>— {quote.author}</p>
        </motion.div>

        {/* Recent activity */}
        <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible" className="card">
          <h2 className="section-title">Recent Activity</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {recentActivity.map((item, i) => (
              <motion.div key={i} initial={{ opacity:0, x:-14 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.6 + i*0.1 }} style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:`${item.color}12`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, border:`1px solid ${item.color}22` }}>
                  {item.icon}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{item.title}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{item.sub}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:11, color:'var(--text-faint)', marginBottom:5, fontWeight:500 }}>{item.time}</div>
                  <span style={{ fontSize:10, fontWeight:600, padding:'2px 9px', borderRadius:9999, background:`${item.color}12`, color:item.color, border:`1px solid ${item.color}25` }}>✓</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="divider" />
          <Link to="/progress">
            <motion.button
              whileHover={{ scale:1.02 }}
              style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px 20px', borderRadius:12, background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.15)', color:'var(--blue)', fontFamily:'Inter', fontSize:14, fontWeight:600, cursor:'pointer' }}
            >
              <Activity size={15} /> View Full Progress <ArrowRight size={14} />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
