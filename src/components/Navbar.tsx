import { Home, Activity, Calendar, BookOpen, User } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full shadow-xl p-2 z-50">
      <div className="flex space-x-4">
        <button className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Home className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <button className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Activity className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <button className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Calendar className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <button className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <BookOpen className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <button className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
    </nav>
  )
}
