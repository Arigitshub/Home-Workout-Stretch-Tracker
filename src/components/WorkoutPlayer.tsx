import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, X, Award, Flame, Timer, CheckCircle2, Volume2, VolumeX, Dumbbell, Sparkles } from 'lucide-react';
import { Routine, Exercise } from '../types';

interface WorkoutPlayerProps {
  routine: Routine;
  onComplete: (stats: {
    duration: number;
    exercisesCompleted: number;
    caloriesBurned: number;
    xpEarned: number;
    weightsUsed?: { [exerciseName: string]: number };
  }) => void;
  onClose: () => void;
}

export default function WorkoutPlayer({ routine, onComplete, onClose }: WorkoutPlayerProps) {
  const hasWeightedExercises = routine.exercises.some((ex) => ex.needsWeight);
  const [currentStep, setCurrentStep] = useState<'setup_weight' | 'intro' | 'active' | 'rest' | 'complete'>(
    hasWeightedExercises ? 'setup_weight' : 'intro'
  );
  
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5); // 5s intro countdown
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Map of exercise ID -> configured weight in lbs
  const [weights, setWeights] = useState<{ [exId: string]: number }>(() => {
    const initialWeights: { [exId: string]: number } = {};
    routine.exercises.forEach((ex) => {
      if (ex.needsWeight) {
        initialWeights[ex.id] = ex.weightLbs || 10;
      }
    });
    return initialWeights;
  });

  // Statistics trackers
  const [totalSecsCompleted, setTotalSecsCompleted] = useState(0);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);

  // XP accumulation rewards states & effect
  const [xpDisplayed, setXpDisplayed] = useState(0);
  const [xpGainAmount, setXpGainAmount] = useState<number | null>(null);

  const currentXp = Math.max(
    0,
    Math.round((totalSecsCompleted / 60) * 10 + completedExerciseIds.length * 5)
  );

  useEffect(() => {
    if (currentXp > xpDisplayed) {
      const diff = currentXp - xpDisplayed;
      setXpGainAmount(diff);
      setXpDisplayed(currentXp);
      const timer = setTimeout(() => {
        setXpGainAmount(null);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentXp, xpDisplayed]);

  const currentExercise: Exercise | undefined = routine.exercises[exerciseIndex];

  // Keep ref to avoid closure issues in intervals
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeStepRef = useRef<HTMLDivElement | null>(null);

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

  // Speak initial intro when transitions to warmup
  useEffect(() => {
    if (currentStep === 'intro') {
      speakText(`Get ready to start ${routine.title}. Let's warm up.`);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Main countdown loop
  useEffect(() => {
    if (isPaused || currentStep === 'complete' || currentStep === 'setup_weight') {
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
      
      const weightMsg = firstEx.needsWeight ? ` with ${weights[firstEx.id]} pounds` : '';
      speakText(`First exercise: ${firstEx.name}${weightMsg}. Go!`);
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
      
      const weightMsg = nextEx.needsWeight ? ` with ${weights[nextEx.id]} pounds` : '';
      speakText(`Exercise: ${nextEx.name}${weightMsg}. Go!`);
    }
  };

  const handleCompletion = () => {
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
      const weightMsg = routine.exercises[0].needsWeight ? ` with ${weights[routine.exercises[0].id]} pounds` : '';
      speakText(`Starting ${routine.exercises[0].name}${weightMsg}. Go!`);
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
      const weightMsg = routine.exercises[nextIndex].needsWeight ? ` with ${weights[routine.exercises[nextIndex].id]} pounds` : '';
      speakText(`Exercise: ${routine.exercises[nextIndex].name}${weightMsg}. Go!`);
    }
  };

  const handleBack = () => {
    if (currentStep === 'active' && exerciseIndex > 0) {
      const prevIndex = exerciseIndex - 1;
      setExerciseIndex(prevIndex);
      setCurrentStep('active');
      setTimeLeft(routine.exercises[prevIndex].duration);
      speakText(`Back to ${routine.exercises[prevIndex].name}.`);
    } else if (currentStep === 'rest') {
      setCurrentStep('active');
      setTimeLeft(routine.exercises[exerciseIndex].duration);
      speakText(`Restarting ${routine.exercises[exerciseIndex].name}.`);
    } else {
      setTimeLeft(routine.exercises[exerciseIndex].duration);
    }
  };

  const handleSave = () => {
    // Estimate calories
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

    // Build log of weights used
    const weightsLog: { [exerciseName: string]: number } = {};
    routine.exercises.forEach((ex) => {
      if (ex.needsWeight && weights[ex.id]) {
        weightsLog[ex.name] = weights[ex.id];
      }
    });

    onComplete({
      duration: totalSecsCompleted,
      exercisesCompleted: completedExerciseIds.length,
      caloriesBurned: estCalories,
      xpEarned: estXp || 10,
      weightsUsed: weightsLog
    });
  };

  // Get active progress percentage
  const totalDuration = currentStep === 'active' && currentExercise ? currentExercise.duration : 1;
  const progressPct = currentStep === 'active' ? (timeLeft / totalDuration) : 1;
  const strokeDashoffset = 2 * Math.PI * 90 * (1 - progressPct);

  // Derived properties for active instruction steps
  const elapsed = Math.max(0, totalDuration - timeLeft);
  const instructionsCount = currentExercise && currentExercise.instructions ? currentExercise.instructions.length : 1;
  const stepDuration = totalDuration / instructionsCount;
  const activeInstructionIndex = Math.min(
    instructionsCount - 1,
    Math.floor(elapsed / stepDuration)
  );

  // Scrolling active step card into view
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeInstructionIndex]);

  return (
    <div className="fixed inset-0 bg-slate-950 text-white z-50 flex flex-col justify-between p-6 md:p-10 transition-all duration-300 overflow-hidden">
      {/* Immersive Atmospheric Spheres */}
      <div className="absolute -top-12 -left-12 w-96 h-96 bg-indigo-650/15 rounded-full blur-3xl pointer-events-none z-0 animate-pulse" />
      <div className="absolute -bottom-12 -right-12 w-96 h-96 bg-rose-650/10 rounded-full blur-3xl pointer-events-none z-0" />
      
      {/* Interactive content containers wrapped in z-10 */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 md:p-10 pointer-events-none select-none">
        <div className="w-full h-full pointer-events-auto" />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full w-full">
      {/* Header */}
      <div className="flex justify-between items-center w-full border-b border-slate-900 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400/80 bg-indigo-950/30 border border-indigo-900/30 px-2 py-0.5 rounded">
            {routine.difficulty} Routine
          </span>
          <h2 className="text-lg md:text-2xl font-extrabold truncate max-w-xs sm:max-w-md mt-1.5">{routine.title}</h2>
        </div>

        {/* Real-time XP accumulation meter */}
        {['intro', 'active', 'rest'].includes(currentStep) && (
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full relative z-30 shadow-lg shadow-indigo-950/20">
            <div className="relative flex items-center justify-center">
              <Award className="w-4 h-4 text-indigo-400 animate-bounce" />
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-sm scale-150 animate-pulse" />
            </div>
            <span className="text-sm font-black font-mono text-indigo-400">
              +{currentXp} XP
            </span>
            <span className="text-[9px] text-indigo-300 bg-indigo-950/80 border border-indigo-900/40 px-1.5 py-0.5 rounded-md hidden md:inline-block font-extrabold tracking-wide uppercase">
              +1 XP / 6s
            </span>
            {xpGainAmount !== null && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-emerald-400 font-black text-sm animate-floatUp z-50 pointer-events-none drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                +{xpGainAmount} XP!
              </div>
            )}
          </div>
        )}

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-rose-400" />}
          </button>
          
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
      <div className="flex-1 flex flex-col items-center justify-center py-6 w-full">
        
        {/* STEP: Weight setup panel */}
        {currentStep === 'setup_weight' && (
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/50 border border-indigo-700/50 flex items-center justify-center text-indigo-400 mx-auto mb-2">
                <Dumbbell className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Pre-Workout Config</span>
              <h1 className="text-2xl font-black">Adjust Dumbbell Weights</h1>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                Set your target dumbbell weights in pounds (lbs) for this training flow.
              </p>
            </div>

            {/* Weighted exercises list */}
            <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
              {routine.exercises.map((ex) => {
                if (!ex.needsWeight) return null;
                const currentWeight = weights[ex.id] || 10;

                const adjustWeight = (delta: number) => {
                  setWeights((prev) => ({
                    ...prev,
                    [ex.id]: Math.max(2, currentWeight + delta) // minimum 2 lbs
                  }));
                };

                return (
                  <div key={ex.id} className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between">
                    <div className="min-w-0 pr-3">
                      <h4 className="font-bold text-sm text-white truncate">{ex.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Recommended: {ex.weightLbs || 10} lbs</p>
                    </div>

                    <div className="flex items-center space-x-3.5">
                      <button
                        type="button"
                        onClick={() => adjustWeight(-2)}
                        className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-black text-sm flex items-center justify-center transition-colors hover:text-white"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-black text-indigo-400 w-16 text-center">
                        {currentWeight} lbs
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustWeight(2)}
                        className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-black text-sm flex items-center justify-center transition-colors hover:text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setCurrentStep('intro');
                setTimeLeft(5);
              }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-650 to-violet-650 hover:from-indigo-600 hover:to-violet-600 text-white font-extrabold tracking-wide text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              Confirm Weights & Start Warmup
            </button>
          </div>
        )}

        {/* STEP: Intro countdown */}
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

        {/* STEP: Active exercise playing */}
        {currentStep === 'active' && currentExercise && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl items-center px-4 relative z-20">
            
            {/* Exercise Instructions Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 sm:p-8 rounded-2xl space-y-6 backdrop-blur-xl">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 text-xs font-black rounded-full bg-indigo-950/65 border border-indigo-900 text-indigo-300 uppercase tracking-wider">
                    Exercise {exerciseIndex + 1} of {routine.exercises.length}
                  </span>
                  {currentExercise.type === 'stretch' && (
                    <span className="flex items-center space-x-1 px-3 py-1 text-xs font-black rounded-full bg-purple-950/65 border border-purple-900 text-purple-300 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '4s' }} />
                      <span>Stretching</span>
                    </span>
                  )}
                  {currentExercise.type === 'workout' && (
                    <span className="flex items-center space-x-1 px-3 py-1 text-xs font-black rounded-full bg-rose-950/65 border border-rose-900 text-rose-300 uppercase tracking-wider">
                      <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      <span>Workout</span>
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-black mt-4 text-white tracking-tight">{currentExercise.name}</h1>
                <p className="text-slate-405 text-xs sm:text-sm mt-2 leading-relaxed">{currentExercise.description}</p>
              </div>

              <div className="space-y-3.5 border-t border-slate-850 pt-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Guided Instructions:</span>
                  <span className="text-[10px] text-indigo-400 font-bold bg-indigo-950/50 border border-indigo-900/40 px-2 py-0.5 rounded-full">
                    Step {activeInstructionIndex + 1} / {instructionsCount}
                  </span>
                </h3>
                
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {currentExercise.instructions.map((inst, index) => {
                    const isActive = index === activeInstructionIndex;
                    const isCompleted = index < activeInstructionIndex;
                    return (
                      <div
                        key={index}
                        ref={isActive ? activeStepRef : null}
                        className={`p-3 rounded-xl border transition-all duration-300 flex items-start space-x-3.5 ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-950/45 to-purple-950/30 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)] scale-[1.01] opacity-100'
                            : isCompleted
                            ? 'bg-slate-950/30 border-emerald-950/30 opacity-55'
                            : 'bg-slate-950/10 border-slate-900/40 opacity-35'
                        }`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {isCompleted ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          ) : isActive ? (
                            <div className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-450 flex items-center justify-center text-indigo-350 relative">
                              <span className="absolute inset-0 rounded-full bg-indigo-400/20 animate-ping" />
                              <span className="w-2 h-2 rounded-full bg-indigo-405" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-[10px] font-bold">
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs sm:text-sm leading-relaxed transition-colors ${
                            isActive ? 'text-white font-semibold' : 'text-slate-350'
                          }`}>
                            {inst}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Circular Timer & Controls */}
            <div className="flex flex-col items-center justify-center space-y-6">
              
              {/* Dumbbell Weight Pill Indicator */}
              {currentExercise.needsWeight && (
                <div className="px-4 py-2 rounded-full bg-indigo-950/60 border border-indigo-800 text-xs font-extrabold text-indigo-305 flex items-center space-x-2 shadow-lg shadow-indigo-950/30 relative">
                  <Dumbbell className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span>Dumbbells: {weights[currentExercise.id]} lbs</span>
                </div>
              )}

              <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
                {/* Glowing Aura Backdrop */}
                <div className={`absolute inset-4 rounded-full bg-indigo-550/10 blur-xl transition-all duration-1000 ${
                  isPaused ? 'scale-95 opacity-40' : 'scale-105 opacity-100 animate-pulse'
                }`} />

                {/* Concentric Breathing Halos (Kinetic Loops) */}
                <div 
                  className="absolute inset-8 rounded-full border border-indigo-500/10 animate-ping pointer-events-none z-0" 
                  style={{ animationDuration: currentExercise.type === 'stretch' ? '6s' : '3s' }} 
                />
                <div 
                  className="absolute inset-16 rounded-full border border-purple-500/25 animate-pulse pointer-events-none z-0" 
                  style={{ animationDuration: currentExercise.type === 'stretch' ? '4s' : '2s' }} 
                />
                
                {/* Abstract Kinetic Rings inside the Timer */}
                <div className="absolute inset-12 pointer-events-none select-none opacity-45 z-0">
                  <svg className={`w-full h-full ${isPaused ? '' : 'animate-spin'}`} style={{ animationDuration: currentExercise.type === 'stretch' ? '25s' : '12s' }} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="url(#kineticGrad)" strokeWidth="0.5" strokeDasharray="4 12" fill="none" />
                    <circle cx="50" cy="50" r="32" stroke="url(#kineticGrad2)" strokeWidth="0.75" strokeDasharray="25 8" fill="none" />
                    <circle cx="50" cy="50" r="22" stroke="rgba(129, 140, 248, 0.1)" strokeWidth="1" fill="none" />
                    {/* Floating nodes along the rings */}
                    <circle cx="50" cy="8" r="2" fill="#818cf8" />
                    <circle cx="50" cy="92" r="2.5" fill="#c084fc" />
                    <circle cx="18" cy="50" r="1.5" fill="#818cf8" />
                    <circle cx="82" cy="50" r="2" fill="#6366f1" />
                  </svg>
                </div>

                {/* Breathing Core */}
                <div 
                  className={`absolute w-36 h-36 rounded-full bg-gradient-to-tr from-indigo-600/5 to-purple-600/5 border border-indigo-500/5 flex items-center justify-center transition-transform duration-1000 z-0 ${
                    isPaused ? 'scale-100' : 'animate-pulse'
                  }`}
                  style={{ 
                    animationDuration: currentExercise.type === 'stretch' ? '6s' : '3.5s',
                  }}
                />

                <svg width="100%" height="100%" viewBox="0 0 200 200" className="transform -rotate-90 relative z-10">
                  <circle cx="100" cy="100" r="90" fill="transparent" stroke="#1e293b" strokeWidth="8" />
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
                  <defs>
                    <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <linearGradient id="kineticGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#c084fc" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="kineticGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
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

        {/* STEP: Rest break between exercises */}
        {currentStep === 'rest' && (
          <div className="text-center space-y-8 max-w-md w-full px-4">
            <div className="space-y-2">
              <span className="text-rose-400 font-bold uppercase tracking-widest text-sm">
                Rest Break
              </span>
              <h1 className="text-4xl sm:text-5xl font-black">Catch Your Breath</h1>
            </div>

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
                  <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-450">
                    <span>Duration: {routine.exercises[exerciseIndex + 1].duration}s</span>
                    {routine.exercises[exerciseIndex + 1].needsWeight && (
                      <span className="text-indigo-400 font-bold bg-indigo-950/65 px-1.5 py-0.2 rounded border border-indigo-900/30">
                        🏋️ {weights[routine.exercises[exerciseIndex + 1].id]} lbs
                      </span>
                    )}
                  </div>
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

        {/* STEP: Summary completion details */}
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

            {/* Stats row */}
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

            {/* List weights used */}
            {hasWeightedExercises && (
              <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-2xl text-left space-y-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">Dumbbell Weights Log</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  {routine.exercises.map((ex) => {
                    if (!ex.needsWeight) return null;
                    return (
                      <div key={ex.id} className="flex justify-between border-b border-slate-900/50 pb-0.5">
                        <span className="text-slate-350 truncate">{ex.name}</span>
                        <span className="font-bold font-mono text-indigo-400">{weights[ex.id]} lbs</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold tracking-wide text-sm transition-all transform active:scale-95 shadow-xl shadow-indigo-600/25 cursor-pointer"
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
    </div>
  );
}
