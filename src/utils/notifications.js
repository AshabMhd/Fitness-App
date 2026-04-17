import { LocalNotifications } from '@capacitor/local-notifications';

export async function initNotifications() {
  await LocalNotifications.requestPermissions();

  
  // clear old ones
  await LocalNotifications.cancel({
    notifications: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
  });
}

// 🏋️ Workout Reminder
export async function scheduleWorkoutReminder() {
  await LocalNotifications.schedule({
    notifications: [
      {
        id: 1,
        title: "Workout Time 💪",
        body: getRandomQuote(),
        schedule: {
          every: 'day',
          at: new Date(new Date().setHours(7, 0, 0)) // 7 AM
        }
      }
    ]
  });
}

// 🚶 Move Reminder
export async function scheduleMoveReminder() {
  await LocalNotifications.schedule({
    notifications: [
      {
        id: 2,
        title: "Get Moving 🚶",
        body: "You’ve been sitting too long. Move your body!",
        schedule: {
          every: 'day',
          at: new Date(new Date().setHours(11, 0, 0)) // 11 AM
        }
      }
    ]
  });
}

// 💧 Water Reminder (repeat every few hours)
export async function scheduleWaterReminder() {
  await LocalNotifications.schedule({
    notifications: [
      {
        id: 3,
        title: "Hydration Check 💧",
        body: "Drink water and stay energized!",
        schedule: {
          every: 'hour',
          count: 8 // repeat 8 times
        }
      }
    ]
  });
}

// 🔥 Streak Motivation
export async function scheduleStreakReminder() {
  await LocalNotifications.schedule({
    notifications: [
      {
        id: 4,
        title: "Keep the Streak 🔥",
        body: "5 more days to unlock your 1-week badge!",
        schedule: {
          every: 'day',
          at: new Date(new Date().setHours(20, 0, 0)) // 8 PM
        }
      }
    ]
  });
}

const quotes = [
  "Push yourself, because no one else will 💪",
  "Small steps every day lead to big results 🚀",
  "Your only limit is you 🔥",
  "Consistency beats motivation 💯",
  "Sweat today, shine tomorrow ✨",
  "No pain, no gain 🏋️",
  "Discipline > Motivation ⚡"
];

function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}