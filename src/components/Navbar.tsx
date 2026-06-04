import { Home, Activity, Calendar, BookOpen, User } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'workouts', icon: Activity, label: 'Routines' },
    { id: 'builder', icon: Calendar, label: 'Custom' },
    { id: 'progress', icon: BookOpen, label: 'Logs' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-full shadow-2xl border border-gray-150 dark:border-gray-700/50 p-2.5 z-40 transition-all">
      <div className="flex space-x-1 sm:space-x-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-1 px-4 py-3 rounded-full transition-all duration-300 relative group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35 scale-105 font-bold'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={tab.label}
            >
              <Icon className="w-5 h-5" />
              {/* Optional responsive label text */}
              <span className={`text-xs hidden md:inline transition-all duration-300 ${isActive ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0 overflow-hidden'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
