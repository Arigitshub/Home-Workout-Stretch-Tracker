import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, X, Award, Flame, Timer, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { Routine, Exercise } from '../types';

interface WorkoutPlayerProps {
  routine: Routine;
  onComplete: (stats: {
    duration: number;
    exercisesCompleted: number;
    caloriesBurned: number;
    xpEarned: number;
  }) => void;
  onClose: () => void;
}

export default function WorkoutPlayer({ routine, onComplete, onClose }: WorkoutPlayerProps) {
  const [currentStep, setCurrentStep] = useState<'intro' | 'active' | 'rest' | 'complete'>('intro');
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5); // 5s intro countdown
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Statistics trackers
  const [totalSecsCompleted, setTotalSecsCompleted] = useState(0);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);

  const currentExercise: Exercise | undefined = routine.exercises[exerciseIndex];

  // Keep ref to avoid closure issues in intervals
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Speech and Audio synthesis helpers
  const speakText = (text: string) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
    }
  };

  const playBeep = (freq = 880, duration = 0.1) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Web Audio API beep failed:', e);
    }
  };

  // Speak initial intro
  useEffect(() => {
    speakText(`Get ready to start ${routine.title}. Let's warm up.`);
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main countdown loop
  useEffect(() => {
    if (isPaused || currentStep === 'complete') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        // Countdown alert beeps for last 3 seconds
        if (prev <= 4 && prev > 1) {
          playBeep(600, 0.08);
        } else if (prev === 1) {
          playBeep(1200, 0.25);
        }

        if (prev <= 1) {
          handleTimerEnd();
          return 0;
        }

        // Track active exercise seconds towards stats
        if (currentStep === 'active') {
          setTotalSecsCompleted((t) => t + 1);
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, exerciseIndex, isPaused, soundEnabled]);

  const handleTimerEnd = () => {
    if (currentStep === 'intro') {
      // Move to first active exercise
      setCurrentStep('active');
      const firstEx = routine.exercises[0];
      setTimeLeft(firstEx.duration);
      speakText(`First exercise: ${firstEx.name}. Go!`);
    } else if (currentStep === 'active') {
      // Mark as completed
      if (currentExercise && !completedExerciseIds.includes(currentExercise.id)) {
        setCompletedExerciseIds((prev) => [...prev, currentExercise.id]);
      }

      // Check if more exercises exist
      if (exerciseIndex < routine.exercises.length - 1) {
        setCurrentStep('rest');
        setTimeLeft(10); // 10 seconds rest
        const nextEx = routine.exercises[exerciseIndex + 1];
        speakText(`Rest time. Next up is ${nextEx.name}.`);
      } else {
        // Workout complete!
        handleCompletion();
      }
    } else if (currentStep === 'rest') {
      // Move to next exercise
      const nextIndex = exerciseIndex + 1;
      setExerciseIndex(nextIndex);
      setCurrentStep('active');
      const nextEx = routine.exercises[nextIndex];
      setTimeLeft(nextEx.duration);
      speakText(`Exercise: ${nextEx.name}. Go!`);
    }
  };

  const handleCompletion = () => {
    // Play celebratory tone
    if (soundEnabled) {
      setTimeout(() => playBeep(523.25, 0.15), 0);   // C5
      setTimeout(() => playBeep(659.25, 0.15), 150); // E5
      setTimeout(() => playBeep(783.99, 0.15), 300); // G5
      setTimeout(() => playBeep(1046.50, 0.4), 450); // C6
    }
    speakText("Great job! You have successfully completed this routine!");
    setCurrentStep('complete');
  };

  const handleSkip = () => {
    if (currentStep === 'intro') {
      setCurrentStep('active');
      setTimeLeft(routine.exercises[0].duration);
      speakText(`Starting ${routine.exercises[0].name}. Go!`);
    } else if (currentStep === 'active') {
      // Skip active exercise
      if (currentExercise && !completedExerciseIds.includes(currentExercise.id)) {
        setCompletedExerciseIds((prev) => [...prev, currentExercise.id]);
      }
      if (exerciseIndex < routine.exercises.length - 1) {
        setCurrentStep('rest');
        setTimeLeft(10);
        speakText(`Skipped. Rest time.`);
      } else {
        handleCompletion();
      }
    } else if (currentStep === 'rest') {
      // Skip rest break
      const nextIndex = exerciseIndex + 1;
      setExerciseIndex(nextIndex);
      setCurrentStep('active');
      setTimeLeft(routine.exercises[nextIndex].duration);
      speakText(`Exercise: ${routine.exercises[nextIndex].name}. Go!`);
    }
  };

  const handleBack = () => {
    if (currentStep === 'active' && exerciseIndex > 0) {
      // Go to previous exercise
      const prevIndex = exerciseIndex - 1;
      setExerciseIndex(prevIndex);
      setCurrentStep('active');
      setTimeLeft(routine.exercises[prevIndex].duration);
      speakText(`Back to ${routine.exercises[prevIndex].name}.`);
    } else if (currentStep === 'rest') {
      // Return to active of current exercise
      setCurrentStep('active');
      setTimeLeft(routine.exercises[exerciseIndex].duration);
      speakText(`Restarting ${routine.exercises[exerciseIndex].name}.`);
    } else {
      // Restart current exercise
      setTimeLeft(routine.exercises[exerciseIndex].duration);
    }
  };

  const handleSave = () => {
    // Estimate calories: workouts burn ~0.15 kcal/s, stretches burn ~0.05 kcal/s
    const workoutSecs = routine.exercises
      .filter((ex) => ex.type === 'workout')
      .reduce((sum, ex) => sum + ex.duration, 0);
    const stretchSecs = routine.exercises
      .filter((ex) => ex.type === 'stretch')
      .reduce((sum, ex) => sum + ex.duration, 0);

    const estCalories = Math.round(workoutSecs * 0.15 + stretchSecs * 0.05);

    // XP = 10 XP per minute + 5 XP per completed exercise
    const durationMins = totalSecsCompleted / 60;
    const estXp = Math.round(durationMins * 10 + completedExerciseIds.length * 5);

    onComplete({
      duration: totalSecsCompleted,
      exercisesCompleted: completedExerciseIds.length,
      caloriesBurned: estCalories,
      xpEarned: estXp || 10 // minimum 10 XP
    });
  };

  // Get active progress percentage
  const totalDuration = currentStep === 'active' && currentExercise ? currentExercise.duration : 1;
  const progressPct = currentStep === 'active' ? (timeLeft / totalDuration) : 1;
  const strokeDashoffset = 2 * Math.PI * 90 * (1 - progressPct);

  return (
    <div className="fixed inset-0 bg-slate-950 text-white z-50 flex flex-col justify-between p-6 md:p-10 transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-center w-full">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            {routine.difficulty} Routine
          </span>
          <h2 className="text-xl md:text-2xl font-bold truncate max-w-xs sm:max-w-md">{routine.title}</h2>
        </div>

        <div className="flex items-center space-x-3">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-rose-400" />}
          </button>
          {/* Quit Button */}
          {currentStep !== 'complete' && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to quit this workout? Progress will not be saved.')) {
                  onClose();
                }
              }}
              className="p-2.5 rounded-full bg-rose-950/40 border border-rose-900/50 hover:bg-rose-900 transition-colors text-rose-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Screen Router */}
      <div className="flex-1 flex flex-col items-center justify-center py-6">
        {currentStep === 'intro' && (
          <div className="text-center space-y-6 animate-pulse">
            <div className="text-indigo-400 font-bold tracking-widest uppercase text-sm sm:text-base">
              Get Ready
            </div>
            <h1 className="text-5xl sm:text-6xl font-black">Ready to Flow?</h1>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Make some space, stand tall, and take deep breaths. First exercise begins in...
            </p>
            <div className="text-7xl md:text-8xl font-black text-indigo-500">{timeLeft}</div>
            <button
              onClick={handleSkip}
              className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm transition-all"
            >
              Skip Warmup
            </button>
          </div>
        )}

        {currentStep === 'active' && currentExercise && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl items-center">
            {/* Exercise Instructions Card */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 sm:p-8 rounded-2xl space-y-6">
              <div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300">
                  Step {exerciseIndex + 1} of {routine.exercises.length}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold mt-3">{currentExercise.name}</h1>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">{currentExercise.description}</p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  How to perform:
                </h3>
                <ul className="space-y-2.5">
                  {currentExercise.instructions.map((inst, index) => (
                    <li key={index} className="flex items-start text-sm text-slate-200">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-900/50 border border-indigo-700/60 text-indigo-300 text-xs font-bold flex items-center justify-center mr-3 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Circular Timer Visuals */}
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative w-64 h-64 md:w-72 md:h-72">
                <svg width="100%" height="100%" viewBox="0 0 200 200" className="transform -rotate-90">
                  {/* Gray Background Circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="transparent"
                    stroke="#1e293b"
                    strokeWidth="8"
                  />
                  {/* Glowing Animated Outer Ring */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="transparent"
                    stroke="url(#timerGrad)"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 90}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Inner Text Timer */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-6xl md:text-7xl font-black font-mono leading-none">
                    {timeLeft}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-slate-400 mt-2 font-bold">
                    Seconds Left
                  </span>
                </div>
              </div>

              {/* Player Quick Controls */}
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleBack}
                  className="p-3.5 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transform active:scale-95 transition-all"
                >
                  {isPaused ? <Play className="w-6 h-6 fill-white ml-0.5" /> : <Pause className="w-6 h-6 fill-white" />}
                </button>

                <button
                  onClick={handleSkip}
                  className="p-3.5 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'rest' && (
          <div className="text-center space-y-8 max-w-md w-full px-4">
            <div className="space-y-2">
              <span className="text-rose-400 font-bold uppercase tracking-widest text-sm">
                Rest Break
              </span>
              <h1 className="text-4xl sm:text-5xl font-black">Catch Your Breath</h1>
            </div>

            {/* Circular Rest Timer */}
            <div className="relative w-40 h-40 mx-auto">
              <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
                <circle cx="50" cy="50" r="44" fill="transparent" stroke="#1e293b" strokeWidth="4" />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="transparent"
                  stroke="#f43f5e"
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={2 * Math.PI * 44 * (1 - timeLeft / 10)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-extrabold font-mono">{timeLeft}s</span>
              </div>
            </div>

            {/* Next up preview */}
            {exerciseIndex + 1 < routine.exercises.length && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-left">
                <div className="flex-1 min-w-0 pr-4">
                  <span className="text-xs text-indigo-400 font-semibold uppercase">Next Up:</span>
                  <h3 className="text-lg font-bold text-white truncate">
                    {routine.exercises[exerciseIndex + 1].name}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    Duration: {routine.exercises[exerciseIndex + 1].duration}s
                  </p>
                </div>
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700 hover:text-white transition-colors"
                >
                  Skip Rest
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="bg-slate-900 border border-indigo-950 max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-lg animate-pulse" />
                <div className="w-20 h-20 bg-indigo-950 border-2 border-indigo-500 rounded-full flex items-center justify-center text-indigo-400 relative">
                  <Award className="w-10 h-10" />
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-black">Routine Complete!</h1>
              <p className="text-slate-400 text-sm mt-1">Excellent dedication. Here are your stats:</p>
            </div>

            {/* Completion stats list */}
            <div className="grid grid-cols-3 gap-3 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
              <div className="flex flex-col items-center py-2">
                <Timer className="w-5 h-5 text-indigo-400 mb-1" />
                <span className="text-xs text-slate-400">Duration</span>
                <span className="font-bold text-white text-sm sm:text-base">
                  {Math.floor(totalSecsCompleted / 60)}m {totalSecsCompleted % 60}s
                </span>
              </div>
              <div className="flex flex-col items-center py-2">
                <CheckCircle2 className="w-5 h-5 text-rose-400 mb-1" />
                <span className="text-xs text-slate-400">Exercises</span>
                <span className="font-bold text-white text-sm sm:text-base">
                  {completedExerciseIds.length}/{routine.exercises.length}
                </span>
              </div>
              <div className="flex flex-col items-center py-2">
                <Flame className="w-5 h-5 text-emerald-400 mb-1" />
                <span className="text-xs text-slate-400">Est. Burn</span>
                <span className="font-bold text-white text-sm sm:text-base">
                  {Math.round(totalSecsCompleted * 0.1)} kcal
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center bg-indigo-950/20 border border-indigo-900/30 rounded-xl py-3 px-4">
              <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
                Total Reward Earned
              </span>
              <span className="text-2xl font-black text-indigo-400 mt-0.5">
                +{Math.round(totalSecsCompleted / 60 * 10 + completedExerciseIds.length * 5) || 10} XP
              </span>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold tracking-wide text-sm transition-all transform active:scale-95 shadow-xl shadow-indigo-600/25"
            >
              Finish & Log Workout
            </button>
          </div>
        )}
      </div>

      {/* Footer queue progress */}
      {currentStep === 'active' && currentExercise && (
        <div className="w-full flex items-center justify-between mt-4 border-t border-slate-900 pt-4 text-xs text-slate-500">
          <div>
            Active: <span className="text-indigo-400 font-semibold">{currentExercise.name}</span>
          </div>
          <div>
            Up next:{' '}
            <span className="text-slate-300">
              {exerciseIndex + 1 < routine.exercises.length
                ? routine.exercises[exerciseIndex + 1].name
                : 'Completion'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
