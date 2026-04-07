import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, CheckCircle2, ChevronDown, ChevronUp, Clock, Flame } from 'lucide-react'
import ExerciseModal from '../components/ExerciseModal'

const categories = [
  { id: 'all',      label: 'All',      emoji: '⚡' },
  { id: 'cardio',   label: 'Cardio',   emoji: '🏃' },
  { id: 'strength', label: 'Strength', emoji: '💪' },
  { id: 'yoga',     label: 'Yoga',     emoji: '🧘' },
  { id: 'hiit',     label: 'HIIT',     emoji: '🔥' },
]

const workouts = [
  { id:1,  name:'Treadmill Run',    category:'cardio',   duration:30, cal:320, diff:3, emoji:'🏃', desc:'Steady-state cardio for endurance and fat burn.', muscles:['quads','calves'], secondary:['hamstrings','core'], color:'#F43F5E', image:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=240&fit=crop' },
  { id:2,  name:'Barbell Squat',   category:'strength', duration:45, cal:280, diff:4, emoji:'🏋️', desc:'Compound lower body — quads, glutes & core under load.', muscles:['quads','glutes'], secondary:['hamstrings','core','back'], color:'#3B82F6', image:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=240&fit=crop' },
  { id:3,  name:'Sun Salutation',  category:'yoga',     duration:20, cal:120, diff:1, emoji:'🧘', desc:'Flowing sun salutation sequence to energize the body.', muscles:['core'], secondary:['shoulders','back','hamstrings'], color:'#10B981', image:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=240&fit=crop' },
  { id:4,  name:'Tabata Intervals',category:'hiit',     duration:20, cal:380, diff:5, emoji:'⏱️', desc:'20 sec max effort / 10 sec rest — 8 rounds each exercise.', muscles:['quads','core','shoulders'], secondary:['chest','calves'], color:'#F59E0B', image:'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=240&fit=crop' },
  { id:5,  name:'Jump Rope',       category:'cardio',   duration:15, cal:220, diff:2, emoji:'⚡', desc:'High-efficiency cardio improving coordination & rhythm.', muscles:['calves','shoulders'], secondary:['core','forearms'], color:'#F43F5E', image:'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=240&fit=crop' },
  { id:6,  name:'Push-up Circuit', category:'strength', duration:25, cal:200, diff:3, emoji:'💪', desc:'Upper-body push circuit: standard → wide → diamond.', muscles:['chest','triceps'], secondary:['shoulders','core'], color:'#3B82F6', image:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=240&fit=crop' },
  { id:7,  name:'Vinyasa Flow',    category:'yoga',     duration:40, cal:180, diff:2, emoji:'🌊', desc:'Dynamic flowing yoga linking breath with movement.', muscles:['core','back'], secondary:['shoulders','hamstrings'], color:'#10B981', image:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=240&fit=crop' },
  { id:8,  name:'Burpee Blaster',  category:'hiit',     duration:15, cal:290, diff:5, emoji:'🔥', desc:'Full-body explosive HIIT — max calorie burn per minute.', muscles:['chest','quads','core'], secondary:['shoulders','triceps'], color:'#F59E0B', image:'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=240&fit=crop' },
  { id:9,  name:'Deadlift',        category:'strength', duration:40, cal:310, diff:5, emoji:'🏋️', desc:'King of posterior chain lifts — back, glutes & hamstrings.', muscles:['back','glutes','hamstrings'], secondary:['traps','forearms','core'], color:'#3B82F6', image:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=240&fit=crop' },
  { id:10, name:'Pull-up Circuit', category:'strength', duration:20, cal:180, diff:4, emoji:'🪝', desc:'Back & biceps — standard, chin-up & wide grip variations.', muscles:['back','biceps'], secondary:['traps','core','forearms'], color:'#6366F1', image:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=240&fit=crop' },
]

const sessionExercises = [
  { id:1, name:'Warm-up Jog',   sets:1, reps:'5 min', done:true  },
  { id:2, name:'Push-ups',      sets:3, reps:'15',     done:true  },
  { id:3, name:'Squats',        sets:3, reps:'20',     done:false },
  { id:4, name:'Plank Hold',    sets:3, reps:'45 s',   done:false },
  { id:5, name:'Jumping Jacks', sets:3, reps:'30',     done:false },
]

function DiffBar({ level }) {
  return (
    <div className="diff-bar">
      {[1,2,3,4,5].map(d => (
        <div key={d} className={`diff-seg ${d <= level ? 'on' : ''} ${d <= level && level >= 4 ? 'hard' : d <= level && level >= 3 ? 'med' : ''}`} />
      ))}
    </div>
  )
}

function Timer({ running }) {
  const [s, setS] = useState(0)
  const ref = useRef()
  useEffect(() => {
    if (running) ref.current = setInterval(() => setS(x => x + 1), 1000)
    else clearInterval(ref.current)
    return () => clearInterval(ref.current)
  }, [running])
  const mm = String(Math.floor(s / 60)).padStart(2,'0')
  const ss = String(s % 60).padStart(2,'0')
  return <span>{mm}:{ss}</span>
}

export default function WorkoutTracker() {
  const [cat, setCat]             = useState('all')
  const [modalWorkout, setModal]  = useState(null)
  const [running, setRunning]     = useState(false)
  const [exercises, setExercises] = useState(sessionExercises)

  const filtered  = workouts.filter(w => cat === 'all' || w.category === cat)
  const doneCount = exercises.filter(e => e.done).length
  const pct       = Math.round((doneCount / exercises.length) * 100)

  const toggle   = id => setExercises(prev => prev.map(e => e.id === id ? { ...e, done: !e.done } : e))
  const openCard = id => setModal(workouts.find(w => w.id === id) ?? null)

  const handleAddToSession = (workout) => {
    // Prevent duplicate entries
    const alreadyAdded = exercises.some(e => e.name === workout.name)
    if (alreadyAdded) return
    const newExercise = {
      id:   Date.now(),
      name: workout.name,
      sets: 3,
      reps: '10',
      done: false,
      isNew: true,        // flag for highlight animation
    }
    setExercises(prev => [...prev, newExercise])
    setModal(null)        // close the modal after adding
  }

  return (
    <div className="page-inner">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }} className="page-header">
        <div className="accent-line" />
        <h1 className="page-title">Workout <span className="gt-blue">Tracker</span></h1>
        <p className="page-subtitle">Track your session · Explore exercises · See how each one is done</p>
      </motion.div>

      {/* Active Session */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.1 }} className="session-bar">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, flexWrap:'wrap', gap:12 }}>
          <div>
            <span className="neon-tag neon-tag-fire" style={{ marginBottom:8, display:'inline-block' }}>● LIVE SESSION</span>
            <h2 style={{ fontFamily:'Inter', fontSize:18, fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.3px' }}>Morning Power Circuit</h2>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <span className="badge badge-success">{doneCount}/{exercises.length} done</span>
            <span className="badge badge-muted">{pct}% complete</span>
          </div>
        </div>

        <div style={{ display:'flex', gap:28, alignItems:'center', flexWrap:'wrap' }}>
          {/* Timer */}
          <div style={{ textAlign:'center' }}>
            <div className="timer-display gt-blue"><Timer running={running} /></div>
            <div style={{ fontSize:11, color:'var(--text-faint)', marginTop:3, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.05em' }}>Elapsed</div>
          </div>

          {/* Controls */}
          <div style={{ display:'flex', gap:10 }}>
            <motion.button
              whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
              onClick={() => setRunning(r => !r)}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 22px', borderRadius:9999, background: running ? 'rgba(0,0,0,0.06)' : '#1a1a1a', color: running ? 'var(--text-primary)' : 'white', fontFamily:'Inter', fontSize:14, fontWeight:600, border:'1px solid var(--border)', cursor:'pointer' }}
            >
              {running ? <><Pause size={14}/> Pause</> : <><Play size={14} fill="white"/> Start</>}
            </motion.button>
            <motion.button
              whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
              onClick={() => setRunning(false)}
              style={{ width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:12, background:'rgba(0,0,0,0.04)', border:'1px solid var(--border)', cursor:'pointer' }}
            >
              <RotateCcw size={15} color="var(--text-secondary)" />
            </motion.button>
          </div>

          {/* Progress */}
          <div style={{ flex:1, minWidth:160 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8 }}>
              <span style={{ color:'var(--text-secondary)', fontWeight:500 }}>Session Progress</span>
              <span style={{ fontWeight:700, color:'var(--blue)' }}>{pct}%</span>
            </div>
            <div className="progress-track" style={{ height:8, borderRadius:9999 }}>
              <motion.div
                className="progress-fill"
                initial={{ width:0 }}
                animate={{ width:`${pct}%` }}
                transition={{ duration:1, delay:0.4 }}
              />
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:20 }}>
          {exercises.map(ex => (
            <motion.div
              key={ex.id}
              initial={ex.isNew ? { opacity: 0, y: 12, background: 'rgba(16,185,129,0.12)' } : false}
              animate={{ opacity: 1, y: 0, background: 'transparent' }}
              transition={{ duration: 0.5 }}
              whileHover={{ x:2 }}
              className={`check-item ${ex.done ? 'done' : ''}`}
              onClick={() => toggle(ex.id)}
              role="checkbox" aria-checked={ex.done} tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && toggle(ex.id)}
            >
              <div className={`check-circle ${ex.done ? 'done' : ''}`}>
                {ex.done && <CheckCircle2 size={13} color="white" />}
              </div>
              <span style={{ flex:1, fontSize:14, fontWeight:500, textDecoration:ex.done ? 'line-through' : 'none', color: ex.done ? 'var(--text-faint)' : 'var(--text-primary)' }}>
                {ex.name}
              </span>
              <span style={{ fontSize:12, color:'var(--text-faint)', fontWeight:500 }}>
                {ex.sets} × {ex.reps}
              </span>
              {ex.isNew && !ex.done && (
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:9999, background:'rgba(16,185,129,0.1)', color:'#10B981', border:'1px solid rgba(16,185,129,0.25)', marginLeft:4, flexShrink:0 }}>NEW</span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Browse Section */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.2 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, flexWrap:'wrap', gap:12 }}>
          <div>
            <h2 className="section-title" style={{ marginBottom:2 }}>Browse Exercises</h2>
            <div className="section-meta">Tap any card to open the full tutorial</div>
          </div>
        </div>

        {/* Category pills */}
        <div className="pill-tabs" style={{ marginBottom:24 }}>
          {categories.map(c => (
            <motion.button key={c.id} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} className={`pill-tab ${cat === c.id ? 'active' : ''}`} onClick={() => setCat(c.id)}>
              {c.emoji} {c.label}
            </motion.button>
          ))}
        </div>

        {/* Single column cards list */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:0 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <AnimatePresence mode="wait">
              {filtered.map((w, i) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                  transition={{ duration:0.4, delay: i * 0.05 }}
                  className="exercise-card"
                  onClick={() => openCard(w.id)}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && openCard(w.id)}
                  whileHover={{ y:-2, boxShadow:'0 8px 24px rgba(0,0,0,0.09)' }}
                  style={{ overflow:'hidden' }}
                >
                  {/* Left color strip */}
                  <div style={{ position:'absolute', top:0, left:0, width:4, bottom:0, borderRadius:'20px 0 0 20px', background: `linear-gradient(to bottom, ${w.color}, ${w.color}55)` }} />

                  {/* Thumbnail */}
                  <div style={{ width:54, height:54, borderRadius:14, overflow:'hidden', flexShrink:0 }}>
                    <img src={w.image} alt={w.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <span style={{ fontFamily:'Inter', fontWeight:700, fontSize:15, color:'var(--text-primary)' }}>{w.name}</span>
                      <span style={{ fontSize:10, fontWeight:600, padding:'2px 9px', borderRadius:9999, background:`${w.color}12`, color:w.color, border:`1px solid ${w.color}25` }}>{w.category}</span>
                    </div>
                    <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.5, marginBottom:10 }}>{w.desc}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:18, flexWrap:'wrap' }}>
                      <DiffBar level={w.diff} />
                      <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'var(--text-muted)', fontWeight:500 }}>
                        <Clock size={11}/> {w.duration} min
                      </span>
                      <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'var(--text-muted)', fontWeight:500 }}>
                        <Flame size={11} color={w.color}/> {w.cal} kcal
                      </span>
                    </div>
                  </div>

                  <div style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-faint)', fontSize:12, fontWeight:500, flexShrink:0 }}>
                    View Guide <ChevronDown size={15}/>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ── Fullscreen exercise modal ── */}
      <AnimatePresence>
        {modalWorkout && (
          <ExerciseModal
            workout={modalWorkout}
            onClose={() => setModal(null)}
            onAddToSession={handleAddToSession}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
