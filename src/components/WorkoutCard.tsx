import { Play, Clock } from 'lucide-react';

interface WorkoutCardProps {
  title: string;
  duration: string;
  difficulty: string;
  image: string;
  description?: string;
  exerciseCount?: number;
  onPlay?: () => void;
}

export default function WorkoutCard({
  title,
  duration,
  difficulty,
  image,
  description,
  exerciseCount,
  onPlay
}: WorkoutCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
      <div className="relative h-44 sm:h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

        {/* Floating exercises pill */}
        {exerciseCount && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-black/60 backdrop-blur-xs text-white border border-white/10 uppercase tracking-wider">
            {exerciseCount} steps
          </span>
        )}

        {/* Guided Player trigger button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onPlay) onPlay();
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-lg transition-all scale-95 group-hover:scale-105 active:scale-95 cursor-pointer z-10"
        >
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </button>
      </div>

      <div className="p-5">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
          {difficulty}
        </span>
        <h3 className="font-extrabold text-lg text-gray-850 dark:text-white mt-1 group-hover:text-indigo-650 dark:group-hover:text-indigo-455 transition-colors line-clamp-1">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed h-8">
            {description}
          </p>
        )}

        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1 text-slate-400" />
            {duration}
          </span>
          <span className="flex items-center font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer" onClick={onPlay}>
            Start Flow &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}
