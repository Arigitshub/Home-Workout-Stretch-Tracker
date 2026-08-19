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
import OnboardingModal from './components/OnboardingModal';

import { predefinedRoutines } from './data/routines';
import { Routine, WorkoutLog, UserProfile } from './types';
import { Sun, Moon, Flame, Dumbbell, Award } from 'lucide-react';
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
  const [showLevelUpModal, setShowLevelUpModal] = useState<number | null>(null);

  // Authentication State
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => localStorage.getItem('fittrack_user_id'));
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => localStorage.getItem('fittrack_user_email'));
  const [currentUserPhone, setCurrentUserPhone] = useState<string | null>(() => localStorage.getItem('fittrack_user_phone'));

  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

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

  // Show Onboarding Modal if preferences are not set
  useEffect(() => {
    if (profile && (!profile.location || !profile.fitnessGoals || profile.fitnessGoals.length === 0)) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [profile]);

  // Auto-apply Streak Shields if gaps are detected
  useEffect(() => {
    const runShieldCheck = async () => {
      if (logs.length === 0 || !profile) return;
      
      const result = checkAndApplyStreakShields(logs, profile);
      if (result) {
        const { newShieldLogs, updatedProfile } = result;
        
        setLogs((prev) => [...newShieldLogs, ...prev]);
        setProfile(updatedProfile);
        
        try {
          if (dbConnected) {
            for (const log of newShieldLogs) {
              await saveLog(log);
            }
            await updateProfileOnServer(updatedProfile);
          }
        } catch (e) {
          console.error('Failed to sync streak shield use to database:', e);
        }
      }
    };
    
    runShieldCheck();
  }, [logs.length, profile?.streakShields, dbConnected]);

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

  // Scoring/Recommendation algorithm based on onboarding quiz
  const getRecommendedRoutines = () => {
    const equipPref = profile?.equipment || [];
    const goalsPref = profile?.fitnessGoals || [];

    const scored = allRoutines.map((routine) => {
      let score = 0;

      // 1. Equipment matching
      const needsWeights = routine.exercises.some((e) => e.needsWeight);
      const hasDumbbells = equipPref.includes('dumbbells');
      if (needsWeights) {
        if (hasDumbbells) {
          score += 3;
        } else {
          score -= 5; // Penalty if weights are needed but user doesn't have them
        }
      } else {
        if (!hasDumbbells) {
          score += 1; // Default to bodyweight
        }
      }

      // 2. Goal matching
      const titleLower = routine.title.toLowerCase();
      const descLower = routine.description.toLowerCase();

      goalsPref.forEach((goal) => {
        if (goal === 'strength') {
          if (titleLower.includes('strength') || titleLower.includes('power') || titleLower.includes('tone') || needsWeights) {
            score += 3;
          }
        } else if (goal === 'flexibility') {
          if (titleLower.includes('stretch') || titleLower.includes('yoga') || titleLower.includes('flow') || titleLower.includes('flexibility')) {
            score += 3;
          }
        } else if (goal === 'core') {
          if (titleLower.includes('core') || titleLower.includes('stabiliz') || titleLower.includes('ab')) {
            score += 3;
          }
        } else if (goal === 'cardio') {
          if (titleLower.includes('hiit') || titleLower.includes('cardio') || descLower.includes('intervals') || descLower.includes('heart rate')) {
            score += 3;
          }
        }
      });

      return { routine, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .map((x) => x.routine);
  };

  // Helper stats for dashboard
  const getTodayStats = () => {
    const todayStr = new Date().toDateString();
    const todayLogs = logs.filter((log) => new Date(log.date).toDateString() === todayStr);

    const mins = todayLogs.reduce((sum, log) => sum + log.duration, 0) / 60;
    const count = todayLogs.length;
    const cals = todayLogs.reduce((sum, log) => sum + log.caloriesBurned, 0);

    return { mins, count, cals };
  };

  const getLevelFromXp = (xp: number): number => {
    if (xp < 500) return 1;
    if (xp < 1200) return 2;
    if (xp < 2200) return 3;
    if (xp < 3500) return 4;
    if (xp < 5000) return 5;
    return 5 + Math.floor((xp - 5000) / 2000);
  };

  const getLevelInfo = (xp: number) => {
    const level = getLevelFromXp(xp);
    let currentLevelXp = 0;
    let nextLevelXp = 500;
    
    if (level === 1) {
      currentLevelXp = 0;
      nextLevelXp = 500;
    } else if (level === 2) {
      currentLevelXp = 500;
      nextLevelXp = 1200;
    } else if (level === 3) {
      currentLevelXp = 1200;
      nextLevelXp = 2200;
    } else if (level === 4) {
      currentLevelXp = 2200;
      nextLevelXp = 3500;
    } else if (level === 5) {
      currentLevelXp = 3500;
      nextLevelXp = 5000;
    } else {
      currentLevelXp = 5000 + (level - 5) * 2000;
      nextLevelXp = currentLevelXp + 2000;
    }
    
    const levelProgress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
    return {
      level,
      currentLevelXp,
      nextLevelXp,
      progressPct: Math.min(100, Math.max(0, levelProgress))
    };
  };

  const checkAndApplyStreakShields = (
    currentLogs: WorkoutLog[],
    currentProfile: UserProfile
  ) => {
    const shieldsAvailable = currentProfile.streakShields ?? 1;
    if (shieldsAvailable <= 0 || currentLogs.length === 0) return null;

    const today = new Date();
    today.setHours(0,0,0,0);

    const sortedLogs = [...currentLogs]
      .filter(l => l.duration > 0 || l.routineId === 'streak_shield')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
    if (sortedLogs.length === 0) return null;
    
    const lastLogDate = new Date(sortedLogs[0].date);
    lastLogDate.setHours(0,0,0,0);

    const diffTime = today.getTime() - lastLogDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return null;
    }

    const daysToBridge = diffDays - 1;
    const bridgesPossible = Math.min(daysToBridge, shieldsAvailable);

    if (bridgesPossible <= 0) return null;

    const newShieldLogs: WorkoutLog[] = [];
    for (let i = 1; i <= bridgesPossible; i++) {
      const shieldDate = new Date(lastLogDate);
      shieldDate.setDate(shieldDate.getDate() + i);

      const newLog: WorkoutLog = {
        id: `shield_${Date.now()}_${i}`,
        routineId: 'streak_shield',
        routineTitle: 'Streak Shield Used 🛡️',
        date: shieldDate.toISOString(),
        duration: 0,
        exercisesCompleted: 0,
        caloriesBurned: 0,
        xpEarned: 0,
        mood: 'restored'
      };
      newShieldLogs.push(newLog);
    }

    const updatedProfile = {
      ...currentProfile,
      streakShields: shieldsAvailable - bridgesPossible
    };

    return {
      newShieldLogs,
      updatedProfile
    };
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
    mood?: string;
  }) => {
    if (!activeWorkout) return;

    const newLog: WorkoutLog = {
      id: `log_${Date.now()}`,
      routineId: activeWorkout.id,
      routineTitle: activeWorkout.title,
      date: new Date().toISOString(),
      duration: stats.duration,
      exercisesCompleted: stats.exercisesCompleted,
      caloriesBurned: stats.caloriesBurned,
      xpEarned: stats.xpEarned,
      weightsUsed: stats.weightsUsed,
      mood: stats.mood
    };

    const badgesToUnlock = checkBadgesToUnlock(newLog, profile, activeStreak);
    const xpBonus = badgesToUnlock.length * 50;

    const levelBefore = getLevelFromXp(profile.xp);
    const updatedProfile = {
      ...profile,
      xp: profile.xp + stats.xpEarned + xpBonus,
      unlockedBadges: [...(profile.unlockedBadges || []), ...badgesToUnlock]
    };
    const levelAfter = getLevelFromXp(updatedProfile.xp);

    setLogs((prev) => [newLog, ...prev]);
    setProfile(updatedProfile);

    if (levelAfter > levelBefore) {
      setShowLevelUpModal(levelAfter);
    }

    if (badgesToUnlock.length > 0) {
      setNewlyUnlockedBadges(badgesToUnlock);
    }

    try {
      if (dbConnected) {
        await saveLog(newLog);
        await updateProfileOnServer(updatedProfile);
      }
    } catch (e) {
      console.error('Failed to sync completed workout to db:', e);
    }

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
    
    const levelBefore = getLevelFromXp(profile.xp);
    const updatedProfile = {
      ...profile,
      xp: profile.xp + newLog.xpEarned
    };
    const levelAfter = getLevelFromXp(updatedProfile.xp);
    
    setProfile(updatedProfile);

    if (levelAfter > levelBefore) {
      setShowLevelUpModal(levelAfter);
    }

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
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                {/* Welcome Section */}
                <div className="md:col-span-4 flex flex-col justify-center bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-850 dark:text-white">
                    Welcome, {profile.name}! 👋
                  </h2>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/40 text-indigo-650 dark:text-indigo-400 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Level {getLevelInfo(profile.xp).level} Athlete
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold font-mono">
                      {profile.xp} XP
                    </span>
                  </div>
                </div>

                {/* Streak Card */}
                <div className="md:col-span-4 bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between dark:from-rose-500/5 dark:to-orange-500/5 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-550 dark:text-rose-450 animate-bounce">
                      <Flame className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-rose-550 dark:text-rose-400 block">Streak</span>
                      <span className="text-lg font-black text-slate-850 dark:text-white">{activeStreak} Days Active</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-rose-550 dark:text-rose-400 font-bold bg-white dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-200/50 dark:border-rose-900/30 block">
                      🔥 Active
                    </span>
                  </div>
                </div>

                {/* Level Up Progress & Streak Shields Card */}
                <div className="md:col-span-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-4 flex flex-col justify-between dark:from-indigo-500/5 dark:to-purple-500/5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🛡️</span>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-550 dark:text-indigo-400 block">Streak Shields</span>
                        <span className="text-sm font-black text-slate-850 dark:text-white">
                          {profile.streakShields ?? 1} Available
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] text-indigo-650 dark:text-indigo-305 bg-indigo-150 dark:bg-indigo-950/50 px-2 py-0.5 rounded font-black uppercase">
                      Auto-Protect
                    </span>
                  </div>
                  
                  {/* Level Progress Bar */}
                  <div className="mt-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
                      <span>Progress to Level {getLevelInfo(profile.xp).level + 1}</span>
                      <span>{profile.xp} / {getLevelInfo(profile.xp).nextLevelXp} XP</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-550 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${getLevelInfo(profile.xp).progressPct}%` }}
                      />
                    </div>
                  </div>
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
                    {profile?.location && profile?.fitnessGoals && profile?.fitnessGoals.length > 0 
                      ? "Recommended for You Today 🎯" 
                      : "Today's Quick Routines"}
                  </h3>
                  <button
                    onClick={() => setActiveTab('workouts')}
                    className="text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline"
                  >
                    View All &rarr;
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {getRecommendedRoutines().slice(0, 3).map((workout) => (
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
                onRetakeOnboarding={() => setShowOnboarding(true)}
              />
            </div>
          )}
        </main>
      </div>

      {/* Global Tab Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Onboarding Questionnaire Modal */}
      {showOnboarding && (
        <OnboardingModal
          profile={profile}
          onSave={async (updatedProfile) => {
            setProfile(updatedProfile);
            setShowOnboarding(false);
            try {
              if (dbConnected) {
                await updateProfileOnServer(updatedProfile);
              }
            } catch (err) {
              console.error('Failed to save onboarding settings to database:', err);
            }
          }}
        />
      )}

      {/* Achievement Unlocked Celebration Popup Overlay */}
      {newlyUnlockedBadges && (
        <CelebrationModal
          badgeIds={newlyUnlockedBadges}
          onClose={() => setNewlyUnlockedBadges(null)}
        />
      )}

      {/* Level-Up Celebration Modal Overlay */}
      {showLevelUpModal !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-indigo-500/30 max-w-md w-full rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden transform scale-100 transition-all duration-300 animate-in zoom-in-95">
            <div className="absolute top-4 left-4 text-amber-400 animate-bounce">✨</div>
            <div className="absolute top-10 right-10 text-indigo-400 animate-pulse">⭐</div>
            <div className="absolute bottom-10 left-10 text-purple-400 animate-ping" style={{ animationDuration: '3s' }}>✨</div>
            
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-xl animate-ping" style={{ animationDuration: '2s' }} />
                <div className="w-24 h-24 bg-indigo-950 border-4 border-indigo-500 rounded-full flex items-center justify-center text-indigo-400 relative">
                  <Award className="w-12 h-12 text-indigo-400 animate-bounce" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-indigo-400 font-extrabold uppercase tracking-widest">Power Level Up!</span>
              <h2 className="text-3xl font-black text-indigo-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                Level {showLevelUpModal} Unlocked!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                You've reached a new tier of dedication. Your strength and stamina are growing!
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-around">
              <div className="text-center">
                <span className="text-[10px] text-slate-550 dark:text-slate-500 uppercase font-black block">Bonus Reward</span>
                <span className="text-emerald-500 dark:text-emerald-400 font-black font-mono text-lg">+1 Streak Shield</span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
              <div className="text-center">
                <span className="text-[10px] text-slate-550 dark:text-slate-500 uppercase font-black block">Streak Shield Inventory</span>
                <span className="text-indigo-650 dark:text-indigo-400 font-black font-mono text-lg">
                  {(profile.streakShields ?? 1) + 1}
                </span>
              </div>
            </div>

            <button
              onClick={async () => {
                const updatedProfile = {
                  ...profile,
                  streakShields: (profile.streakShields ?? 1) + 1
                };
                setProfile(updatedProfile);
                if (dbConnected) {
                  try {
                    await updateProfileOnServer(updatedProfile);
                  } catch (err) {
                    console.error(err);
                  }
                }
                setShowLevelUpModal(null);
                
                try {
                  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                  if (AudioCtx) {
                    const ctx = new AudioCtx();
                    const now = ctx.currentTime;
                    const playNote = (freq: number, start: number, dur: number) => {
                      const osc = ctx.createOscillator();
                      const gain = ctx.createGain();
                      osc.connect(gain);
                      gain.connect(ctx.destination);
                      osc.frequency.setValueAtTime(freq, start);
                      gain.gain.setValueAtTime(0.08, start);
                      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
                      osc.start(start);
                      osc.stop(start + dur);
                    };
                    playNote(523.25, now, 0.15);      // C5
                    playNote(659.25, now + 0.1, 0.15); // E5
                    playNote(783.99, now + 0.2, 0.15); // G5
                    playNote(1046.50, now + 0.3, 0.4); // C6
                  }
                } catch (e) {}
              }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-650 to-violet-650 hover:from-indigo-600 hover:to-violet-600 text-white font-extrabold tracking-wide text-sm transition-all transform active:scale-95 shadow-xl shadow-indigo-600/20 cursor-pointer"
            >
              Collect Rewards & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
