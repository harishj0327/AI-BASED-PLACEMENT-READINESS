import React, { useState } from 'react';
import {
  RotateCcw,
  Save,
  Check,
  Share2,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PredictionResponse, PredictionRequest } from '../types';
import { ScoreGauge } from '../components/ScoreGauge';
import { SkillRadar } from '../components/SkillRadar';
import { StrengthGapList } from '../components/StrengthGapList';
import { api } from '../services/api';

interface ResultPageProps {
  prediction: PredictionResponse;
  inputFeatures: PredictionRequest;
  onRetake: () => void;
  onViewHistory: () => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({
  prediction,
  inputFeatures,
  onRetake,
  onViewHistory,
}) => {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.savePrediction(inputFeatures, prediction);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save assessment:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Evaluation Complete</span>
          </div>
          <h1 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">
            Your Placement Readiness
          </h1>
        </div>

        {/* Large Score Gauge */}
        <div className="py-2">
          <ScoreGauge score={prediction.score} category={prediction.category} size="lg" />
        </div>

        {/* Metadata Strip */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>
              Model Used: <strong className="text-white">{prediction.model_name}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Multi-Factor Non-Linear Academic Scoring</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-3.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                saved
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved to Firestore</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-blue-400" />
                  <span>Save Assessment</span>
                </>
              )}
            </button>
            <button
              onClick={onRetake}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Take Assessment Again</span>
            </button>
          </div>
        </div>
      </div>

      {/* Skill Analysis Visualization */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Skill-Wise Analysis</h2>
            <p className="text-xs text-slate-400">
              Breakdown across your tested academic, algorithmic, and experience pillars
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">Benchmark: 70–75</span>
        </div>

        <SkillRadar features={inputFeatures} type="bar" />
      </div>

      {/* Strengths, Gaps, and Personalized Recommendations */}
      <StrengthGapList
        strengths={prediction.strengths}
        skillGaps={prediction.skill_gaps}
        recommendations={prediction.recommendations}
      />

      {/* Navigation action bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          onClick={onRetake}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake With New Inputs</span>
        </button>

        <button
          onClick={onViewHistory}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <span>View Past Predictions &amp; History</span>
        </button>
      </div>
    </div>
  );
};
