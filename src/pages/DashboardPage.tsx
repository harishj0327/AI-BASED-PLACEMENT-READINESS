import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  Award,
  History,
  ArrowRight,
  BookOpen,
  Code,
  Brain,
  MessageSquare,
  Cpu,
  FolderGit2,
  BadgeCheck,
  Briefcase,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { AuthUser } from '../lib/firebase';
import { ScoreGauge } from '../components/ScoreGauge';
import { SkillRadar } from '../components/SkillRadar';
import { StrengthGapList } from '../components/StrengthGapList';
import { PredictionRecord, DashboardStats, PredictionRequest } from '../types';
import { api } from '../services/api';

interface DashboardPageProps {
  currentUser: AuthUser;
  onStartAssessment: () => void;
  onViewHistory: () => void;
  onSelectPrediction: (pred: PredictionRecord) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  onStartAssessment,
  onViewHistory,
  onSelectPrediction,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [history, setHistory] = useState<PredictionRecord[]>([]);
  const [latestPred, setLatestPred] = useState<PredictionRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, histData] = await Promise.all([
          api.getDashboardStats(),
          api.getHistory(),
        ]);
        setStats(statsData);
        setHistory(histData.history || []);
        if (histData.history && histData.history.length > 0) {
          setLatestPred(histData.history[0]);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  // Fallback default features if no assessment yet
  const defaultFeatures: PredictionRequest = {
    cgpa: 8.2,
    programming_skills: 75,
    aptitude_score: 70,
    communication_skills: 80,
    technical_skills: 78,
    projects_score: 75,
    certifications: 2,
    internship_experience: 6,
  };

  const activeFeatures: PredictionRequest = latestPred?.inputFeatures || defaultFeatures;
  const activeScore = latestPred ? latestPred.score : 78;
  const activeCategory = latestPred ? latestPred.category : 'Moderately Ready';

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your placement profile readiness, skill gaps, and ML evaluation trend
          </p>
        </div>

        <button
          onClick={onStartAssessment}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>New Assessment</span>
        </button>
      </div>

      {/* Main Readiness Score Card & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Readiness Gauge */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Placement Readiness
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                Latest ML Score
              </span>
            </div>

            <div className="py-2">
              <ScoreGauge score={activeScore} category={activeCategory} size="lg" />
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-xs text-slate-400 space-y-2">
            <div className="flex justify-between">
              <span>Evaluated On:</span>
              <span className="text-white font-mono">
                {latestPred?.createdAt ? latestPred.createdAt.slice(0, 10) : 'Active Baseline'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Model Architecture:</span>
              <span className="text-white font-medium">
                {latestPred?.modelName || 'Linear Regression'}
              </span>
            </div>
          </div>
        </div>

        {/* 8 Metric Cards Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* 1. CGPA */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">CGPA</span>
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-black text-white">{activeFeatures.cgpa.toFixed(2)}</p>
              <span className="text-[10px] text-slate-500">Scale of 10.0</span>
            </div>
          </div>

          {/* 2. Programming */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Coding</span>
              <Code className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-black text-white">{activeFeatures.programming_skills}</p>
              <span className="text-[10px] text-slate-500">DSA &amp; Problem Solving</span>
            </div>
          </div>

          {/* 3. Aptitude */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Aptitude</span>
              <Brain className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <p className="text-xl font-black text-white">{activeFeatures.aptitude_score}</p>
              <span className="text-[10px] text-slate-500">Quant &amp; Logic</span>
            </div>
          </div>

          {/* 4. Communication */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Comm.</span>
              <MessageSquare className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-xl font-black text-white">{activeFeatures.communication_skills}</p>
              <span className="text-[10px] text-slate-500">Interview &amp; GD</span>
            </div>
          </div>

          {/* 5. Technical */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Technical</span>
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-xl font-black text-white">{activeFeatures.technical_skills}</p>
              <span className="text-[10px] text-slate-500">Core CS Subjects</span>
            </div>
          </div>

          {/* 6. Projects */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Projects</span>
              <FolderGit2 className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xl font-black text-white">{activeFeatures.projects_score}</p>
              <span className="text-[10px] text-slate-500">Portfolio Quality</span>
            </div>
          </div>

          {/* 7. Certifications */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Certs</span>
              <BadgeCheck className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <p className="text-xl font-black text-white">{activeFeatures.certifications}</p>
              <span className="text-[10px] text-slate-500">Credentials Count</span>
            </div>
          </div>

          {/* 8. Internship */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Internship</span>
              <Briefcase className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <p className="text-xl font-black text-white">
                {activeFeatures.internship_experience}m
              </p>
              <span className="text-[10px] text-slate-500">Industry Exposure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Score Trend & Skill Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend Recharts */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Readiness Score Trend
              </h2>
              <p className="text-xs text-slate-400">Progression across assessment attempts</p>
            </div>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>

          <div className="h-64 w-full">
            {stats && stats.recent_trend && stats.recent_trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.recent_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                    }}
                    formatter={(val: any) => [`${val} / 100`, 'Score']}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#60a5fa', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Take multiple assessments to visualize progress over time.
              </div>
            )}
          </div>
        </div>

        {/* Skill Breakdown Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Skill Breakdown</h2>
              <p className="text-xs text-slate-400">Relative balance across 6 core criteria</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">0-100</span>
          </div>

          <SkillRadar features={activeFeatures} type="bar" />
        </div>
      </div>

      {/* Strengths, Gaps and Recommendations */}
      <StrengthGapList
        strengths={
          latestPred?.strengths || [
            'Programming & Algorithmic Problem Solving',
            'Core Technical Knowledge (CS Concepts)',
            'Communication & Interview Articulation',
          ]
        }
        skillGaps={
          latestPred?.skillGaps || [
            'Aptitude & Logical Reasoning (speed improvement needed)',
          ]
        }
        recommendations={
          latestPred?.recommendations || [
            'Practice timed quantitative aptitude mock tests daily to clear preliminary screening rounds.',
            'Strengthen system design concepts and build a full-stack deployed application.',
          ]
        }
      />

      {/* Recent Assessment Records Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Recent Assessments</h2>
            <p className="text-xs text-slate-400">Past model predictions stored in Firestore</p>
          </div>
          <button
            onClick={onViewHistory}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Score</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Model</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {history && history.length > 0 ? (
                history.slice(0, 4).map((record) => (
                  <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {record.createdAt ? record.createdAt.slice(0, 10) : 'Recent'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-white">{record.score}</span> / 100
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          record.category === 'Highly Ready'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : record.category === 'Moderately Ready'
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {record.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{record.modelName}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectPrediction(record)}
                        className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline text-[11px]"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 italic">
                    No past assessments recorded yet. Run your first assessment!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
