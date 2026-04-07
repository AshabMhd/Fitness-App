/**
 * ExerciseVisualizer
 * Renders a schematic front/back human silhouette with
 * muscle groups highlighted based on the `muscles` prop.
 *
 * Props:
 *   muscles   — array of muscle group keys (primary)
 *   secondary — array of muscle group keys (secondary, lighter highlight)
 *   size      — SVG size (default 220)
 */

const MUSCLE_COLORS = {
  primary:   '#3B82F6',
  secondary: 'rgba(59,130,246,0.35)',
}

const MUSCLE_LABELS = {
  chest:      'Chest',
  shoulders:  'Shoulders',
  biceps:     'Biceps',
  triceps:    'Triceps',
  forearms:   'Forearms',
  core:       'Core / Abs',
  quads:      'Quads',
  calves:     'Calves',
  traps:      'Traps',
  back:       'Back',
  glutes:     'Glutes',
  hamstrings: 'Hamstrings',
}

// Front-view SVG paths (simplified schematic shapes)
function FrontBody({ muscles, secondary }) {
  const isPrimary   = (k) => muscles?.includes(k)
  const isSecondary = (k) => secondary?.includes(k)
  const fill = (k) =>
    isPrimary(k)   ? MUSCLE_COLORS.primary
    : isSecondary(k) ? MUSCLE_COLORS.secondary
    : 'rgba(15,23,42,0.07)'

  return (
    <svg viewBox="0 0 200 400" style={{ width: '100%', height: '100%' }}>
      {/* Head */}
      <ellipse cx="100" cy="32" rx="22" ry="26" fill="rgba(15,23,42,0.06)" stroke="rgba(15,23,42,0.12)" strokeWidth="1.5" />

      {/* Neck */}
      <rect x="90" y="56" width="20" height="16" rx="6" fill="rgba(15,23,42,0.05)" />

      {/* Torso */}
      <path d="M64,72 Q52,80 50,115 L50,175 Q50,180 64,180 L136,180 Q150,180 150,175 L150,115 Q148,80 136,72 Z"
        fill="rgba(15,23,42,0.04)" stroke="rgba(15,23,42,0.1)" strokeWidth="1.2" />

      {/* Chest - left & right */}
      <ellipse cx="83" cy="105" rx="18" ry="14"
        fill={fill('chest')} style={{ transition: 'fill 0.4s ease' }} opacity="0.9" />
      <ellipse cx="117" cy="105" rx="18" ry="14"
        fill={fill('chest')} style={{ transition: 'fill 0.4s ease' }} opacity="0.9" />

      {/* Shoulders */}
      <ellipse cx="55" cy="80" rx="14" ry="16"
        fill={fill('shoulders')} style={{ transition: 'fill 0.4s ease' }} />
      <ellipse cx="145" cy="80" rx="14" ry="16"
        fill={fill('shoulders')} style={{ transition: 'fill 0.4s ease' }} />

      {/* Core / Abs (3 row boxes) */}
      {[0,1,2].map(row => (
        <g key={row}>
          <rect x="82" y={130 + row * 16} width="14" height="12" rx="3"
            fill={fill('core')} style={{ transition: 'fill 0.4s ease' }} />
          <rect x="104" y={130 + row * 16} width="14" height="12" rx="3"
            fill={fill('core')} style={{ transition: 'fill 0.4s ease' }} />
        </g>
      ))}

      {/* Upper arms / biceps */}
      <rect x="36" y="88" width="16" height="48" rx="8"
        fill={fill('biceps')} style={{ transition: 'fill 0.4s ease' }} />
      <rect x="148" y="88" width="16" height="48" rx="8"
        fill={fill('biceps')} style={{ transition: 'fill 0.4s ease' }} />

      {/* Forearms */}
      <rect x="30" y="140" width="14" height="42" rx="7"
        fill={fill('forearms')} style={{ transition: 'fill 0.4s ease' }} />
      <rect x="156" y="140" width="14" height="42" rx="7"
        fill={fill('forearms')} style={{ transition: 'fill 0.4s ease' }} />

      {/* Hands */}
      <ellipse cx="37" cy="192" rx="9" ry="11" fill="rgba(15,23,42,0.05)" />
      <ellipse cx="163" cy="192" rx="9" ry="11" fill="rgba(15,23,42,0.05)" />

      {/* Hips */}
      <path d="M60,180 Q55,185 58,200 L142,200 Q145,185 140,180 Z"
        fill="rgba(15,23,42,0.04)" />

      {/* Quads left & right */}
      <rect x="62" y="200" width="32" height="70" rx="14"
        fill={fill('quads')} style={{ transition: 'fill 0.4s ease' }} />
      <rect x="106" y="200" width="32" height="70" rx="14"
        fill={fill('quads')} style={{ transition: 'fill 0.4s ease' }} />

      {/* Knee */}
      <ellipse cx="78" cy="278" rx="16" ry="10" fill="rgba(15,23,42,0.05)" />
      <ellipse cx="122" cy="278" rx="16" ry="10" fill="rgba(15,23,42,0.05)" />

      {/* Calves / lower leg */}
      <rect x="64" y="285" width="28" height="58" rx="12"
        fill={fill('calves')} style={{ transition: 'fill 0.4s ease' }} />
      <rect x="108" y="285" width="28" height="58" rx="12"
        fill={fill('calves')} style={{ transition: 'fill 0.4s ease' }} />

      {/* Feet */}
      <ellipse cx="78" cy="350" rx="20" ry="10" fill="rgba(15,23,42,0.05)" />
      <ellipse cx="122" cy="350" rx="20" ry="10" fill="rgba(15,23,42,0.05)" />
    </svg>
  )
}

// Back-view SVG paths
function BackBody({ muscles, secondary }) {
  const isPrimary   = (k) => muscles?.includes(k)
  const isSecondary = (k) => secondary?.includes(k)
  const fill = (k) =>
    isPrimary(k)   ? MUSCLE_COLORS.primary
    : isSecondary(k) ? MUSCLE_COLORS.secondary
    : 'rgba(255,255,255,0.07)'

  return (
    <svg viewBox="0 0 200 400" style={{ width: '100%', height: '100%' }}>
      {/* Head */}
      <ellipse cx="100" cy="32" rx="22" ry="26" fill="rgba(15,23,42,0.06)" stroke="rgba(15,23,42,0.12)" strokeWidth="1.5" />

      {/* Neck */}
      <rect x="90" y="56" width="20" height="16" rx="6" fill="rgba(255,255,255,0.08)" />

      {/* Traps */}
      <path d="M75,70 Q100,60 125,70 L136,84 Q100,76 64,84 Z"
        fill={fill('traps')} style={{ transition: 'fill 0.4s ease' }} />

      {/* Shoulders */}
      <ellipse cx="55" cy="82" rx="14" ry="16"
        fill={fill('shoulders')} style={{ transition: 'fill 0.4s ease' }} />
      <ellipse cx="145" cy="82" rx="14" ry="16"
        fill={fill('shoulders')} style={{ transition: 'fill 0.4s ease' }} />

      {/* Back (lats + mid-back) */}
      <path d="M65,88 Q55,110 58,145 L80,155 L80,120 L100,112 L120,120 L120,155 L142,145 Q145,110 135,88 Z"
        fill={fill('back')} style={{ transition: 'fill 0.4s ease' }} opacity="0.9" />

      {/* Spine line */}
      <line x1="100" y1="82" x2="100" y2="175" stroke="rgba(15,23,42,0.08)" strokeWidth="2" />

      {/* Lower back */}
      <rect x="78" y="155" width="44" height="24" rx="8"
        fill={fill('back')} style={{ transition: 'fill 0.4s ease' }} opacity="0.7" />

      {/* Triceps */}
      <rect x="36" y="90" width="16" height="44" rx="8"
        fill={fill('triceps')} style={{ transition: 'fill 0.4s ease' }} />
      <rect x="148" y="90" width="16" height="44" rx="8"
        fill={fill('triceps')} style={{ transition: 'fill 0.4s ease' }} />

      {/* Forearms */}
      <rect x="30" y="138" width="14" height="44" rx="7"
        fill={fill('forearms')} style={{ transition: 'fill 0.4s ease' }} />
      <rect x="156" y="138" width="14" height="44" rx="7"
        fill={fill('forearms')} style={{ transition: 'fill 0.4s ease' }} />

      {/* Hands */}
      <ellipse cx="37" cy="192" rx="9" ry="11" fill="rgba(15,23,42,0.05)" />
      <ellipse cx="163" cy="192" rx="9" ry="11" fill="rgba(15,23,42,0.05)" />

      {/* Glutes */}
      <ellipse cx="82" cy="193" rx="22" ry="18"
        fill={fill('glutes')} style={{ transition: 'fill 0.4s ease' }} />
      <ellipse cx="118" cy="193" rx="22" ry="18"
        fill={fill('glutes')} style={{ transition: 'fill 0.4s ease' }} />

      {/* Hamstrings */}
      <rect x="63" y="208" width="32" height="65" rx="14"
        fill={fill('hamstrings')} style={{ transition: 'fill 0.4s ease' }} />
      <rect x="105" y="208" width="32" height="65" rx="14"
        fill={fill('hamstrings')} style={{ transition: 'fill 0.4s ease' }} />

      {/* Knee back */}
      <ellipse cx="79" cy="278" rx="16" ry="10" fill="rgba(15,23,42,0.05)" />
      <ellipse cx="121" cy="278" rx="16" ry="10" fill="rgba(15,23,42,0.05)" />

      {/* Calves */}
      <rect x="64" y="286" width="28" height="58" rx="12"
        fill={fill('calves')} style={{ transition: 'fill 0.4s ease' }} />
      <rect x="108" y="286" width="28" height="58" rx="12"
        fill={fill('calves')} style={{ transition: 'fill 0.4s ease' }} />

      {/* Feet */}
      <ellipse cx="78" cy="350" rx="20" ry="10" fill="rgba(15,23,42,0.05)" />
      <ellipse cx="122" cy="350" rx="20" ry="10" fill="rgba(15,23,42,0.05)" />
    </svg>
  )
}

export default function ExerciseVisualizer({ muscles = [], secondary = [], compact = false }) {
  const h = compact ? 180 : 260

  // Which muscles to label
  const allHighlighted = [...new Set([...muscles, ...secondary])]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
      {/* Front + Back silhouettes side by side */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <div style={{ width: compact ? 80 : 110, height: h, position: 'relative' }}>
          <div style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Front</div>
          <FrontBody muscles={muscles} secondary={secondary} />
        </div>
        <div style={{ width: compact ? 80 : 110, height: h, position: 'relative' }}>
          <div style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Back</div>
          <BackBody muscles={muscles} secondary={secondary} />
        </div>
      </div>

      {/* Muscle chips */}
      {allHighlighted.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
          {muscles.map(k => (
            <span key={k} style={{
              padding: '3px 10px', borderRadius: 'var(--r-full)',
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
              color: 'var(--blue)', fontSize: 11.5, fontWeight: 600
            }}>
              {MUSCLE_LABELS[k] || k}
            </span>
          ))}
          {secondary.map(k => (
            <span key={k} style={{
              padding: '3px 10px', borderRadius: 'var(--r-full)',
              background: 'rgba(15,23,42,0.04)', border: '1px solid var(--border)',
              color: 'var(--text-2)', fontSize: 11.5, fontWeight: 500
            }}>
              {MUSCLE_LABELS[k] || k}
            </span>
          ))}
        </div>
      )}

      {/* Empty state */}
      {allHighlighted.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>
          Select an exercise to see muscles worked
        </div>
      )}
    </div>
  )
}
