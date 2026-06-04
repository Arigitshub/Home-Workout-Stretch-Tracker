import { useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, Award, Calendar } from 'lucide-react';
import { WorkoutLog } from '../types';

interface StreakCalendarProps {
  logs?: WorkoutLog[];
  activeStreak: number;
}

export default function StreakCalendar({ logs = [], activeStreak }: StreakCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get month name
  const monthName = currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // Get start day of the month (0 = Sunday, 1 = Monday...)
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Get total days in the month
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Get name of days
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Check if a specific date has logs
  const getLogsForDay = (dayNum: number) => {
    return logs.filter((log) => {
      const d = new Date(log.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === dayNum;
    });
  };

  const hasActivityOnDay = (dayNum: number) => {
    return getLogsForDay(dayNum).length > 0;
  };

  // Determine what type of activity occurred on that day (workout, stretch, or both)
  const getActivityTypeOnDay = (dayNum: number): 'workout' | 'stretch' | 'both' | 'none' => {
    const dayLogs = getLogsForDay(dayNum);
    if (dayLogs.length === 0) return 'none';
    
    // We check if logs have workouts vs stretches.
    // In our predefined routines, we can determine from routineTitle or routineId.
    // Let's look at log fields: routineTitle is available.
    let hasWorkout = false;
    let hasStretch = false;

    dayLogs.forEach((log) => {
      const title = log.routineTitle.toLowerCase();
      if (title.includes('stretch') || title.includes('yoga') || title.includes('flow')) {
        hasStretch = true;
      } else {
        hasWorkout = true;
      }
    });

    if (hasWorkout && hasStretch) return 'both';
    if (hasStretch) return 'stretch';
    return 'workout';
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isToday = (dayNum: number) => {
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === dayNum;
  };

  // Create padding cells for grid start
  const blanks = Array(firstDayOfMonth).fill(null);
  
  // Create actual day cells
  const days = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  // Total grid items (blanks + days)
  const gridItems = [...blanks, ...days];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700/60 transition-all duration-300">
      
      {/* Calendar Header with navigation */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <h3 className="font-bold text-lg text-gray-800 dark:text-white">Activity Heatmap</h3>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-550 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-gray-800 dark:text-white min-w-[100px] text-center">
            {monthName}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-550 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid calendar */}
      <div className="grid grid-cols-7 gap-2.5 text-center mb-4">
        {/* Day Name Header */}
        {dayNames.map((name) => (
          <span key={name} className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">
            {name.substring(0, 2)}
          </span>
        ))}

        {/* Calendar cells */}
        {gridItems.map((item, index) => {
          if (item === null) {
            return <div key={`blank-${index}`} className="aspect-square" />;
          }

          const active = hasActivityOnDay(item);
          const type = getActivityTypeOnDay(item);
          const current = isToday(item);

          let cellClass = 'bg-gray-50/55 dark:bg-gray-900/10 text-gray-700 dark:text-gray-300 border border-transparent';

          if (active) {
            if (type === 'both') {
              cellClass = 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-extrabold shadow-sm shadow-indigo-500/20';
            } else if (type === 'stretch') {
              cellClass = 'bg-gradient-to-tr from-purple-500 to-fuchsia-500 text-white font-extrabold shadow-sm shadow-purple-500/20';
            } else {
              cellClass = 'bg-gradient-to-tr from-rose-500 to-orange-500 text-white font-extrabold shadow-sm shadow-rose-500/20';
            }
          }

          if (current) {
            cellClass += ' border-2 border-indigo-500 dark:border-indigo-400';
          }

          return (
            <div
              key={`day-${item}`}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs relative group transition-all duration-300 hover:scale-105 select-none ${cellClass}`}
            >
              <span>{item}</span>
              
              {/* Little flame overlay for active dates */}
              {active && (
                <Flame className="w-2.5 h-2.5 fill-white absolute bottom-1 text-white animate-pulse" />
              )}

              {/* Hover Tooltip showing details */}
              {active && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-28 bg-slate-900 text-white text-[9px] rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg text-left leading-relaxed">
                  <span className="font-extrabold block border-b border-slate-800 pb-0.5 mb-1 text-indigo-400">
                    Day Activity
                  </span>
                  {getLogsForDay(item).map((log) => (
                    <div key={log.id} className="truncate">
                      • {log.routineTitle}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Streak Summary Info Row */}
      <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700/65 pt-4 mt-6">
        <div className="flex items-center space-x-3 bg-gray-50/50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-800 rounded-xl p-3.5">
          <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 dark:text-orange-400">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-black text-gray-400 block tracking-wider">Current Streak</span>
            <span className="text-sm font-black text-gray-800 dark:text-white">{activeStreak} Days Active</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-gray-50/50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-800 rounded-xl p-3.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-black text-gray-400 block tracking-wider">Total Completed</span>
            <span className="text-sm font-black text-gray-800 dark:text-white">{logs.length} Routines</span>
          </div>
        </div>
      </div>
    </div>
  );
}
