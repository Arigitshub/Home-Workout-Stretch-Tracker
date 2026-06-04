export interface Exercise {
  id: string;
  name: string;
  duration: number; // in seconds
  description: string;
  instructions: string[];
  type: 'workout' | 'stretch';
  needsWeight?: boolean;
  weightLbs?: number;
}

export interface Routine {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g. "15 min"
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  image: string;
  exercises: Exercise[];
  isCustom?: boolean;
}

export interface WorkoutLog {
  id: string;
  routineId: string;
  routineTitle: string;
  date: string; // ISO string
  duration: number; // in seconds
  exercisesCompleted: number;
  caloriesBurned: number;
  xpEarned: number;
  weightsUsed?: { [exerciseName: string]: number };
}

export interface UserProfile {
  name: string;
  xp: number;
  dailyMinutesGoal: number;
  dailyStretchesGoal: number;
  weightKg: number;
  unlockedBadges?: string[];
  voiceRate?: number;
  voicePitch?: number;
}

