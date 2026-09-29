import React, { useState } from 'react';
import { LogIn, Key, Mail, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { loginWithEmail, AuthUser } from '../lib/firebase';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  onNavigateRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateRegister,
}) => {
  const [email, setEmail] = useState('alex.johnson@campus.edu');
  const [password, setPassword] = useState('student123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithEmail(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('student123');
    setLoading(true);
    try {
      const user = await loginWithEmail(demoEmail, 'student123');
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.message || 'Demo sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-7 sm:p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Student Portal Sign In</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your placement readiness score and prediction history
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              College Email ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campus.edu"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Sign In Box */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Fast Evaluator Demo Accounts:</span>
          </p>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('aarav.sharma@campus.edu')}
              className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 flex justify-between items-center transition-colors cursor-pointer"
            >
              <span>Aarav Sharma (Strong Profile)</span>
              <span className="text-[10px] text-emerald-400">Score ~85</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('priya.patel@campus.edu')}
              className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 flex justify-between items-center transition-colors cursor-pointer"
            >
              <span>Priya Patel (Average Profile)</span>
              <span className="text-[10px] text-sky-400">Score ~61</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('rohan.gupta@campus.edu')}
              className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 flex justify-between items-center transition-colors cursor-pointer"
            >
              <span>Rohan Gupta (Needs Improvement)</span>
              <span className="text-[10px] text-amber-400">Score ~41</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          New student?{' '}
          <button
            onClick={onNavigateRegister}
            className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};
