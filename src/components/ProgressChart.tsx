import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { WorkoutLog } from '../types';
import { Dumbbell, TrendingUp } from 'lucide-react';

interface ProgressChartProps {
  logs?: WorkoutLog[];
}

export default function ProgressChart({ logs = [] }: ProgressChartProps) {
  const [metric, setMetric] = useState<'workouts' | 'minutes' | 'calories'>('workouts');

  // Days of the week in order starting from Monday
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Map day numbers from Date.getDay() (0=Sun, 1=Mon, ..., 6=Sat) to index in dayNames (0=Mon, ..., 6=Sun)
  const getDayIndex = (dateString: string) => {
    const d = new Date(dateString);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday...
    return day === 0 ? 6 : day - 1;
  };

  // Compile last 7 days metrics
  const last7DaysData = dayNames.map((name) => ({
    name,
    workouts: 0,
    minutes: 0,
    calories: 0
  }));

  // Populate from logs (only from current week)
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  logs.forEach((log) => {
    const logDate = new Date(log.date);
    if (logDate >= oneWeekAgo) {
      const idx = getDayIndex(log.date);
      if (idx >= 0 && idx < 7) {
        last7DaysData[idx].workouts += 1;
        last7DaysData[idx].minutes += Math.round(log.duration / 60);
        last7DaysData[idx].calories += log.caloriesBurned;
      }
    }
  });

  const hasData = logs.length > 0;
  const chartData = last7DaysData;

  const getActiveMetricLabel = () => {
    switch (metric) {
      case 'workouts': return 'Workout Count';
      case 'minutes': return 'Active Minutes';
      case 'calories': return 'Calories (kcal)';
    }
  };

  const getMetricColor = () => {
    switch (metric) {
      case 'workouts': return '#6366f1'; // Indigo-500
      case 'minutes': return '#f43f5e';  // Rose-500
      case 'calories': return '#10b981'; // Emerald-500
    }
  };

  const activeColor = getMetricColor();

  // --- DUMBBELL PROGRESSION LOGIC ---
  // Filter logs that have weightsUsed
  const weightedLogs = logs
    .filter((log) => log.weightsUsed && Object.keys(log.weightsUsed).length > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Find all unique exercises that used weights
  const weightedExercises = Array.from(
    new Set(
      weightedLogs.flatMap((log) => log.weightsUsed ? Object.keys(log.weightsUsed) : [])
    )
  );

  const [selectedExercise, setSelectedExercise] = useState<string>(() => {
    return weightedExercises[0] || '';
  });

  // Keep state synchronized if logs change
  const currentSelect = selectedExercise || weightedExercises[0] || '';

  // Compile data for line chart
  const progressionData = currentSelect
    ? weightedLogs
        .filter((log) => log.weightsUsed && log.weightsUsed[currentSelect] !== undefined)
        .map((log) => {
          const d = new Date(log.date);
          return {
            dateStr: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            weight: log.weightsUsed ? log.weightsUsed[currentSelect] : 0,
          };
        })
    : [];

  const hasProgressionData = progressionData.length > 0;

  return (
    <div className="space-y-6">
      {/* Weekly Performance Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700/60 transition-all duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
          <div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Weekly Performance</h3>
            <p className="text-xs text-gray-400">
              {hasData ? "Displaying your logged activity this week." : "No workouts logged this week yet."}
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex bg-gray-100 dark:bg-gray-900 rounded-xl p-0.5 text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setMetric('workouts')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all ${
                metric === 'workouts'
                  ? 'bg-white dark:bg-gray-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
            >
              Workouts
            </button>
            <button
              onClick={() => setMetric('minutes')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all ${
                metric === 'minutes'
                  ? 'bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-450 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
            >
              Minutes
            </button>
            <button
              onClick={() => setMetric('calories')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all ${
                metric === 'calories'
                  ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-450 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
            >
              Calories
            </button>
          </div>
        </div>

        {/* Chart Visualizer */}
        <div className="h-56 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }}
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  borderColor: 'rgba(99, 102, 241, 0.3)',
                  borderRadius: '16px',
                  fontSize: '12px',
                  color: '#fff',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
                  borderWidth: '1px'
                }}
                formatter={(value: number | string) => [`${value} ${metric === 'workouts' ? '' : metric === 'minutes' ? 'min' : 'kcal'}`, getActiveMetricLabel()]}
              />
              <Bar dataKey={metric} radius={[6, 6, 0, 0]} maxBarSize={32} style={{ filter: `drop-shadow(0px 0px 4px ${activeColor}80)` }}>
                {chartData.map((entry, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry[metric] > 0 ? activeColor : 'rgba(148, 163, 184, 0.15)'}
                    className="transition-all duration-500"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dumbbell Progression Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700/60 transition-all duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
          <div>
            <div className="flex items-center space-x-2">
              <Dumbbell className="w-5 h-5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">Dumbbell Load Progression</h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {hasProgressionData 
                ? `Tracking weight load progress for ${currentSelect}.` 
                : "No dumbbell weight logs found. Adjust weights inside a routine player to begin tracking."}
            </p>
          </div>

          {/* Exercise Dropdown Selector */}
          {weightedExercises.length > 0 && (
            <div className="w-full sm:w-auto relative">
              <select
                value={currentSelect}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="w-full sm:w-auto text-xs bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl px-3.5 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold appearance-none pr-8 cursor-pointer"
              >
                {weightedExercises.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">
                ▼
              </div>
            </div>
          )}
        </div>

        {hasProgressionData ? (
          <div className="h-56 w-full mt-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <filter id="areaGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <XAxis
                  dataKey="dateStr"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  label={{ value: 'lbs', angle: -90, position: 'insideLeft', offset: 10, fill: '#94a3b8', style: { fontSize: '10px', fontWeight: 'bold' } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    color: '#fff',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
                    borderWidth: '1px'
                  }}
                  formatter={(value: number | string) => [`${value} lbs`, 'Selected Load']}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#6366f1"
                  strokeWidth={3}
                  filter="url(#areaGlowFilter)"
                  fillOpacity={1}
                  fill="url(#colorWeight)"
                  dot={{ r: 4, stroke: '#6366f1', strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#6366f1', style: { filter: 'drop-shadow(0px 0px 8px #6366f1)' } }}
                />
              </AreaChart>
            </ResponsiveContainer>
            
            {/* Progression Insights Badge */}
            {progressionData.length > 1 && (() => {
              const firstWeight = progressionData[0].weight;
              const lastWeight = progressionData[progressionData.length - 1].weight;
              const diff = lastWeight - firstWeight;
              if (diff > 0) {
                return (
                  <div className="absolute top-0 right-2 flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-1 rounded-full text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wide">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+{diff} lbs Lifted Growth</span>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        ) : (
          <div className="h-56 flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-gray-700/80 rounded-2xl p-6 text-center bg-gray-50/50 dark:bg-gray-900/10">
            <Dumbbell className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3 animate-bounce" />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-350">Ready to Track Strength?</span>
            <p className="text-xs text-gray-400 max-w-xs mt-1 leading-relaxed">
              When you play routines configured with weights, your load logs will appear here as a strength progression timeline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
