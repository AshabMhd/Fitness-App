export const PRIVACY_MASK = '•••'

/** Mask a numeric or string stat when privacy mode is on */
export function maskStat(privacyMode, value, mask = PRIVACY_MASK) {
  return privacyMode ? mask : value
}

/** Locale string for numbers; masked when privacy */
export function maskLocaleNumber(privacyMode, n, mask = PRIVACY_MASK) {
  if (privacyMode) return mask
  const num = Number(n)
  return Number.isFinite(num) ? num.toLocaleString() : mask
}

/** Zero out chart series values for privacy-safe placeholder charts */
export function anonymizeWeeklyRows(rows) {
  if (!Array.isArray(rows)) return []
  return rows.map((d) => ({
    ...d,
    steps: 0,
    cal: 0,
    active: 0,
  }))
}

export function anonymizeMonthlyCalories(rows) {
  if (!Array.isArray(rows)) return []
  return rows.map((d) => ({
    ...d,
    burned: 0,
    consumed: 0,
  }))
}

export function anonymizeMuscleFreq(rows) {
  if (!Array.isArray(rows)) return []
  return rows.map((d) => ({
    ...d,
    sessions: 0,
  }))
}

export function anonymizeHeatCells(rows) {
  if (!Array.isArray(rows)) return []
  return rows.map((c) => ({ ...c, level: 0 }))
}
