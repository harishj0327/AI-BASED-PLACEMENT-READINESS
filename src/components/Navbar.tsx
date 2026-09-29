import React from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  BrainCircuit,
  History,
  User,
  LogOut,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { AuthUser, logoutUser } from '../lib/firebase';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage,
  currentUser,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <div
            onClick={() => setCurrentPage('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Placement Readiness
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                ML Predictor
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentPage('landing')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'landing'
                  ? 'bg-slate-800 text-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </button>

            {currentUser && (
              <>
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 'dashboard'
                      ? 'bg-slate-800 text-blue-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentPage('assessment')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 'assessment'
                      ? 'bg-slate-800 text-blue-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Assess Readiness
                </button>
                <button
                  onClick={() => setCurrentPage('history')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 'history'
                      ? 'bg-slate-800 text-blue-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <History className="w-4 h-4" />
                  History
                </button>
              </>
            )}

            <button
              onClick={() => setCurrentPage('insights')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'insights'
                  ? 'bg-slate-800 text-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              Model Insights
            </button>

            <button
              onClick={() => setCurrentPage('about')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'about'
                  ? 'bg-slate-800 text-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Methodology
            </button>
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage('profile')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    currentPage === 'profile'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                      : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="hidden sm:inline">{currentUser.name}</span>
                </button>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage('login')}
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentPage('register')}
                  className="px-3.5 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm shadow-blue-500/30 transition-all"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
