import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Flame } from 'lucide-react'
import WorkoutGuide from './WorkoutGuide'
import ExerciseVisualizer from './ExerciseVisualizer'

export default function ExerciseModal({ workout, onClose, onAddToSession }) {
  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!workout) return null

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal panel */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ duration: 0.4, ease: [0.34, 1.2, 0.64, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 28,
            width: '100%',
            maxWidth: 980,
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
            pointerEvents: 'all',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* ── Top hero strip ── */}
          <div
            style={{
              background: `linear-gradient(135deg, ${workout.color}DD, ${workout.color}88)`,
              borderRadius: '28px 28px 0 0',
              padding: '32px 36px 28px',
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {/* bg pattern */}
            <div style={{ position:'absolute', inset:0, opacity:0.08, backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E")`, pointerEvents:'none' }} />
            {/* bg image */}
            <div style={{ position:'absolute', inset:0, backgroundImage:`url(${workout.image})`, backgroundSize:'cover', backgroundPosition:'center', opacity:0.18, pointerEvents:'none', borderRadius:'28px 28px 0 0' }} />

            <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
              <div>
                <span style={{ display:'inline-block', marginBottom:10, fontSize:11, fontWeight:700, padding:'4px 14px', borderRadius:9999, background:'rgba(255,255,255,0.2)', color:'white', textTransform:'uppercase', letterSpacing:'0.1em', border:'1px solid rgba(255,255,255,0.3)' }}>
                  {workout.category}
                </span>
                <h2 style={{ fontFamily:'Inter', fontSize:'clamp(24px, 3vw, 36px)', fontWeight:800, color:'white', marginBottom:6, letterSpacing:'-0.03em', lineHeight:1.1 }}>
                  {workout.name}
                </h2>
                <p style={{ fontSize:15, color:'rgba(255,255,255,0.82)', fontWeight:400, maxWidth:480, lineHeight:1.5 }}>{workout.desc}</p>

                {/* Quick stats */}
                <div style={{ display:'flex', gap:20, marginTop:16 }}>
                  {[
                    { icon:<Clock size={14}/>,  label:`${workout.duration} min` },
                    { icon:<Flame size={14}/>,  label:`${workout.cal} kcal`    },
                    { icon:<span style={{fontSize:12}}>💪</span>, label:`Level ${workout.diff}/5` },
                  ].map((s,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.9)', background:'rgba(255,255,255,0.15)', padding:'6px 14px', borderRadius:9999, border:'1px solid rgba(255,255,255,0.2)' }}>
                      {s.icon} {s.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.93 }}
                onClick={onClose}
                aria-label="Close"
                style={{
                  width: 44, height: 44,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s',
                }}
              >
                <X size={20} color="white" strokeWidth={2.5} />
              </motion.button>
            </div>
          </div>

          {/* ── Body: two column layout ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0,
              flex: 1,
              minHeight: 0,
            }}
          >
            {/* Left: Step-by-step guide */}
            <div style={{ padding: '32px 28px 32px 36px', borderRight: '1px solid #e2e8f0', overflowY: 'auto' }}>
              {/* Reuse WorkoutGuide but in fullscreen context (it renders inline) */}
              <WorkoutGuide workout={workout} onClose={onClose} onAddToSession={onAddToSession} fullscreen />
            </div>

            {/* Right: Muscle map */}
            <div style={{ padding: '32px 36px 32px 28px', overflowY: 'auto' }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: workout.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                  Muscles Targeted
                </div>
                <h3 style={{ fontFamily:'Inter', fontWeight:700, fontSize:18, color:'#1a1a1a', letterSpacing:'-0.02em' }}>
                  Muscle Activation Map
                </h3>
                <p style={{ fontSize:13, color:'#718096', marginTop:4, lineHeight:1.5 }}>
                  Highlighted in <span style={{ color:workout.color, fontWeight:600 }}>blue</span> — primary groups. Faded = secondary stabilizers.
                </p>
              </div>

              <ExerciseVisualizer muscles={workout.muscles} secondary={workout.secondary} />

              <div style={{ marginTop: 24, padding: '16px 18px', borderRadius: 16, background: `${workout.color}08`, border: `1px solid ${workout.color}25` }}>
                <div style={{ fontSize: 11, color: workout.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Primary Muscles</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {workout.muscles.map(m => (
                    <span key={m} style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 9999, background: `${workout.color}15`, color: workout.color, border: `1px solid ${workout.color}30`, textTransform: 'capitalize' }}>
                      {m}
                    </span>
                  ))}
                </div>
                {workout.secondary?.length > 0 && (
                  <>
                    <div style={{ fontSize: 11, color: '#718096', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 14, marginBottom: 8 }}>Secondary / Stabilizers</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {workout.secondary.map(m => (
                        <span key={m} style={{ fontSize: 12, fontWeight: 500, padding: '4px 12px', borderRadius: 9999, background: 'rgba(0,0,0,0.04)', color: '#4a5568', border: '1px solid #e2e8f0', textTransform: 'capitalize' }}>
                          {m}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
