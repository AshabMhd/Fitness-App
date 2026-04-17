import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Moon, Eye, Smartphone, Shield, ChevronRight, Accessibility } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { user } from '../utils/api'

const goals = [
  { id:'weight_loss', label:'Weight Loss', icon:'⚖️', color:'#F43F5E' },
  { id:'muscle_gain', label:'Muscle Gain', icon:'💪', color:'#3B82F6' },
  { id:'endurance',   label:'Endurance',   icon:'🏃', color:'#10B981' },
  { id:'flexibility', label:'Flexibility', icon:'🧘', color:'#8B5CF6' },
  { id:'general',     label:'Stay Active', icon:'⚡', color:'#F59E0B' },
]

const accountItems = [
  { label:'Personal Information', icon:'👤', sub:'Name, age, height, weight' },
  { label:'Health Data',          icon:'❤️', sub:'Connect health apps' },
  { label:'Privacy & Security',   icon:'🔒', sub:'Data sharing preferences' },
  { label:'Notifications',        icon:'🔔', sub:'Manage alerts' },
  { label:'Help & Support',       icon:'💬', sub:'FAQ, contact us' },
]

const cardVariants = {
  hidden: { opacity:0, y:24 },
  visible: i => ({ opacity:1, y:0, transition:{ duration:0.55, delay:i*0.1, ease:[0.4,0,0.2,1] } }),
}

export default function Profile() {
  const { user: authUser } = useAuth()
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const { darkMode, setDarkMode } = useAuth()
  const [notifs, setNotifs] = useState(true)
  const [privMode, setPrivMode] = useState(false)
  const [wearable, setWearable] = useState(false)
  const { fontSize, setFontSize } = useAuth()
  const [activeGoal, setActiveGoal] = useState('muscle_gain')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await user.getProfile()
        setUserProfile(profile)
        if (profile.goal) {
          setActiveGoal(profile.goal)
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const activeGoalObj = goals.find(g => g.id === activeGoal)
  const displayName = darkMode ? ` ${userProfile?.name || 'User'}` : userProfile?.name || 'User'

  const achievements = [
    { id:1, icon:'🏅', name:'First Workout',   desc:'Completed your first session',   unlocked:(userProfile?.completed_workouts || 0) >= 1 },
    { id:2, icon:'🔥', name:'7-Day Streak',    desc:'Worked out 7 days in a row',      unlocked:(userProfile?.streak || 0) >= 7 },
    { id:3, icon:'💪', name:'Strength Master', desc:'Earn 1,000 XP',                   unlocked:(userProfile?.total_xp || 0) >= 1000 },
    { id:4, icon:'🏃', name:'Marathon Ready',  desc:'Run 42 km this month',            unlocked:false },
    { id:5, icon:'⚡', name:'HIIT Champion',   desc:'Complete 20 HIIT sessions',       unlocked:false },
    { id:6, icon:'🧘', name:'Zen Master',      desc:'Complete 15 yoga sessions',       unlocked:false },
  ]
  const unlocked = achievements.filter(a => a.unlocked).length 

  if (loading) {
    return (
      <div className="page-inner">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Loading profile...
        </div>
      </div>
    )
  }

  return (
    <div className="page-inner">
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }} className="page-header">
        <div className="accent-line" />
        <h1 className="page-title">My <span className="gt-blue">Profile</span></h1>
        <p className="page-subtitle">Personalize your fitness experience</p>
      </motion.div>

      {/* Profile Hero */}
      <motion.div
        custom={0} variants={cardVariants} initial="hidden" animate="visible"
        style={{
          background: 'var(--bg-hero)',
          borderRadius: 24, padding: '36px 36px 28px',
          border: '1px solid var(--border)',
          marginBottom: 24, position:'relative', overflow:'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ position:'absolute', top:-60, right:-50, width:240, height:240, borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-40, left:-40, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div style={{ display:'flex', alignItems:'center', gap:24, flexWrap:'wrap', position:'relative' }}>
          {/* Avatar */}
          <motion.div
            animate={{ boxShadow:['0 0 0 0 rgba(59,130,246,0.3)','0 0 0 12px rgba(59,130,246,0)','0 0 0 0 rgba(59,130,246,0)'] }}
            transition={{ duration:2.5, repeat:Infinity }}
            style={{ width:86, height:86, borderRadius:'50%', background:'linear-gradient(135deg, #3B82F6, #6366F1)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter', fontSize:32, fontWeight:800, color:'white', border:'3px solid rgba(59,130,246,0.25)', flexShrink:0, position:'relative' }}
          >
            A
            <div style={{ position:'absolute', bottom:4, right:4, width:20, height:20, background:'#10B981', borderRadius:'50%', border:'2px solid white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'white' }}>✓</div>
          </motion.div>

          <div style={{ flex:1 }}>
            <h2 style={{ fontFamily:'Inter', fontWeight:800, fontSize:24, marginBottom:4, color:'var(--text-primary)', letterSpacing:'-0.5px' }}>{displayName}</h2>
            <div style={{ fontSize:14, color:'var(--text-muted)', marginBottom:14 }}>{userProfile?.email || ''}</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {activeGoalObj && <span style={{ fontSize:12, fontWeight:600, padding:'4px 12px', borderRadius:9999, background:`${activeGoalObj.color}20`, color:activeGoalObj.color, border:`1px solid ${activeGoalObj.color}40` }}>{activeGoalObj.icon} {activeGoalObj.label}</span>}
              <span style={{ fontSize:12, fontWeight:600, padding:'4px 12px', borderRadius:9999, background:'var(--badge-warning-bg)', color:'var(--badge-warning-color)', border:'1px solid var(--badge-warning-border)' }}>🔥 Active Member</span>
            </div>
          </div>

          <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }} style={{ padding:'10px 22px', borderRadius:9999, background:'var(--bg-white)', border:'1px solid var(--border)', fontSize:14, fontWeight:600, cursor:'pointer', color:'var(--text-primary)', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', flexShrink:0 }}>
            Edit Profile
          </motion.button>
        </div>

        <div style={{ height:1, background:'var(--border)', margin:'28px 0 20px' }} />
        <div style={{ display:'flex', justifyContent:'space-around' }}>
          {[
            { v: userProfile?.completed_workouts || 0,   l:'Workouts' },
            { v: `${userProfile?.streak || 0}d`,         l:'Current Streak' },
            { v: `${userProfile?.total_xp || 0} XP`,      l:'XP Earned' },
            { v: `${userProfile?.hours_logged || 0}h`,    l:'Hours Logged' },
          ].map((s,i)=>(
            <div key={s.l} style={{ textAlign:'center', padding:'0 16px', borderRight:i<3?'1px solid var(--border)':'none' }}>
              <div style={{ fontFamily:'Inter', fontSize:24, fontWeight:800, color:'var(--text-primary)', letterSpacing:'-0.8px' }}>{s.v}</div>
              <div style={{ fontSize:11, color:'var(--text-faint)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginTop:3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Goal Selector */}
      <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" className="card" style={{ marginBottom:24 }}>
        <h2 className="section-title">🎯 Fitness Goal</h2>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16 }}>
          {goals.map(g => (
            <motion.button
              key={g.id} whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
              onClick={() => setActiveGoal(g.id)}
              style={{
                padding:'10px 20px', borderRadius:9999,
                border:`1px solid ${activeGoal===g.id ? g.color+'50' : 'var(--border)'}`,
                background: activeGoal===g.id ? `${g.color}10` : 'var(--bg-subtle)',
                color: activeGoal===g.id ? g.color : 'var(--text-secondary)',
                fontSize:14, fontWeight:600, cursor:'pointer',
                fontFamily:'Inter',
                boxShadow: activeGoal===g.id ? `0 4px 14px ${g.color}20` : 'none',
              }}
            >
              {g.icon} {g.label}
            </motion.button>
          ))}
        </div>
        {activeGoalObj && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} key={activeGoal} style={{ padding:'14px 18px', borderRadius:16, background:`${activeGoalObj.color}07`, border:`1px solid ${activeGoalObj.color}25`, fontSize:14, color:'var(--text-secondary)', fontWeight:400, lineHeight:1.6 }}>
            🎯 Current focus: <span style={{ color:activeGoalObj.color, fontWeight:700 }}>{activeGoalObj.label}</span> — your workouts and recommendations are tailored to this goal.
          </motion.div>
        )}
      </motion.div>

      {/* Settings + Account */}
      <div className="g2" style={{ marginBottom:24 }}>
        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" className="card">
          <h2 className="section-title" style={{ display:'flex', alignItems:'center', gap:8, marginBottom:22 }}>
            <Accessibility size={18} color="var(--blue)"/> Settings
          </h2>
          {[
            { icon:<Moon size={15}/>,      title:'Dark Mode',      desc:'Easier on eyes in low light', state:darkMode, set:setDarkMode  },
            { icon:<Bell size={15}/>,      title:'Notifications',  desc:'Workout reminders & alerts',  state:notifs,   set:setNotifs    },
            { icon:<Eye size={15}/>,       title:'Privacy Mode',   desc:'Hide personal metrics',       state:privMode, set:setPrivMode  },
            { icon:<Smartphone size={15}/>,title:'Wearable Sync',  desc:'Sync with smartwatch',        state:wearable, set:setWearable  },
          ].map(item => (
            <div key={item.title} className="toggle-row">
              <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                <span style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ color:'var(--text-muted)' }}>{item.icon}</span> {item.title}
                </span>
                <span style={{ fontSize:12, color:'var(--text-faint)' }}>{item.desc}</span>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={item.state} onChange={e=>item.set(e.target.checked)}/>
                <span className="toggle-slider"/>
              </label>
            </div>
          ))}
          <div style={{ marginTop:18, paddingTop:18, borderTop:'1px solid var(--border)' }}>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:12 }}>Text Size</div>
            <div style={{ display:'flex', gap:8 }}>
              {['sm','md','lg','xl'].map(sz=>(
                <motion.button key={sz} whileHover={{ scale:1.05 }} onClick={() => setFontSize(sz)} style={{ flex:1, padding:'9px 4px', borderRadius:12, border:`1px solid ${fontSize===sz?'var(--blue-border)':'var(--border)'}`, background: fontSize===sz?'rgba(59,130,246,0.08)':'var(--bg-subtle)', color: fontSize===sz?'var(--blue)':'var(--text-faint)', fontSize: sz==='sm'?11:sz==='md'?13:sz==='lg'?15:17, fontWeight:700, cursor:'pointer', fontFamily:'Inter' }}>
                  {sz.toUpperCase()}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible" className="card">
          <h2 className="section-title" style={{ display:'flex', alignItems:'center', gap:8, marginBottom:22 }}>
            <Shield size={18} color="#10B981"/> Account
          </h2>
          {accountItems.map(item => (
            <motion.div
              key={item.label}
              whileHover={{ x:4 }}
              style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom:'1px solid var(--border)', cursor:'pointer' }}
              role="button" tabIndex={0}
            >
              <div style={{ width:40, height:40, borderRadius:12, background:'var(--bg-subtle)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, border:'1px solid var(--border)' }}>{item.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{item.label}</div>
                <div style={{ fontSize:12, color:'var(--text-faint)', marginTop:2 }}>{item.sub}</div>
              </div>
              <ChevronRight size={16} color="var(--text-faint)"/>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" className="card">
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <h2 className="section-title" style={{ marginBottom:0 }}>🏆 Achievements</h2>
          <span style={{ fontSize:12, fontWeight:600, padding:'4px 12px', borderRadius:9999, background:'rgba(245,158,11,0.08)', color:'var(--amber)', border:'1px solid rgba(245,158,11,0.2)' }}>{unlocked}/{achievements.length}</span>
        </div>
        <div className="g3">
          {achievements.map((ach, i) => (
            <motion.div
              key={ach.id}
              custom={i}
              variants={{ hidden:{ opacity:0, scale:0.9 }, visible: i => ({ opacity:1, scale:1, transition:{ duration:0.4, delay:0.4+i*0.06, ease:[0.34,1.56,0.64,1] } }) }}
              initial="hidden" animate="visible"
              whileHover={ach.unlocked ? { y:-6, boxShadow:'0 12px 32px rgba(0,0,0,0.1)' } : {}}
              className={`ach-card ${ach.unlocked?'unlocked':'locked'}`}
            >
              <div className="ach-icon" style={{ background:ach.unlocked?'rgba(245,158,11,0.1)':'rgba(0,0,0,0.04)', border:`1px solid ${ach.unlocked ? 'rgba(245,158,11,0.2)' : 'var(--border)'}` }}>
                {ach.icon}
              </div>
              <div style={{ fontFamily:'Inter', fontWeight:700, fontSize:13, color:'var(--text-primary)' }}>{ach.name}</div>
              <div style={{ fontSize:11, color:'var(--text-faint)', lineHeight:1.5, textAlign:'center' }}>{ach.desc}</div>
              {ach.unlocked && (
                <span style={{ fontSize:10, fontWeight:600, padding:'3px 10px', borderRadius:9999, background:'rgba(16,185,129,0.08)', color:'#10B981', border:'1px solid rgba(16,185,129,0.2)', marginTop:4 }}>✓ Unlocked</span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
