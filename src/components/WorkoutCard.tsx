import { Play, Clock, Zap } from 'lucide-react'

interface WorkoutCardProps {
  title: string
  duration: string
  difficulty: string
  image: string
}

export default function WorkoutCard({ title, duration, difficulty, image }: WorkoutCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
      <div className="relative h-40">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full transition-colors">
          <Play className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg dark:text-white">{title}</h3>
        <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {duration}
          </span>
          <span className="flex items-center">
            <Zap className="w-4 h-4 mr-1" />
            {difficulty}
          </span>
        </div>
      </div>
    </div>
  )
}
