import React from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  CheckCircle,
  BarChart3,
  Layers,
  ShieldCheck,
  Award,
  Zap,
} from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge';
import { DemoStudentPreset } from '../types';

interface LandingPageProps {
  onStartAssessment: () => void;
  onExploreInsights: () => void;
  onLoadPreset: (preset: DemoStudentPreset) => void;
  demoStudents: DemoStudentPreset[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartAssessment,
  onExploreInsights,
  onLoadPreset,
  demoStudents,
}) => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Factor Machine Learning Project</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Know Your Placement <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-300 bg-clip-text text-transparent">
                Readiness Score.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Analyze your skills. Discover your gaps. Prepare smarter. Instead of judging capability
              by CGPA alone, our trained ML regression models evaluate 8 dimensions of academic,
              coding, and practical experience.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onStartAssessment}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all cursor-pointer group"
              >
                <span>Check My Readiness</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreInsights}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>Explore Model Insights</span>
              </button>
            </div>

            {/* Quick stats banner */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="text-2xl font-black text-white">4</p>
                <p className="text-xs text-slate-400">ML Algorithms</p>
              </div>
              <div>
                <p className="text-2xl font-black text-blue-400">8</p>
                <p className="text-xs text-slate-400">Core Dimensions</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-400">0–100</p>
                <p className="text-xs text-slate-400">Readiness Score</p>
              </div>
            </div>
          </div>

          {/* Interactive ML Sample Card */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-300">Live ML Model Output</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Linear Regression (R²: 0.78)
                </span>
              </div>

              <div className="py-2">
                <ScoreGauge score={78.2} category="Moderately Ready" size="lg" />
              </div>

              <div className="mt-6 pt-5 border-t border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Key Strength:</span>
                  <span className="font-semibold text-emerald-400">Communication &amp; Tech</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Targeted Gap:</span>
                  <span className="font-semibold text-amber-400">Programming Speed &amp; DSA</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Training Sample Size:</span>
                  <span className="font-mono text-slate-300">1,500 Academic Records</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Presets Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Instant Demonstration Presets</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                Test Verified Archetypes Directly in the Model
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Load predefined student profiles evaluated by the real trained ML pipeline.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {demoStudents && demoStudents.length > 0 ? (
              demoStudents.map((demo, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 rounded-xl p-5 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          demo.prediction.category === 'Highly Ready'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : demo.prediction.category === 'Moderately Ready'
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {demo.prediction.category}
                      </span>
                      <span className="text-lg font-black text-white">
                        {demo.prediction.score}
                        <span className="text-xs font-normal text-slate-400">/100</span>
                      </span>
                    </div>

                    <h3 className="font-semibold text-white text-sm mb-1">{demo.profile.name}</h3>
                    <p className="text-xs text-slate-400 mb-4">{demo.profile.branch}</p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-lg mb-4">
                      <div>CGPA: <strong className="text-white">{demo.features.cgpa}</strong></div>
                      <div>Prog: <strong className="text-white">{demo.features.programming_skills}</strong></div>
                      <div>Tech: <strong className="text-white">{demo.features.technical_skills}</strong></div>
                      <div>Intern: <strong className="text-white">{demo.features.internship_experience}m</strong></div>
                    </div>
                  </div>

                  <button
                    onClick={() => onLoadPreset(demo)}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Load &amp; View Assessment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-6 text-slate-500 text-xs">
                Loading demo archetypes...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4 Pillars of the ML System */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How The Assessment Engine Works
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            A continuous machine learning pipeline built on solid statistical foundations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base mb-2">1. 8-Factor Input</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Considers academic CGPA, coding ability, aptitude, communication, core technical
              concepts, project portfolio, certifications, and internship months.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base mb-2">2. Continuous Regression</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trained on 4 regression models (Linear Regression, Decision Tree, Random Forest, SVR)
              to predict the continuous 0–100 score instead of an arbitrary threshold.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base mb-2">3. Feature Explainability</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Computes feature importance dynamically from the model so students and faculty know
              which skills carry the highest placement leverage.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base mb-2">4. Actionable Advice</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects specific weaknesses (e.g., Programming &lt; 60 or zero internships) and
              generates dynamic actionable recommendations to clear drives.
            </p>
          </div>
        </div>
      </section>

      {/* Cloud Architecture Summary Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-sky-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cloud &amp; Security Architecture</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Built for Production Cloud Run &amp; Firestore
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed as a modern decoupled full-stack architecture with Python FastAPI REST APIs,
              token-verified Firebase Authentication, and scalable Cloud Firestore document
              storage.
            </p>
          </div>
          <button
            onClick={onStartAssessment}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shrink-0 cursor-pointer shadow-lg shadow-blue-600/30"
          >
            Start Your Assessment
          </button>
        </div>
      </section>
    </div>
  );
};
