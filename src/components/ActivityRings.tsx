interface ActivityRingsProps {
  minutesCompleted: number;
  minutesGoal: number;
  stretchesCompleted: number;
  stretchesGoal: number;
  caloriesBurned: number;
  caloriesGoal: number;
}

export default function ActivityRings({
  minutesCompleted,
  minutesGoal,
  stretchesCompleted,
  stretchesGoal,
  caloriesBurned,
  caloriesGoal
}: ActivityRingsProps) {
  // SVG Constants
  const size = 180;
  const strokeWidth = 14;
  const center = size / 2;

  // Ring 1 (Minutes) - Outer
  const r1 = 75;
  const circ1 = 2 * Math.PI * r1;
  const pct1 = Math.min(minutesCompleted / (minutesGoal || 1), 1);
  const strokeDashoffset1 = circ1 - pct1 * circ1;

  // Ring 2 (Stretches) - Middle
  const r2 = 58;
  const circ2 = 2 * Math.PI * r2;
  const pct2 = Math.min(stretchesCompleted / (stretchesGoal || 1), 1);
  const strokeDashoffset2 = circ2 - pct2 * circ2;

  // Ring 3 (Calories) - Inner
  const r3 = 41;
  const circ3 = 2 * Math.PI * r3;
  const pct3 = Math.min(caloriesBurned / (caloriesGoal || 1), 1);
  const strokeDashoffset3 = circ3 - pct3 * circ3;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around bg-gradient-to-br from-indigo-900/40 to-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl dark:border-white/5">
      {/* Rings Visual */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Defs for gradients */}
          <defs>
            <linearGradient id="minutesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" /> {/* Indigo-400 */}
              <stop offset="100%" stopColor="#4f46e5" /> {/* Indigo-600 */}
            </linearGradient>
            <linearGradient id="stretchesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" /> {/* Rose-500 */}
              <stop offset="100%" stopColor="#be123c" /> {/* Rose-700 */}
            </linearGradient>
            <linearGradient id="caloriesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" /> {/* Emerald-500 */}
              <stop offset="100%" stopColor="#047857" /> {/* Emerald-700 */}
            </linearGradient>
          </defs>

          {/* Backgrounds */}
          <circle
            cx={center}
            cy={center}
            r={r1}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            opacity="0.3"
          />
          <circle
            cx={center}
            cy={center}
            r={r2}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            opacity="0.3"
          />
          <circle
            cx={center}
            cy={center}
            r={r3}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            opacity="0.3"
          />

          {/* Interactive Progress Rings */}
          <circle
            cx={center}
            cy={center}
            r={r1}
            fill="transparent"
            stroke="url(#minutesGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circ1}
            strokeDashoffset={strokeDashoffset1}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <circle
            cx={center}
            cy={center}
            r={r2}
            fill="transparent"
            stroke="url(#stretchesGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circ2}
            strokeDashoffset={strokeDashoffset2}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <circle
            cx={center}
            cy={center}
            r={r3}
            fill="transparent"
            stroke="url(#caloriesGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circ3}
            strokeDashoffset={strokeDashoffset3}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-white">
            {Math.round((pct1 + pct2 + pct3) * 33.3)}%
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">
            Daily Goal
          </span>
        </div>
      </div>

      {/* Legend & Stats */}
      <div className="mt-6 sm:mt-0 space-y-4 w-full sm:w-1/2 max-w-[200px]">
        {/* Minutes stat */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded-full bg-indigo-500" />
            <span className="text-sm font-medium text-slate-200">Exercise Time</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-white">{Math.round(minutesCompleted)}</span>
            <span className="text-xs text-slate-400">/{minutesGoal}m</span>
          </div>
        </div>

        {/* Stretches stat */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500" />
            <span className="text-sm font-medium text-slate-200">Routines Completed</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-white">{stretchesCompleted}</span>
            <span className="text-xs text-slate-400">/{stretchesGoal}</span>
          </div>
        </div>

        {/* Calories stat */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-slate-200">Est. Calories</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-white">{Math.round(caloriesBurned)}</span>
            <span className="text-xs text-slate-400">/{caloriesGoal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
