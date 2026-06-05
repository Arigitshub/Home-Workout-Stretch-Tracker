import { useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, Award, Calendar, X, Dumbbell } from 'lucide-react';
import { WorkoutLog, Routine } from '../types';

interface StreakCalendarProps {
  logs?: WorkoutLog[];
  activeStreak: number;
  onAddManualLog: (log: WorkoutLog) => void;
  routines: Routine[];
}

export default function StreakCalendar({
  logs = [],
  activeStreak,
  onAddManualLog,
  routines
}: StreakCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; dayNum: number } | null>(null);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>('custom');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [durationMins, setDurationMins] = useState<number>(15);
  const [dateStr, setDateStr] = useState<string>('');
  const [exercisesCompleted, setExercisesCompleted] = useState<number>(5);
  const [calories, setCalories] = useState<number>(105);
  const [xp, setXp] = useState<number>(150);
  const [showWeights, setShowWeights] = useState<boolean>(false);
  const [weights, setWeights] = useState<{ [key: string]: number }>({});

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
    setContextMenu(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setContextMenu(null);
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

  // Right-Click Context Menu Trigger
  const handleCellContextMenu = (e: React.MouseEvent, dayNum: number) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      dayNum
    });
  };

  // Log routine immediately
  const handleQuickLog = (routine: Routine, dayNum: number) => {
    const now = new Date();
    // Set target date with current hour/minute
    const logDate = new Date(year, month, dayNum, now.getHours(), now.getMinutes(), 0);
    const parsedMins = parseInt(routine.duration) || 15;

    const quickWeights: { [key: string]: number } = {};
    routine.exercises.forEach((ex) => {
      if (ex.needsWeight) {
        quickWeights[ex.name] = ex.weightLbs || 10;
      }
    });

    const newLog: WorkoutLog = {
      id: `manual_log_${Date.now()}`,
      routineId: routine.id,
      routineTitle: routine.title,
      date: logDate.toISOString(),
      duration: parsedMins * 60,
      exercisesCompleted: routine.exercises.length,
      caloriesBurned: parsedMins * 7,
      xpEarned: parsedMins * 10,
      weightsUsed: Object.keys(quickWeights).length > 0 ? quickWeights : undefined
    };

    onAddManualLog(newLog);
    setContextMenu(null);
  };

  // Helper to construct a local datetime string for target day
  const getLocalDateTimeStringForDay = (dayNum: number) => {
    const now = new Date();
    const targetDate = new Date(year, month, dayNum, now.getHours(), now.getMinutes());
    const tzoffset = targetDate.getTimezoneOffset() * 60000;
    return new Date(targetDate.getTime() - tzoffset).toISOString().slice(0, 16);
  };

  // Open custom manual log modal
  const handleLogCustomClick = (dayNum: number) => {
    setSelectedRoutineId('custom');
    setCustomTitle('');
    setDurationMins(15);
    setDateStr(getLocalDateTimeStringForDay(dayNum));
    setExercisesCompleted(5);
    setCalories(105);
    setXp(150);
    setShowWeights(false);
    setWeights({});
    
    setIsModalOpen(true);
    setContextMenu(null);
  };

  const handleRoutineChangeInModal = (id: string) => {
    setSelectedRoutineId(id);
    if (id === 'custom') {
      setCustomTitle('');
      setDurationMins(15);
      setExercisesCompleted(5);
      setCalories(105);
      setXp(150);
      setWeights({});
    } else {
      const routine = routines.find((r) => r.id === id);
      if (routine) {
        setCustomTitle(routine.title);
        const parsedMins = parseInt(routine.duration) || 15;
        setDurationMins(parsedMins);
        setExercisesCompleted(routine.exercises.length);
        setCalories(parsedMins * 7);
        setXp(parsedMins * 10);
        
        const newWeights: { [key: string]: number } = {};
        routine.exercises.forEach((ex) => {
          if (ex.needsWeight) {
            newWeights[ex.name] = ex.weightLbs || 10;
          }
        });
        setWeights(newWeights);
      }
    }
  };

  const handleWeightChange = (exName: string, lbs: number) => {
    setWeights((prev) => ({
      ...prev,
      [exName]: Math.max(0, lbs)
    }));
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = selectedRoutineId === 'custom' ? (customTitle.trim() || 'Custom Workout') : customTitle;

    const manualLog: WorkoutLog = {
      id: `manual_log_${Date.now()}`,
      routineId: selectedRoutineId,
      routineTitle: title,
      date: new Date(dateStr).toISOString(),
      duration: durationMins * 60,
      exercisesCompleted: exercisesCompleted,
      caloriesBurned: calories,
      xpEarned: xp,
      weightsUsed: showWeights ? weights : undefined
    };

    onAddManualLog(manualLog);
    setIsModalOpen(false);
  };

  // Find active exercises for weights if a routine is selected in modal
  const modalActiveRoutine = routines.find((r) => r.id === selectedRoutineId);
  const modalWeightExercises = modalActiveRoutine ? modalActiveRoutine.exercises : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700/60 transition-all duration-300 relative">
      
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
              onContextMenu={(e) => handleCellContextMenu(e, item)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs relative group transition-all duration-300 hover:scale-105 select-none cursor-pointer ${cellClass}`}
              title="Right click to log workout"
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

      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center font-bold">
        💡 Pro-Tip: Right-click any day to quickly log a workout!
      </p>

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
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-550 dark:text-indigo-405">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-black text-gray-400 block tracking-wider">Total Completed</span>
            <span className="text-sm font-black text-gray-800 dark:text-white">{logs.length} Routines</span>
          </div>
        </div>
      </div>

      {/* RIGHT-CLICK FLOATING CONTEXT MENU */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
          />
          <div
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="fixed bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/80 rounded-2xl shadow-xl p-2.5 z-50 min-w-[210px] animate-in fade-in slide-in-from-top-1 duration-150 text-left border-gray-200/50"
          >
            <span className="text-[9px] font-black text-gray-400 dark:text-gray-450 uppercase tracking-widest px-3 py-1 block border-b border-gray-100 dark:border-gray-700/50 mb-1.5">
              Log for {monthName.split(' ')[0]} {contextMenu.dayNum}
            </span>
            {routines.slice(0, 5).map((r) => (
              <button
                key={r.id}
                onClick={() => handleQuickLog(r, contextMenu.dayNum)}
                className="w-full text-left px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/45 hover:text-indigo-650 dark:hover:text-indigo-400 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span className="text-sm">🏋️</span>
                <span className="truncate">{r.title}</span>
              </button>
            ))}
            <button
              onClick={() => handleLogCustomClick(contextMenu.dayNum)}
              className="w-full text-left px-3 py-2 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/45 rounded-lg transition-colors border-t border-gray-100 dark:border-gray-700/50 mt-1.5 pt-2 flex items-center space-x-2"
            >
              <span className="text-sm">📝</span>
              <span>Custom Log Entry...</span>
            </button>
          </div>
        </>
      )}

      {/* INLINE MANUAL LOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full border border-gray-100 dark:border-gray-700/80 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-650 dark:hover:text-white bg-gray-50 dark:bg-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-gray-855 dark:text-white flex items-center text-base border-b border-gray-100 dark:border-gray-700/50 pb-3 mb-4">
              <Calendar className="w-5 h-5 text-rose-550 mr-2" />
              Log Manual Workout
            </h3>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-455 uppercase tracking-wider mb-1.5">
                  Select Workout / Routine
                </label>
                <select
                  value={selectedRoutineId}
                  onChange={(e) => handleRoutineChangeInModal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-255 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-all"
                >
                  <option value="custom">Custom / Other Workout</option>
                  {routines.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>

              {selectedRoutineId === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-455 uppercase tracking-wider mb-1.5">
                    Workout Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Morning Jog, Cardio HIIT"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-255 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-all"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-455 uppercase tracking-wider mb-1.5">
                  Date & Time Performed
                </label>
                <input
                  type="datetime-local"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-255 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-455 uppercase tracking-wider mb-1.5">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={durationMins}
                    onChange={(e) => {
                      const mins = parseInt(e.target.value) || 1;
                      setDurationMins(mins);
                      setCalories(mins * 7);
                      setXp(mins * 10);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-255 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-455 uppercase tracking-wider mb-1.5">
                    Exercises Completed
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={exercisesCompleted}
                    onChange={(e) => setExercisesCompleted(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-255 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-455 uppercase tracking-wider mb-1.5">
                    Calories Burned (kcal)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5000"
                    value={calories}
                    onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-255 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-455 uppercase tracking-wider mb-1.5">
                    XP Earned
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={xp}
                    onChange={(e) => setXp(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-255 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-all"
                    required
                  />
                </div>
              </div>

              {selectedRoutineId !== 'custom' && modalWeightExercises.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-700/50 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center">
                      <Dumbbell className="w-4 h-4 mr-1 text-indigo-500" />
                      Log Weights for Routine?
                    </span>
                    <input
                      type="checkbox"
                      checked={showWeights}
                      onChange={(e) => setShowWeights(e.target.checked)}
                      className="rounded text-rose-550 focus:ring-rose-550 w-4 h-4"
                    />
                  </div>

                  {showWeights && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-150 dark:border-gray-705 p-3 rounded-2xl space-y-2 max-h-[160px] overflow-y-auto">
                      {modalWeightExercises.map((ex) => (
                        <div key={ex.name} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400 truncate max-w-[180px] font-semibold">{ex.name}</span>
                          <div className="flex items-center space-x-1.5 flex-shrink-0">
                            <input
                              type="number"
                              min="0"
                              max="300"
                              placeholder="0"
                              value={weights[ex.name] ?? ''}
                              onChange={(e) => handleWeightChange(ex.name, parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 text-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-950 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs font-bold"
                            />
                            <span className="text-[10px] text-gray-400">lbs</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center transition-colors shadow-md shadow-rose-500/20"
              >
                Save Manual Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
