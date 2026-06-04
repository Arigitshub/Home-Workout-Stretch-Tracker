import { useState } from 'react';
import { User, Award, Flame, Timer, TrendingUp, Settings, Edit3, Check } from 'lucide-react';
import { UserProfile, WorkoutLog } from '../types';

interface ProfileViewProps {
  profile: UserProfile;
  logs: WorkoutLog[];
  onUpdateProfile: (updated: UserProfile) => void;
}

export default function ProfileView({ profile, logs, onUpdateProfile }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [dailyMinutesGoal, setDailyMinutesGoal] = useState(profile.dailyMinutesGoal);
  const [dailyStretchesGoal, setDailyStretchesGoal] = useState(profile.dailyStretchesGoal);
  const [weightKg, setWeightKg] = useState(profile.weightKg);

  // Level Logic: 500 XP per level
  const xpPerLevel = 500;
  const currentLevel = Math.floor(profile.xp / xpPerLevel) + 1;
  const currentLevelXp = profile.xp % xpPerLevel;
  const xpPct = Math.round((currentLevelXp / xpPerLevel) * 100);

  // Aggregate stats
  const totalWorkouts = logs.length;
  const totalSecs = logs.reduce((sum, log) => sum + log.duration, 0);
  const totalMins = Math.round(totalSecs / 60);
  const totalCals = logs.reduce((sum, log) => sum + log.caloriesBurned, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: name.trim() || 'Champion',
      dailyMinutesGoal: Math.max(1, dailyMinutesGoal),
      dailyStretchesGoal: Math.max(1, dailyStretchesGoal),
      weightKg: Math.max(10, weightKg)
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Level Card */}
      <div className="bg-gradient-to-r from-indigo-650 via-purple-600 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-200 border border-white/10">
              <User className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-indigo-200">Athlete Profile</span>
              <h2 className="text-2xl font-black">{profile.name}</h2>
            </div>
          </div>

          <div className="bg-white/10 border border-white/10 rounded-2xl py-2 px-5 text-center">
            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-200 block">Level</span>
            <span className="text-3xl font-black">{currentLevel}</span>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-8 space-y-2">
          <div className="flex justify-between text-xs text-indigo-100 font-bold">
            <span>Level {currentLevel}</span>
            <span>{currentLevelXp} / {xpPerLevel} XP ({xpPct}%)</span>
            <span>Level {currentLevel + 1}</span>
          </div>
          <div className="w-full h-3 bg-indigo-950/40 rounded-full overflow-hidden border border-white/5 p-0.5">
            <div
              className="h-full bg-linear-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Aggregate Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Time */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-550 dark:text-indigo-400">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block uppercase">Total Active Time</span>
            <span className="text-lg font-black text-gray-800 dark:text-white">
              {totalMins >= 60 ? `${Math.floor(totalMins / 60)}h ` : ''}
              {totalMins % 60}m
            </span>
          </div>
        </div>

        {/* Total Workouts */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500 dark:text-rose-450">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block uppercase">Total Workouts</span>
            <span className="text-lg font-black text-gray-800 dark:text-white">{totalWorkouts} sessions</span>
          </div>
        </div>

        {/* Total Calories */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500 dark:text-emerald-450">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block uppercase">Energy Expended</span>
            <span className="text-lg font-black text-gray-800 dark:text-white">{totalCals} kcal</span>
          </div>
        </div>
      </div>

      {/* Goal Settings Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/10">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center">
            <Settings className="w-5 h-5 text-indigo-550 mr-2" />
            Goal & Settings Configuration
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold text-indigo-650 hover:text-indigo-500 flex items-center bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Goals
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-450 uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-750 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-450 uppercase tracking-wider mb-1.5">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseInt(e.target.value) || 70)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-750 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-450 uppercase tracking-wider mb-1.5">
                  Daily Active Minutes Goal
                </label>
                <input
                  type="number"
                  value={dailyMinutesGoal}
                  onChange={(e) => setDailyMinutesGoal(parseInt(e.target.value) || 20)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-750 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-450 uppercase tracking-wider mb-1.5">
                  Daily Routine Goal (Count)
                </label>
                <input
                  type="number"
                  value={dailyStretchesGoal}
                  onChange={(e) => setDailyStretchesGoal(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-750 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-755">
              <button
                type="button"
                onClick={() => {
                  setName(profile.name);
                  setDailyMinutesGoal(profile.dailyMinutesGoal);
                  setDailyStretchesGoal(profile.dailyStretchesGoal);
                  setWeightKg(profile.weightKg);
                  setIsEditing(false);
                }}
                className="px-4 py-2 border border-gray-250 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-semibold"
              >
                Discard
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-550 text-white font-bold text-xs flex items-center justify-center transition-colors shadow-sm"
              >
                <Check className="w-3.5 h-3.5 mr-1" /> Save Configurations
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/60">
              <span className="text-gray-400 font-semibold">Athlete Name</span>
              <span className="font-bold text-gray-850 dark:text-white">{profile.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/60">
              <span className="text-gray-400 font-semibold">Body Weight</span>
              <span className="font-bold text-gray-850 dark:text-white">{profile.weightKg} kg</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/60">
              <span className="text-gray-400 font-semibold">Daily Minutes Goal</span>
              <span className="font-bold text-gray-850 dark:text-white">{profile.dailyMinutesGoal} minutes</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/60">
              <span className="text-gray-400 font-semibold">Daily Workouts Goal</span>
              <span className="font-bold text-gray-850 dark:text-white">{profile.dailyStretchesGoal} sessions</span>
            </div>
          </div>
        )}
      </div>

      {/* Fitness tips card */}
      <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150/40 dark:border-indigo-900/30 rounded-2xl p-5 flex items-start space-x-3">
        <TrendingUp className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm">Pro-Tip for Consistency: Streak Tracking</h4>
          <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed mt-1">
            Perform at least 1 workout or stretch session daily to increment your active streak rings! Consistency is the number one driver of mobility, aerobic health, and joint health. Try the 'Desk Re-Energizer' routine during work breaks to keep active!
          </p>
        </div>
      </div>
    </div>
  );
}
