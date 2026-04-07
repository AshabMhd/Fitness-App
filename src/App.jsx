import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import WorkoutTracker from './pages/WorkoutTracker'
import Progress from './pages/Progress'
import Profile from './pages/Profile'

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}

export default App
