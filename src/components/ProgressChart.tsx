import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { WorkoutLog } from '../types';

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

  // Fallback to static demo data if there are no logs to show, so the user doesn't see a blank chart
  const hasData = logs.length > 0;
  const chartData = hasData
    ? last7DaysData
    : [
        { name: 'Mon', workouts: 1, minutes: 15, calories: 120 },
        { name: 'Tue', workouts: 2, minutes: 40, calories: 310 },
        { name: 'Wed', workouts: 0, minutes: 0, calories: 0 },
        { name: 'Thu', workouts: 3, minutes: 45, calories: 380 },
        { name: 'Fri', workouts: 1, minutes: 20, calories: 150 },
        { name: 'Sat', workouts: 2, minutes: 30, calories: 250 },
        { name: 'Sun', workouts: 1, minutes: 10, calories: 80 }
      ];

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700/60 transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
        <div>
          <h3 className="font-bold text-lg text-gray-800 dark:text-white">Weekly Performance</h3>
          <p className="text-xs text-gray-400">
            {hasData ? "Displaying your logged activity this week." : "Sample data (no workouts logged yet)."}
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
              cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#fff'
              }}
              formatter={(value: number | string) => [`${value} ${metric === 'workouts' ? '' : metric === 'minutes' ? 'min' : 'kcal'}`, getActiveMetricLabel()]}
            />
            <Bar dataKey={metric} radius={[4, 4, 0, 0]} maxBarSize={32}>
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
  );
}
