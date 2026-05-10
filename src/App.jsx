import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Login from './components/Login'
import Dashboard from './pages/Dashboard'
import WorkoutTracker from './pages/WorkoutTracker'
import Progress from './pages/Progress'
import Profile from './pages/Profile'
import { useEffect } from "react";
import { applyReminderSchedule } from "./utils/notifications";

function AppContent() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!user) return;

    async function setupNotifications() {
      await applyReminderSchedule();
    }

    setupNotifications();
  }, [user]);
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/"          element={<Dashboard />}     />
          <Route path="/workouts"  element={<WorkoutTracker />} />
          <Route path="/progress"  element={<Progress />}       />
          <Route path="/profile"   element={<Profile />}        />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
