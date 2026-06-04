import { Award, Flame, Zap, Shield, Sparkles, Trophy, Heart } from 'lucide-react';

export interface Badge {
  id: string;
  name: string;
  description: string;
  requirement: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string; // colors for gradients
}

export const badgesList: Badge[] = [
  {
    id: 'first_flow',
    name: 'First Flow',
    description: 'Logged your very first workout or stretch session.',
    requirement: 'Complete 1 routine',
    icon: Award,
    colorClass: 'from-blue-500 to-indigo-650'
  },
  {
    id: 'dumbbell_master',
    name: 'Iron Grip',
    description: 'Completed a workout utilizing dumbbell resistance weights.',
    requirement: 'Complete any dumbbell routine',
    icon: Shield,
    colorClass: 'from-slate-700 to-slate-900'
  },
  {
    id: 'streak_3',
    name: 'Consistency Hero',
    description: 'Maintained a active daily workout streak of 3 days or more.',
    requirement: 'Reach a 3-day active streak',
    icon: Flame,
    colorClass: 'from-rose-500 to-orange-500'
  },
  {
    id: 'calories_500',
    name: 'Calorie Incinerator',
    description: 'Burned a cumulative total of 500 estimated calories.',
    requirement: 'Burn 500+ cumulative kcal',
    icon: Zap,
    colorClass: 'from-amber-400 to-orange-600'
  },
  {
    id: 'night_owl',
    name: 'Midnight Warrior',
    description: 'Completed a workout session late at night (after 9:00 PM).',
    requirement: 'Complete a workout after 9:00 PM',
    icon: Sparkles,
    colorClass: 'from-indigo-900 to-purple-950'
  },
  {
    id: 'early_bird',
    name: 'Dawn Patrol',
    description: 'Completed a workout session early in the morning (before 8:00 AM).',
    requirement: 'Complete a workout before 8:00 AM',
    icon: Heart,
    colorClass: 'from-sky-400 to-emerald-450'
  },
  {
    id: 'custom_pioneer',
    name: 'Custom Pioneer',
    description: 'Saved and completed your own customized workout routine.',
    requirement: 'Build and complete 1 custom routine',
    icon: Trophy,
    colorClass: 'from-yellow-400 to-amber-550'
  }
];
