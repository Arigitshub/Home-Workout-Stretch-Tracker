import { Trash2, Calendar, Clock, Flame, Award, Heart, Search, Plus, X, Dumbbell } from 'lucide-react';
import { WorkoutLog, Routine } from '../types';
import { useState } from 'react';

interface HistoryLogProps {
  logs: WorkoutLog[];
  onDeleteLog: (id: string) => void;
  onAddManualLog: (log: WorkoutLog) => void;
  routines: Routine[];
}

// Helper to get local date time string in YYYY-MM-DDTHH:MM format
const getLocalDateTimeString = () => {
  const now = new Date();
  const tzoffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzoffset).toISOString().slice(0, 16);
};

export default function HistoryLog({ logs, onDeleteLog, onAddManualLog, routines }: HistoryLogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form States
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>('custom');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [durationMins, setDurationMins] = useState<number>(15);
  const [dateStr, setDateStr] = useState<string>(getLocalDateTimeString());
  const [exercisesCompleted, setExercisesCompleted] = useState<number>(5);
  const [calories, setCalories] = useState<number>(105);
  const [xp, setXp] = useState<number>(150);
  const [showWeights, setShowWeights] = useState<boolean>(false);
  const [weights, setWeights] = useState<{ [key: string]: number }>({});

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRoutineChange = (id: string) => {
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
        // Parse duration e.g. "15 min" -> 15
        const parsedMins = parseInt(routine.duration) || 15;
        setDurationMins(parsedMins);
        setExercisesCompleted(routine.exercises.length);
        setCalories(parsedMins * 7);
        setXp(parsedMins * 10);
        
        // Setup weights dictionary for exercises in routine
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

  const handleDurationChange = (mins: number) => {
    setDurationMins(mins);
    setCalories(mins * 7);
    setXp(mins * 10);
  };

  const handleWeightChange = (exName: string, lbs: number) => {
    setWeights((prev) => ({
      ...prev,
      [exName]: Math.max(0, lbs)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
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

  const filteredLogs = logs.filter((log) =>
    log.routineTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find active exercises for weights if a routine is selected
  const activeRoutine = routines.find((r) => r.id === selectedRoutineId);
  const weightExercises = activeRoutine ? activeRoutine.exercises : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700/60 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0 border-b border-gray-50 dark:border-gray-700/50 pb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-855 dark:text-white flex items-center">
            <Calendar className="w-5 h-5 text-rose-500 mr-2" />
            Workout Log History
          </h3>
          <p className="text-gray-450 dark:text-gray-400 text-xs">
            Review your consistency and historical achievements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          {logs.length > 0 && (
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-150 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none text-xs transition-all"
              />
            </div>
          )}

          <button
            onClick={() => {
              setSelectedRoutineId('custom');
              setCustomTitle('');
              setDurationMins(15);
              setDateStr(getLocalDateTimeString());
              setExercisesCompleted(5);
              setCalories(105);
              setXp(150);
              setShowWeights(false);
              setWeights({});
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/25"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Manually</span>
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="py-12 text-center text-gray-455 dark:text-gray-500 flex flex-col items-center">
          <Heart className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600 animate-pulse" />
          <p className="text-sm font-bold">No sessions completed yet</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            Start a routine from the routines tab, or tap 'Log Manually' to enter your workout details directly!
          </p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="py-12 text-center text-gray-450 dark:text-gray-500 text-xs">
          No logs match your search.
        </div>
      ) : (
        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
          {filteredLogs.map((log) => {
            const minutes = Math.floor(log.duration / 60);
            const seconds = log.duration % 60;

            return (
              <div
                key={log.id}
                className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-700/60 flex items-center justify-between transition-all hover:shadow-xs group"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-sm text-gray-800 dark:text-white truncate">
                      {log.routineTitle}
                    </h4>
                    <span className="text-[10px] text-gray-405 font-medium">
                      {formatDate(log.date)}
                    </span>
                  </div>

                  {/* Summary Grid stats */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-xs text-gray-550 dark:text-slate-455">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 text-indigo-400 mr-1" />
                      {minutes > 0 ? `${minutes}m ` : ''}
                      {seconds}s
                    </span>
                    <span className="flex items-center">
                      <Flame className="w-3.5 h-3.5 text-rose-455 mr-1" />
                      {log.caloriesBurned} kcal
                    </span>
                    <span className="flex items-center">
                      <Award className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                      +{log.xpEarned} XP
                    </span>
                  </div>

                  {log.weightsUsed && Object.keys(log.weightsUsed).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 bg-gray-100/50 dark:bg-slate-950/20 border border-gray-150 dark:border-slate-850 p-2 rounded-xl text-[10px]">
                      <span className="font-bold text-[9px] uppercase tracking-wider text-indigo-500 dark:text-indigo-400 block w-full">Weights Log:</span>
                      {Object.entries(log.weightsUsed).map(([exName, wt]) => (
                        <span key={exName} className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800/80 px-2 py-0.5 rounded-lg text-slate-600 dark:text-slate-350">
                          {exName}: <strong className="text-indigo-650 dark:text-indigo-400 font-mono">{wt} lbs</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delete Log */}
                <button
                  onClick={() => {
                    if (window.confirm('Delete this workout log from your history? This will also remove the corresponding XP.')) {
                      onDeleteLog(log.id);
                    }
                  }}
                  className="p-2.5 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all opacity-80 sm:opacity-0 group-hover:opacity-100"
                  title="Delete Log"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* MANUAL LOG MODAL */}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Routine Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-450 uppercase tracking-wider mb-1.5">
                  Select Workout / Routine
                </label>
                <select
                  value={selectedRoutineId}
                  onChange={(e) => handleRoutineChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-all"
                >
                  <option value="custom">Custom / Other Workout</option>
                  {routines.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>

              {/* Title (for custom) */}
              {selectedRoutineId === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-450 uppercase tracking-wider mb-1.5">
                    Workout Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Morning Jog, Cardio HIIT"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-all"
                    required
                  />
                </div>
              )}

              {/* Date & Time Done */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-450 uppercase tracking-wider mb-1.5">
                  Date & Time Performed
                </label>
                <input
                  type="datetime-local"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-all"
                  required
                />
              </div>

              {/* Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-450 uppercase tracking-wider mb-1.5">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={durationMins}
                    onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-450 uppercase tracking-wider mb-1.5">
                    Exercises Completed
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={exercisesCompleted}
                    onChange={(e) => setExercisesCompleted(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-all"
                    required
                  />
                </div>
              </div>

              {/* Calories and XP */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-450 uppercase tracking-wider mb-1.5">
                    Calories Burned (kcal)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5000"
                    value={calories}
                    onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-450 uppercase tracking-wider mb-1.5">
                    XP Earned
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={xp}
                    onChange={(e) => setXp(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-all"
                    required
                  />
                </div>
              </div>

              {/* Optional Weights used section */}
              {selectedRoutineId !== 'custom' && weightExercises.length > 0 && (
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
                      {weightExercises.map((ex) => (
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
