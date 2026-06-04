import { useState } from 'react';
import { Plus, Trash2, Save, MoveUp, MoveDown, Search, Dumbbell, Sparkles } from 'lucide-react';
import { Exercise, Routine } from '../types';
import { exerciseCatalog } from '../data/routines';

interface RoutineBuilderProps {
  onSave: (routine: Routine) => void;
  onCancel: () => void;
}

export default function RoutineBuilder({ onSave, onCancel }: RoutineBuilderProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'workout' | 'stretch'>('all');

  const availableImages = [
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Yoga / stretch
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Workout gym
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Cardio HIIT
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'  // General fitness
  ];
  const [selectedImage, setSelectedImage] = useState(availableImages[0]);

  // Filter exercise catalog
  const filteredCatalog = exerciseCatalog.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' ? true : ex.type === filterType;
    return matchesSearch && matchesType;
  });

  const addExercise = (ex: Exercise) => {
    // Generate a unique ID for this instance in the list so same exercise can be added multiple times
    const instanceId = `${ex.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    setSelectedExercises([...selectedExercises, { ...ex, id: instanceId }]);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const updateDuration = (index: number, seconds: number) => {
    const updated = [...selectedExercises];
    updated[index].duration = Math.max(5, seconds); // minimum 5s
    setSelectedExercises(updated);
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === selectedExercises.length - 1) return;

    const newIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...selectedExercises];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    setSelectedExercises(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a routine title.');
      return;
    }
    if (selectedExercises.length === 0) {
      alert('Please add at least one exercise/stretch to your routine.');
      return;
    }

    // Calculate total duration string
    const totalSecs = selectedExercises.reduce((sum, ex) => sum + ex.duration, 0);
    const durationMinStr = totalSecs % 60 === 0
      ? `${totalSecs / 60} min`
      : `${(totalSecs / 60).toFixed(1)} min`;

    const newRoutine: Routine = {
      id: `custom_${Date.now()}`,
      title,
      description: description || `Custom routine with ${selectedExercises.length} steps.`,
      duration: durationMinStr,
      difficulty,
      image: selectedImage,
      exercises: selectedExercises,
      isCustom: true
    };

    onSave(newRoutine);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700/60 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <Sparkles className="w-6 h-6 text-indigo-500 mr-2" />
            Build Custom Routine
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Assemble your custom workouts or stretches.</p>
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs transition-colors"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Routine Title
              </label>
              <input
                type="text"
                placeholder="e.g., Evening Hip Opener"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                placeholder="Brief summary of the focus or benefits..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'Beginner' | 'Intermediate' | 'Advanced')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Cover Photo
              </label>
              <div className="flex space-x-2">
                {availableImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img ? 'border-indigo-500 scale-105' : 'border-transparent opacity-60 hover:opacity-90'
                    }`}
                  >
                    <img src={img} alt="Cover option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Builder Workdesk */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          {/* Exercise Library Selection (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                1. Add Exercises
              </h3>
              {/* Type Switcher */}
              <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-2 py-1 rounded-md ${filterType === 'all' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs' : 'text-gray-500'}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('workout')}
                  className={`px-2 py-1 rounded-md ${filterType === 'workout' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs' : 'text-gray-500'}`}
                >
                  Workouts
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('stretch')}
                  className={`px-2 py-1 rounded-md ${filterType === 'stretch' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs' : 'text-gray-500'}`}
                >
                  Stretches
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-150 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none text-xs transition-all"
              />
            </div>

            {/* Catalog List */}
            <div className="h-80 overflow-y-auto border border-gray-100 dark:border-gray-700/80 rounded-xl divide-y divide-gray-100 dark:divide-gray-700 pr-1">
              {filteredCatalog.length === 0 ? (
                <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs">
                  No matching exercises found.
                </div>
              ) : (
                filteredCatalog.map((ex) => (
                  <div key={ex.id} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-gray-800 dark:text-white truncate">{ex.name}</h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          ex.type === 'workout' ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {ex.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-450 line-clamp-1 mt-0.5">{ex.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addExercise(ex)}
                      className="p-1.5 rounded-lg bg-indigo-550 hover:bg-indigo-650 text-white flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Routine Playlist Queue (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center">
                <Dumbbell className="w-4 h-4 text-indigo-500 mr-2" />
                2. Routine Playlist Queue ({selectedExercises.length})
              </h3>
              <span className="text-xs font-semibold text-gray-500">
                Est: {selectedExercises.reduce((sum, ex) => sum + ex.duration, 0)}s
              </span>
            </div>

            {/* List */}
            <div className="h-96 overflow-y-auto border border-gray-150 dark:border-gray-700 rounded-xl divide-y divide-gray-150 dark:divide-gray-700 bg-gray-50/50 dark:bg-slate-900/25 p-2 space-y-2">
              {selectedExercises.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500 p-8">
                  <Dumbbell className="w-10 h-10 mb-2 opacity-35" />
                  <span className="text-xs font-semibold">Your playlist is empty.</span>
                  <span className="text-[10px] text-gray-400 mt-1 max-w-[200px]">
                    Click the plus icon on the left to add movements to your custom routine.
                  </span>
                </div>
              ) : (
                selectedExercises.map((ex, index) => (
                  <div
                    key={ex.id}
                    className="p-3 bg-white dark:bg-gray-850 rounded-xl border border-gray-150 dark:border-gray-700/60 flex items-center justify-between shadow-xs hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  >
                    {/* Sort buttons */}
                    <div className="flex flex-col space-y-1.5 mr-2">
                      <button
                        type="button"
                        onClick={() => moveExercise(index, 'up')}
                        disabled={index === 0}
                        className="text-gray-450 hover:text-indigo-650 disabled:opacity-20"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveExercise(index, 'down')}
                        disabled={index === selectedExercises.length - 1}
                        className="text-gray-450 hover:text-indigo-650 disabled:opacity-20"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1 pr-3">
                      <h4 className="text-sm font-bold text-gray-850 dark:text-white truncate">
                        {ex.name.replace(/_.*$/, '')} {/* strip unique ID suffix */}
                      </h4>
                      {/* Duration configure */}
                      <div className="flex items-center space-x-1.5 mt-1">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase">Hold Time:</span>
                        <input
                          type="number"
                          value={ex.duration}
                          min={5}
                          max={300}
                          onChange={(e) => updateDuration(index, parseInt(e.target.value) || 30)}
                          className="w-16 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-55 dark:bg-gray-900 text-slate-800 dark:text-white font-mono text-[11px] font-bold focus:outline-none"
                        />
                        <span className="text-[10px] text-gray-550 font-semibold">seconds</span>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-550 dark:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-550 hover:to-indigo-650 text-white font-bold text-sm flex items-center justify-center transition-all shadow-md shadow-indigo-500/10 active:scale-95"
          >
            <Save className="w-4.5 h-4.5 mr-2" />
            Save & Compile Routine
          </button>
        </div>
      </form>
    </div>
  );
}
