import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, CheckCircle2, ChevronDown, ChevronUp, Clock, Flame } from 'lucide-react'
import ExerciseModal from '../components/ExerciseModal'
import { workouts as workoutsApi, sessions } from '../utils/api'

const categories = [
  { id: 'all',      label: 'All',      emoji: '⚡' },
  { id: 'cardio',   label: 'Cardio',   emoji: '🏃' },
  { id: 'strength', label: 'Strength', emoji: '💪' },
  { id: 'yoga',     label: 'Yoga',     emoji: '🧘' },
  { id: 'hiit',     label: 'HIIT',     emoji: '🔥' },
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

function Timer({ running, seconds, setSeconds }) {
  const ref = useRef()
  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSeconds(prev => prev + 1), 1000)
    } else {
      clearInterval(ref.current)
    }
    return () => clearInterval(ref.current)
  }, [running, setSeconds])
  const mm = String(Math.floor(seconds / 60)).padStart(2,'0')
  const ss = String(seconds % 60).padStart(2,'0')
  return <span>{mm}:{ss}</span>
}

export default function WorkoutTracker() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cat, setCat] = useState('all')
  const [modalWorkout, setModal] = useState(null)
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [sessionStart, setSessionStart] = useState(null)
  const [congrats, setCongrats] = useState('')
  const [sessionComplete, setSessionComplete] = useState(false)
  const [pendingSave, setPendingSave] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [planName, setPlanName] = useState('')
  const [planSaved, setPlanSaved] = useState('')
  const [savedPlans, setSavedPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [plansError, setPlansError] = useState(null)
  const [planDeleteError, setPlanDeleteError] = useState(null)
  const [customWorkout, setCustomWorkout] = useState({
    name: '',
    category: 'strength',
    sets: '',
    reps: '',
    duration: '',
    calories: '',
    difficulty: '',
    description: '',
  })
  const [customError, setCustomError] = useState(null)
  const [exercises, setExercises] = useState([
    { id:1, name:'Warm-up Jog',   sets:1, reps:'5 min', done:false },
    { id:2, name:'Push-ups',      sets:3, reps:'15',     done:false },
    { id:3, name:'Squats',        sets:3, reps:'20',     done:false },
    { id:4, name:'Plank Hold',    sets:3, reps:'45 s',   done:false },
    { id:5, name:'Jumping Jacks', sets:3, reps:'30',     done:false },
  ])

  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const [data, plans] = await Promise.all([workoutsApi.getAll(), workoutsApi.getPlans()])
        // Transform API data to match expected format
        const transformed = data.map(w => ({
          id: w.id,
          name: w.name,
          category: w.category,
          duration: w.duration,
          cal: w.calories,
          diff: w.difficulty,
          emoji: w.category === 'cardio' ? '🏃' : w.category === 'strength' ? '💪' : w.category === 'yoga' ? '🧘' : '⚡',
          desc: w.description,
          muscles: w.muscles ? w.muscles.split(',') : [],
          secondary: w.secondary_muscles ? w.secondary_muscles.split(',') : [],
          color: w.category === 'cardio' ? '#F43F5E' : w.category === 'strength' ? '#3B82F6' : w.category === 'yoga' ? '#10B981' : '#F59E0B',
          image: w.image_url
        }))
        setWorkouts(transformed)
        setSavedPlans(plans)
      } catch (err) {
        setError(err.message)
        setPlansError(err.message)
      } finally {
        setLoading(false)
        setPlansLoading(false)
      }
    }

    loadWorkouts()
  }, [])

  const filtered = workouts.filter(w => cat === 'all' || w.category === cat)
  const doneCount = exercises.filter(e => e.done).length
  const pct = Math.round((doneCount / exercises.length) * 100)
  const allDone = exercises.length > 0 && exercises.every(e => e.done)
  const sessionMinutes = Math.max(1, Math.round(seconds / 60))

  const toggle = id => setExercises(prev => prev.map(e => e.id === id ? { ...e, done: !e.done } : e))
  const openCard = id => setModal(workouts.find(w => w.id === id) ?? null)

  const openPlan = (plan) => {
    const planExercises = plan.exercises.map((ex, index) => ({
      id: ex.id || Date.now() + index,
      name: ex.name,
      sets: ex.sets ?? 3,
      reps: ex.reps ?? '10',
      done: false,
      isNew: true,
    }))
    setExercises(planExercises)
    setPlanSaved(`Loaded "${plan.name}" into your session.`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeletePlan = async (planId) => {
    setPlanDeleteError(null)
    if (!planId) {
      setPlanDeleteError('Invalid plan selected for deletion.')
      return
    }

    try {
      await workoutsApi.deletePlan(planId)
      setSavedPlans(prev => prev.filter(plan => plan.id !== planId))
      setPlanSaved('Saved plan deleted.')
    } catch (err) {
      setPlanDeleteError(err.message || 'Could not delete saved plan.')
    }
  }

  const handleAddToSession = (workout) => {
    // Prevent duplicate entries
    const alreadyAdded = exercises.some(e => e.name === workout.name)
    if (alreadyAdded) return
    const newExercise = {
      id: Date.now(),
      name: workout.name,
      sets: 3,
      reps: '10',
      done: false,
      isNew: true, // flag for highlight animation
    }
    setExercises(prev => [...prev, newExercise])
    setModal(null) // close the modal after adding
  }

  const handleStartPause = () => {
    if (!running && !sessionStart) {
      setSessionStart(new Date())
    }
    setRunning(prev => !prev)
  }

  const resetSession = () => {
    setRunning(false)
    setSeconds(0)
    setSessionStart(null)
    setCongrats('')
    setSessionComplete(false)
    setPendingSave(false)
    setSaveError(null)
  }

  const handleNewSession = () => {
    resetSession()
    setExercises([])
    setPlanSaved('')
    setPlanName('')
    setSaveError(null)
    setCustomError(null)
  }

  const handleFinishSession = async () => {
    if (!allDone) return
    setPendingSave(true)
    setSaveError(null)
    setPlanSaved('')
    setCustomError(null)

    try {
      const response = await sessions.create({
        workoutId: null,
        startTime: sessionStart ? sessionStart.toISOString() : new Date(Date.now() - seconds * 1000).toISOString(),
        endTime: new Date().toISOString(),
        duration: sessionMinutes,
        caloriesBurned: Math.max(50, sessionMinutes * 10),
        completed: true,
      })

      const streakText = response.streak ? `${response.streak}-day streak` : 'new streak'
      setCongrats(`Congratulations! You finished your workout and locked in a ${streakText}.`)
      setSessionComplete(true)
      setRunning(false)
    } catch (err) {
      setSaveError(err.message || 'Could not save your workout.')
    } finally {
      setPendingSave(false)
    }
  }

  const handleDeleteExercise = (id) => {
    setExercises(prev => prev.filter(e => e.id !== id))
  }

  const handleCreateCustomWorkout = async () => {
    setCustomError(null)
    setSaveError(null)
    setPlanSaved('')

    if (!customWorkout.name.trim()) {
      setCustomError('Workout name is required.')
      return
    }

    try {
      const created = await workoutsApi.create({
        name: customWorkout.name,
        category: customWorkout.category,
        duration: Number(customWorkout.duration) || 20,
        calories: Number(customWorkout.calories) || 150,
        difficulty: Number(customWorkout.difficulty) || 3,
        description: customWorkout.description,
        muscles: '',
        secondary_muscles: '',
        image_url: '',
      })

      const newExercise = {
        id: Date.now(),
        name: created.name,
        sets: Number(customWorkout.sets) || 3,
        reps: customWorkout.reps || '10',
        done: false,
        isNew: true,
      }

      setWorkouts(prev => [
        ...prev,
        {
          ...created,
          emoji: created.category === 'cardio' ? '🏃' : created.category === 'strength' ? '💪' : created.category === 'yoga' ? '🧘' : '⚡',
          desc: created.description,
          muscles: created.muscles ? created.muscles.split(',') : [],
          secondary: created.secondary_muscles ? created.secondary_muscles.split(',') : [],
          color: created.category === 'cardio' ? '#F43F5E' : created.category === 'strength' ? '#3B82F6' : created.category === 'yoga' ? '#10B981' : '#F59E0B',
          image: created.image_url,
        }
      ])
      setExercises(prev => [...prev, newExercise])
      setCustomWorkout({
        name: '',
        category: 'strength',
        sets: '',
        reps: '',
        duration: '',
        calories: '',
        difficulty: '',
        description: '',
      })
      setPlanSaved('Custom workout added to your session.')
    } catch (err) {
      setCustomError(err.message || 'Could not add custom workout.')
    }
  }

  const handleSavePlan = async () => {
    setSaveError(null)
    setCustomError(null)
    setPlanSaved('')

    if (!planName.trim()) {
      setSaveError('Please give your plan a name.')
      return
    }
    if (exercises.length === 0) {
      setSaveError('Add at least one exercise before saving.')
      return
    }

    setPendingSave(true)

    try {
      const newPlan = await workoutsApi.savePlan({
        name: planName,
        exercises: exercises.map(({ id, name, sets, reps }) => ({ id, name, sets, reps })),
      })
      setSavedPlans(prev => [newPlan, ...prev])
      setPlanSaved(`Saved "${planName}" as a workout plan.`)
      setPlanName('')
    } catch (err) {
      setSaveError(err.message || 'Could not save workout plan.')
    } finally {
      setPendingSave(false)
    }
  }

  if (loading) {
    return (
      <div className="page-inner">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Loading workouts...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-inner">
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          Error loading workouts: {error}
        </div>
      </div>
    )
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

        {congrats && (
          <motion.div
            initial={{ opacity:0, y:-10 }}
            animate={{ opacity:1, y:0 }}
            style={{ marginBottom:18, padding:'18px 20px', borderRadius:20, background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.22)', color:'#065f46' }}
          >
            <strong>🎉 Nice work!</strong> {congrats}
          </motion.div>
        )}

        <div style={{ display:'flex', gap:28, alignItems:'center', flexWrap:'wrap' }}>
          {/* Timer */}
          <div style={{ textAlign:'center' }}>
            <div className="timer-display gt-blue"><Timer running={running} seconds={seconds} setSeconds={setSeconds} /></div>
            <div style={{ fontSize:11, color:'var(--text-faint)', marginTop:3, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.05em' }}>Elapsed</div>
          </div>

          {/* Controls */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <motion.button
              whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
              onClick={handleStartPause}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 22px', borderRadius:9999, background: running ? 'rgba(0,0,0,0.06)' : '#1a1a1a', color: running ? 'var(--text-primary)' : 'white', fontFamily:'Inter', fontSize:14, fontWeight:600, border:'1px solid var(--border)', cursor:'pointer' }}
            >
              {running ? <><Pause size={14}/> Pause</> : <><Play size={14} fill="white"/> Start</>}
            </motion.button>
            <motion.button
              whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
              onClick={handleNewSession}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 18px', borderRadius:9999, border:'1px solid rgba(59,130,246,0.18)', background:'rgba(59,130,246,0.08)', color:'#2563eb', fontFamily:'Inter', fontSize:14, fontWeight:600, cursor:'pointer' }}
            >
              New Session
            </motion.button>
            <motion.button
              whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
              onClick={resetSession}
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

        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', marginTop:18 }}>
          <motion.button
            whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            onClick={handleFinishSession}
            disabled={!allDone || sessionComplete || pendingSave}
            style={{
              padding:'12px 24px', borderRadius:9999, border:'none', cursor: allDone && !sessionComplete ? 'pointer' : 'not-allowed',
              background: allDone && !sessionComplete ? '#10B981' : 'rgba(16,185,129,0.18)',
              color: allDone && !sessionComplete ? 'white' : 'rgba(16,185,129,0.7)',
              fontWeight:700,
            }}
          >
            {sessionComplete ? 'Session Saved' : pendingSave ? 'Saving...' : 'Finish Session'}
          </motion.button>
          {allDone && !sessionComplete && (
            <div style={{ color:'#065f46', fontSize:13, fontWeight:500 }}>
              All exercises are checked. Tap finish to save the workout and update your streak.
            </div>
          )}
          {saveError && (
            <div style={{ color:'#dc2626', fontSize:13, fontWeight:500 }}>
              {saveError}
            </div>
          )}
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
              <button
                onClick={e => { e.stopPropagation(); handleDeleteExercise(ex.id) }}
                style={{ marginLeft:12, padding:'6px 10px', borderRadius:12, background:'rgba(220,38,38,0.1)', color:'#b91c1c', border:'1px solid rgba(220,38,38,0.2)', fontSize:12, fontWeight:700, cursor:'pointer' }}
              >
                Remove
              </button>
            </motion.div>
          ))}
        </div>

        <div style={{ marginTop:24, padding:'28px', borderRadius:24, background:'rgba(248,250,252,0.95)', border:'1px solid rgba(226,232,240,0.9)' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
              <div>
                <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>Save this session as a plan</h3>
                <p style={{ margin: '8px 0 0', fontSize:13, color:'var(--text-muted)', maxWidth:520 }}>Give your live session a name and save it for future reuse.</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'center', width:'100%', minWidth:0 }}>
                <input
                  value={planName}
                  onChange={e => setPlanName(e.target.value)}
                  placeholder="Plan name"
                  style={{ width:'100%', minWidth:0, padding:'12px 16px', borderRadius:16, border:'1px solid var(--border)', background:'white', color:'var(--text-primary)', fontSize:13 }}
                />
                <motion.button
                  whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  onClick={handleSavePlan}
                  disabled={!exercises.length || pendingSave}
                  style={{ padding:'12px 20px', borderRadius:9999, border:'none', background: !exercises.length || pendingSave ? 'rgba(107,114,128,0.16)' : '#1d4ed8', color:'white', fontWeight:700, cursor: !exercises.length || pendingSave ? 'not-allowed' : 'pointer', minWidth:0 }}
                >
                  Save Plan
                </motion.button>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:14, alignItems:'start', width:'100%' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <h4 style={{ margin:0, fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>Create a custom workout</h4>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:12, width:'100%' }}>
                  <input
                    value={customWorkout.name}
                    onChange={e => setCustomWorkout(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Workout name"
                    style={{ width:'100%', minWidth:0, padding:'12px 16px', borderRadius:16, border:'1px solid var(--border)', background:'white', color:'var(--text-primary)' }}
                  />
                  <select
                    value={customWorkout.category}
                    onChange={e => setCustomWorkout(prev => ({ ...prev, category: e.target.value }))}
                    style={{ width:'100%', minWidth:0, padding:'12px 16px', borderRadius:16, border:'1px solid var(--border)', background:'white', color:'var(--text-primary)' }}
                  >
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                    <option value="yoga">Yoga</option>
                    <option value="hiit">HIIT</option>
                  </select>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12, width:'100%' }}>
                  <input
                    value={customWorkout.sets}
                    onChange={e => setCustomWorkout(prev => ({ ...prev, sets: e.target.value }))}
                    placeholder="Sets"
                    style={{ width:'100%', minWidth:0, padding:'12px 16px', borderRadius:16, border:'1px solid var(--border)', background:'white', color:'var(--text-primary)' }}
                  />
                  <input
                    value={customWorkout.reps}
                    onChange={e => setCustomWorkout(prev => ({ ...prev, reps: e.target.value }))}
                    placeholder="Reps / Time"
                    style={{ width:'100%', minWidth:0, padding:'10px 14px', borderRadius:14, border:'1px solid var(--border)', background:'white', color:'var(--text-primary)' }}
                  />
                  <input
                    value={customWorkout.duration}
                    onChange={e => setCustomWorkout(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="Duration"
                    style={{ width:'100%', minWidth:0, padding:'10px 14px', borderRadius:14, border:'1px solid var(--border)', background:'white', color:'var(--text-primary)' }}
                  />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12, width:'100%' }}>
                  <input
                    value={customWorkout.calories}
                    onChange={e => setCustomWorkout(prev => ({ ...prev, calories: e.target.value }))}
                    placeholder="Calories"
                    style={{ width:'100%', minWidth:0, padding:'12px 16px', borderRadius:16, border:'1px solid var(--border)', background:'white', color:'var(--text-primary)' }}
                  />
                  <input
                    value={customWorkout.difficulty}
                    onChange={e => setCustomWorkout(prev => ({ ...prev, difficulty: Number(e.target.value) }))}
                    type="number"
                    min="1"
                    max="5"
                    placeholder="Difficulty"
                    style={{ width:'100%', minWidth:0, padding:'10px 14px', borderRadius:14, border:'1px solid var(--border)', background:'white', color:'var(--text-primary)' }}
                  />
                </div>
                <textarea
                  value={customWorkout.description}
                  onChange={e => setCustomWorkout(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description (optional)"
                  rows={3}
                  style={{ width:'100%', padding:'14px 16px', borderRadius:16, border:'1px solid var(--border)', background:'white', color:'var(--text-primary)', resize:'vertical' }}
                />
                <motion.button
                  whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  onClick={handleCreateCustomWorkout}
                  style={{ padding:'14px 24px', borderRadius:9999, border:'none', background:'#2563eb', color:'white', fontWeight:700, cursor:'pointer', alignSelf:'flex-start' }}
                >
                  Add Custom Workout
                </motion.button>
                {customError && <div style={{ color:'#dc2626', fontSize:13 }}>{customError}</div>}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:12, padding:'18px', borderRadius:20, background:'white', minWidth:0, width:'100%' }}>
                <div style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>Plan Summary</div>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>Current session has {exercises.length} exercises.</div>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>After saving, this workout plan will be available in your saved routines.</div>
                {planSaved && <div style={{ color:'#065f46', fontSize:13 }}>{planSaved}</div>}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Saved Plans Section */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.2 }} style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, flexWrap:'wrap', gap:12 }}>
          <div>
            <h2 className="section-title" style={{ marginBottom:2 }}>Saved Plans</h2>
            <div className="section-meta">Open a saved routine to load it into your current session.</div>
          </div>
        </div>

        {planDeleteError && (
          <div style={{ padding:'14px 18px', borderRadius:20, background:'rgba(254,226,226,0.95)', border:'1px solid rgba(239,68,68,0.15)', color:'#b91c1c', marginBottom:16 }}>
            {planDeleteError}
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:14 }}>
          {plansLoading ? (
            <div style={{ padding:'18px', borderRadius:20, background:'rgba(248,250,252,0.95)', border:'1px solid rgba(226,232,240,0.9)', gridColumn:'1/-1' }}>Loading saved plans…</div>
          ) : plansError ? (
            <div style={{ padding:'18px', borderRadius:20, background:'rgba(254,226,226,0.95)', border:'1px solid rgba(239,68,68,0.15)', color:'#b91c1c', gridColumn:'1/-1' }}>Could not load saved plans: {plansError}</div>
          ) : savedPlans.length === 0 ? (
            <div style={{ padding:'18px', borderRadius:20, background:'rgba(248,250,252,0.95)', border:'1px solid rgba(226,232,240,0.9)', gridColumn:'1/-1' }}>No saved plans yet. Save a plan from the session panel to see it here.</div>
          ) : (
            savedPlans.map(plan => (
              <div key={plan.id} style={{ padding:'18px', borderRadius:20, background:'white', border:'1px solid rgba(226,232,240,0.9)', display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>{plan.name}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>{plan.exercises.length} exercises</div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <motion.button
                      whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                      onClick={() => openPlan(plan)}
                      style={{ padding:'8px 14px', borderRadius:9999, border:'none', background:'#2563eb', color:'white', fontSize:12, fontWeight:700, cursor:'pointer' }}
                    >
                      Open Plan
                    </motion.button>
                    <motion.button
                      whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                      onClick={() => handleDeletePlan(plan.id)}
                      style={{ padding:'8px 14px', borderRadius:9999, border:'1px solid rgba(220,38,38,0.25)', background:'rgba(220,38,38,0.08)', color:'#b91c1c', fontSize:12, fontWeight:700, cursor:'pointer' }}
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {plan.exercises.slice(0, 4).map((ex, idx) => (
                    <span key={`${plan.id}-${idx}`} style={{ padding:'6px 10px', borderRadius:9999, background:'rgba(59,130,246,0.08)', color:'#1d4ed8', fontSize:11, fontWeight:600 }}>{ex.name}</span>
                  ))}
                </div>
              </div>
            ))
          )}
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
