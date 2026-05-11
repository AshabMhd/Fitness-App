import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Activity, ShieldCheck, BarChart3, Play, Pause } from 'lucide-react'
import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getKeypoint(pose, part) {
  return pose.keypoints.find(k => k.name === part || k.part === part) || null
}

function angleBetween(a, b, c) {
  if (!a || !b || !c) return 0
  const abx = a.x - b.x
  const aby = a.y - b.y
  const cbx = c.x - b.x
  const cby = c.y - b.y
  const dot = abx * cbx + aby * cby
  const magAB = Math.sqrt(abx * abx + aby * aby)
  const magCB = Math.sqrt(cbx * cbx + cby * cby)
  if (magAB === 0 || magCB === 0) return 0
  const raw = dot / (magAB * magCB)
  const clipped = clamp(raw, -1, 1)
  return Math.acos(clipped) * (180 / Math.PI)
}

function drawPose(ctx, pose, width, height) {
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(ctx.canvas.video, 0, 0, width, height)

  const adjacentPairs = [
    ['left_shoulder','right_shoulder'],
    ['left_hip','right_hip'],
    ['left_shoulder','left_elbow'],
    ['left_elbow','left_wrist'],
    ['right_shoulder','right_elbow'],
    ['right_elbow','right_wrist'],
    ['left_hip','left_knee'],
    ['left_knee','left_ankle'],
    ['right_hip','right_knee'],
    ['right_knee','right_ankle'],
    ['left_shoulder','left_hip'],
    ['right_shoulder','right_hip'],
  ]

  ctx.strokeStyle = 'rgba(59,130,246,0.85)'
  ctx.lineWidth = 3
  adjacentPairs.forEach(([a, b]) => {
    const kpA = getKeypoint(pose, a)
    const kpB = getKeypoint(pose, b)
    if (kpA?.score > 0.4 && kpB?.score > 0.4) {
      ctx.beginPath()
      ctx.moveTo(kpA.x, kpA.y)
      ctx.lineTo(kpB.x, kpB.y)
      ctx.stroke()
    }
  })

  pose.keypoints.forEach(kp => {
    if (kp.score > 0.35) {
      ctx.fillStyle = 'rgba(255,255,255,0.96)'
      ctx.strokeStyle = '#2563eb'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(kp.x, kp.y, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
  })
}

function analyzeExercisePose(pose, exercise, state) {
  const leftShoulder = getKeypoint(pose, 'left_shoulder')
  const rightShoulder = getKeypoint(pose, 'right_shoulder')
  const leftHip = getKeypoint(pose, 'left_hip')
  const rightHip = getKeypoint(pose, 'right_hip')
  const leftKnee = getKeypoint(pose, 'left_knee')
  const rightKnee = getKeypoint(pose, 'right_knee')
  const leftAnkle = getKeypoint(pose, 'left_ankle')
  const rightAnkle = getKeypoint(pose, 'right_ankle')
  const leftElbow = getKeypoint(pose, 'left_elbow')
  const rightElbow = getKeypoint(pose, 'right_elbow')
  const leftWrist = getKeypoint(pose, 'left_wrist')
  const rightWrist = getKeypoint(pose, 'right_wrist')

  const issues = []
  let countTrigger = false

  if (exercise === 'squat') {
    const leftKneeAngle = angleBetween(leftHip, leftKnee, leftAnkle)
    const rightKneeAngle = angleBetween(rightHip, rightKnee, rightAnkle)
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2
    const torsoAngleLeft = angleBetween(leftShoulder, leftHip, leftKnee)
    const torsoAngleRight = angleBetween(rightShoulder, rightHip, rightKnee)
    const avgTorsoAngle = (torsoAngleLeft + torsoAngleRight) / 2

    if (avgKneeAngle < 110) {
      state.phase = 'down'
    }
    if (state.phase === 'down' && avgKneeAngle > 150) {
      countTrigger = true
      state.phase = 'up'
    }
    if (avgKneeAngle > 160) {
      issues.push('Stand tall and finish each rep with locked legs.')
    }
    if (avgKneeAngle > 100 && avgKneeAngle < 150) {
      issues.push('Keep your weight in your heels and sink deeper.')
    }
    if (avgTorsoAngle > 35) {
      issues.push('Keep your chest lifted and avoid leaning forward too much.')
    }
  }

  if (exercise === 'pushup') {
    const leftElbowAngle = angleBetween(leftShoulder, leftElbow, leftWrist)
    const rightElbowAngle = angleBetween(rightShoulder, rightElbow, rightWrist)
    const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2
    const leftHipAngle = angleBetween(leftShoulder, leftHip, leftKnee)
    const rightHipAngle = angleBetween(rightShoulder, rightHip, rightKnee)
    const avgHipAngle = (leftHipAngle + rightHipAngle) / 2

    if (avgElbowAngle < 95) {
      state.phase = 'down'
    }
    if (state.phase === 'down' && avgElbowAngle > 160) {
      countTrigger = true
      state.phase = 'up'
    }
    if (avgHipAngle > 25) {
      issues.push('Keep your hips aligned with your shoulders for a flat plank.')
    }
    if (avgElbowAngle > 170) {
      issues.push('Lower more slowly to engage more muscle.')
    }
  }

  return {
    countTrigger,
    issues: issues.filter(Boolean),
  }
}

function estimateCalories(durationSeconds, reps) {
  return Math.round(Math.max(30, durationSeconds * 0.12 + reps * 1.2))
}

function formatDuration(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

export default function CameraWorkout() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const detectorRef = useRef(null)
  const requestRef = useRef(null)
  const sessionTimerRef = useRef(null)
  const analysisStateRef = useRef({ phase: 'up' })

  const [modelReady, setModelReady] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [setupMessage, setSetupMessage] = useState('Preparing camera trainer...')
  const [exercise, setExercise] = useState('squat')
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [repCount, setRepCount] = useState(0)
  const [formFeedback, setFormFeedback] = useState('Ready to analyze your movement.')
  const [goodReps, setGoodReps] = useState(0)
  const [badReps, setBadReps] = useState(0)
  const [recordings, setRecordings] = useState([])
  const [currentIssues, setCurrentIssues] = useState([])

  useEffect(() => {
    let stream
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setCameraReady(true)
        }
      } catch (err) {
        setErrorMessage('Could not access the camera. Please enable camera permissions and refresh.')
        setSetupMessage('Camera access is required for exercise detection.')
        console.error(err)
      }
    }

    const loadModel = async () => {
      try {
        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
        })
        detectorRef.current = detector
        setModelReady(true)
        setSetupMessage('Camera trainer is ready. Choose an exercise and start your session.')
      } catch (err) {
        setErrorMessage('Unable to load pose detection model. Please try again later.')
        console.error(err)
      }
    }

    startCamera()
    loadModel()

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (detectorRef.current) {
        detectorRef.current.dispose?.()
      }
    }
  }, [])

  useEffect(() => {
    if (!sessionActive) {
      clearInterval(sessionTimerRef.current)
      return
    }

    sessionTimerRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(sessionTimerRef.current)
  }, [sessionActive])

  useEffect(() => {
    if (!cameraReady || !modelReady || !sessionActive) return
    const drawFrame = async () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      const detector = detectorRef.current

      if (!video || !canvas || !detector) {
        requestRef.current = requestAnimationFrame(drawFrame)
        return
      }

      const width = video.videoWidth
      const height = video.videoHeight
      if (width && height) {
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.canvas.video = video
        const poses = await detector.estimatePoses(video, { flipHorizontal: true })
        if (poses.length > 0) {
          const pose = poses[0]
          const result = analyzeExercisePose(pose, exercise, analysisStateRef.current)
          setCurrentIssues(result.issues)

          if (result.countTrigger) {
            const hasGoodForm = result.issues.length === 0
            setRepCount(prev => prev + 1)
            setGoodReps(prev => prev + (hasGoodForm ? 1 : 0))
            setBadReps(prev => prev + (hasGoodForm ? 0 : 1))
            setFormFeedback(hasGoodForm ? 'Great rep. Keep that form!' : 'Rep counted, but watch your posture.')
          }

          if (result.issues.length > 0) {
            setFormFeedback(result.issues[0])
          }
          drawPose(ctx, pose, width, height)
        }
      }
      requestRef.current = requestAnimationFrame(drawFrame)
    }

    requestRef.current = requestAnimationFrame(drawFrame)
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [cameraReady, modelReady, sessionActive, exercise])

  const startSession = () => {
    analysisStateRef.current = { phase: 'up' }
    setSessionActive(true)
    setFormFeedback('Tracking movement. Keep your form steady.')
  }

  const stopSession = () => {
    setSessionActive(false)
    setRecordings(prev => [{
      id: Date.now(),
      exercise,
      duration: sessionTime,
      reps: repCount,
      goodReps,
      badReps,
      calories: estimateCalories(sessionTime, repCount),
      date: new Date().toLocaleString(),
    }, ...prev])
  }

  const resetSession = () => {
    setSessionActive(false)
    setSessionTime(0)
    setRepCount(0)
    setGoodReps(0)
    setBadReps(0)
    setFormFeedback('Ready to analyze your movement.')
    setCurrentIssues([])
    analysisStateRef.current = { phase: 'up' }
  }

  const analytics = {
    totalReps: repCount,
    correct: goodReps,
    incorrect: badReps,
    calories: estimateCalories(sessionTime, repCount),
    accuracy: repCount ? Math.round((goodReps / repCount) * 100) : 0,
  }

  return (
    <div className="page-inner" style={{ paddingBottom: 40 }}>
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }} className="page-header">
        <div className="accent-line" />
        <h1 className="page-title">Live Trainer</h1>
        <p className="page-subtitle">Camera-based exercise detection, rep counting, posture guidance, and session analytics.</p>
      </motion.div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:24, alignItems:'start', marginTop:24 }}>
        <div style={{ borderRadius:24, overflow:'hidden', border:'1px solid var(--border)', background:'var(--bg-surface)' }}>
          <div style={{ position:'relative', width:'100%', paddingTop:'56.25%', background:'#111' }}>
            <video ref={videoRef} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover' }} muted playsInline />
            <canvas ref={canvasRef} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }} />
          </div>
          <div style={{ padding:20 }}>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:18 }}>
              <div style={{ padding:'14px 16px', borderRadius:18, background:'rgba(59,130,246,0.08)', flex:1, minWidth:140 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#2563eb' }}>Session</div>
                <div style={{ fontSize:24, fontWeight:800, marginTop:6 }}>{formatDuration(sessionTime)}</div>
              </div>
              <div style={{ padding:'14px 16px', borderRadius:18, background:'rgba(16,185,129,0.08)', flex:1, minWidth:140 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#15803d' }}>Reps</div>
                <div style={{ fontSize:24, fontWeight:800, marginTop:6 }}>{repCount}</div>
              </div>
              <div style={{ padding:'14px 16px', borderRadius:18, background:'rgba(234,179,8,0.08)', flex:1, minWidth:140 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#b45309' }}>Exercise</div>
                <div style={{ fontSize:24, fontWeight:800, marginTop:6 }}>{exercise === 'squat' ? 'Squats' : 'Push-ups'}</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
              <select value={exercise} onChange={e => setExercise(e.target.value)} disabled={sessionActive} style={{ minWidth:180, padding:'12px 14px', borderRadius:14, border:'1px solid var(--border)', background:'var(--bg-white)', color:'var(--text-primary)' }}>
                <option value="squat">Squat</option>
                <option value="pushup">Push-up</option>
              </select>
              <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={sessionActive ? stopSession : startSession} style={{ padding:'12px 22px', borderRadius:9999, border:'none', background: sessionActive ? '#ef4444' : '#2563eb', color:'white', fontWeight:700, cursor:'pointer' }}>
                {sessionActive ? <><Pause size={16}/> Stop Session</> : <><Play size={16}/> Start Session</>}
              </motion.button>
              <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={resetSession} style={{ padding:'12px 22px', borderRadius:9999, border:'1px solid rgba(59,130,246,0.18)', background:'rgba(59,130,246,0.08)', color:'#2563eb', fontWeight:700, cursor:'pointer' }}>
                Reset
              </motion.button>
            </div>
            <div style={{ marginTop:20, padding:'18px 20px', borderRadius:20, background:'rgba(15,23,42,0.03)', border:'1px solid rgba(59,130,246,0.12)' }}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>Live Form Feedback</div>
              <div style={{ fontSize:14, color:'#111827', lineHeight:1.6 }}>{formFeedback}</div>
              {currentIssues.length > 0 && (
                <ul style={{ marginTop:12, paddingLeft:18, color:'#374151', fontSize:13, lineHeight:1.6 }}>
                  {currentIssues.slice(0, 3).map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gap:18 }}>
          <div style={{ padding:24, borderRadius:24, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <Activity size={18} />
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>Workout Analytics</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:14 }}>
              <div style={{ padding:16, borderRadius:20, background:'rgba(59,130,246,0.08)' }}>
                <div style={{ fontSize:12, color:'#2563eb', fontWeight:700 }}>Correct Reps</div>
                <div style={{ fontSize:22, fontWeight:800, marginTop:8 }}>{goodReps}</div>
              </div>
              <div style={{ padding:16, borderRadius:20, background:'rgba(239,68,68,0.08)' }}>
                <div style={{ fontSize:12, color:'#b91c1c', fontWeight:700 }}>Form alerts</div>
                <div style={{ fontSize:22, fontWeight:800, marginTop:8 }}>{badReps}</div>
              </div>
              <div style={{ padding:16, borderRadius:20, background:'rgba(16,185,129,0.08)' }}>
                <div style={{ fontSize:12, color:'#047857', fontWeight:700 }}>Calories</div>
                <div style={{ fontSize:22, fontWeight:800, marginTop:8 }}>{analytics.calories}</div>
              </div>
              <div style={{ padding:16, borderRadius:20, background:'rgba(234,179,8,0.08)' }}>
                <div style={{ fontSize:12, color:'#b45309', fontWeight:700 }}>Accuracy</div>
                <div style={{ fontSize:22, fontWeight:800, marginTop:8 }}>{analytics.accuracy}%</div>
              </div>
            </div>
          </div>

          <div style={{ padding:24, borderRadius:24, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <ShieldCheck size={18} />
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>Session Summary</div>
            </div>
            <div style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>
              {sessionActive ? 'Workout is live. Performance is being tracked in real time.' : 'No active session. Start the camera trainer to begin counting reps and correcting form.'}
            </div>
            <div style={{ marginTop:16, display:'grid', gap:12 }}>
              <div style={{ fontSize:14, fontWeight:700 }}>Selected exercise</div>
              <div style={{ padding:'14px 16px', borderRadius:18, background:'rgba(255,255,255,0.8)', border:'1px solid var(--border)' }}>{exercise === 'squat' ? 'Squats' : 'Push-ups'}</div>
              <div style={{ fontSize:14, fontWeight:700 }}>Session duration</div>
              <div style={{ padding:'14px 16px', borderRadius:18, background:'rgba(255,255,255,0.8)', border:'1px solid var(--border)' }}>{formatDuration(sessionTime)}</div>
            </div>
          </div>

          <div style={{ padding:24, borderRadius:24, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <BarChart3 size={18} />
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>Previous Camera Sessions</div>
            </div>
            {recordings.length === 0 ? (
              <div style={{ fontSize:13, color:'var(--text-muted)' }}>Your live sessions will appear here after you stop a workout.</div>
            ) : (
              <div style={{ display:'grid', gap:14 }}>
                {recordings.slice(0, 3).map(record => (
                  <div key={record.id} style={{ padding:'14px 16px', borderRadius:18, background:'rgba(255,255,255,0.85)', border:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:13, fontWeight:700 }}>
                      <span>{record.exercise === 'squat' ? 'Squat session' : 'Push-up session'}</span>
                      <span>{record.date}</span>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, fontSize:12, color:'#4b5563' }}>
                      <div>Reps: {record.reps}</div>
                      <div>Duration: {formatDuration(record.duration)}</div>
                      <div>Calories: {record.calories}</div>
                      <div>Good reps: {record.goodReps}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop:26, padding:24, borderRadius:24, background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.18)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
          <Camera size={18} />
          <div style={{ fontSize:15, fontWeight:700 }}>How it works</div>
        </div>
        <div style={{ fontSize:14, color:'#374151', lineHeight:1.8 }}>
          Camera-based training uses your device webcam to detect body landmarks in real time. The live trainer tracks rep motion, counts repetitions, and provides posture guidance so each set is safer and more effective. Recorded sessions are stored for quick analytics and progress review.
        </div>
      </div>

      {(errorMessage || !modelReady || !cameraReady) && (
        <div style={{ marginTop:24, padding:18, borderRadius:20, background:'rgba(254,226,226,0.95)', border:'1px solid rgba(239,68,68,0.15)', color:'#b91c1c' }}>
          {errorMessage || setupMessage}
        </div>
      )}
    </div>
  )
}
