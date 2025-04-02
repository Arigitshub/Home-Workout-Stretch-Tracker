import { useState, useEffect } from 'react'

interface ChartData {
  name: string
  workouts: number
}

export default function SimpleChart({ data }: { data: ChartData[] }) {
  const [maxValue, setMaxValue] = useState(5)

  useEffect(() => {
    const highest = Math.max(...data.map(item => item.workouts), 5)
    setMaxValue(highest)
  }, [data])

  return (
    <div className="h-48 w-full">
      <div className="flex h-full items-end space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-indigo-500 rounded-t-sm transition-all duration-300"
              style={{ 
                height: `${(item.workouts / maxValue) * 100}%`,
                maxHeight: '100%'
              }}
            />
            <span className="text-xs mt-1 dark:text-gray-300">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
