const KEYS = {
  workoutTime: 'fitpulse-reminder-workout-time',
  waterInterval: 'fitpulse-reminder-water-interval',
  waterStart: 'fitpulse-reminder-water-start',
  waterEnd: 'fitpulse-reminder-water-end',
}

export const DEFAULT_REMINDER_PREFS = {
  workoutTime: '07:00',
  waterIntervalHours: 3,
  waterWindowStart: '09:00',
  waterWindowEnd: '21:00',
}

export function getReminderPreferences() {
  const wi = parseInt(localStorage.getItem(KEYS.waterInterval) || '', 10)
  return {
    workoutTime: localStorage.getItem(KEYS.workoutTime) || DEFAULT_REMINDER_PREFS.workoutTime,
    waterIntervalHours: Number.isFinite(wi) && wi >= 1 && wi <= 6 ? wi : DEFAULT_REMINDER_PREFS.waterIntervalHours,
    waterWindowStart: localStorage.getItem(KEYS.waterStart) || DEFAULT_REMINDER_PREFS.waterWindowStart,
    waterWindowEnd: localStorage.getItem(KEYS.waterEnd) || DEFAULT_REMINDER_PREFS.waterWindowEnd,
  }
}

export function saveReminderPreferences(partial) {
  if (partial.workoutTime != null) localStorage.setItem(KEYS.workoutTime, partial.workoutTime)
  if (partial.waterIntervalHours != null) {
    localStorage.setItem(KEYS.waterInterval, String(partial.waterIntervalHours))
  }
  if (partial.waterWindowStart != null) localStorage.setItem(KEYS.waterStart, partial.waterWindowStart)
  if (partial.waterWindowEnd != null) localStorage.setItem(KEYS.waterEnd, partial.waterWindowEnd)
}

/** Parse "HH:MM" to { hour, minute } */
export function parseTimeParts(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec((hhmm || '').trim())
  if (!m) return { hour: 7, minute: 0 }
  let h = parseInt(m[1], 10)
  let min = parseInt(m[2], 10)
  h = Math.min(23, Math.max(0, h))
  min = Math.min(59, Math.max(0, min))
  return { hour: h, minute: min }
}

/** Build { hour, minute } slots from window + interval (hours) */
export function buildWaterScheduleSlots(windowStart, windowEnd, intervalHours) {
  const start = parseTimeParts(windowStart)
  const end = parseTimeParts(windowEnd)
  let cur = start.hour * 60 + start.minute
  const endM = end.hour * 60 + end.minute
  const step = Math.max(1, Math.min(6, intervalHours)) * 60
  const slots = []
  if (endM >= cur) {
    while (cur <= endM && slots.length < 12) {
      slots.push({ hour: Math.floor(cur / 60) % 24, minute: cur % 60 })
      cur += step
    }
  }
  if (slots.length === 0) {
    slots.push({ hour: start.hour, minute: start.minute })
  }
  return slots
}

export function notificationsEnabled() {
  return localStorage.getItem('fitpulse-notifications-enabled') !== '0'
}
