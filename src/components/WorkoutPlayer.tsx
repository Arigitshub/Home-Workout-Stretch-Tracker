import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, X, Award, Flame, Timer, CheckCircle2, Volume2, VolumeX, Dumbbell, Sparkles } from 'lucide-react';
import { Routine, Exercise, UserProfile } from '../types';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneOsc3: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  
  private bpm: number = 120;
  private isMuted: boolean = false;
  private activeType: 'workout' | 'stretch' | null = null;
  private theme: 'classic' | 'synthwave' | 'retro_8bit' | 'zen' = 'classic';
  
  private beatTimer: any = null;
  private stepCount: number = 0;

  constructor() {}

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      if (this.droneGain) this.droneGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    } else {
      if (this.droneGain && this.activeType === 'stretch') {
        const volume = this.theme === 'zen' ? 0.22 : 0.12;
        this.droneGain.gain.setValueAtTime(volume, this.ctx?.currentTime || 0);
      }
    }
  }

  setTheme(theme: 'classic' | 'synthwave' | 'retro_8bit' | 'zen') {
    const wasRunning = this.activeType !== null;
    const prevType = this.activeType;
    this.theme = theme;
    if (wasRunning && prevType) {
      this.start(prevType);
    }
  }

  setBpm(bpm: number) {
    this.bpm = bpm;
    if (this.activeType === 'workout') {
      this.restartWorkoutBeats();
    }
  }

  start(type: 'workout' | 'stretch') {
    this.init();
    if (!this.ctx) return;
    
    this.stop();
    this.activeType = type;

    if (type === 'stretch') {
      this.startStretchDrone();
    } else if (type === 'workout') {
      this.startWorkoutBeats();
    }
  }

  stop() {
    this.activeType = null;
    
    if (this.droneOsc1) {
      try { this.droneOsc1.stop(); } catch(e) {}
      this.droneOsc1.disconnect();
      this.droneOsc1 = null;
    }
    if (this.droneOsc2) {
      try { this.droneOsc2.stop(); } catch(e) {}
      this.droneOsc2.disconnect();
      this.droneOsc2 = null;
    }
    if (this.droneOsc3) {
      try { this.droneOsc3.stop(); } catch(e) {}
      this.droneOsc3.disconnect();
      this.droneOsc3 = null;
    }
    if (this.lfo) {
      try { this.lfo.stop(); } catch(e) {}
      this.lfo.disconnect();
      this.lfo = null;
    }
    if (this.lfoGain) {
      this.lfoGain.disconnect();
      this.lfoGain = null;
    }
    if (this.droneFilter) {
      this.droneFilter.disconnect();
      this.droneFilter = null;
    }
    if (this.droneGain) {
      this.droneGain.disconnect();
      this.droneGain = null;
    }

    if (this.beatTimer) {
      clearInterval(this.beatTimer);
      this.beatTimer = null;
    }
  }

  private startStretchDrone() {
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    this.droneGain = this.ctx.createGain();
    const volume = this.theme === 'zen' ? 0.22 : 0.12;
    this.droneGain.gain.setValueAtTime(this.isMuted ? 0 : volume, now);
    this.droneGain.connect(this.ctx.destination);

    if (this.theme === 'synthwave') {
      this.lfo = this.ctx.createOscillator();
      this.lfoGain = this.ctx.createGain();
      this.lfo.frequency.setValueAtTime(0.15, now);
      this.lfoGain.gain.setValueAtTime(120, now);
      
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sawtooth';
      this.droneOsc1.frequency.setValueAtTime(110, now);
      
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'sawtooth';
      this.droneOsc2.frequency.setValueAtTime(110.6, now);

      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(180, now);

      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.droneFilter.frequency);
      
      this.droneOsc1.connect(this.droneFilter);
      this.droneOsc2.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      
      this.lfo.start(now);
      this.droneOsc1.start(now);
      this.droneOsc2.start(now);

    } else if (this.theme === 'retro_8bit') {
      const notes = [261.63, 329.63, 392.00, 493.88, 523.25];
      let noteIndex = 0;
      
      this.beatTimer = setInterval(() => {
        if (this.isMuted || !this.ctx || this.ctx.state === 'suspended' || this.activeType !== 'stretch') return;
        const playTime = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(notes[noteIndex], playTime);
        noteIndex = (noteIndex + 1) % notes.length;
        
        gain.gain.setValueAtTime(0.04, playTime);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.45);
        
        osc.connect(gain);
        gain.connect(this.droneGain!);
        
        osc.start(playTime);
        osc.stop(playTime + 0.5);
      }, 500);

    } else if (this.theme === 'zen') {
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(144, now);
      
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'sine';
      this.droneOsc2.frequency.setValueAtTime(144.5, now);
      
      this.droneOsc3 = this.ctx.createOscillator();
      this.droneOsc3.type = 'sine';
      this.droneOsc3.frequency.setValueAtTime(216, now);

      this.lfo = this.ctx.createOscillator();
      this.lfoGain = this.ctx.createGain();
      this.lfo.frequency.setValueAtTime(0.06, now);
      this.lfoGain.gain.setValueAtTime(0.05, now);

      const droneSubGain = this.ctx.createGain();
      droneSubGain.gain.setValueAtTime(0.12, now);

      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(droneSubGain.gain);

      this.droneOsc1.connect(droneSubGain);
      this.droneOsc2.connect(droneSubGain);
      this.droneOsc3.connect(droneSubGain);
      droneSubGain.connect(this.droneGain);

      this.lfo.start(now);
      this.droneOsc1.start(now);
      this.droneOsc2.start(now);
      this.droneOsc3.start(now);

    } else {
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(100, now);

      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'sine';
      this.droneOsc2.frequency.setValueAtTime(108, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, now);
      
      this.droneOsc1.connect(filter);
      this.droneOsc2.connect(filter);
      filter.connect(this.droneGain);

      this.droneOsc1.start(now);
      this.droneOsc2.start(now);
    }
  }

  private startWorkoutBeats() {
    this.restartWorkoutBeats();
  }

  private restartWorkoutBeats() {
    if (this.beatTimer) {
      clearInterval(this.beatTimer);
      this.beatTimer = null;
    }
    
    const intervalMs = (60 / this.bpm) * 250;
    this.stepCount = 0;
    
    this.beatTimer = setInterval(() => {
      if (this.isMuted || !this.ctx || this.ctx.state === 'suspended' || this.activeType !== 'workout') return;
      this.playStep(this.stepCount);
      this.stepCount = (this.stepCount + 1) % 16;
    }, intervalMs);
  }

  private playStep(step: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.theme === 'synthwave') {
      if (step % 2 === 0) {
        const measure = Math.floor(this.stepCount / 16) % 4;
        let freq = 55.0;
        if (measure === 2) freq = 49.0;
        if (measure === 3) freq = 43.65;
        this.playSynthwaveBass(freq, now);
      }
      if (step === 0 || step === 8) {
        this.playKickDrum(now, 110, 35, 0.15, 0.2);
      }
      if (step === 4 || step === 12) {
        this.playSynthwaveSnare(now);
      }
      if (step % 4 === 2) {
        this.playHiHat(now, 0.02, 0.05);
      }

    } else if (this.theme === 'retro_8bit') {
      if (step % 2 === 0) {
        const measure = Math.floor(this.stepCount / 16) % 4;
        const notes = [110.0, 130.81, 146.83, 164.81];
        const freq = notes[(measure + (step / 4)) % notes.length];
        this.playRetroBass(freq, now);
      }
      if (step === 0 || step === 8) {
        this.playRetroKick(now);
      }
      if (step === 4 || step === 12) {
        this.playRetroSnare(now);
      }
      if (step % 4 === 2) {
        this.playRetroHiHat(now);
      }

    } else if (this.theme === 'zen') {
      if (step === 0) {
        this.playKickDrum(now, 75, 30, 0.25, 0.12);
      }
      if (step === 8) {
        this.playTibetanBowl(now);
      }
      if (step === 4 || step === 12) {
        this.playWoodBlock(now);
      }

    } else {
      if (step === 0 || step === 8) {
        this.playClassicKick(now);
      }
      if (step === 4 || step === 12) {
        this.playClassicHiHat(now);
      }
    }
  }

  private playClassicKick(now: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  private playClassicHiHat(now: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(8000, now);
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, now);
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  private playKickDrum(now: number, startFreq: number, endFreq: number, duration: number, vol: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.02);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  private playSynthwaveSnare(now: number) {
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.22;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1100;
      filter.Q.value = 2.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      const tone = this.ctx.createOscillator();
      const toneGain = this.ctx.createGain();
      tone.frequency.setValueAtTime(180, now);
      toneGain.gain.setValueAtTime(0.08, now);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      tone.connect(toneGain);
      toneGain.connect(this.ctx.destination);

      noise.start(now);
      tone.start(now);
      tone.stop(now + 0.12);
    } catch (e) {}
  }

  private playSynthwaveBass(freq: number, now: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + 0.04);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.12);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  private playRetroKick(now: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  private playRetroSnare(now: number) {
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1600;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch (e) {}
  }

  private playRetroHiHat(now: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(6000, now);
    gain.gain.setValueAtTime(0.015, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  private playRetroBass(freq: number, now: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  private playTibetanBowl(now: number) {
    if (!this.ctx) return;
    const freqs = [350, 700, 1050, 1400];
    const gains = [0.15, 0.06, 0.03, 0.01];
    
    freqs.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      
      gain.gain.setValueAtTime(gains[index], now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now);
      osc.stop(now + 1.6);
    });
  }

  private playWoodBlock(now: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  private playHiHat(now: number, vol: number, dur: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(9000, now);
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8000, now);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.start(now);
    osc.stop(now + dur + 0.01);
  }
}

function getBeginnerTip(exerciseName: string): string {
  const name = exerciseName.toLowerCase();
  if (name.includes('squat')) {
    return 'Keep your heels glued to the floor and knees pushing outward in line with your toes. Avoid arching your back.';
  }
  if (name.includes('plank') || name.includes('push-up') || name.includes('pushup')) {
    return 'Keep your core braced tightly. Ensure a straight line from your head to your heels; do not let your hips sag.';
  }
  if (name.includes('lunge')) {
    return 'Ensure your front knee does not slide forward past your toes. Keep your chest upright and step with control.';
  }
  if (name.includes('jack') || name.includes('climber') || name.includes('knee')) {
    return 'Land softly on the balls of your feet to protect your joints. Maintain a steady, comfortable breathing rhythm.';
  }
  if (name.includes('crunch') || name.includes('twist') || name.includes('leg') || name.includes('kick')) {
    return 'Press your lower back flat into the ground. Focus on contracting your abdominals rather than pulling on your neck.';
  }
  return 'Maintain steady, calm breathing. Focus on slow, controlled movements and full range of motion rather than speed.';
}

function getRestBreathingInfo(time: number) {
  if (time > 6) {
    // Inhale phase (4 seconds: 10, 9, 8, 7)
    const progress = (10 - time) / 3; // 0 to 1
    return {
      text: 'Inhale Deeply',
      scale: 1 + progress * 0.35,
      color: 'text-indigo-400',
      ringColor: 'stroke-indigo-500',
      bgColor: 'from-indigo-600/20 to-indigo-900/5'
    };
  } else if (time > 4) {
    // Hold phase (2 seconds: 6, 5)
    return {
      text: 'Hold Breath',
      scale: 1.35,
      color: 'text-purple-400 animate-pulse',
      ringColor: 'stroke-purple-500',
      bgColor: 'from-purple-600/25 to-purple-900/5'
    };
  } else {
    // Exhale phase (4 seconds: 4, 3, 2, 1)
    const progress = (time - 1) / 3; // 1 down to 0
    return {
      text: 'Exhale Slowly',
      scale: 1 + progress * 0.35,
      color: 'text-emerald-400',
      ringColor: 'stroke-emerald-500',
      bgColor: 'from-emerald-600/20 to-emerald-900/5'
    };
  }
}

function getAiCoachingTip(exerciseName: string, elapsedSecs: number, totalSecs: number): string | null {
  const name = exerciseName.toLowerCase();
  
  // Midpoint posture checks (announced exactly halfway through)
  const isMidpoint = elapsedSecs === Math.floor(totalSecs / 2);
  if (!isMidpoint) return null;
  
  if (name.includes('squat')) {
    return "Check your form: Keep your hips back, chest proud, and weight on your heels.";
  }
  if (name.includes('plank')) {
    return "Keep your core braced tightly. Make sure your hips aren't sagging or lifting too high.";
  }
  if (name.includes('push-up') || name.includes('pushup')) {
    return "Keep your elbows at a 45-degree angle. Push the ground away with full control.";
  }
  if (name.includes('lunge')) {
    return "Keep your torso upright. Drive up through your front heel.";
  }
  if (name.includes('downward dog') || name.includes('downward-dog') || name.includes('dog')) {
    return "Push your hips up and back. Press your heels down toward the mat.";
  }
  if (name.includes('cobra')) {
    return "Relax your shoulders down. Lift gently through your chest.";
  }
  if (name.includes('cat-cow') || name.includes('cat cow')) {
    return "Match your movement to your breath. Inhale to arch, exhale to round your back.";
  }
  if (name.includes('crunch') || name.includes('twist') || name.includes('ab')) {
    return "Focus on contracting your abdominals. Do not pull on your neck.";
  }
  if (name.includes('jack') || name.includes('jumping') || name.includes('climber') || name.includes('knee')) {
    return "Stay light on your feet! Keep a steady, fast pace.";
  }
  
  // Generic motivational tip
  return "You are halfway there. Keep breathing and stay focused.";
}

interface WorkoutPlayerProps {
  routine: Routine;
  profile?: UserProfile;
  onComplete: (stats: {
    duration: number;
    exercisesCompleted: number;
    caloriesBurned: number;
    xpEarned: number;
    weightsUsed?: { [exerciseName: string]: number };
    mood?: string;
  }) => void;
  onClose: () => void;
}

export default function WorkoutPlayer({ routine, profile, onComplete, onClose }: WorkoutPlayerProps) {
  const hasWeightedExercises = routine.exercises.some((ex) => ex.needsWeight);
  const [currentStep, setCurrentStep] = useState<'setup_weight' | 'intro' | 'active' | 'rest' | 'complete'>(
    hasWeightedExercises ? 'setup_weight' : 'intro'
  );
  
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5); // 5s intro countdown
  const [activeExerciseDuration, setActiveExerciseDuration] = useState(5);
  const [selectedMood, setSelectedMood] = useState<string>('energized');
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedState, setSavedState] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [coachCaption, setCoachCaption] = useState<string | null>(null);

  // Sound Synthesizer reference
  const synthRef = useRef<SoundSynthesizer | null>(null);

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
      utterance.rate = profile?.voiceRate ?? 1.05;
      utterance.pitch = profile?.voicePitch ?? 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
    }
  };

  const speakExerciseStart = (ex: Exercise) => {
    const weightMsg = ex.needsWeight ? ` with ${weights[ex.id]} pounds` : '';
    let msg = `Exercise: ${ex.name}${weightMsg}. Go!`;
    if (routine.difficulty === 'Beginner') {
      const setupMsg = ex.instructions && ex.instructions[0] ? `. Setup: ${ex.instructions[0]}` : '';
      msg = `Exercise: ${ex.name}${weightMsg}${setupMsg}. Go!`;
    }
    speakText(msg);
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

  // Get active progress percentage
  const getSimulatedHeartRate = () => {
    if (isPaused) return 70;
    
    if (currentStep === 'intro' || currentStep === 'setup_weight' || currentStep === 'complete') {
      return 70;
    }
    
    const totalDurationVal = currentStep === 'active' && currentExercise ? activeExerciseDuration : 10;
    
    if (currentStep === 'active' && currentExercise) {
      const isCardio = currentExercise.name.toLowerCase().includes('jack') || 
                       currentExercise.name.toLowerCase().includes('climber') || 
                       currentExercise.name.toLowerCase().includes('knee') ||
                       currentExercise.name.toLowerCase().includes('hiit') ||
                       currentExercise.name.toLowerCase().includes('squat');
      const baseBpm = currentExercise.type === 'workout' ? (isCardio ? 110 : 95) : 65;
      const peakBpm = currentExercise.type === 'workout' ? (isCardio ? 165 : 130) : 75;
      
      const elapsedFraction = (totalDurationVal - timeLeft) / totalDurationVal;
      return Math.round(baseBpm + (peakBpm - baseBpm) * elapsedFraction);
    }
    
    if (currentStep === 'rest') {
      const elapsedFraction = (10 - timeLeft) / 10;
      return Math.round(135 - (135 - 82) * elapsedFraction);
    }
    
    return 70;
  };

  const bpm = getSimulatedHeartRate();
  const pulseDuration = `${60 / bpm}s`;

  const triggerVibration = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.warn('Vibration failed:', e);
      }
    }
  };

  // Sound Synthesizer hooks
  useEffect(() => {
    synthRef.current = new SoundSynthesizer();
    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.setMuted(!soundEnabled);
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.setBpm(bpm);
    }
  }, [bpm]);

  useEffect(() => {
    if (!synthRef.current) return;
    if (currentStep === 'active' && currentExercise && !isPaused) {
      synthRef.current.start(currentExercise.type);
    } else {
      synthRef.current.stop();
    }
  }, [currentStep, exerciseIndex, isPaused, currentExercise]);

  // Check state protection on mount
  useEffect(() => {
    const raw = localStorage.getItem('fittrack_active_workout');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.routineId === routine.id && Date.now() - parsed.timestamp < 7200000) {
          setSavedState(parsed);
          setShowResumePrompt(true);
        } else {
          localStorage.removeItem('fittrack_active_workout');
        }
      } catch (e) {
        console.error('State protection loading failed:', e);
      }
    }
  }, [routine.id]);

  // Save active workout state to localStorage
  useEffect(() => {
    if (['active', 'rest'].includes(currentStep)) {
      const stateToSave = {
        routineId: routine.id,
        exerciseIndex,
        timeLeft,
        currentStep,
        totalSecsCompleted,
        completedExerciseIds,
        weights,
        activeExerciseDuration,
        timestamp: Date.now()
      };
      localStorage.setItem('fittrack_active_workout', JSON.stringify(stateToSave));
    } else if (currentStep === 'complete') {
      localStorage.removeItem('fittrack_active_workout');
    }
  }, [currentStep, exerciseIndex, timeLeft, totalSecsCompleted, completedExerciseIds, weights, activeExerciseDuration, routine.id]);

  // Main countdown loop
  useEffect(() => {
    if (isPaused || currentStep === 'complete' || currentStep === 'setup_weight' || showResumePrompt) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 4 && prev > 1) {
          playBeep(600, 0.08);
          triggerVibration(60);
        } else if (prev === 1) {
          playBeep(1200, 0.25);
          triggerVibration([120, 80, 120]);
        }

        if (prev <= 1) {
          handleTimerEnd();
          return 0;
        }

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
  }, [currentStep, exerciseIndex, isPaused, soundEnabled, showResumePrompt]);

  const handleTimerEnd = () => {
    setCoachCaption(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentStep === 'intro') {
      setCurrentStep('active');
      const firstEx = routine.exercises[0];
      setTimeLeft(firstEx.duration);
      setActiveExerciseDuration(firstEx.duration);
      speakExerciseStart(firstEx);
    } else if (currentStep === 'active') {
      if (currentExercise && !completedExerciseIds.includes(currentExercise.id)) {
        setCompletedExerciseIds((prev) => [...prev, currentExercise.id]);
      }

      if (exerciseIndex < routine.exercises.length - 1) {
        setCurrentStep('rest');
        setTimeLeft(10);
        setActiveExerciseDuration(10);
        const nextEx = routine.exercises[exerciseIndex + 1];
        speakText(`Rest time. Next up is ${nextEx.name}.`);
      } else {
        handleCompletion();
      }
    } else if (currentStep === 'rest') {
      const nextIndex = exerciseIndex + 1;
      setExerciseIndex(nextIndex);
      setCurrentStep('active');
      const nextEx = routine.exercises[nextIndex];
      setTimeLeft(nextEx.duration);
      setActiveExerciseDuration(nextEx.duration);
      speakExerciseStart(nextEx);
    }
  };

  const handleCompletion = () => {
    setCoachCaption(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
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
    setCoachCaption(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentStep === 'intro') {
      setCurrentStep('active');
      const firstEx = routine.exercises[0];
      setTimeLeft(firstEx.duration);
      setActiveExerciseDuration(firstEx.duration);
      speakExerciseStart(firstEx);
    } else if (currentStep === 'active') {
      if (currentExercise && !completedExerciseIds.includes(currentExercise.id)) {
        setCompletedExerciseIds((prev) => [...prev, currentExercise.id]);
      }
      if (exerciseIndex < routine.exercises.length - 1) {
        setCurrentStep('rest');
        setTimeLeft(10);
        setActiveExerciseDuration(10);
        speakText(`Skipped. Rest time.`);
      } else {
        handleCompletion();
      }
    } else if (currentStep === 'rest') {
      const nextIndex = exerciseIndex + 1;
      setExerciseIndex(nextIndex);
      setCurrentStep('active');
      const nextEx = routine.exercises[nextIndex];
      setTimeLeft(nextEx.duration);
      setActiveExerciseDuration(nextEx.duration);
      speakExerciseStart(nextEx);
    }
  };

  const handleBack = () => {
    setCoachCaption(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentStep === 'active' && exerciseIndex > 0) {
      const prevIndex = exerciseIndex - 1;
      setExerciseIndex(prevIndex);
      setCurrentStep('active');
      const prevEx = routine.exercises[prevIndex];
      setTimeLeft(prevEx.duration);
      setActiveExerciseDuration(prevEx.duration);
      speakExerciseStart(prevEx);
    } else if (currentStep === 'rest') {
      setCurrentStep('active');
      const currentEx = routine.exercises[exerciseIndex];
      setTimeLeft(currentEx.duration);
      setActiveExerciseDuration(currentEx.duration);
      speakExerciseStart(currentEx);
    } else {
      const currentEx = routine.exercises[exerciseIndex];
      setTimeLeft(currentEx.duration);
      setActiveExerciseDuration(currentEx.duration);
      speakExerciseStart(currentEx);
    }
  };

  const adjustTime = (seconds: number) => {
    setTimeLeft((prev) => {
      const newTimeLeft = Math.max(1, prev + seconds);
      if (seconds > 0) {
        setActiveExerciseDuration((d) => d + seconds);
      } else {
        setActiveExerciseDuration((d) => Math.max(newTimeLeft, d + seconds));
      }
      return newTimeLeft;
    });
    playBeep(880, 0.05);
  };

  const togglePause = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    if (nextPaused) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setCoachCaption(null);
    }
  };

  const handleSave = () => {
    const workoutSecs = routine.exercises
      .filter((ex) => ex.type === 'workout')
      .reduce((sum, ex) => sum + ex.duration, 0);
    const stretchSecs = routine.exercises
      .filter((ex) => ex.type === 'stretch')
      .reduce((sum, ex) => sum + ex.duration, 0);

    const estCalories = Math.round(workoutSecs * 0.15 + stretchSecs * 0.05);

    const durationMins = totalSecsCompleted / 60;
    const estXp = Math.round(durationMins * 10 + completedExerciseIds.length * 5);

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
      weightsUsed: weightsLog,
      mood: selectedMood
    });
  };

  const totalDuration = activeExerciseDuration || 1;
  const progressPct = timeLeft / totalDuration;
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

  // Step-by-step coaching for Beginners
  useEffect(() => {
    if (currentStep === 'active' && currentExercise && routine.difficulty === 'Beginner') {
      // Skip the first setup step (index 0) because speakExerciseStart already read it as part of the startup setup.
      if (activeInstructionIndex > 0) {
        const activeInstruction = currentExercise.instructions[activeInstructionIndex];
        if (activeInstruction) {
          speakText(`Step ${activeInstructionIndex + 1}: ${activeInstruction}`);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeInstructionIndex, currentStep, exerciseIndex]);

  // Vocal breathing prompts during rest breaks
  useEffect(() => {
    if (currentStep === 'rest') {
      if (timeLeft === 10) {
        speakText("Rest break. Inhale deeply.");
      } else if (timeLeft === 6) {
        speakText("Hold your breath.");
      } else if (timeLeft === 4) {
        speakText("Exhale slowly.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, currentStep]);

  // AI Coaching Posture Tips
  useEffect(() => {
    if (currentStep === 'active' && currentExercise && !isPaused) {
      const elapsed = totalDuration - timeLeft;
      const tip = getAiCoachingTip(currentExercise.name, elapsed, totalDuration);
      if (tip) {
        speakText(tip);
        setCoachCaption(tip);
        const timer = setTimeout(() => setCoachCaption(null), 5000);
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, currentStep, isPaused, totalDuration]);

  // Clear coaching caption and cancel TTS if paused
  useEffect(() => {
    if (isPaused) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setCoachCaption(null);
    }
  }, [isPaused]);

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
            onClick={() => {
              const nextVal = !soundEnabled;
              setSoundEnabled(nextVal);
              if (!nextVal) {
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                setCoachCaption(null);
              }
            }}
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
              {routine.difficulty === 'Beginner' && (
                <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-3.5 flex items-start space-x-2.5 mt-4">
                  <span className="text-base text-indigo-400 select-none animate-bounce">💡</span>
                  <div className="flex-1">
                    <span className="text-[10px] font-black uppercase text-indigo-400 block tracking-wider">Coach Form Tip</span>
                    <p className="text-xs text-indigo-200/90 leading-relaxed mt-0.5 font-medium font-mono">
                      {getBeginnerTip(currentExercise.name)}
                    </p>
                  </div>
                </div>
              )}
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

                {/* Heart Rate Neon Badge */}
                <div 
                  className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/90 border border-rose-500/30 text-[10px] font-black text-rose-455 flex items-center space-x-1.5 shadow-lg shadow-rose-950/20 backdrop-blur z-30"
                >
                  <span 
                    className="inline-block text-rose-550 animate-pulse" 
                    style={{ animationDuration: pulseDuration }}
                  >
                    ❤️
                  </span>
                  <span className="font-mono">{bpm} BPM</span>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
                  <span className="text-6xl md:text-7xl font-black font-mono leading-none">
                    {timeLeft}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-slate-400 mt-2 font-bold">
                    Seconds Left
                  </span>

                  {/* Neon Pulse ECG Wave */}
                  <svg className="w-16 h-6 text-rose-500/40 opacity-75 mt-2.5 pointer-events-none" viewBox="0 0 100 30" fill="none">
                    <path 
                      d="M0,15 L30,15 L35,5 L40,25 L45,12 L48,18 L53,15 L100,15" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="animate-pulse"
                      style={{ animationDuration: pulseDuration }}
                    />
                  </svg>

                  {/* Dynamic Exercise Visual Animation Helper */}
                  {currentExercise.type === 'stretch' && (
                    <div className="flex flex-col items-center mt-2 scale-90">
                      <span className="text-[8px] uppercase tracking-wider text-purple-400 font-extrabold animate-pulse">Deep Breath Flow</span>
                      <svg className="w-6 h-6 text-purple-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="8" className="animate-ping" style={{ animationDuration: '4s' }} />
                        <circle cx="12" cy="12" r="5" />
                      </svg>
                    </div>
                  )}
                  {currentExercise.type === 'workout' && currentExercise.needsWeight && (
                    <div className="flex flex-col items-center mt-2 scale-90">
                      <span className="text-[8px] uppercase tracking-wider text-indigo-400 font-extrabold animate-pulse">Power Reps</span>
                      <svg className="w-8 h-5 text-indigo-400 mt-0.5" viewBox="0 0 40 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <g className="animate-bounce" style={{ animationDuration: '2s' }}>
                          <line x1="8" y1="10" x2="32" y2="10" />
                          <rect x="4" y="6" width="4" height="8" rx="1" fill="currentColor" />
                          <rect x="1" y="8" width="3" height="4" rx="0.5" fill="currentColor" />
                          <rect x="32" y="6" width="4" height="8" rx="1" fill="currentColor" />
                          <rect x="36" y="8" width="3" height="4" rx="0.5" fill="currentColor" />
                        </g>
                      </svg>
                    </div>
                  )}
                  {currentExercise.type === 'workout' && !currentExercise.needsWeight && (
                    <div className="flex flex-col items-center mt-2 scale-90">
                      <span className="text-[8px] uppercase tracking-wider text-rose-455 font-extrabold animate-pulse">Burn Zone</span>
                      <svg className="w-10 h-5 text-rose-500 mt-0.5" viewBox="0 0 40 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path 
                          d="M5,10 Q10,0 15,10 T25,10 T35,10" 
                          className="animate-pulse" 
                          strokeDasharray="3 1" 
                          style={{ animationDuration: '0.8s' }} 
                        />
                        <path 
                          d="M5,10 Q10,20 15,10 T25,10 T35,10" 
                          className="animate-pulse" 
                          style={{ animationDuration: '0.8s' }} 
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Player Quick Controls */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => adjustTime(-10)}
                  className="px-3 py-2 text-xs font-bold font-mono rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-rose-400 hover:text-rose-350 transition-colors cursor-pointer"
                  title="Shorten 10 seconds"
                >
                  -10s
                </button>

                <button
                  onClick={handleBack}
                  className="p-3.5 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={togglePause}
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

                <button
                  onClick={() => adjustTime(10)}
                  className="px-3 py-2 text-xs font-bold font-mono rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-emerald-400 hover:text-emerald-350 transition-colors cursor-pointer"
                  title="Extend 10 seconds"
                >
                  +10s
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP: Rest break between exercises */}
        {currentStep === 'rest' && (() => {
          const breathInfo = getRestBreathingInfo(timeLeft);
          return (
            <div className="text-center space-y-8 max-w-md w-full px-4 relative z-20">
              <div className="space-y-2">
                <span className="text-rose-450 font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>Recovery Rest Break</span>
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Catch Your Breath</h1>
              </div>

              {/* Dynamic Breathing Recovery Ring */}
              <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
                {/* Heart Rate Neon Badge in Rest Mode */}
                <div 
                  className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/90 border border-rose-500/30 text-[10px] font-black text-rose-455 flex items-center space-x-1.5 shadow-lg shadow-rose-950/20 backdrop-blur z-30"
                >
                  <span 
                    className="inline-block text-rose-550 animate-pulse" 
                    style={{ animationDuration: pulseDuration }}
                  >
                    ❤️
                  </span>
                  <span className="font-mono">{bpm} BPM</span>
                </div>

                {/* Glowing breathing aura backdrop */}
                <div 
                  className={`absolute inset-4 rounded-full bg-gradient-to-tr ${breathInfo.bgColor} blur-xl transition-all duration-1000 transform opacity-65`}
                  style={{ transform: `scale(${breathInfo.scale})` }}
                />

                {/* Concentric rings */}
                <div className="absolute inset-2 rounded-full border border-slate-900 pointer-events-none" />
                <div 
                  className="absolute inset-10 rounded-full border border-indigo-500/10 pointer-events-none transition-transform duration-1000"
                  style={{ transform: `scale(${breathInfo.scale * 0.95})` }}
                />

                <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90 absolute inset-0 z-10">
                  <circle cx="50" cy="50" r="45" fill="transparent" stroke="#0f172a" strokeWidth="3" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke="url(#restGrad)"
                    strokeWidth="3.5"
                    strokeDasharray={2 * Math.PI * 45}
                    strokeDashoffset={2 * Math.PI * 45 * (1 - timeLeft / 10)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                  <defs>
                    <linearGradient id="restGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Central text prompt */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 transition-transform duration-1000" style={{ transform: `scale(${breathInfo.scale * 0.85})` }}>
                  <span className="text-4xl font-black font-mono leading-none tracking-tight">
                    {timeLeft}s
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-wider mt-2 transition-colors duration-500 ${breathInfo.color}`}>
                    {breathInfo.text}
                  </span>
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
          );
        })()}

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

            {/* Mood log selector */}
            <div className="space-y-3 text-left">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">
                How do you feel right now?
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: 'energized', label: 'Energized', emoji: '⚡', color: 'border-amber-500/20 text-amber-400 bg-amber-950/10 hover:bg-amber-950/20' },
                  { value: 'restored', label: 'Restored', emoji: '🧘', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-950/10 hover:bg-emerald-950/20' },
                  { value: 'exhausted', label: 'Exhausted', emoji: '🥵', color: 'border-rose-500/20 text-rose-400 bg-rose-950/10 hover:bg-rose-950/20' },
                  { value: 'tired', label: 'Tired', emoji: '😴', color: 'border-blue-500/20 text-blue-400 bg-blue-950/10 hover:bg-blue-950/20' }
                ].map((mood) => {
                  const isSelected = selectedMood === mood.value;
                  return (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setSelectedMood(mood.value)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-300 relative cursor-pointer hover:scale-[1.02] ${
                        isSelected 
                          ? 'bg-slate-900 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.2)] scale-[1.02]' 
                          : `${mood.color} opacity-70`
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-[8px] text-white">
                          ✓
                        </span>
                      )}
                      <span className="text-xl mb-1">{mood.emoji}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider">{mood.label}</span>
                    </button>
                  );
                })}
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

      {/* AI Coach Caption Subtitle Overlay */}
      {coachCaption && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-40 bg-indigo-950/90 border border-indigo-550/40 text-indigo-200 px-5 py-2.5 rounded-2xl text-xs text-center max-w-xs sm:max-w-md shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300 font-medium leading-relaxed flex items-center space-x-2 border-l-4 border-l-indigo-500">
          <span className="text-amber-400 animate-pulse flex-shrink-0">🎙️ AI Coach:</span>
          <span className="text-left">{coachCaption}</span>
        </div>
      )}

      {/* State Protection Resume Modal Overlay */}
      {showResumePrompt && savedState && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-indigo-500/30 max-w-md w-full rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden transform scale-100 transition-all duration-300 animate-in zoom-in-95">
            <div className="absolute -top-10 -left-10 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-indigo-950/50 border border-indigo-700/50 flex items-center justify-center text-indigo-400 mx-auto mb-2">
              <Timer className="w-7 h-7 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-xs text-indigo-400 font-extrabold uppercase tracking-widest">Workout Interrupted</span>
              <h2 className="text-2xl font-black">Resume Your Workout?</h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                We saved your active place in <strong>{routine.title}</strong> before your session was closed or refreshed.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Exercise:</span>
                <span className="font-bold text-white">
                  {routine.exercises[savedState.exerciseIndex]?.name || `Exercise ${savedState.exerciseIndex + 1}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time remaining:</span>
                <span className="font-mono font-bold text-indigo-400">{savedState.timeLeft} seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Completed so far:</span>
                <span className="font-bold text-white">{savedState.completedExerciseIds.length} / {routine.exercises.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('fittrack_active_workout');
                  setShowResumePrompt(false);
                }}
                className="py-3.5 rounded-xl border border-slate-800 hover:bg-slate-850 hover:text-white text-slate-400 font-bold text-xs transition-colors cursor-pointer"
              >
                Start Over
              </button>
              <button
                type="button"
                onClick={() => {
                  setExerciseIndex(savedState.exerciseIndex);
                  setTimeLeft(savedState.timeLeft);
                  setCurrentStep(savedState.currentStep);
                  setTotalSecsCompleted(savedState.totalSecsCompleted);
                  setCompletedExerciseIds(savedState.completedExerciseIds);
                  if (savedState.weights) setWeights(savedState.weights);
                  if (savedState.activeExerciseDuration) setActiveExerciseDuration(savedState.activeExerciseDuration);
                  setIsPaused(true); // resume in paused state
                  setShowResumePrompt(false);
                }}
                className="py-3.5 rounded-xl bg-gradient-to-r from-indigo-650 to-violet-650 hover:from-indigo-600 hover:to-violet-600 text-white font-extrabold text-xs transition-all shadow-lg shadow-indigo-950/30 cursor-pointer"
              >
                Resume Flow
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
