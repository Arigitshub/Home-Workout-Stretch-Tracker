import { useState, useEffect } from 'react'
import SimpleChart from './SimpleChart'

const data = [
  { name: 'Mon', workouts: 2 },
  { name: 'Tue', workouts: 3 },
  { name: 'Wed', workouts: 1 },
  { name: 'Thu', workouts: 4 },
  { name: 'Fri', workouts: 2 },
  { name: 'Sat', workouts: 3 },
  { name: 'Sun', workouts: 1 },
]

export default function ProgressChart() {
  const [useRecharts, setUseRecharts] = useState(false)

  useEffect(() => {
    try {
      require('recharts')
      setUseRecharts(true)
    } catch {
      setUseRecharts(false)
    }
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 h-64">
      <h3 className="font-bold text-lg mb-4 dark:text-white">Weekly Progress</h3>
      {useRecharts ? (
        <div className="h-[80%]">
          {/* Recharts implementation would go here */}
          <SimpleChart data={data} />
        </div>
      ) : (
        <SimpleChart data={data} />
      )}
    </div>
  )
}
