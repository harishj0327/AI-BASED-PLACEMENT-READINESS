import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Code,
  Brain,
  Briefcase,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { PredictionRequest, PredictionResponse } from '../types';
import { api } from '../services/api';

interface AssessmentPageProps {
  onPredictionComplete: (prediction: PredictionResponse, inputs: PredictionRequest) => void;
  initialValues?: PredictionRequest | null;
}

const DEFAULT_INPUTS: PredictionRequest = {
  cgpa: 7.8,
  programming_skills: 72,
  aptitude_score: 68,
  communication_skills: 75,
  technical_skills: 74,
  projects_score: 70,
  certifications: 2,
  internship_experience: 6,
};

export const AssessmentPage: React.FC<AssessmentPageProps> = ({
  onPredictionComplete,
  initialValues,
}) => {
  const [step, setStep] = useState<number>(1);
  const [inputs, setInputs] = useState<PredictionRequest>(initialValues || DEFAULT_INPUTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof PredictionRequest, value: number) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (inputs.cgpa < 0 || inputs.cgpa > 10) {
        setError('CGPA must be between 0.0 and 10.0');
        return;
      }
    }
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.predict(inputs);
      // Automatically save assessment to Firestore
      try {
        await api.savePrediction(inputs, result);
      } catch (saveErr) {
        console.warn('Could not auto-save prediction:', saveErr);
      }
      onPredictionComplete(result, inputs);
    } catch (err: any) {
      setError(err?.message || 'Prediction failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  // Quick preset fills
  const setPreset = (type: 'strong' | 'average' | 'needs_imp') => {
    if (type === 'strong') {
      setInputs({
        cgpa: 8.95,
        programming_skills: 88,
        aptitude_score: 85,
        communication_skills: 82,
        technical_skills: 86,
        projects_score: 85,
        certifications: 3,
        internship_experience: 9,
      });
    } else if (type === 'average') {
      setInputs({
        cgpa: 7.35,
        programming_skills: 65,
        aptitude_score: 62,
        communication_skills: 68,
        technical_skills: 64,
        projects_score: 60,
        certifications: 1,
        internship_experience: 3,
      });
    } else {
      setInputs({
        cgpa: 5.8,
        programming_skills: 42,
        aptitude_score: 48,
        communication_skills: 52,
        technical_skills: 45,
        projects_score: 40,
        certifications: 0,
        internship_experience: 0,
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Placement Assessment</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Readiness Score Evaluation
            </h1>
          </div>

          {/* Quick preset selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 px-1 hidden sm:inline">Presets:</span>
            <button
              onClick={() => setPreset('strong')}
              type="button"
              className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600/30 text-emerald-400 font-medium transition-colors"
            >
              Strong
            </button>
            <button
              onClick={() => setPreset('average')}
              type="button"
              className="px-2 py-1 rounded bg-slate-800 hover:bg-sky-600/30 text-sky-400 font-medium transition-colors"
            >
              Average
            </button>
            <button
              onClick={() => setPreset('needs_imp')}
              type="button"
              className="px-2 py-1 rounded bg-slate-800 hover:bg-amber-600/30 text-amber-400 font-medium transition-colors"
            >
              Low
            </button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="py-6">
          <div className="flex items-center justify-between mb-2">
            {[
              { num: 1, label: 'Academic' },
              { num: 2, label: 'Skills' },
              { num: 3, label: 'Aptitude' },
              { num: 4, label: 'Experience' },
              { num: 5, label: 'Review' },
            ].map((s) => (
              <div
                key={s.num}
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                  step === s.num
                    ? 'text-blue-400'
                    : step > s.num
                    ? 'text-emerald-400'
                    : 'text-slate-500'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    step === s.num
                      ? 'bg-blue-600 text-white'
                      : step > s.num
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Step Forms */}
        <div className="py-4">
          {/* STEP 1: Academic */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Academic Performance</h2>
                  <p className="text-xs text-slate-400">Cumulative Grade Point Average (0.0–10.0)</p>
                </div>
              </div>

              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-200">
                    Cumulative CGPA (0.0 to 10.0)
                  </label>
                  <span className="text-lg font-black text-blue-400">{inputs.cgpa.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="10.0"
                  step="0.05"
                  value={inputs.cgpa}
                  onChange={(e) => updateField('cgpa', parseFloat(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>4.0 (Minimum Passing)</span>
                  <span>7.5 (Typical Cutoff)</span>
                  <span>10.0 (Distinction)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Skills */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Core Technical &amp; Coding Skills</h2>
                  <p className="text-xs text-slate-400">Proficiency scores on a scale of 0 to 100</p>
                </div>
              </div>

              <div className="space-y-5 bg-slate-950 p-6 rounded-xl border border-slate-800">
                {/* Programming Skills */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-200">
                      Programming &amp; Algorithmic Skills
                    </span>
                    <span className="font-bold text-blue-400">{inputs.programming_skills} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={inputs.programming_skills}
                    onChange={(e) => updateField('programming_skills', parseInt(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">
                    DSA, problem solving, LeetCode / competitive programming readiness.
                  </p>
                </div>

                {/* Technical Skills */}
                <div className="space-y-2 pt-3 border-t border-slate-900">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-200">
                      Technical &amp; Computer Science Subjects
                    </span>
                    <span className="font-bold text-indigo-400">{inputs.technical_skills} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={inputs.technical_skills}
                    onChange={(e) => updateField('technical_skills', parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">
                    DBMS, Operating Systems, Computer Networks, and OOP fundamentals.
                  </p>
                </div>

                {/* Communication Skills */}
                <div className="space-y-2 pt-3 border-t border-slate-900">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-200">
                      Communication &amp; Interview Presentation
                    </span>
                    <span className="font-bold text-emerald-400">{inputs.communication_skills} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={inputs.communication_skills}
                    onChange={(e) => updateField('communication_skills', parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">
                    Articulating technical thoughts, GD, and HR interview readiness.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Aptitude */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">General Aptitude &amp; Reasoning</h2>
                  <p className="text-xs text-slate-400">Quantitative, logical, and verbal reasoning (0–100)</p>
                </div>
              </div>

              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-200">
                    Aptitude Assessment Test Score
                  </label>
                  <span className="text-lg font-black text-sky-400">{inputs.aptitude_score} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={inputs.aptitude_score}
                  onChange={(e) => updateField('aptitude_score', parseInt(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Companies use online aptitude rounds as a first-round filter. A score above 70
                  significantly elevates qualification rates for subsequent technical interviews.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Experience */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Projects, Certifications &amp; Experience</h2>
                  <p className="text-xs text-slate-400">Hands-on application and industry exposure</p>
                </div>
              </div>

              <div className="space-y-5 bg-slate-950 p-6 rounded-xl border border-slate-800">
                {/* Projects Score */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-200">Projects &amp; Portfolio Quality</span>
                    <span className="font-bold text-amber-400">{inputs.projects_score} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={inputs.projects_score}
                    onChange={(e) => updateField('projects_score', parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">
                    Depth of GitHub repositories, full-stack deployment, architecture.
                  </p>
                </div>

                {/* Certifications */}
                <div className="space-y-2 pt-3 border-t border-slate-900">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-200">
                      Recognized Certifications (Count: 0–10)
                    </span>
                    <span className="font-bold text-purple-400">{inputs.certifications} Credential(s)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={inputs.certifications}
                    onChange={(e) => updateField('certifications', parseInt(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">
                    Cloud (AWS/GCP/Azure), Kubernetes, Cisco, Oracle, or recognized badges.
                  </p>
                </div>

                {/* Internship Experience */}
                <div className="space-y-2 pt-3 border-t border-slate-900">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-200">
                      Internship Experience (Months: 0–24)
                    </span>
                    <span className="font-bold text-emerald-400">
                      {inputs.internship_experience} Month(s)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={inputs.internship_experience}
                    onChange={(e) => updateField('internship_experience', parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">
                    Formal industry internships or professional technical contracts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Review */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Review Assessment Inputs</h2>
                  <p className="text-xs text-slate-400">
                    Confirm values before feeding into the Machine Learning model
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-6 rounded-xl border border-slate-800 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">CGPA</span>
                  <span className="text-base font-bold text-white">{inputs.cgpa.toFixed(2)}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Programming</span>
                  <span className="text-base font-bold text-blue-400">{inputs.programming_skills}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Technical</span>
                  <span className="text-base font-bold text-indigo-400">{inputs.technical_skills}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Aptitude</span>
                  <span className="text-base font-bold text-sky-400">{inputs.aptitude_score}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Communication</span>
                  <span className="text-base font-bold text-emerald-400">{inputs.communication_skills}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Projects</span>
                  <span className="text-base font-bold text-amber-400">{inputs.projects_score}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Certifications</span>
                  <span className="text-base font-bold text-purple-400">{inputs.certifications}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Internship</span>
                  <span className="text-base font-bold text-emerald-400">{inputs.internship_experience}m</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || loading}
            className="px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/40 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Computing ML Inference...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Predict My Readiness</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
