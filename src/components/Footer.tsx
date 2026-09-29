import React from 'react';
import { Database, Cloud, Cpu, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white font-semibold text-base mb-2">
              AI-Based Placement Readiness Score Predictor
            </h3>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Academic Machine Learning &amp; Cloud Computing final project. Predicts student
              placement readiness score (0–100) using continuous regression algorithms and generates
              dynamic, personalized actionable recommendations.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Prototype trained on a generated academic dataset</span>
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">ML Algorithms Evaluated</h4>
            <ul className="text-xs space-y-2">
              <li className="flex items-center gap-1.5 text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                Linear Regression (Best Model)
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                Support Vector Regressor (SVR)
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Random Forest Regressor
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                Decision Tree Regressor
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Cloud Architecture</h4>
            <ul className="text-xs space-y-2">
              <li className="flex items-center gap-1.5 text-slate-300">
                <Cloud className="w-3.5 h-3.5 text-sky-400" />
                Google Cloud Run (FastAPI Backend)
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                Google Cloud Firestore Database
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Cloud className="w-3.5 h-3.5 text-rose-400" />
                Firebase Authentication &amp; Rules
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Academic ML &amp; Cloud Computing Project Demonstration.</p>
          <p className="italic">
            Notice: Estimates readiness based on academic input features. Does not guarantee placement outcomes.
          </p>
        </div>
      </div>
    </footer>
  );
};
