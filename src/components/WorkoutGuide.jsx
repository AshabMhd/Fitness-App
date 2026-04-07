import { useState, useEffect } from 'react'

/* ── Animated figure lookup ──────────────────────────────────── */

// Each figure renders as an inline SVG with CSS keyframe animations on body parts

function SquatFigure() {
  return (
    <svg viewBox="0 0 120 160" width="120" height="160">
      {/* Head */}
      <ellipse cx="60" cy="20" rx="12" ry="13" fill="#FF6B2B" />
      {/* Neck */}
      <rect x="55" y="31" width="10" height="8" rx="3" fill="#FF8C42" />
      {/* Body (animates) */}
      <g style={{ transformOrigin: '60px 80px', animation: 'squat 1.6s ease-in-out infinite' }}>
        <rect x="44" y="39" width="32" height="36" rx="8" fill="#FF6B2B" opacity="0.9" />
        {/* Arms */}
        <line x1="44" y1="46" x2="26" y2="68" stroke="#FF8C42" strokeWidth="5" strokeLinecap="round" />
        <line x1="76" y1="46" x2="94" y2="68" stroke="#FF8C42" strokeWidth="5" strokeLinecap="round" />
        {/* Legs */}
        <line x1="52" y1="75" x2="36" y2="112" stroke="#FF6B2B" strokeWidth="6" strokeLinecap="round" />
        <line x1="68" y1="75" x2="84" y2="112" stroke="#FF6B2B" strokeWidth="6" strokeLinecap="round" />
        {/* Feet */}
        <ellipse cx="33" cy="116" rx="10" ry="5" fill="#FF8C42" />
        <ellipse cx="87" cy="116" rx="10" ry="5" fill="#FF8C42" />
      </g>
      {/* Ground line */}
      <line x1="10" y1="140" x2="110" y2="140" stroke="rgba(255,107,43,0.3)" strokeWidth="2" strokeDasharray="4 3" />
      {/* Arrows down */}
      <text x="60" y="155" textAnchor="middle" fill="rgba(255,107,43,0.5)" fontSize="9" fontFamily="monospace">↕ squat</text>
    </svg>
  )
}

function PushupFigure() {
  return (
    <svg viewBox="0 0 180 100" width="180" height="100">
      <g style={{ transformOrigin: '90px 60px', animation: 'pushup 1.4s ease-in-out infinite' }}>
        {/* Head */}
        <ellipse cx="30" cy="42" rx="11" ry="12" fill="#00D4FF" />
        {/* Body */}
        <rect x="40" y="45" width="85" height="16" rx="8" fill="#00D4FF" opacity="0.9" />
        {/* Upper arms */}
        <line x1="56" y1="52" x2="56" y2="72" stroke="#22DDFF" strokeWidth="6" strokeLinecap="round" />
        <line x1="96" y1="52" x2="96" y2="72" stroke="#22DDFF" strokeWidth="6" strokeLinecap="round" />
        {/* Lower body */}
        <rect x="124" y="49" width="36" height="12" rx="6" fill="#00D4FF" opacity="0.8" />
        {/* Feet */}
        <ellipse cx="158" cy="66" rx="7" ry="10" fill="#22DDFF" />
      </g>
      {/* Ground */}
      <line x1="10" y1="82" x2="170" y2="82" stroke="rgba(0,212,255,0.3)" strokeWidth="2" strokeDasharray="4 3" />
      <text x="90" y="96" textAnchor="middle" fill="rgba(0,212,255,0.5)" fontSize="9" fontFamily="monospace">↕ push-up</text>
    </svg>
  )
}

function PlankFigure() {
  return (
    <svg viewBox="0 0 200 90" width="200" height="90">
      <g style={{ transformOrigin: '100px 50px', animation: 'plank-breathe 2.5s ease-in-out infinite' }}>
        <ellipse cx="26" cy="40" rx="11" ry="12" fill="#A8FF3E" />
        <rect x="36" y="43" width="110" height="14" rx="7" fill="#A8FF3E" opacity="0.9" />
        {/* Forearms on ground */}
        <line x1="52" y1="56" x2="52" y2="70" stroke="#CCFF66" strokeWidth="6" strokeLinecap="round" />
        <line x1="84" y1="56" x2="84" y2="70" stroke="#CCFF66" strokeWidth="6" strokeLinecap="round" />
        {/* Lower body */}
        <rect x="145" y="47" width="36" height="10" rx="5" fill="#A8FF3E" opacity="0.8" />
        <ellipse cx="182" cy="62" rx="7" ry="10" fill="#CCFF66" />
      </g>
      <line x1="10" y1="76" x2="190" y2="76" stroke="rgba(168,255,62,0.3)" strokeWidth="2" strokeDasharray="4 3" />
      <text x="100" y="88" textAnchor="middle" fill="rgba(168,255,62,0.5)" fontSize="9" fontFamily="monospace">hold position</text>
    </svg>
  )
}

function RunFigure() {
  return (
    <svg viewBox="0 0 120 160" width="120" height="160">
      <g style={{ animation: 'run-bob 0.7s ease-in-out infinite' }}>
        {/* Head */}
        <ellipse cx="72" cy="20" rx="12" ry="13" fill="#FF2D9B" />
        {/* Body */}
        <rect x="58" y="32" width="26" height="30" rx="8" fill="#FF2D9B" opacity="0.9" />
        {/* Front arm forward */}
        <line x1="58" y1="40" x2="32" y2="54" stroke="#FF50AC" strokeWidth="5" strokeLinecap="round" />
        {/* Back arm back */}
        <line x1="84" y1="40" x2="104" y2="50" stroke="#FF50AC" strokeWidth="5" strokeLinecap="round" />
        {/* Front leg (up) */}
        <line x1="68" y1="62" x2="44" y2="90" stroke="#FF2D9B" strokeWidth="6" strokeLinecap="round" />
        <line x1="44" y1="90" x2="30" y2="115" stroke="#FF50AC" strokeWidth="5" strokeLinecap="round" />
        {/* Back leg (down/behind) */}
        <line x1="74" y1="62" x2="96" y2="96" stroke="#FF2D9B" strokeWidth="6" strokeLinecap="round" />
        <line x1="96" y1="96" x2="110" y2="118" stroke="#FF50AC" strokeWidth="5" strokeLinecap="round" />
        {/* Feet */}
        <ellipse cx="27" cy="118" rx="9" ry="4" fill="#FF50AC" />
        <ellipse cx="113" cy="122" rx="9" ry="4" fill="#FF50AC" />
      </g>
      <line x1="10" y1="130" x2="110" y2="130" stroke="rgba(255,45,155,0.3)" strokeWidth="2" strokeDasharray="4 3" />
      {/* Motion lines */}
      <line x1="10" y1="55" x2="28" y2="55" stroke="rgba(255,45,155,0.3)" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="63" x2="22" y2="63" stroke="rgba(255,45,155,0.2)" strokeWidth="1.5" strokeLinecap="round" />
      <text x="60" y="146" textAnchor="middle" fill="rgba(255,45,155,0.5)" fontSize="9" fontFamily="monospace">→ running</text>
    </svg>
  )
}

function JumpJackFigure() {
  return (
    <svg viewBox="0 0 160 170" width="160" height="170">
      <g style={{ transformOrigin: '80px 90px', animation: 'jump-jack 0.8s ease-in-out infinite' }}>
        {/* Head */}
        <ellipse cx="80" cy="20" rx="12" ry="13" fill="#FFD24D" />
        {/* Body */}
        <rect x="68" y="32" width="24" height="32" rx="8" fill="#FFD24D" opacity="0.9" />
        {/* Arms wide */}
        <line x1="68" y1="40" x2="22" y2="64" stroke="#FFE080" strokeWidth="6" strokeLinecap="round" />
        <line x1="92" y1="40" x2="138" y2="64" stroke="#FFE080" strokeWidth="6" strokeLinecap="round" />
        {/* Hands */}
        <circle cx="20" cy="66" r="5" fill="#FFE080" />
        <circle cx="140" cy="66" r="5" fill="#FFE080" />
        {/* Legs apart */}
        <line x1="74" y1="64" x2="36" y2="118" stroke="#FFD24D" strokeWidth="6" strokeLinecap="round" />
        <line x1="86" y1="64" x2="124" y2="118" stroke="#FFD24D" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="33" cy="124" rx="10" ry="5" fill="#FFE080" />
        <ellipse cx="127" cy="124" rx="10" ry="5" fill="#FFE080" />
      </g>
      <line x1="10" y1="140" x2="150" y2="140" stroke="rgba(255,210,77,0.3)" strokeWidth="2" strokeDasharray="4 3" />
      <text x="80" y="156" textAnchor="middle" fill="rgba(255,210,77,0.5)" fontSize="9" fontFamily="monospace">↔ jumping jacks</text>
    </svg>
  )
}

function BurpeeFigure() {
  return (
    <svg viewBox="0 0 160 170" width="160" height="170">
      <g style={{ transformOrigin: '80px 80px', animation: 'burpee 1.8s ease-in-out infinite' }}>
        {/* Head */}
        <ellipse cx="80" cy="20" rx="12" ry="13" fill="#FF6B2B" />
        {/* Body */}
        <rect x="64" y="32" width="32" height="36" rx="8" fill="#FF6B2B" opacity="0.9" />
        {/* Arms */}
        <line x1="64" y1="42" x2="40" y2="62" stroke="#FF8C42" strokeWidth="5" strokeLinecap="round" />
        <line x1="96" y1="42" x2="120" y2="62" stroke="#FF8C42" strokeWidth="5" strokeLinecap="round" />
        {/* Legs */}
        <line x1="72" y1="68" x2="54" y2="108" stroke="#FF6B2B" strokeWidth="6" strokeLinecap="round" />
        <line x1="88" y1="68" x2="106" y2="108" stroke="#FF6B2B" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="51" cy="114" rx="10" ry="5" fill="#FF8C42" />
        <ellipse cx="109" cy="114" rx="10" ry="5" fill="#FF8C42" />
      </g>
      <line x1="10" y1="134" x2="150" y2="134" stroke="rgba(255,107,43,0.3)" strokeWidth="2" strokeDasharray="4 3" />
      <text x="80" y="150" textAnchor="middle" fill="rgba(255,107,43,0.5)" fontSize="9" fontFamily="monospace">↕ burpee</text>
    </svg>
  )
}

function YogaFigure() {
  return (
    <svg viewBox="0 0 140 170" width="140" height="170">
      <g style={{ transformOrigin: '70px 100px', animation: 'yoga-tree 3s ease-in-out infinite' }}>
        {/* Head */}
        <ellipse cx="70" cy="20" rx="12" ry="13" fill="#A8FF3E" />
        {/* Body */}
        <rect x="58" y="32" width="24" height="44" rx="8" fill="#A8FF3E" opacity="0.9" />
        {/* Arms raised */}
        <line x1="58" y1="40" x2="30" y2="20" stroke="#CCFF66" strokeWidth="5" strokeLinecap="round" />
        <line x1="82" y1="40" x2="110" y2="20" stroke="#CCFF66" strokeWidth="5" strokeLinecap="round" />
        {/* Hands (palms together at top) */}
        <circle cx="70" cy="12" r="6" fill="#CCFF66" />
        {/* Standing leg */}
        <line x1="70" y1="76" x2="70" y2="130" stroke="#A8FF3E" strokeWidth="6" strokeLinecap="round" />
        {/* Bent leg (tree pose) */}
        <line x1="70" y1="90" x2="50" y2="110" stroke="#A8FF3E" strokeWidth="5" strokeLinecap="round" />
        <line x1="50" y1="110" x2="64" y2="106" stroke="#CCFF66" strokeWidth="4" strokeLinecap="round" />
        {/* Foot */}
        <ellipse cx="70" cy="133" rx="9" ry="5" fill="#CCFF66" />
      </g>
      <line x1="40" y1="140" x2="100" y2="140" stroke="rgba(168,255,62,0.3)" strokeWidth="2" strokeDasharray="4 3" />
      <text x="70" y="157" textAnchor="middle" fill="rgba(168,255,62,0.5)" fontSize="9" fontFamily="monospace">tree pose / flow</text>
    </svg>
  )
}

function DeadliftFigure() {
  return (
    <svg viewBox="0 0 160 170" width="160" height="170">
      <g style={{ transformOrigin: '80px 80px', animation: 'deadlift-move 1.8s ease-in-out infinite' }}>
        {/* Head */}
        <ellipse cx="80" cy="22" rx="12" ry="13" fill="#00D4FF" />
        {/* Body bent over */}
        <rect x="60" y="34" width="28" height="34" rx="8" fill="#00D4FF" opacity="0.9" />
        {/* Arms gripping bar */}
        <line x1="60" y1="48" x2="24" y2="72" stroke="#22DDFF" strokeWidth="5" strokeLinecap="round" />
        <line x1="88" y1="48" x2="124" y2="72" stroke="#22DDFF" strokeWidth="5" strokeLinecap="round" />
        {/* Barbell */}
        <line x1="14" y1="76" x2="146" y2="76" stroke="#22DDFF" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="12" cy="76" rx="10" ry="14" fill="rgba(0,212,255,0.5)" stroke="#22DDFF" strokeWidth="1.5" />
        <ellipse cx="148" cy="76" rx="10" ry="14" fill="rgba(0,212,255,0.5)" stroke="#22DDFF" strokeWidth="1.5" />
        {/* Legs */}
        <line x1="70" y1="68" x2="60" y2="110" stroke="#00D4FF" strokeWidth="6" strokeLinecap="round" />
        <line x1="86" y1="68" x2="96" y2="110" stroke="#00D4FF" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="57" cy="116" rx="10" ry="5" fill="#22DDFF" />
        <ellipse cx="99" cy="116" rx="10" ry="5" fill="#22DDFF" />
      </g>
      <line x1="10" y1="130" x2="150" y2="130" stroke="rgba(0,212,255,0.3)" strokeWidth="2" strokeDasharray="4 3" />
      <text x="80" y="146" textAnchor="middle" fill="rgba(0,212,255,0.5)" fontSize="9" fontFamily="monospace">↕ deadlift</text>
    </svg>
  )
}

function PullupFigure() {
  return (
    <svg viewBox="0 0 160 170" width="160" height="170">
      {/* Bar at top */}
      <line x1="20" y1="18" x2="140" y2="18" stroke="#FF2D9B" strokeWidth="6" strokeLinecap="round" />
      <rect x="10" y="12" width="16" height="12" rx="3" fill="rgba(255,45,155,0.3)" />
      <rect x="134" y="12" width="16" height="12" rx="3" fill="rgba(255,45,155,0.3)" />
      <g style={{ transformOrigin: '80px 80px', animation: 'deadlift-move 1.8s ease-in-out infinite' }}>
        {/* Arms up */}
        <line x1="54" y1="36" x2="54" y2="18" stroke="#FF50AC" strokeWidth="5" strokeLinecap="round" />
        <line x1="106" y1="36" x2="106" y2="18" stroke="#FF50AC" strokeWidth="5" strokeLinecap="round" />
        {/* Head */}
        <ellipse cx="80" cy="46" rx="12" ry="13" fill="#FF2D9B" />
        {/* Body */}
        <rect x="66" y="58" width="28" height="36" rx="8" fill="#FF2D9B" opacity="0.9" />
        {/* Legs hang */}
        <line x1="74" y1="94" x2="64" y2="132" stroke="#FF2D9B" strokeWidth="6" strokeLinecap="round" />
        <line x1="86" y1="94" x2="96" y2="132" stroke="#FF2D9B" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="61" cy="137" rx="9" ry="5" fill="#FF50AC" />
        <ellipse cx="99" cy="137" rx="9" ry="5" fill="#FF50AC" />
      </g>
      <text x="80" y="156" textAnchor="middle" fill="rgba(255,45,155,0.5)" fontSize="9" fontFamily="monospace">↑ pull-up</text>
    </svg>
  )
}

// Default for unknown/yoga exercises
function GenericFigure({ color = '#FF6B2B' }) {
  return (
    <svg viewBox="0 0 120 160" width="120" height="160">
      <g style={{ animation: 'float 2.5s ease-in-out infinite' }}>
        <ellipse cx="60" cy="22" rx="12" ry="13" fill={color} />
        <rect x="48" y="34" width="24" height="34" rx="8" fill={color} opacity="0.9" />
        <line x1="48" y1="42" x2="26" y2="60" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <line x1="72" y1="42" x2="94" y2="60" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <line x1="56" y1="68" x2="44" y2="108" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <line x1="64" y1="68" x2="76" y2="108" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="41" cy="113" rx="9" ry="5" fill={color} style={{ opacity:0.8 }} />
        <ellipse cx="79" cy="113" rx="9" ry="5" fill={color} style={{ opacity:0.8 }} />
      </g>
      <line x1="10" y1="128" x2="110" y2="128" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeDasharray="4 3" />
      <text x="60" y="143" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="monospace">exercise</text>
    </svg>
  )
}

const FIGURE_MAP = {
  squat:     <SquatFigure />,
  squat2:    <SquatFigure />,
  pushup:    <PushupFigure />,
  pushup2:   <PushupFigure />,
  plank:     <PlankFigure />,
  run:       <RunFigure />,
  treadmill: <RunFigure />,
  jumping:   <JumpJackFigure />,
  burpee:    <BurpeeFigure />,
  tabata:    <BurpeeFigure />,
  yoga:      <YogaFigure />,
  sun:       <YogaFigure />,
  vinyasa:   <YogaFigure />,
  deadlift:  <DeadliftFigure />,
  pullup:    <PullupFigure />,
  pull:      <PullupFigure />,
  rope:      <RunFigure />,
}

function pickFigure(name) {
  const key = name.toLowerCase()
  for (const [k, fig] of Object.entries(FIGURE_MAP)) {
    if (key.includes(k)) return fig
  }
  return <GenericFigure />
}

/* ── Per-exercise guide data ──────────────────────────────────── */
const GUIDE_DATA = {
  'Treadmill Run': {
    tagline: 'Cardio Foundation',
    steps: [
      'Stand on treadmill, feet shoulder-width apart.',
      'Start at a slow walk (2–3 mph) to warm up for 2 min.',
      'Increase speed to your target pace (5–7 mph for moderate).',
      'Keep chest upright, arms bent at 90°, swinging naturally.',
      'Land mid-foot, not on heel — reduces joint impact.',
      'Breathe rhythmically: inhale 2 steps, exhale 2 steps.',
      'Cool down: reduce speed to walk for last 2 min.',
    ],
    tips: ['Stay hydrated', 'Look forward, not down', 'Don\'t hold the rails'],
    muscles_note: 'Primary: quads & calves. Secondary: hamstrings & core stabilizers.',
  },
  'Barbell Squat': {
    tagline: 'King of Leg Exercises',
    steps: [
      'Stand with feet shoulder-width apart under the bar.',
      'Grip bar slightly wider than shoulders, brace core & unrack.',
      'Step back: feet shoulder-width, toes pointed 15–30° out.',
      'Inhale, brace hard — begin descent: push knees out over toes.',
      'Descend until thighs are parallel to floor (or below).',
      'Drive through heels to stand. Exhale at the top.',
      'Keep chest up and back flat throughout the movement.',
    ],
    tips: ['Knees track toes', 'Keep back neutral', 'Use lifting shoes or heel plate'],
    muscles_note: 'Primary: quads & glutes. Secondary: hamstrings, core & back.',
  },
  'Sun Salutation': {
    tagline: 'Morning Flow',
    steps: [
      'Mountain Pose: stand tall, palms at heart center.',
      'Raised Arms: inhale, sweep arms up & back.',
      'Forward Fold: exhale, hinge forward from hips.',
      'Half Lift: inhale, lengthen spine parallel to floor.',
      'Plank: exhale, step or jump back into plank.',
      'Chaturanga: slowly lower chest, keep elbows in.',
      'Upward Dog → Downward Dog: inhale up, exhale back.',
      'Walk feet to hands, rise back to Mountain Pose.',
    ],
    tips: ['Move with breath', 'Modify with knees down', '3–5 slow rounds'],
    muscles_note: 'Full body flow — core, back, hamstrings & shoulders.',
  },
  'Tabata Intervals': {
    tagline: 'Maximum Intensity',
    steps: [
      'Choose 1–2 exercises (e.g. burpees + squat jumps).',
      '20 seconds: perform the exercise at maximum effort.',
      '10 seconds: complete rest — breathe and recover.',
      'Repeat 8 rounds = 4 minutes total per exercise.',
      'Keep form strict even as fatigue builds.',
      'Use a Tabata timer app for precise intervals.',
      'Cool down 5 min after all rounds.',
    ],
    tips: ['All-out effort each 20 sec', 'Rest completely in 10 sec', 'Consistency beats intensity early on'],
    muscles_note: 'Full body — cardio + muscular endurance.',
  },
  'Jump Rope': {
    tagline: 'Coordination & Cardio',
    steps: [
      'Size rope: step on middle, handles should reach armpits.',
      'Hold handles at hip height, elbows close to body.',
      'Start spinning the rope from your wrists, not arms.',
      'Jump 1–2 inches off the ground, landing on balls of feet.',
      'Keep knees slightly bent to absorb impact.',
      'Build up: basic jump → alternate feet → double-unders.',
      'Rest 30 s every 2 min if needed when starting out.',
    ],
    tips: ['Wrists, not shoulders', 'Stay on your toes', 'Find a rhythm before adding speed'],
    muscles_note: 'Primary: calves & shoulders. Secondary: core & forearms.',
  },
  'Push-up Circuit': {
    tagline: 'Upper Body Strength',
    steps: [
      'Place hands slightly wider than shoulder-width on the floor.',
      'Extend legs behind — body forms a straight line head to heel.',
      'Engage core and glutes — no sagging hips.',
      'Inhale as you lower chest toward the floor.',
      'Elbows flare 45° from body (not 90° out).',
      'Press back up to start, exhale at the top.',
      'For circuit: 15 standard → 10 wide → 10 diamond → repeat.',
    ],
    tips: ['Keep core rigid', 'Full range: chest to 1 in from floor', 'Slow negatives build more strength'],
    muscles_note: 'Primary: chest & triceps. Secondary: shoulders & core.',
  },
  'Vinyasa Flow': {
    tagline: 'Fluid Movement',
    steps: [
      'Start in Downward Facing Dog — hips high, heels pressed down.',
      'Inhale: shift forward to Plank Pose.',
      'Exhale: Chaturanga (low push-up) — elbows at 90°.',
      'Inhale: Upward Facing Dog — chest lifts, thighs off floor.',
      'Exhale: Back to Downward Dog.',
      'Flow through 5–10 rounds at your own breath pace.',
      'Add Warrior I, II, and Triangle for variety.',
    ],
    tips: ['Match every move to a breath', 'Don\'t rush — flow means smooth', 'Modify: knees down for Chaturanga'],
    muscles_note: 'Core, back, shoulders, hamstrings — full body integration.',
  },
  'Burpee Blaster': {
    tagline: 'Total Body Explosive',
    steps: [
      'Stand with feet shoulder-width. Arms at sides.',
      'Drop: squat down, place both hands on the floor.',
      'Jump or step feet back into Plank position.',
      'Optionally: perform a push-up here for extra burn.',
      'Jump or step feet forward toward hands.',
      'Explode up: jump, reaching arms overhead.',
      'Land softly, immediately repeat. Target: 15–20 reps.',
    ],
    tips: ['Use arms on the jump for height', 'Keep hips level in plank', 'Modify: step instead of jump'],
    muscles_note: 'Full body — quads, chest, shoulders, core, calves.',
  },
  'Deadlift': {
    tagline: 'Posterior Chain Power',
    steps: [
      'Stand with bar over mid-foot, feet hip-width apart.',
      'Hinge: bend and grip bar just outside knees (double overhand).',
      'Bring shins to bar, chest tall, back flat, hips above knees.',
      'Take a deep breath, brace core hard (360° pressure).',
      'Push floor away — bar stays dragging against your legs.',
      'Lock hips and knees simultaneously at the top. Stand tall.',
      'Hinge back down with control, bar stays over mid-foot.',
    ],
    tips: ['Bar stays over mid-foot', '\"Push the floor down\" cue', 'Wrist neutrality — don\'t curl'],
    muscles_note: 'Primary: back, glutes & hamstrings. Secondary: traps, core & forearms.',
  },
  'Pull-up Circuit': {
    tagline: 'Back & Bicep Builder',
    steps: [
      'Grip bar slightly wider than shoulders, palms facing away.',
      'Hang with arms fully extended — hollow body, slight hollow.',
      'Depress and retract shoulder blades before pulling.',
      'Pull elbows toward the floor to bring chest toward bar.',
      'Chin clears bar — pause 1 second at the top.',
      'Lower slowly with control (3–4 seconds down).',
      'Circuit: standard pull-ups → chin-ups → wide grip → rest.',
    ],
    tips: ['Full hang between reps', 'Engage lats — think "elbows to pockets"', 'Use band assistance if needed'],
    muscles_note: 'Primary: back & biceps. Secondary: traps, core & forearms.',
  },
}

const PALETTE_MAP = {
  cardio:   { bg: '#FF2D9B', label: 'badge-magenta' },
  strength: { bg: '#00D4FF', label: 'badge-cyan' },
  yoga:     { bg: '#A8FF3E', label: 'badge-lime' },
  hiit:     { bg: '#FF6B2B', label: 'badge-fire' },
  default:  { bg: '#FF6B2B', label: 'badge-fire' },
}

export default function WorkoutGuide({ workout, onClose, onAddToSession }) {
  const [activeStep, setActiveStep] = useState(0)
  const [added, setAdded] = useState(false)
  const guide = GUIDE_DATA[workout.name]
  const palette = PALETTE_MAP[workout.category] || PALETTE_MAP.default
  const figure = pickFigure(workout.name)

  // Auto-advance steps
  useEffect(() => {
    const steps = guide?.steps?.length || 1
    const timer = setInterval(() => {
      setActiveStep(s => (s + 1) % steps)
    }, 3200)
    return () => clearInterval(timer)
  }, [guide])

  if (!guide) return null

  return (
    <div className="guide-panel anim-scale">
      {/* Header with gradient + animation stage */}
      <div className="guide-header">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className={`badge ${palette.label}`} style={{ marginBottom: 8 }}>{workout.category.toUpperCase()}</span>
          <h2 style={{ fontFamily:'Space Grotesk', fontSize:18, fontWeight:800, color:'white', marginBottom:2 }}>
            {workout.name}
          </h2>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.7)', fontStyle:'italic' }}>{guide.tagline}</p>
        </div>

        {/* Animation stage */}
        <div className="guide-anim-stage" style={{ height: 180, position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}>
            {figure}
          </div>
          <div style={{ position:'absolute', bottom:8, right:10, fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:'monospace', fontStyle:'italic' }}>
            animated demo
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="guide-body">
        {/* Stats row */}
        <div style={{ display:'flex', gap:12, marginBottom:16 }}>
          <div style={{ flex:1, textAlign:'center', padding:'10px', borderRadius:'var(--r-md)', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)' }}>
            <div style={{ fontSize:18, fontWeight:800, fontFamily:'Space Mono, monospace', color:'var(--text-1)' }}>{workout.duration}</div>
            <div style={{ fontSize:10, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em' }}>min</div>
          </div>
          <div style={{ flex:1, textAlign:'center', padding:'10px', borderRadius:'var(--r-md)', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)' }}>
            <div style={{ fontSize:18, fontWeight:800, fontFamily:'Space Mono, monospace', color:'var(--text-1)' }}>{workout.cal}</div>
            <div style={{ fontSize:10, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em' }}>kcal</div>
          </div>
          <div style={{ flex:1, textAlign:'center', padding:'10px', borderRadius:'var(--r-md)', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)' }}>
            <div style={{ fontSize:18, fontWeight:800, fontFamily:'Space Mono, monospace', color:'var(--text-1)' }}>{workout.diff}/5</div>
            <div style={{ fontSize:10, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em' }}>diff</div>
          </div>
        </div>

        {/* Step-by-step how-to */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>
            How To Do It
          </div>
          <div className="guide-steps-wrap">
            {guide.steps.map((step, i) => (
              <div
                key={i}
                className="step-card"
                style={{
                  borderColor: activeStep === i ? 'var(--orange-border)' : 'var(--border)',
                  background: activeStep === i ? 'rgba(255,107,43,0.07)' : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                }}
                onClick={() => setActiveStep(i)}
              >
                <div className="step-num">{i + 1}</div>
                <p style={{ fontSize:12.5, color: activeStep === i ? 'var(--text-1)' : 'var(--text-2)', lineHeight:1.55, flex:1 }}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div style={{ marginBottom:16, padding:'12px', borderRadius:'var(--r-md)', background:'rgba(0,212,255,0.06)', border:'1px solid var(--cyan-border)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--cyan)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>
            ⚡ Pro Tips
          </div>
          <ul style={{ paddingLeft:16, margin:0 }}>
            {guide.tips.map((tip, i) => (
              <li key={i} style={{ fontSize:12, color:'var(--text-2)', marginBottom:4, lineHeight:1.5 }}>{tip}</li>
            ))}
          </ul>
        </div>

        {/* Muscles note */}
        <div style={{ fontSize:11.5, color:'var(--text-3)', lineHeight:1.5, marginBottom:16 }}>
          <span style={{ color:'var(--orange)', fontWeight:700 }}>Muscles: </span>
          {guide.muscles_note}
        </div>

        {/* CTA */}
        <button
          className="btn btn-fire"
          style={{ width:'100%', opacity: added ? 0.85 : 1, transition:'opacity 0.2s' }}
          onClick={() => {
            if (!added && onAddToSession) {
              onAddToSession(workout)
              setAdded(true)
              setTimeout(() => setAdded(false), 2000)
            }
          }}
        >
          {added ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Added to Session!
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Add to Session
            </>
          )}
        </button>
        <button
          className="btn btn-outline"
          style={{ width:'100%', marginTop:8 }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  )
}
