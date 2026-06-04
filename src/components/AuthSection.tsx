import React, { useState } from 'react';
import { User, Lock, Phone, LogIn, UserPlus, LogOut, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { login, signup, syncUserData } from '../api';
import { UserProfile, Routine, WorkoutLog } from '../types';

interface AuthSectionProps {
  currentUserId: string | null;
  currentUserEmail: string | null;
  currentUserPhone: string | null;
  profile: UserProfile;
  customRoutines: Routine[];
  logs: WorkoutLog[];
  onAuthSuccess: (userId: string, email: string, phone: string) => void;
  onSignOut: () => void;
  onRefreshData: () => Promise<void>;
}

export default function AuthSection({
  currentUserId,
  currentUserEmail,
  currentUserPhone,
  profile,
  customRoutines,
  logs,
  onAuthSuccess,
  onSignOut,
  onRefreshData
}: AuthSectionProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (!email.trim() || !pin.trim()) {
      setError('Email and PIN are required.');
      setLoading(false);
      return;
    }

    if (isSignUp && !phone.trim()) {
      setError('Phone number is required for sign up.');
      setLoading(false);
      return;
    }

    try {
      let authRes;
      if (isSignUp) {
        authRes = await signup(email.trim(), pin.trim(), phone.trim());
        setSuccessMsg('Account created successfully!');
      } else {
        authRes = await login(email.trim(), pin.trim());
        setSuccessMsg('Logged in successfully!');
      }

      // Save user ID to localStorage so getHeaders() grabs it
      localStorage.setItem('fittrack_user_id', authRes.userId);
      localStorage.setItem('fittrack_user_email', authRes.email);
      localStorage.setItem('fittrack_user_phone', authRes.phone || '');

      // Sync local data immediately to the new account
      setSuccessMsg((prev) => `${prev} Syncing local data to your account...`);
      await syncUserData(profile, customRoutines, logs);

      // Trigger success state in App component
      onAuthSuccess(authRes.userId, authRes.email, authRes.phone || '');
      
      // Reload everything from server to sync state
      await onRefreshData();
      
      setSuccessMsg('All done! Your workout progress is synced.');
      
      // Clear inputs
      setEmail('');
      setPin('');
      setPhone('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please try again.');
      // If we failed after setting local storage, revert it
      localStorage.removeItem('fittrack_user_id');
      localStorage.removeItem('fittrack_user_email');
      localStorage.removeItem('fittrack_user_phone');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutClick = () => {
    onSignOut();
    setSuccessMsg('Signed out successfully.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  if (currentUserId) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-550/10 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 dark:text-indigo-400">Linked Account</span>
              <h4 className="text-sm font-black text-gray-855 dark:text-white truncate max-w-[200px] sm:max-w-xs">{currentUserEmail}</h4>
              {currentUserPhone && (
                <p className="text-xs text-gray-405 dark:text-gray-450 flex items-center mt-0.5">
                  <Phone className="w-3 h-3 mr-1" /> {currentUserPhone}
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-3 w-full sm:w-auto">
            <button
              onClick={onRefreshData}
              disabled={loading}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-705 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold text-gray-650 dark:text-gray-300 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Sync DB
            </button>
            <button
              onClick={handleSignOutClick}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 text-rose-600 dark:text-rose-455 hover:text-white dark:hover:text-white text-xs font-bold flex items-center justify-center transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign Out
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 p-6 shadow-sm space-y-5">
      <div className="border-b border-gray-100 dark:border-gray-700/60 pb-4">
        <h3 className="font-black text-gray-855 dark:text-white flex items-center text-base">
          {isSignUp ? <UserPlus className="w-5 h-5 text-indigo-550 mr-2" /> : <LogIn className="w-5 h-5 text-indigo-550 mr-2" />}
          {isSignUp ? 'Create FitTrack Account' : 'Sign In to Cloud Account'}
        </h3>
        <p className="text-gray-450 dark:text-gray-400 text-xs mt-1">
          {isSignUp 
            ? 'Sign up to back up your custom workout routines, history logs, and profile levels.'
            : 'Access your workouts and logs from any device.'}
        </p>
      </div>

      <div className="flex bg-gray-100 dark:bg-slate-900 rounded-xl p-0.5 text-xs font-semibold">
        <button
          type="button"
          onClick={() => { setIsSignUp(false); setError(null); }}
          className={`flex-1 py-2 rounded-lg transition-all ${
            !isSignUp
              ? 'bg-white dark:bg-gray-800 text-indigo-650 dark:text-indigo-400 shadow-xs'
              : 'text-gray-500 hover:text-slate-800 dark:hover:text-slate-350'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setIsSignUp(true); setError(null); }}
          className={`flex-1 py-2 rounded-lg transition-all ${
            isSignUp
              ? 'bg-white dark:bg-gray-800 text-indigo-650 dark:text-indigo-400 shadow-xs'
              : 'text-gray-500 hover:text-slate-800 dark:hover:text-slate-350'
          }`}
        >
          Register / Create Account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-450 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="email"
              placeholder="e.g. athlete@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-450 uppercase tracking-wider mb-1.5">
            PIN (Access Code)
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="password"
              placeholder="e.g. 1718"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
              required
            />
          </div>
        </div>

        {isSignUp && (
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-450 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                placeholder="e.g. +1 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                required={isSignUp}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl text-xs text-rose-600 dark:text-rose-455 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-indigo-650 hover:bg-indigo-550 text-white font-bold text-xs flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : isSignUp ? (
            <>
              <UserPlus className="w-4 h-4 mr-2" /> Sign Up & Sync Data
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-2" /> Log In & Sync Data
            </>
          )}
        </button>
      </form>
    </div>
  );
}
