import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { TrendingUp, Award, Target, Zap } from 'lucide-react'

const weeklyData = [
  { day:'Mon', steps:6200,  cal:1800, active:35 },
  { day:'Tue', steps:8100,  cal:2100, active:55 },
  { day:'Wed', steps:5400,  cal:1650, active:28 },
  { day:'Thu', steps:9300,  cal:2400, active:68 },
  { day:'Fri', steps:7800,  cal:2050, active:50 },
  { day:'Sat', steps:11200, cal:2700, active:82 },
  { day:'Sun', steps:4960,  cal:1840, active:47 },
]

const monthlyCalories = [
  { week:'W1', burned:12400, consumed:14200 },
  { week:'W2', burned:13800, consumed:14800 },
  { week:'W3', burned:15200, consumed:15400 },
  { week:'W4', burned:14100, consumed:14900 },
]

const muscleFreq = [
  { muscle:'Core',    sessions:7 },
  { muscle:'Quads',   sessions:5 },
  { muscle:'Chest',   sessions:4 },
  { muscle:'Glutes',  sessions:4 },
  { muscle:'Back',    sessions:3 },
  { muscle:'Arms',    sessions:3 },
]

const prs = [
  { name:'Bench Press',    record:'85 kg',   trend:'+5 kg this month',  icon:'🏋️', color:'#3B82F6', image:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=160&fit=crop' },
  { name:'5K Run',         record:'24:32',   trend:'-1:20 this month',  icon:'🏃', color:'#F43F5E', image:'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=300&h=160&fit=crop' },
  { name:'Push-ups',       record:'52 reps', trend:'+8 this month',     icon:'💪', color:'#10B981', image:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=160&fit=crop' },
  { name:'Plank Duration', record:'3:45',    trend:'+45s this month',   icon:'⚡', color:'#8B5CF6', image:'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=160&fit=crop' },
]

const heatData = Array.from({length:28},(_,i)=>({ day:i, level:[0,0,1,2,0,3,4,2,1,4,3,0,1,2,4,3,1,0,2,4,3,2,1,4,4,3,0,1][i] }))

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:14, padding:'12px 16px', boxShadow:'0 8px 24px rgba(0,0,0,0.1)' }}>
      <div style={{ fontFamily:'Inter', fontWeight:700, marginBottom:6, fontSize:13, color:'var(--text-primary)' }}>{label}</div>
      {payload.map((p,i) => <div key={i} style={{ fontSize:12, color:p.color, fontWeight:600 }}>{p.name}: {p.value?.toLocaleString()}</div>)}
    </div>
  )
}

const cardVariants = {
  hidden: { opacity:0, y:24 },
  visible: i => ({ opacity:1, y:0, transition:{ duration:0.55, delay:i*0.1, ease:[0.4,0,0.2,1] } }),
}

export default function Progress() {
  const [tab, setTab] = useState('steps')

  const summary = [
    { label:'Total Workouts',  v:'47',   sub:'this month', color:'#3B82F6', icon:<Zap size={20} color="#3B82F6"/>,         delta:'+12%' },
    { label:'Calories Burned', v:'54.8k',sub:'this month', color:'#F59E0B', icon:<span style={{fontSize:20}}>🔥</span>,    delta:'+8%'  },
    { label:'Avg Active Min',  v:'52',   sub:'per day',    color:'#10B981', icon:<Target size={20} color="#10B981"/>,       delta:'+5%'  },
    { label:'Best Streak',     v:'14',   sub:'days',       color:'#8B5CF6', icon:<span style={{fontSize:20}}>⚡</span>,     delta:'🔥'   },
  ]

  return (
    <div className="page-inner">
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }} className="page-header">
        <div className="accent-line" />
        <h1 className="page-title">Progress <span className="gt-blue">& Analytics</span></h1>
        <p className="page-subtitle">Track your fitness journey over time</p>
      </motion.div>

      {/* Summary cards */}
      <div className="g4" style={{ marginBottom:28 }}>
        {summary.map((s, i) => (
          <motion.div key={s.label} custom={i} variants={cardVariants} initial="hidden" animate="visible" className="card card-sm" style={{ borderTop:`3px solid ${s.color}`, overflow:'visible' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ width:44, height:44, borderRadius:14, background:`${s.color}12`, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${s.color}20` }}>
                {s.icon}
              </div>
              <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:9999, background:`${s.color}10`, color:s.color, border:`1px solid ${s.color}25` }}>
                {s.delta}
              </span>
            </div>
            <div className="stat-value">{s.v}</div>
            <div className="stat-label">{s.label}</div>
            <div style={{ fontSize:11, color:'var(--text-faint)', marginTop:3 }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Weekly chart */}
      <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" className="card" style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <div>
            <h2 className="section-title" style={{ marginBottom:2 }}>Weekly Overview</h2>
            <div className="section-meta">This week's performance</div>
          </div>
          <div className="pill-tabs">
            {[{id:'steps',label:'👟 Steps'},{id:'cal',label:'🔥 Cals'},{id:'active',label:'⚡ Active'}].map(t=>(
              <motion.button key={t.id} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} className={`pill-tab ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>{t.label}</motion.button>
            ))}
          </div>
        </div>
        <div style={{ height:230 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barCategoryGap="30%">
              <defs>
                <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6"/>
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false}/>
              <XAxis dataKey="day" tick={{fill:'var(--text-faint)',fontSize:12,fontFamily:'Inter'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'var(--text-faint)',fontSize:11,fontFamily:'Inter'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>} cursor={{fill:'rgba(59,130,246,0.04)'}}/>
              <Bar dataKey={tab} fill="url(#barG)" radius={[8,8,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Area + Muscle freq */}
      <div className="g2" style={{ marginBottom:24 }}>
        <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible" className="card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <h2 className="section-title" style={{ marginBottom:0 }}>Active Minutes</h2>
            <span style={{ fontSize:11, fontWeight:600, padding:'4px 12px', borderRadius:9999, background:'rgba(14,165,233,0.08)', color:'#0EA5E9', border:'1px solid rgba(14,165,233,0.2)' }}>Daily</span>
          </div>
          <div style={{ height:190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.18}/>
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false}/>
                <XAxis dataKey="day" tick={{fill:'var(--text-faint)',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'var(--text-faint)',fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip content={<Tip/>}/>
                <Area type="monotone" dataKey="active" name="Active min" stroke="#3B82F6" strokeWidth={2.5} fill="url(#areaG)" dot={{fill:'#3B82F6',r:4,strokeWidth:0}} activeDot={{r:6}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible" className="card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <h2 className="section-title" style={{ marginBottom:0 }}>Muscle Frequency</h2>
            <span style={{ fontSize:11, fontWeight:600, padding:'4px 12px', borderRadius:9999, background:'rgba(59,130,246,0.08)', color:'#3B82F6', border:'1px solid rgba(59,130,246,0.2)' }}>Month</span>
          </div>
          <div style={{ height:190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={muscleFreq} layout="vertical" barCategoryGap="22%">
                <defs>
                  <linearGradient id="musG" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6"/>
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false}/>
                <XAxis type="number" tick={{fill:'var(--text-faint)',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="muscle" tick={{fill:'var(--text-secondary)',fontSize:12}} axisLine={false} tickLine={false} width={52}/>
                <Tooltip content={<Tip/>} cursor={{fill:'rgba(59,130,246,0.04)'}}/>
                <Bar dataKey="sessions" name="Sessions" fill="url(#musG)" radius={[0,8,8,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Calorie balance */}
      <motion.div custom={7} variants={cardVariants} initial="hidden" animate="visible" className="card" style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
          <h2 className="section-title" style={{ marginBottom:0 }}>Calorie Balance</h2>
          <span style={{ fontSize:11, fontWeight:600, padding:'4px 12px', borderRadius:9999, background:'rgba(245,158,11,0.08)', color:'var(--amber)', border:'1px solid rgba(245,158,11,0.2)' }}>Monthly</span>
        </div>
        <div style={{ height:210 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyCalories}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false}/>
              <XAxis dataKey="week" tick={{fill:'var(--text-faint)',fontSize:12}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'var(--text-faint)',fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>} cursor={{stroke:'rgba(0,0,0,0.06)'}}/>
              <Line type="monotone" dataKey="burned"   name="Burned"   stroke="#3B82F6" strokeWidth={2.5} dot={{fill:'#3B82F6',r:4,strokeWidth:0}} activeDot={{r:6}}/>
              <Line type="monotone" dataKey="consumed" name="Consumed" stroke="#10B981" strokeWidth={2.5} strokeDasharray="5 4" dot={{fill:'#10B981',r:4,strokeWidth:0}} activeDot={{r:6}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display:'flex', gap:24, marginTop:14 }}>
          {[{c:'#3B82F6',l:'Burned'},{c:'#10B981',l:'Consumed'}].map(e=>(
            <div key={e.l} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--text-secondary)', fontWeight:500 }}>
              <div style={{ width:18, height:3, background:e.c, borderRadius:2 }}/> {e.l}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Heatmap */}
      <motion.div custom={8} variants={cardVariants} initial="hidden" animate="visible" className="card" style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
          <h2 className="section-title" style={{ marginBottom:0 }}>Training Heatmap</h2>
          <span className="badge badge-muted">Last 28 days</span>
        </div>
        <div style={{ display:'flex', gap:6, marginBottom:10 }}>
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>(
            <div key={d} style={{ flex:1, fontSize:10, color:'var(--text-faint)', textAlign:'center', fontWeight:600 }}>{d}</div>
          ))}
        </div>
        <div className="heatmap-grid">
          {heatData.map((c,i)=>(
            <div key={i} className="heat-cell" data-level={c.level} title={['Rest','Light','Moderate','Intense','Peak'][c.level]}/>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:14, fontSize:11, color:'var(--text-faint)', fontWeight:500 }}>
          <span>Less</span>
          {[0,1,2,3,4].map(l=><div key={l} className="heat-cell" data-level={l} style={{ width:14, height:14, flexShrink:0, borderRadius:3 }}/>)}
          <span>More</span>
        </div>
      </motion.div>

      {/* PRs */}
      <motion.div custom={9} variants={cardVariants} initial="hidden" animate="visible" className="card">
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
          <Award size={22} color="var(--amber)"/>
          <h2 className="section-title" style={{ marginBottom:0 }}>Personal Records</h2>
        </div>
        <div className="g2">
          {prs.map((pr, i)=>(
            <motion.div key={pr.name} whileHover={{ y:-4, boxShadow:'0 8px 28px rgba(0,0,0,0.1)' }} transition={{ duration:0.25 }} style={{ borderRadius:20, overflow:'hidden', border:'1px solid var(--border)', cursor:'pointer' }}>
              {/* Image top */}
              <div style={{ height:100, position:'relative', overflow:'hidden' }}>
                <img src={pr.image} alt={pr.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                <div style={{ position:'absolute', inset:0, background:`linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(0,0,0,0.5) 100%)` }} />
              </div>
              {/* Content */}
              <div style={{ padding:'16px 18px', background:'white' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ fontSize:24, flexShrink:0 }}>{pr.icon}</div>
                  <div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:2, fontWeight:500 }}>{pr.name}</div>
                    <div style={{ fontFamily:'Inter', fontSize:22, fontWeight:800, color:pr.color, letterSpacing:'-0.5px' }}>{pr.record}</div>
                    <div style={{ fontSize:11, color:'#10B981', marginTop:3, fontWeight:600 }}>{pr.trend}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
