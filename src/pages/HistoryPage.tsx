import React, { useState, useEffect } from 'react';
import {
  History,
  TrendingUp,
  Calendar,
  Eye,
  ArrowRight,
  Filter,
  Sparkles,
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
import { PredictionRecord } from '../types';
import { api } from '../services/api';

interface HistoryPageProps {
  onSelectRecord: (record: PredictionRecord) => void;
  onNewAssessment: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onSelectRecord,
  onNewAssessment,
}) => {
  const [history, setHistory] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await api.getHistory();
        setHistory(res.history || []);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    if (filterCategory === 'ALL') return true;
    return item.category.toUpperCase().includes(filterCategory);
  });

  const chartData = [...history]
    .reverse()
    .map((item, idx) => ({
      idx: idx + 1,
      date: item.createdAt ? item.createdAt.slice(0, 10) : `Trial ${idx + 1}`,
      score: item.score,
      category: item.category,
    }));

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-1">
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail &amp; Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Prediction History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Historical placement readiness scores retrieved from Cloud Firestore
          </p>
        </div>

        <button
          onClick={onNewAssessment}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>New Assessment</span>
        </button>
      </div>

      {/* Readiness Score Over Time Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Readiness Score Over Time</h2>
              <p className="text-xs text-slate-400">Progression trajectory from Firestore records</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">Total: {history.length} records</span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
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
                  formatter={(value: any) => [`${value} / 100`, 'Score']}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#60a5fa', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
              No historical records found. Run an assessment to generate your first score!
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">All Logged Predictions</h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {['ALL', 'HIGHLY', 'MODERATELY', 'NEEDS'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <span className="inline-block w-5 h-5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-2" />
            <p>Loading prediction records from Firestore...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date / Time</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Readiness Category</th>
                  <th className="py-3.5 px-4">Key Strengths</th>
                  <th className="py-3.5 px-4">Model Used</th>
                  <th className="py-3.5 px-4 text-right">View Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {item.createdAt ? item.createdAt.replace('T', ' ').slice(0, 16) : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-bold text-white">{item.score}</span>
                        <span className="text-slate-500"> / 100</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            item.category === 'Highly Ready'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : item.category === 'Moderately Ready'
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-400">
                        {item.strengths && item.strengths.length > 0
                          ? item.strengths.slice(0, 2).join(', ')
                          : 'General competencies'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {item.modelName}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onSelectRecord(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white transition-colors cursor-pointer text-[11px] font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
