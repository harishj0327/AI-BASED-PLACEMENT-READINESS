import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, Lightbulb } from 'lucide-react';

interface StrengthGapListProps {
  strengths: string[];
  skillGaps: string[];
  recommendations: string[];
}

export const StrengthGapList: React.FC<StrengthGapListProps> = ({
  strengths,
  skillGaps,
  recommendations,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Your Strengths
              </h3>
              <p className="text-xs text-slate-400">Competencies that boost your readiness</p>
            </div>
          </div>

          <ul className="space-y-2.5">
            {strengths && strengths.length > 0 ? (
              strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500 italic">No dominant strengths recorded.</li>
            )}
          </ul>
        </div>

        {/* Skill Gaps Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Areas To Improve
              </h3>
              <p className="text-xs text-slate-400">Identified hurdles and skill gaps</p>
            </div>
          </div>

          <ul className="space-y-2.5">
            {skillGaps && skillGaps.length > 0 ? (
              skillGaps.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500 italic">No significant critical gaps noted.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="bg-slate-900/90 border border-blue-500/30 rounded-xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Personalized Recommendations
            </h3>
            <p className="text-xs text-slate-400">
              Generated dynamically from your actual assessed metrics
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {recommendations && recommendations.length > 0 ? (
            recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-200 text-xs sm:text-sm hover:border-blue-500/40 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="leading-relaxed flex-1">{rec}</p>
                <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 self-center hidden sm:block" />
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">Complete an assessment to generate advice.</p>
          )}
        </div>
      </div>
    </div>
  );
};
