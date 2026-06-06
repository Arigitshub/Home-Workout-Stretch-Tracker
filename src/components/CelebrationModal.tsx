import { badgesList } from '../data/badges';
import { Award, Check } from 'lucide-react';
import { useEffect } from 'react';

interface CelebrationModalProps {
  badgeIds: string[];
  onClose: () => void;
}

export default function CelebrationModal({ badgeIds, onClose }: CelebrationModalProps) {
  const badges = badgesList.filter((b) => badgeIds.includes(b.id));

  // Sound cues on mount
  useEffect(() => {
    try {
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        const playCelebrationChime = (freq: number, start: number, dur: number) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime + start);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + dur);
          osc.start(audioCtx.currentTime + start);
          osc.stop(audioCtx.currentTime + start + dur);
        };
        // Sweet arpeggio
        playCelebrationChime(261.63, 0, 0.2); // C4
        playCelebrationChime(329.63, 0.1, 0.2); // E4
        playCelebrationChime(392.00, 0.2, 0.2); // G4
        playCelebrationChime(523.25, 0.3, 0.4); // C5
        playCelebrationChime(659.25, 0.45, 0.6); // E5
      }
    } catch (e) {
      console.warn('Celebration audio failed:', e);
    }
  }, []);

  if (badges.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      {/* Floating Confetti Particle System */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, idx) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 5;
          const duration = 3 + Math.random() * 4;
          const size = 6 + Math.random() * 8;
          const colors = ['bg-rose-500', 'bg-indigo-500', 'bg-amber-400', 'bg-emerald-400', 'bg-violet-500'];
          const color = colors[Math.floor(Math.random() * colors.length)];
          const rotation = Math.random() * 360;

          return (
            <div
              key={idx}
              className={`absolute rounded-xs ${color} animate-fall opacity-80`}
              style={{
                left: `${left}%`,
                top: `-20px`,
                width: `${size}px`,
                height: `${size * 1.5}px`,
                transform: `rotate(${rotation}deg)`,
                animation: `fall ${duration}s linear infinite`,
                animationDelay: `${delay}s`
              }}
            />
          );
        })}
      </div>

      {/* Modal Card */}
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-white/10 max-w-md w-full rounded-3xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden scale-100 animate-pop-in">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Ribbon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500/25 rounded-full blur-md animate-ping" />
            <div className="w-16 h-16 bg-amber-950 border-2 border-amber-500 rounded-full flex items-center justify-center text-amber-450 relative">
              <Award className="w-8 h-8 animate-wiggle" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight uppercase">
          Achievement Unlocked!
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Fantastic! You've reached a new milestone and earned special rewards.
        </p>

        {/* Unlocked Badges List */}
        <div className="my-6 space-y-3.5 max-h-60 overflow-y-auto pr-1 perspective-card">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className="relative p-4 rounded-2xl bg-gradient-to-r from-slate-950/70 to-slate-900/50 border border-white/5 flex items-center space-x-4 text-left overflow-hidden group hover:border-indigo-500/30 transition-all duration-300 badge-3d-item"
              >
                {/* Badge Left Icon Graphic */}
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${badge.colorClass} flex items-center justify-center text-white flex-shrink-0 shadow-md badge-icon-glow`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-sm text-white group-hover:text-indigo-400 transition-colors">
                    {badge.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {badge.description}
                  </p>
                  <span className="inline-block text-[9px] font-bold text-indigo-300 mt-1 uppercase tracking-wider bg-indigo-950/40 px-1.5 py-0.2 rounded border border-indigo-900/25">
                    {badge.requirement}
                  </span>
                </div>

                <div className="w-5 h-5 rounded-full bg-emerald-500/25 border border-emerald-500 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Check className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Claim Rewards Box */}
        <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-2xl p-3.5 mb-6 text-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Bonus Claim Reward</span>
          <span className="text-xl font-black text-white block mt-0.5">
            +{badgeIds.length * 50} XP
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black tracking-wider text-sm transition-all transform active:scale-95 shadow-lg shadow-amber-500/10 cursor-pointer"
        >
          Claim Rewards & Let's Go!
        </button>
      </div>

      {/* Confetti & Modal Keyframe styling */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
        .animate-wiggle {
          animation: wiggle 2s ease-in-out infinite;
        }
        .animate-fall {
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
