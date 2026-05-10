import { LocalNotifications } from '@capacitor/local-notifications'
import {
  getReminderPreferences,
  notificationsEnabled,
  parseTimeParts,
  buildWaterScheduleSlots,
} from './reminderPreferences'

const CANCEL_ID_COUNT = 48

export async function initNotifications() {
  try {
    await LocalNotifications.requestPermissions()
  } catch (e) {
    console.warn('Notification permission:', e)
  }
}

function cancelDescriptorList() {
  return Array.from({ length: CANCEL_ID_COUNT }, (_, i) => ({ id: i + 1 }))
}

const quotes = [
  'Push yourself, because no one else will 💪',
  'Small steps every day lead to big results 🚀',
  'Your only limit is you 🔥',
  'Consistency beats motivation 💯',
  'Sweat today, shine tomorrow ✨',
  'No pain, no gain 🏋️',
  'Discipline > Motivation ⚡',
]

function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)]
}

/**
 * Cancels FitPulse reminder ids and re-schedules from saved preferences
 * (workout daily time + water reminders in a daily window). Honors
 * fitpulse-notifications-enabled in localStorage.
 */
export async function applyReminderSchedule() {
  try {
    await initNotifications()
    await LocalNotifications.cancel({ notifications: cancelDescriptorList() })

    if (!notificationsEnabled()) return

    const prefs = getReminderPreferences()
    const workoutOn = parseTimeParts(prefs.workoutTime)
    const waterSlots = buildWaterScheduleSlots(
      prefs.waterWindowStart,
      prefs.waterWindowEnd,
      prefs.waterIntervalHours
    )

    const notifications = [
      {
        id: 1,
        title: 'Workout Time 💪',
        body: getRandomQuote(),
        schedule: { every: 'day', on: { hour: workoutOn.hour, minute: workoutOn.minute } },
      },
      {
        id: 2,
        title: 'Get Moving 🚶',
        body: "You've been sitting too long. Move your body!",
        schedule: { every: 'day', on: { hour: 11, minute: 0 } },
      },
      {
        id: 4,
        title: 'Keep the Streak 🔥',
        body: 'Open FitPulse and log a workout today!',
        schedule: { every: 'day', on: { hour: 20, minute: 0 } },
      },
    ]

    waterSlots.forEach((slot, i) => {
      if (i >= 12) return
      notifications.push({
        id: 31 + i,
        title: 'Hydration Check 💧',
        body: 'Drink water and stay energized!',
        schedule: { every: 'day', on: { hour: slot.hour, minute: slot.minute } },
      })
    })

    await LocalNotifications.schedule({ notifications })
  } catch (e) {
    console.warn('applyReminderSchedule:', e)
  }
}

/** @deprecated use applyReminderSchedule */
export async function scheduleWorkoutReminder() {
  await applyReminderSchedule()
}

/** @deprecated use applyReminderSchedule */
export async function scheduleMoveReminder() {
  await applyReminderSchedule()
}

/** @deprecated use applyReminderSchedule */
export async function scheduleWaterReminder() {
  await applyReminderSchedule()
}

/** @deprecated use applyReminderSchedule */
export async function scheduleStreakReminder() {
  await applyReminderSchedule()
}
