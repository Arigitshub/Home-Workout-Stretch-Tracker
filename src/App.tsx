import { useState } from 'react'
import Navbar from './components/Navbar'
import WorkoutCard from './components/WorkoutCard'
import ProgressChart from './components/ProgressChart'
import { Sun, Moon } from 'lucide-react'

export default function App() {
  const [darkMode, setDarkMode] = useState(false)

  const workouts = [
    {
      title: "Morning Yoga Flow",
      duration: "15 min",
      difficulty: "Beginner",
      image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    },
    {
      title: "Full Body HIIT",
      duration: "30 min",
      difficulty: "Intermediate",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    },
    {
      title: "Core Strengthening",
      duration: "20 min",
      difficulty: "Advanced",
      image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    }
  ]

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-16 pb-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">FitTrack</h1>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Today's Workout</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workouts.map((workout, index) => (
              <WorkoutCard key={index} {...workout} />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <ProgressChart />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Recommended Stretches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WorkoutCard 
              title="Post-Workout Stretch"
              duration="10 min"
              difficulty="Beginner"
              image="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
            />
            <WorkoutCard 
              title="Yoga for Flexibility"
              duration="20 min"
              difficulty="Intermediate"
              image="https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
            />
          </div>
        </div>
      </div>

      <Navbar />
    </div>
  )
}
