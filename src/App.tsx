import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import WorkoutCard from './components/WorkoutCard';
import ProgressChart from './components/ProgressChart';
import WorkoutPlayer from './components/WorkoutPlayer';
import RoutineBuilder from './components/RoutineBuilder';
import HistoryLog from './components/HistoryLog';
import ProfileView from './components/ProfileView';
import ActivityRings from './components/ActivityRings';
import CelebrationModal from './components/CelebrationModal';
import StreakCalendar from './components/StreakCalendar';

import { predefinedRoutines } from './data/routines';
import { Routine, WorkoutLog, UserProfile } from './types';
import { Sun, Moon, Flame, Dumbbell } from 'lucide-react';
import {
  fetchProfile,
  updateProfileOnServer,
  fetchCustomRoutines,
  saveCustomRoutine,
  fetchLogs,
  saveLog,
  deleteLog
} from './api';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('fittrack_dark_mode');
    return saved === 'true';
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeWorkout, setActiveWorkout] = useState<Routine | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<string[] | null>(null);

  // Authentication State
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => localStorage.getItem('fittrack_user_id'));
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => localStorage.getItem('fittrack_user_email'));
  const [currentUserPhone, setCurrentUserPhone] = useState<string | null>(() => localStorage.getItem('fittrack_user_phone'));

  // Database / Local Cache state
  const [logs, setLogs] = useState<WorkoutLog[]>(() => {
    const saved = localStorage.getItem('fittrack_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [customRoutines, setCustomRoutines] = useState<Routine[]>(() => {
    const saved = localStorage.getItem('fittrack_custom_routines');
    return saved ? JSON.parse(saved) : [];
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('fittrack_profile');
    const defaultProfile = {
      name: 'Champion Athlete',
      xp: 0,
      dailyMinutesGoal: 15,
      dailyStretchesGoal: 1,
      weightKg: 70,
      voiceRate: 1.05,
      voicePitch: 1.0
    };
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...defaultProfile,
        ...parsed
      };
    }
    return defaultProfile;
  });

  // Load data from Neon Database server
  const loadDataFromServer = async () => {
    const userId = localStorage.getItem('fittrack_user_id');
    // If not logged in, we stay offline / local storage
    if (!userId) {
      setDbConnected(false);
      return;
    }
    try {
      const fetchedProfile = await fetchProfile();
      setProfile(fetchedProfile);
      localStorage.setItem('fittrack_profile', JSON.stringify(fetchedProfile));

      const fetchedRoutines = await fetchCustomRoutines();
      setCustomRoutines(fetchedRoutines);
      localStorage.setItem('fittrack_custom_routines', JSON.stringify(fetchedRoutines));

      const fetchedLogs = await fetchLogs();
      setLogs(fetchedLogs);
      localStorage.setItem('fittrack_logs', JSON.stringify(fetchedLogs));

      setDbConnected(true);
    } catch (err) {
      console.warn('Neon database offline or backend unreached. Running locally.', err);
      setDbConnected(false);
    }
  };

  // Sync data from Neon Database on mount / user change
  useEffect(() => {
    loadDataFromServer();
  }, [currentUserId]);

  const handleAuthSuccess = (userId: string, email: string, phone: string) => {
    setCurrentUserId(userId);
    setCurrentUserEmail(email);
    setCurrentUserPhone(phone);
    setDbConnected(true);
  };

  const handleSignOut = () => {
    localStorage.removeItem('fittrack_user_id');
    localStorage.removeItem('fittrack_user_email');
    localStorage.removeItem('fittrack_user_phone');
    setCurrentUserId(null);
    setCurrentUserEmail(null);
    setCurrentUserPhone(null);

    // Revert profile, custom routines, logs to local cache if present
    const cachedProfile = localStorage.getItem('fittrack_profile');
    if (cachedProfile) {
      try {
        setProfile(JSON.parse(cachedProfile));
      } catch {
        // Fallback
      }
    } else {
      setProfile({
        name: 'Champion Athlete',
        xp: 0,
        dailyMinutesGoal: 15,
        dailyStretchesGoal: 1,
        weightKg: 70
      });
    }

    const cachedRoutines = localStorage.getItem('fittrack_custom_routines');
    setCustomRoutines(cachedRoutines ? JSON.parse(cachedRoutines) : []);

    const cachedLogs = localStorage.getItem('fittrack_logs');
    setLogs(cachedLogs ? JSON.parse(cachedLogs) : []);

    setDbConnected(false);
  };

  // Save changes to LocalStorage as a local cache
  useEffect(() => {
    localStorage.setItem('fittrack_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('fittrack_custom_routines', JSON.stringify(customRoutines));
  }, [customRoutines]);

  useEffect(() => {
    localStorage.setItem('fittrack_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('fittrack_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Combine predefined and custom routines
  const allRoutines = [...predefinedRoutines, ...customRoutines];

  // Helper stats for dashboard
  const getTodayStats = () => {
    const todayStr = new Date().toDateString();
    const todayLogs = logs.filter((log) => new Date(log.date).toDateString() === todayStr);

    const mins = todayLogs.reduce((sum, log) => sum + log.duration, 0) / 60;
    const count = todayLogs.length;
    const cals = todayLogs.reduce((sum, log) => sum + log.caloriesBurned, 0);

    return { mins, count, cals };
  };

  const calculateStreak = (workoutLogs: WorkoutLog[]) => {
    if (workoutLogs.length === 0) return 0;
    const sortedDates = [...new Set(workoutLogs.map((log) => new Date(log.date).toDateString()))]
      .map((dStr) => new Date(dStr))
      .sort((a, b) => b.getTime() - a.getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const newestWorkoutDate = sortedDates[0];
    newestWorkoutDate.setHours(0, 0, 0, 0);

    if (newestWorkoutDate.getTime() !== today.getTime() && newestWorkoutDate.getTime() !== yesterday.getTime()) {
      return 0;
    }

    let streak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const current = sortedDates[i];
      const next = sortedDates[i + 1];

      const diffTime = Math.abs(current.getTime() - next.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
      } else if (diffDays > 1) {
        break;
      }
    }
    return streak;
  };

  const todayStats = getTodayStats();
  const activeStreak = calculateStreak(logs);

  const checkBadgesToUnlock = (
    newLog: WorkoutLog,
    currentProfile: UserProfile,
    streak: number
  ) => {
    const newlyUnlocked: string[] = [];
    const currentUnlocked = currentProfile.unlockedBadges || [];

    const addBadge = (id: string) => {
      if (!currentUnlocked.includes(id) && !newlyUnlocked.includes(id)) {
        newlyUnlocked.push(id);
      }
    };

    // 1. First Flow
    addBadge('first_flow');

    // 2. Iron Grip (dumbbell master)
    if (newLog.weightsUsed && Object.keys(newLog.weightsUsed).length > 0) {
      addBadge('dumbbell_master');
    }

    // 3. Consistency Hero (streak >= 3)
    if (streak >= 3) {
      addBadge('streak_3');
    }

    // 4. Calorie Incinerator (cumulative cals >= 500)
    const totalCals = logs.reduce((sum, log) => sum + log.caloriesBurned, 0) + newLog.caloriesBurned;
    if (totalCals >= 500) {
      addBadge('calories_500');
    }

    // 5. Midnight Warrior (after 9:00 PM / 21:00)
    const logHour = new Date(newLog.date).getHours();
    if (logHour >= 21 || logHour < 4) {
      addBadge('night_owl');
    }

    // 6. Dawn Patrol (before 8:00 AM)
    if (logHour >= 4 && logHour < 8) {
      addBadge('early_bird');
    }

    // 7. Custom Pioneer
    if (newLog.routineId.startsWith('custom_')) {
      addBadge('custom_pioneer');
    }

    return newlyUnlocked;
  };

  // Handlers
  const handleWorkoutComplete = async (stats: {
    duration: number;
    exercisesCompleted: number;
    caloriesBurned: number;
    xpEarned: number;
    weightsUsed?: { [exerciseName: string]: number };
  }) => {
    if (!activeWorkout) return;

    // Create log entry
    const newLog: WorkoutLog = {
      id: `log_${Date.now()}`,
      routineId: activeWorkout.id,
      routineTitle: activeWorkout.title,
      date: new Date().toISOString(),
      duration: stats.duration,
      exercisesCompleted: stats.exercisesCompleted,
      caloriesBurned: stats.caloriesBurned,
      xpEarned: stats.xpEarned,
      weightsUsed: stats.weightsUsed
    };

    // Calculate badges
    const badgesToUnlock = checkBadgesToUnlock(newLog, profile, activeStreak);
    const xpBonus = badgesToUnlock.length * 50;

    // Optimistic UI updates
    setLogs((prev) => [newLog, ...prev]);
    const updatedProfile = {
      ...profile,
      xp: profile.xp + stats.xpEarned + xpBonus,
      unlockedBadges: [...(profile.unlockedBadges || []), ...badgesToUnlock]
    };
    setProfile(updatedProfile);

    if (badgesToUnlock.length > 0) {
      setNewlyUnlockedBadges(badgesToUnlock);
    }

    // Save to Neon Database
    try {
      if (dbConnected) {
        await saveLog(newLog);
        await updateProfileOnServer(updatedProfile);
      }
    } catch (e) {
      console.error('Failed to sync completed workout to db:', e);
    }

    // Reset played routine and navigate to Logs
    setActiveWorkout(null);
    setActiveTab('progress');
  };

  const handleSaveCustomRoutine = async (newRoutine: Routine) => {
    setCustomRoutines((prev) => [newRoutine, ...prev]);
    try {
      if (dbConnected) {
        await saveCustomRoutine(newRoutine);
      }
    } catch (e) {
      console.error('Failed to save custom routine to db:', e);
    }
    setActiveTab('workouts');
  };

  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    try {
      if (dbConnected) {
        await updateProfileOnServer(updatedProfile);
      }
    } catch (e) {
      console.error('Failed to sync profile to db:', e);
    }
  };

  const handleDeleteLog = async (id: string) => {
    const logToDelete = logs.find((l) => l.id === id);
    let updatedProfile = { ...profile };
    if (logToDelete) {
      updatedProfile = {
        ...profile,
        xp: Math.max(0, profile.xp - logToDelete.xpEarned)
      };
      setProfile(updatedProfile);
    }
    setLogs((prev) => prev.filter((l) => l.id !== id));

    try {
      if (dbConnected) {
        await deleteLog(id);
        await updateProfileOnServer(updatedProfile);
      }
    } catch (e) {
      console.error('Failed to delete log from db:', e);
    }
  };

  const handleSaveManualLog = async (newLog: WorkoutLog) => {
    setLogs((prev) => [newLog, ...prev]);
    
    const updatedProfile = {
      ...profile,
      xp: profile.xp + newLog.xpEarned
    };
    setProfile(updatedProfile);

    try {
      if (dbConnected) {
        await saveLog(newLog);
        await updateProfileOnServer(updatedProfile);
      }
    } catch (e) {
      console.error('Failed to save manual log to db:', e);
    }
  };

  // Filters for workouts view
  const [workoutFilter, setWorkoutFilter] = useState<'all' | 'workouts' | 'stretches'>('all');
  const filteredRoutines = allRoutines.filter((r) => {
    if (workoutFilter === 'all') return true;
    
    // Check if the routine primarily consists of workout or stretch exercises
    const workoutCount = r.exercises.filter((ex) => ex.type === 'workout').length;
    const stretchCount = r.exercises.filter((ex) => ex.type === 'stretch').length;

    if (workoutFilter === 'workouts') {
      return workoutCount >= stretchCount;
    } else {
      return stretchCount > workoutCount;
    }
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50/50 text-slate-800'}`}>
      
      {/* Immersive Fullscreen Guided Player */}
      {activeWorkout && (
        <WorkoutPlayer
          routine={activeWorkout}
          profile={profile}
          onComplete={handleWorkoutComplete}
          onClose={() => setActiveWorkout(null)}
        />
      )}

      {/* Main Container */}
      <div className="container mx-auto px-4 py-8 pb-28 max-w-5xl">
        
        {/* Top Header Row */}
        <header className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3 w-full justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-650 flex items-center justify-center text-white">
                <Dumbbell className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-gray-850 dark:text-white mr-2">FitTrack</h1>
              
              {/* Database Live Sync Status Badge */}
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                dbConnected 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-550 border-amber-500/20 dark:text-amber-450 dark:border-amber-500/10'
              }`}>
                {dbConnected ? '● Neon Live' : '○ Local Sync'}
              </span>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>
        </header>

        {/* Dynamic Tab Router */}
        <main className="transition-all duration-350">
          
          {/* TAB: HOME */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Daily greeting & Streak Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8">
                  <h2 className="text-3xl font-black tracking-tight text-gray-850 dark:text-white">
                    Welcome back, {profile.name}! 👋
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Your fitness goals are waiting. Make today count towards your health!
                  </p>
                </div>

                <div className="md:col-span-4 bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between dark:from-rose-500/5 dark:to-orange-500/5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-550 dark:text-rose-450 animate-bounce">
                      <Flame className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-rose-550 dark:text-rose-400 block">Streak</span>
                      <span className="text-lg font-black text-slate-850 dark:text-white">{activeStreak} Days Active</span>
                    </div>
                  </div>
                  <span className="text-xs text-rose-550 dark:text-rose-400 font-bold bg-white dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-200/50 dark:border-rose-900/30">
                    🔥 Active
                  </span>
                </div>
              </div>

              {/* Performance Targets & Activity Calendar Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                    Today's Performance Target
                  </h3>
                  <ActivityRings
                    minutesCompleted={todayStats.mins}
                    minutesGoal={profile.dailyMinutesGoal}
                    stretchesCompleted={todayStats.count}
                    stretchesGoal={profile.dailyStretchesGoal}
                    caloriesBurned={todayStats.cals}
                    caloriesGoal={Math.round(profile.dailyMinutesGoal * 7)}
                  />
                </div>
                <div className="lg:col-span-5">
                  <StreakCalendar
                    logs={logs}
                    activeStreak={activeStreak}
                    onAddManualLog={handleSaveManualLog}
                    routines={allRoutines}
                  />
                </div>
              </div>

              {/* Daily featured workouts */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                    Today's Quick Routines
                  </h3>
                  <button
                    onClick={() => setActiveTab('workouts')}
                    className="text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline"
                  >
                    View All &rarr;
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {allRoutines.slice(0, 3).map((workout) => (
                    <WorkoutCard
                      key={workout.id}
                      title={workout.title}
                      duration={workout.duration}
                      difficulty={workout.difficulty}
                      image={workout.image}
                      description={workout.description}
                      exerciseCount={workout.exercises.length}
                      onPlay={() => setActiveWorkout(workout)}
                    />
                  ))}
                </div>
              </div>

              {/* Performance Chart */}
              <div>
                <ProgressChart logs={logs} />
              </div>
            </div>
          )}

          {/* TAB: WORKOUTS */}
          {activeTab === 'workouts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                <div>
                  <h2 className="text-2xl font-black text-gray-850 dark:text-white">Routines Library</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                    Launch guided steps for exercises and stretches.
                  </p>
                </div>

                {/* Filter Switcher */}
                <div className="flex bg-gray-100 dark:bg-slate-900 rounded-xl p-0.5 text-xs font-semibold w-full sm:w-auto">
                  <button
                    onClick={() => setWorkoutFilter('all')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
                      workoutFilter === 'all'
                        ? 'bg-white dark:bg-gray-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-500 hover:text-slate-800 dark:hover:text-slate-350'
                    }`}
                  >
                    All Flows
                  </button>
                  <button
                    onClick={() => setWorkoutFilter('workouts')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
                      workoutFilter === 'workouts'
                        ? 'bg-white dark:bg-gray-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-500 hover:text-slate-800 dark:hover:text-slate-350'
                    }`}
                  >
                    Strength HIIT
                  </button>
                  <button
                    onClick={() => setWorkoutFilter('stretches')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
                      workoutFilter === 'stretches'
                        ? 'bg-white dark:bg-gray-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-500 hover:text-slate-800 dark:hover:text-slate-350'
                    }`}
                  >
                    Flex Yoga
                  </button>
                </div>
              </div>

              {filteredRoutines.length === 0 ? (
                <div className="py-12 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl text-center text-gray-400">
                  No routines found. Create one in the builder tab!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredRoutines.map((workout) => (
                    <WorkoutCard
                      key={workout.id}
                      title={workout.title}
                      duration={workout.duration}
                      difficulty={workout.difficulty}
                      image={workout.image}
                      description={workout.description}
                      exerciseCount={workout.exercises.length}
                      onPlay={() => setActiveWorkout(workout)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: BUILDER */}
          {activeTab === 'builder' && (
            <div>
              <RoutineBuilder
                onSave={handleSaveCustomRoutine}
                onCancel={() => setActiveTab('workouts')}
              />
            </div>
          )}

          {/* TAB: PROGRESS */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              <ProgressChart logs={logs} />
              <HistoryLog
                logs={logs}
                onDeleteLog={handleDeleteLog}
                onAddManualLog={handleSaveManualLog}
                routines={allRoutines}
              />
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div>
              <ProfileView
                profile={profile}
                logs={logs}
                customRoutines={customRoutines}
                currentUserId={currentUserId}
                currentUserEmail={currentUserEmail}
                currentUserPhone={currentUserPhone}
                onUpdateProfile={handleUpdateProfile}
                onAuthSuccess={handleAuthSuccess}
                onSignOut={handleSignOut}
                onRefreshData={loadDataFromServer}
              />
            </div>
          )}
        </main>
      </div>

      {/* Global Tab Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Achievement Unlocked Celebration Popup Overlay */}
      {newlyUnlockedBadges && (
        <CelebrationModal
          badgeIds={newlyUnlockedBadges}
          onClose={() => setNewlyUnlockedBadges(null)}
        />
      )}
    </div>
  );
}
