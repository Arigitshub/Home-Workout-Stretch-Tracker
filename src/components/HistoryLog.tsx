import { Trash2, Calendar, Clock, Flame, Award, Heart, Search } from 'lucide-react';
import { WorkoutLog } from '../types';
import { useState } from 'react';

interface HistoryLogProps {
  logs: WorkoutLog[];
  onDeleteLog: (id: string) => void;
}

export default function HistoryLog({ logs, onDeleteLog }: HistoryLogProps) {
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredLogs = logs.filter((log) =>
    log.routineTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700/60">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
        <div>
          <h3 className="font-bold text-lg text-gray-850 dark:text-white flex items-center">
            <Calendar className="w-5 h-5 text-rose-500 mr-2" />
            Workout Log History
          </h3>
          <p className="text-gray-450 dark:text-gray-400 text-xs">
            Review your consistency and historical achievements.
          </p>
        </div>

        {/* Search */}
        {logs.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-150 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none text-xs transition-all"
            />
          </div>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="py-12 text-center text-gray-450 dark:text-gray-500 flex flex-col items-center">
          <Heart className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600 animate-pulse" />
          <p className="text-sm font-bold">No sessions completed yet</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            Start a routine from the routines tab, finish the exercises, and save your workout to see it here!
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
                    <span className="text-[10px] text-gray-400 font-medium">
                      {formatDate(log.date)}
                    </span>
                  </div>

                  {/* Summary Grid stats */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-xs text-gray-550 dark:text-slate-450">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 text-indigo-400 mr-1" />
                      {minutes > 0 ? `${minutes}m ` : ''}
                      {seconds}s
                    </span>
                    <span className="flex items-center">
                      <Flame className="w-3.5 h-3.5 text-rose-400 mr-1" />
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
    </div>
  );
}
