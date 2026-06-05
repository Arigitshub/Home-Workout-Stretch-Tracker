import React, { useState } from 'react';
import { Home, Dumbbell, Sparkles, Target, ArrowRight, ArrowLeft, Shield, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingModalProps {
  profile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
}

export default function OnboardingModal({ profile, onSave }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState<'home' | 'gym' | 'any'>(profile.location || 'home');
  const [equipment, setEquipment] = useState<string[]>(profile.equipment || []);
  const [goals, setGoals] = useState<string[]>(profile.fitnessGoals || []);

  const handleEquipmentToggle = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleGoalToggle = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save onboarding config
      onSave({
        ...profile,
        location,
        equipment,
        fitnessGoals: goals
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full border border-gray-150 dark:border-gray-700/80 shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-850 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-200">Setup Wizard</span>
          <h3 className="font-black text-xl flex items-center mt-1">
            <Sparkles className="w-5 h-5 text-amber-300 mr-2 animate-pulse" />
            Customize Your Training Flow
          </h3>
          <p className="text-indigo-200 text-xs mt-1.5 leading-relaxed">
            Answer a few quick questions to align FitTrack with your schedule, location, and equipment.
          </p>

          {/* Progress Indicator */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex space-x-2 w-full pr-12">
              <div className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${step >= 1 ? 'bg-white' : 'bg-white/20'}`} />
              <div className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${step >= 2 ? 'bg-white' : 'bg-white/20'}`} />
              <div className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${step >= 3 ? 'bg-white' : 'bg-white/20'}`} />
            </div>
            <span className="text-[10px] font-black uppercase text-indigo-250 absolute right-6 bottom-5 bg-white/10 px-2.5 py-1 rounded-md border border-white/5">
              Step {step} of 3
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* STEP 1: LOCATION */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-250">
              <div>
                <h4 className="font-extrabold text-sm text-gray-800 dark:text-white flex items-center">
                  <Home className="w-4 h-4 text-indigo-500 mr-2" />
                  1. Where are you planning to do most workouts?
                </h4>
                <p className="text-gray-400 dark:text-gray-450 text-xs mt-1">
                  We use this to prioritize routines suited for your environment.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLocation('home')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    location === 'home'
                      ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-650 bg-gray-50/50 dark:bg-slate-900/5 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <span className="text-2xl block mb-2">🏠</span>
                  <span className="font-bold text-xs block">Home Workouts</span>
                  <span className="text-[10px] text-gray-400 block mt-1 leading-normal">Focused on high-efficiency, space-friendly sessions.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLocation('gym')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    location === 'gym'
                      ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-650 bg-gray-50/50 dark:bg-slate-900/5 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <span className="text-2xl block mb-2">💪</span>
                  <span className="font-bold text-xs block">Commercial Gym</span>
                  <span className="text-[10px] text-gray-400 block mt-1 leading-normal">Full weight stacks and targeted strength building.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLocation('any')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    location === 'any'
                      ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-650 bg-gray-50/50 dark:bg-slate-900/5 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <span className="text-2xl block mb-2">🌎</span>
                  <span className="font-bold text-xs block">Varies / Any location</span>
                  <span className="text-[10px] text-gray-400 block mt-1 leading-normal">Flexible settings suited for any training environment.</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: EQUIPMENT */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-250">
              <div>
                <h4 className="font-extrabold text-sm text-gray-800 dark:text-white flex items-center">
                  <Dumbbell className="w-4 h-4 text-indigo-500 mr-2" />
                  2. What training equipment do you have access to?
                </h4>
                <p className="text-gray-400 dark:text-gray-450 text-xs mt-1">
                  Check all that apply. Leave empty for bodyweight only.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleEquipmentToggle('dumbbells')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    equipment.includes('dumbbells')
                      ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-650 bg-gray-50/50 dark:bg-slate-900/5 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <div>
                    <span className="text-2xl block mb-1">🏋️</span>
                    <span className="font-bold text-xs">Dumbbells</span>
                    <span className="text-[10px] text-gray-405 block mt-0.5 leading-normal">Adjustable or fixed weight sets.</span>
                  </div>
                  {equipment.includes('dumbbells') && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleEquipmentToggle('bands')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    equipment.includes('bands')
                      ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-650 bg-gray-50/50 dark:bg-slate-900/5 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <div>
                    <span className="text-2xl block mb-1">🎗️</span>
                    <span className="font-bold text-xs">Resistance Bands</span>
                    <span className="text-[10px] text-gray-405 block mt-0.5 leading-normal">Elastic training tubes or loop bands.</span>
                  </div>
                  {equipment.includes('bands') && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              </div>

              {equipment.length === 0 && (
                <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/15 border border-amber-100/50 dark:border-amber-900/20 rounded-xl text-[10px] text-amber-700 dark:text-amber-400 flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-amber-550 flex-shrink-0 mt-0.5" />
                  <span>
                    No equipment selected! We will default to bodyweight and flexibility yoga routines for you. You can update this anytime.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: GOALS */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-250">
              <div>
                <h4 className="font-extrabold text-sm text-gray-800 dark:text-white flex items-center">
                  <Target className="w-4 h-4 text-indigo-500 mr-2" />
                  3. Select your primary training focus
                </h4>
                <p className="text-gray-400 dark:text-gray-450 text-xs mt-1">
                  Choose the fitness goals you want to prioritize today.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { id: 'strength', emoji: '💪', title: 'Build Strength', desc: 'Weighted and hypertrophy dumbbell training.' },
                  { id: 'flexibility', emoji: '🧘', title: 'Better Flexibility', desc: 'Stretch, mobility, and joint health flows.' },
                  { id: 'core', emoji: '🛡️', title: 'Core Power', desc: 'Ab stabilization and alignment routines.' },
                  { id: 'cardio', emoji: '⚡', title: 'Cardio & Stamina', desc: 'Calorie burning and cardiovascular intervals.' }
                ].map((g) => {
                  const isChecked = goals.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleGoalToggle(g.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isChecked
                          ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-650 bg-gray-50/50 dark:bg-slate-900/5 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <div>
                        <span className="text-xl block mb-1">{g.emoji}</span>
                        <span className="font-bold text-xs">{g.title}</span>
                        <span className="text-[9px] text-gray-405 block mt-0.5 leading-normal">{g.desc}</span>
                      </div>
                      {isChecked && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-55/30 dark:bg-slate-900/15">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="px-4 py-2 border border-gray-250 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold transition-all flex items-center disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
          </button>
          
          <button
            type="button"
            onClick={handleNext}
            disabled={step === 3 && goals.length === 0}
            className="px-5 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-550 text-white font-bold text-xs flex items-center transition-colors shadow-sm disabled:opacity-50"
          >
            {step === 3 ? (
              <>
                <Check className="w-4 h-4 mr-1.5" /> Save Configuration
              </>
            ) : (
              <>
                Next Steps <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
