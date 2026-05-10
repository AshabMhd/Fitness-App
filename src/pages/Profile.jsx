import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Moon, Eye, Smartphone, Shield, ChevronRight, Accessibility, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { user } from '../utils/api'
import { applyReminderSchedule } from '../utils/notifications'
import {
  getReminderPreferences,
  saveReminderPreferences,
  DEFAULT_REMINDER_PREFS,
} from '../utils/reminderPreferences'

const goals = [
  { id:'weight_loss', label:'Weight Loss', icon:'⚖️', color:'#F43F5E' },
  { id:'muscle_gain', label:'Muscle Gain', icon:'💪', color:'#3B82F6' },
  { id:'endurance',   label:'Endurance',   icon:'🏃', color:'#10B981' },
  { id:'flexibility', label:'Flexibility', icon:'🧘', color:'#8B5CF6' },
  { id:'general',     label:'Stay Active', icon:'⚡', color:'#F59E0B' },
]

const accountItems = [
  { key: 'personal', label: 'Personal Information', icon: '👤', sub: 'Name, age, height, weight' },
  { key: 'health', label: 'Health Data', icon: '❤️', sub: 'Connect health apps' },
  { key: 'privacy', label: 'Privacy & Security', icon: '🔒', sub: 'Data sharing preferences' },
  { key: 'notifications', label: 'Notifications', icon: '🔔', sub: 'Workout & water reminder times' },
  { key: 'help', label: 'Help & Support', icon: '💬', sub: 'FAQ, contact us' },
]

const supportFaq = [
  {
    q: 'How do I log a workout?',
    a: 'Open Workout Tracker, run your session, check off exercises, then tap Finish Session. Your streak and progress update automatically.',
  },
  {
    q: 'Where is my data stored?',
    a: 'Your account and workout history are stored on the FitPulse server you connect to. Profile settings like reminders are saved on this device.',
  },
  {
    q: 'Why are my stats hidden?',
    a: 'Turn on Privacy Mode in Settings to hide personal metrics on screen. Turn it off anytime to see full numbers again.',
  },
  {
    q: 'Reminders are not firing',
    a: 'Allow notifications for this app in your device settings. On the web, push reminders may be limited; use the mobile app for reliable alerts.',
  },
]

const cardVariants = {
  hidden: { opacity:0, y:24 },
  visible: i => ({ opacity:1, y:0, transition:{ duration:0.55, delay:i*0.1, ease:[0.4,0,0.2,1] } }),
}

function profileInitial(profile) {
  const name = typeof profile?.name === 'string' ? profile.name.trim() : ''
  if (name) return name[0].toUpperCase()
  const email = typeof profile?.email === 'string' ? profile.email.trim() : ''
  if (email) return email[0].toUpperCase()
  return 'U'
}

/** Visible profile name when privacy mode hides full identity */
function maskDisplayName(name) {
  const n = typeof name === 'string' ? name.trim() : ''
  if (!n) return 'Member'
  return `${n[0].toUpperCase()}•••`
}

const MASK_METRIC = '•••'

export default function Profile() {
  const {
    refreshUser,
    darkMode,
    setDarkMode,
    fontSize,
    setFontSize,
    privacyMode,
    setPrivacyMode,
  } = useAuth()
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifs, setNotifs] = useState(() => localStorage.getItem('fitpulse-notifications-enabled') !== '0')
  const [wearable, setWearable] = useState(false)
  const [accountModal, setAccountModal] = useState(null)
  const [faqOpen, setFaqOpen] = useState(null)
  const [reminderForm, setReminderForm] = useState(() => getReminderPreferences())
  const [reminderSaved, setReminderSaved] = useState(false)
  const [activeGoal, setActiveGoal] = useState('muscle_gain')
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', age: '', height: '', weight: '' })
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  const openEdit = () => {
    if (!userProfile) return
    setEditForm({
      name: userProfile.name ?? '',
      age: userProfile.age != null ? String(userProfile.age) : '',
      height: userProfile.height != null ? String(userProfile.height) : '',
      weight: userProfile.weight != null ? String(userProfile.weight) : '',
    })
    setSaveError('')
    setEditOpen(true)
  }

  const saveProfile = async () => {
    setSaveError('')
    const name = editForm.name.trim()
    const age = parseInt(editForm.age, 10)
    const height = parseFloat(editForm.height)
    const weight = parseFloat(editForm.weight)
    if (!name) {
      setSaveError('Please enter your name.')
      return
    }
    if (Number.isNaN(age) || age < 1 || age > 120) {
      setSaveError('Please enter a valid age.')
      return
    }
    if (Number.isNaN(height) || height <= 0) {
      setSaveError('Please enter a valid height.')
      return
    }
    if (Number.isNaN(weight) || weight <= 0) {
      setSaveError('Please enter a valid weight.')
      return
    }
    setSaving(true)
    try {
      await user.updateProfile({
        name,
        age,
        height,
        weight,
        goal: activeGoal,
      })
      const profile = await user.getProfile()
      setUserProfile(profile)
      await refreshUser()
      setEditOpen(false)
    } catch (err) {
      setSaveError(err?.message || 'Could not save profile.')
    } finally {
      setSaving(false)
    }
  }

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

  useEffect(() => {
    localStorage.setItem('fitpulse-notifications-enabled', notifs ? '1' : '0')
    applyReminderSchedule().catch(() => {})
  }, [notifs])

  useEffect(() => {
    if (accountModal === 'notifications') {
      setReminderForm(getReminderPreferences())
      setReminderSaved(false)
    }
  }, [accountModal])

  const handleAccountItem = (key) => {
    if (key === 'personal') {
      openEdit()
      return
    }
    setAccountModal(key)
  }

  const saveReminderSettings = async () => {
    saveReminderPreferences({
      workoutTime: reminderForm.workoutTime,
      waterIntervalHours: reminderForm.waterIntervalHours,
      waterWindowStart: reminderForm.waterWindowStart,
      waterWindowEnd: reminderForm.waterWindowEnd,
    })
    await applyReminderSchedule()
    setReminderSaved(true)
  }

  const activeGoalObj = goals.find(g => g.id === activeGoal)
  const displayName = privacyMode
    ? maskDisplayName(userProfile?.name)
    : (userProfile?.name?.trim() || 'User')
  const emailDisplay = privacyMode ? '••••••••@••••••' : (userProfile?.email || '')
  const avatarLetter = profileInitial(userProfile)

  const heroStats = privacyMode
    ? [
        { v: MASK_METRIC, l: 'Workouts' },
        { v: MASK_METRIC, l: 'Current Streak' },
        { v: MASK_METRIC, l: 'XP Earned' },
        { v: MASK_METRIC, l: 'Hours Logged' },
      ]
    : [
        { v: userProfile?.completed_workouts || 0, l: 'Workouts' },
        { v: `${userProfile?.streak || 0}d`, l: 'Current Streak' },
        { v: `${userProfile?.total_xp || 0} XP`, l: 'XP Earned' },
        { v: `${userProfile?.hours_logged || 0}h`, l: 'Hours Logged' },
      ]

  const achievements = [
    { id:1, icon:'🏅', name:'First Workout',   desc:'Completed your first session',   unlocked:(userProfile?.completed_workouts || 0) >= 1 },
    { id:2, icon:'🔥', name:'7-Day Streak',    desc:'Worked out 7 days in a row',      unlocked:(userProfile?.streak || 0) >= 7 },
    { id:3, icon:'💪', name:'Strength Master', desc:'Earn 1,000 XP',                   unlocked:(userProfile?.total_xp || 0) >= 1000 },
    { id:4, icon:'🏃', name:'Marathon Ready',  desc:'Run 42 km this month',            unlocked:false },
    { id:5, icon:'⚡', name:'HIIT Champion',   desc:'Complete 20 HIIT sessions',       unlocked:false },
    { id:6, icon:'🧘', name:'Zen Master',      desc:'Complete 15 yoga sessions',       unlocked:false },
  ]
  const unlocked = achievements.filter(a => a.unlocked).length
  const achievementsDisplay = privacyMode
    ? achievements.map((a) => ({ ...a, unlocked: false }))
    : achievements

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
            {avatarLetter}
            <div style={{ position:'absolute', bottom:4, right:4, width:20, height:20, background:'#10B981', borderRadius:'50%', border:'2px solid white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'white' }}>✓</div>
          </motion.div>

          <div style={{ flex:1 }}>
            <h2 style={{ fontFamily:'Inter', fontWeight:800, fontSize:24, marginBottom:4, color:'var(--text-primary)', letterSpacing:'-0.5px' }}>{displayName}</h2>
            <div style={{ fontSize:14, color:'var(--text-muted)', marginBottom:14 }}>{emailDisplay}</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {activeGoalObj && <span style={{ fontSize:12, fontWeight:600, padding:'4px 12px', borderRadius:9999, background:`${activeGoalObj.color}20`, color:activeGoalObj.color, border:`1px solid ${activeGoalObj.color}40` }}>{activeGoalObj.icon} {activeGoalObj.label}</span>}
              <span style={{ fontSize:12, fontWeight:600, padding:'4px 12px', borderRadius:9999, background:'var(--badge-warning-bg)', color:'var(--badge-warning-color)', border:'1px solid var(--badge-warning-border)' }}>🔥 Active Member</span>
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale:1.04 }}
            whileTap={{ scale:0.97 }}
            onClick={openEdit}
            style={{ padding:'10px 22px', borderRadius:9999, background:'var(--bg-white)', border:'1px solid var(--border)', fontSize:14, fontWeight:600, cursor:'pointer', color:'var(--text-primary)', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', flexShrink:0 }}
          >
            Edit Profile
          </motion.button>
        </div>

        <div style={{ height:1, background:'var(--border)', margin:'28px 0 20px' }} />
        <div style={{ display:'flex', justifyContent:'space-around' }}>
          {heroStats.map((s,i)=>(
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
        <motion.div id="profile-settings-card" custom={2} variants={cardVariants} initial="hidden" animate="visible" className="card">
          <h2 className="section-title" style={{ display:'flex', alignItems:'center', gap:8, marginBottom:22 }}>
            <Accessibility size={18} color="var(--blue)"/> Settings
          </h2>
          {[
            { icon:<Moon size={15}/>,      title:'Dark Mode',      desc:'Easier on eyes in low light', state:darkMode, set:setDarkMode  },
            { icon:<Bell size={15}/>,      title:'Notifications',  desc:'Workout reminders & alerts',  state:notifs,   set:setNotifs    },
            { icon:<Eye size={15}/>,       title:'Privacy Mode',   desc:'Hide personal metrics',       state:privacyMode, set:setPrivacyMode  },
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
              key={item.key}
              whileHover={{ x:4 }}
              style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom:'1px solid var(--border)', cursor:'pointer' }}
              role="button"
              tabIndex={0}
              onClick={() => handleAccountItem(item.key)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAccountItem(item.key) } }}
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
          <span style={{ fontSize:12, fontWeight:600, padding:'4px 12px', borderRadius:9999, background:'rgba(245,158,11,0.08)', color:'var(--amber)', border:'1px solid rgba(245,158,11,0.2)' }}>{privacyMode ? '•/•' : `${unlocked}/${achievements.length}`}</span>
        </div>
        <div className="g3">
          {achievementsDisplay.map((ach, i) => (
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

      {editOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !saving) setEditOpen(false)
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              borderRadius: 20,
              padding: 24,
              background: 'var(--bg-white)',
              border: '1px solid var(--border)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
            }}
          >
            <h2 id="edit-profile-title" style={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 800, marginBottom: 6, color: 'var(--text-primary)' }}>
              Edit profile
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Update your details. Your selected fitness goal below is saved with this form.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Name
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  autoComplete="name"
                  style={{
                    marginTop: 6,
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    fontSize: 15,
                    fontFamily: 'Inter',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Age
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={editForm.age}
                    onChange={(e) => setEditForm((f) => ({ ...f, age: e.target.value }))}
                    style={{
                      marginTop: 6,
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      fontSize: 15,
                      fontFamily: 'Inter',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </label>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Height (cm)
                  <input
                    type="number"
                    min={1}
                    step={0.1}
                    value={editForm.height}
                    onChange={(e) => setEditForm((f) => ({ ...f, height: e.target.value }))}
                    style={{
                      marginTop: 6,
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      fontSize: 15,
                      fontFamily: 'Inter',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </label>
              </div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Weight (kg)
                <input
                  type="number"
                  min={1}
                  step={0.1}
                  value={editForm.weight}
                  onChange={(e) => setEditForm((f) => ({ ...f, weight: e.target.value }))}
                  style={{
                    marginTop: 6,
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    fontSize: 15,
                    fontFamily: 'Inter',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </label>
            </div>
            {saveError && (
              <p style={{ marginTop: 14, fontSize: 13, color: '#EF4444', fontWeight: 500 }}>{saveError}</p>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button
                type="button"
                disabled={saving}
                onClick={() => !saving && setEditOpen(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 9999,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  color: 'var(--text-primary)',
                  fontFamily: 'Inter',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={saveProfile}
                style={{
                  padding: '10px 18px',
                  borderRadius: 9999,
                  border: 'none',
                  background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? 'wait' : 'pointer',
                  color: 'white',
                  fontFamily: 'Inter',
                  opacity: saving ? 0.85 : 1,
                }}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {accountModal === 'health' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-health-title"
          style={{
            position: 'fixed', inset: 0, zIndex: 420,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => e.target === e.currentTarget && setAccountModal(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 440, borderRadius: 20, padding: 24,
              background: 'var(--bg-white)', border: '1px solid var(--border)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.12)', position: 'relative',
            }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setAccountModal(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
            >
              <X size={20} />
            </button>
            <h2 id="account-health-title" style={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)', paddingRight: 32 }}>
              Health data
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 14 }}>
              Apple Health, Google Fit, and other wearables can be linked from the <strong>mobile app</strong> (Capacitor build). This web version records workouts and progress when you use the tracker and dashboard manually.
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Tip: finish sessions in Workout Tracker so steps and calories stay up to date in Progress.
            </p>
            <button type="button" onClick={() => setAccountModal(null)} className="btn btn-primary" style={{ marginTop: 20, width: '100%' }}>
              Got it
            </button>
          </motion.div>
        </div>
      )}

      {accountModal === 'privacy' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-privacy-title"
          style={{
            position: 'fixed', inset: 0, zIndex: 420,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => e.target === e.currentTarget && setAccountModal(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 440, borderRadius: 20, padding: 24,
              background: 'var(--bg-white)', border: '1px solid var(--border)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.12)', position: 'relative',
            }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setAccountModal(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
            >
              <X size={20} />
            </button>
            <h2 id="account-privacy-title" style={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)', paddingRight: 32 }}>
              Privacy &amp; security
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <li><strong>Privacy mode</strong> hides metrics on Dashboard, Workouts, Progress, and Profile. Toggle it under Settings on this page.</li>
              <li>Your password is stored securely on the server; we never show it in the app.</li>
              <li>Use a strong, unique password and log out on shared devices.</li>
            </ul>
            <button
              type="button"
              onClick={() => {
                setAccountModal(null)
                document.getElementById('profile-settings-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              style={{
                marginTop: 18, width: '100%', padding: '12px 18px', borderRadius: 9999,
                border: '1px solid var(--blue-border)', background: 'rgba(59,130,246,0.08)',
                color: 'var(--blue)', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter',
              }}
            >
              Jump to Settings
            </button>
            <button type="button" onClick={() => setAccountModal(null)} style={{ marginTop: 10, width: '100%', padding: '10px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-subtle)', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}>
              Close
            </button>
          </motion.div>
        </div>
      )}

      {accountModal === 'notifications' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-notif-title"
          style={{
            position: 'fixed', inset: 0, zIndex: 420,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => e.target === e.currentTarget && setAccountModal(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 440, borderRadius: 20, padding: 24,
              background: 'var(--bg-white)', border: '1px solid var(--border)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.12)', position: 'relative', maxHeight: '90vh', overflowY: 'auto',
            }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setAccountModal(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
            >
              <X size={20} />
            </button>
            <h2 id="account-notif-title" style={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)', paddingRight: 32 }}>
              Reminder schedule
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18, lineHeight: 1.5 }}>
              Set when to nudge you for workouts and water. Enable <strong>Notifications</strong> in Settings above, and allow alerts in your device settings (best on the mobile app).
            </p>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Daily workout reminder
              <input
                type="time"
                value={reminderForm.workoutTime}
                onChange={(e) => setReminderForm((f) => ({ ...f, workoutTime: e.target.value }))}
                style={{
                  marginTop: 6, display: 'block', width: '100%', boxSizing: 'border-box',
                  padding: '10px 12px', borderRadius: 12, border: '1px solid var(--border)',
                  fontSize: 16, fontFamily: 'Inter', background: 'var(--bg-subtle)', color: 'var(--text-primary)',
                }}
              />
            </label>

            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Water reminders</div>
            <p style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 10 }}>
              We schedule alerts every few hours between your start and end time (same times each day).
            </p>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Repeat every
              <select
                value={reminderForm.waterIntervalHours}
                onChange={(e) => setReminderForm((f) => ({ ...f, waterIntervalHours: Number(e.target.value) }))}
                style={{
                  marginTop: 6, display: 'block', width: '100%', boxSizing: 'border-box',
                  padding: '10px 12px', borderRadius: 12, border: '1px solid var(--border)',
                  fontSize: 15, fontFamily: 'Inter', background: 'var(--bg-subtle)', color: 'var(--text-primary)',
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((h) => (
                  <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                ))}
              </select>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Window start
                <input
                  type="time"
                  value={reminderForm.waterWindowStart}
                  onChange={(e) => setReminderForm((f) => ({ ...f, waterWindowStart: e.target.value }))}
                  style={{
                    marginTop: 6, width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 12,
                    border: '1px solid var(--border)', fontSize: 15, fontFamily: 'Inter', background: 'var(--bg-subtle)', color: 'var(--text-primary)',
                  }}
                />
              </label>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Window end
                <input
                  type="time"
                  value={reminderForm.waterWindowEnd}
                  onChange={(e) => setReminderForm((f) => ({ ...f, waterWindowEnd: e.target.value }))}
                  style={{
                    marginTop: 6, width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 12,
                    border: '1px solid var(--border)', fontSize: 15, fontFamily: 'Inter', background: 'var(--bg-subtle)', color: 'var(--text-primary)',
                  }}
                />
              </label>
            </div>

            {reminderSaved && (
              <p style={{ fontSize: 13, color: '#059669', fontWeight: 600, marginBottom: 12 }}>Saved. Reminders updated on this device.</p>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={saveReminderSettings}
                style={{
                  flex: 1, minWidth: 120, padding: '12px 18px', borderRadius: 9999, border: 'none',
                  background: 'linear-gradient(135deg, #3B82F6, #6366F1)', color: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter',
                }}
              >
                Save schedule
              </button>
              <button
                type="button"
                onClick={() => {
                  setReminderForm({ ...DEFAULT_REMINDER_PREFS })
                  saveReminderPreferences({ ...DEFAULT_REMINDER_PREFS })
                  applyReminderSchedule().catch(() => {})
                  setReminderSaved(true)
                }}
                style={{
                  padding: '12px 18px', borderRadius: 9999, border: '1px solid var(--border)',
                  background: 'var(--bg-subtle)', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter', color: 'var(--text-primary)',
                }}
              >
                Reset defaults
              </button>
            </div>
            <button type="button" onClick={() => setAccountModal(null)} style={{ marginTop: 12, width: '100%', padding: '10px', borderRadius: 12, border: '1px solid var(--border)', background: 'transparent', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}>
              Close
            </button>
          </motion.div>
        </div>
      )}

      {accountModal === 'help' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-help-title"
          style={{
            position: 'fixed', inset: 0, zIndex: 420,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => e.target === e.currentTarget && setAccountModal(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 480, borderRadius: 20, padding: 24,
              background: 'var(--bg-white)', border: '1px solid var(--border)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.12)', position: 'relative', maxHeight: '88vh', overflowY: 'auto',
            }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setAccountModal(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
            >
              <X size={20} />
            </button>
            <h2 id="account-help-title" style={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)', paddingRight: 32 }}>
              Help &amp; support
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 18 }}>
              Questions? See below or email <a href="mailto:support@fitpulse.app" style={{ color: 'var(--blue)', fontWeight: 600 }}>support@fitpulse.app</a>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {supportFaq.map((item, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden',
                    background: faqOpen === i ? 'var(--bg-subtle)' : 'var(--bg-white)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '14px 16px', border: 'none', background: 'transparent',
                      fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'Inter',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                    }}
                  >
                    {item.q}
                    <ChevronRight size={18} style={{ transform: faqOpen === i ? 'rotate(90deg)' : 'none', flexShrink: 0, color: 'var(--text-muted)' }} />
                  </button>
                  {faqOpen === i && (
                    <div style={{ padding: '0 16px 14px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setAccountModal(null)} style={{ marginTop: 20, width: '100%', padding: '12px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-subtle)', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}>
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
