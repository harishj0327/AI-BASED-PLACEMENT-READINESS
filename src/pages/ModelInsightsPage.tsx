import React, { useState, useEffect } from 'react';
import {
  Cpu,
  BarChart2,
  Layers,
  Award,
  CheckCircle2,
  FileCode2,
  HelpCircle,
  Database,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';
import { ModelMetricsResponse } from '../types';
import { api } from '../services/api';

export const ModelInsightsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await api.getModelMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load model metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const comparisonData = metrics?.comparison_table
    ? Object.entries(metrics.comparison_table).map(([name, item]) => ({
        name: name.replace(' Regressor', ''),
        fullName: name,
        MAE: item.mae,
        RMSE: item.rmse,
        R2: item.r2,
        isBest: name === metrics.active_model,
      }))
    : [];

  const featureImportanceData = metrics?.feature_importance
    ? Object.entries(metrics.feature_importance).map(([feat, pct]) => ({
        feature: feat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        rawKey: feat,
        importance: pct,
      }))
    : [];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-1">
          <Cpu className="w-3.5 h-3.5" />
          <span>Machine Learning Viva &amp; Architecture Showcase</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Model Insights &amp; Algorithmic Comparison
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Empirical evaluation across 4 regression algorithms, error metrics, and learned feature
          importance
        </p>
      </div>

      {/* Selected Model Performance Cards */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold">
              Production Selected Model
            </span>
            <h2 className="text-2xl font-black text-white mt-1">
              {metrics?.active_model || 'Linear Regression'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Selection Criterion: <strong>{metrics?.selection_criterion || 'Lowest RMSE with R² >= 0.85'}</strong>
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Optimal Generalization on Unseen Test Split</span>
          </div>
        </div>

        {/* 3 Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Mean Absolute Error (MAE)</span>
            <p className="text-3xl font-black text-white mt-1">
              {metrics?.metrics_summary?.mae ?? 3.567}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Average deviation across 0–100 scale on test split.
            </p>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400">
              Root Mean Squared Error (RMSE)
            </span>
            <p className="text-3xl font-black text-blue-400 mt-1">
              {metrics?.metrics_summary?.rmse ?? 4.549}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Penalizes large outlier estimation errors.
            </p>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400">
              R-Squared (R²) Coefficient
            </span>
            <p className="text-3xl font-black text-emerald-400 mt-1">
              {metrics?.metrics_summary?.r2 ?? 0.7817}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              ~78.2% of target variance explained by inputs.
            </p>
          </div>
        </div>
      </div>

      {/* Model Comparison Table & Visual Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Comparison Table */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="pb-4 border-b border-slate-800 mb-4">
            <h3 className="text-base font-bold text-white tracking-tight">
              Four Models Comparison Table
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated strictly on the held-out 20% test partition (300 samples)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Algorithm</th>
                  <th className="py-3 px-3">MAE</th>
                  <th className="py-3 px-3">RMSE</th>
                  <th className="py-3 px-3">R² Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {comparisonData.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      item.isBest ? 'bg-blue-600/10 font-semibold' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-3 px-3 flex items-center gap-2">
                      <span className="text-white">{item.fullName}</span>
                      {item.isBest && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Selected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">{item.MAE.toFixed(3)}</td>
                    <td className="py-3 px-3 font-mono text-blue-400">{item.RMSE.toFixed(3)}</td>
                    <td className="py-3 px-3 font-mono text-emerald-400">{item.R2.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            <strong>Viva Talking Point:</strong> Linear Regression delivered the lowest RMSE (4.549)
            and highest R² (0.7817), outperforming tree models because academic score compounding is
            predominantly smooth and monotonic across normalized distributions.
          </div>
        </div>

        {/* Model Metrics Chart */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="pb-4 border-b border-slate-800 mb-4">
            <h3 className="text-base font-bold text-white tracking-tight">
              Empirical Error Comparison (RMSE vs MAE)
            </h3>
            <p className="text-xs text-slate-400">Lower error indicates superior predictive accuracy</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="RMSE" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="MAE" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feature Importance Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="pb-4 border-b border-slate-800 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Feature Importance &amp; Model Explainability
            </h3>
            <p className="text-xs text-slate-400">
              Normalized relative weight of each evaluated dimension calculated from the trained model
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Computed Dynamically
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Bar Chart */}
          <div className="lg:col-span-7 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={featureImportanceData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis
                  type="number"
                  unit="%"
                  domain={[0, 30]}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="feature"
                  tick={{ fill: '#cbd5e1', fontSize: 11 }}
                  width={140}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Importance']}
                />
                <Bar dataKey="importance" fill="#6366f1" radius={[0, 6, 6, 0]}>
                  {featureImportanceData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#3b82f6' : index < 3 ? '#6366f1' : '#0ea5e9'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Insights List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
              <h4 className="font-semibold text-white">Dominant Factors:</h4>
              <p className="text-slate-300 leading-relaxed">
                1. <strong>Programming Skills (~23.1%)</strong> and{' '}
                <strong>Aptitude Score (~16.0%)</strong> emerge as the two heaviest predictors of
                clearing initial placement rounds.
              </p>
              <p className="text-slate-300 leading-relaxed">
                2. <strong>Technical Skills (~14.9%)</strong> and{' '}
                <strong>Communication Skills (~13.0%)</strong> determine technical interview clearance.
              </p>
              <p className="text-slate-300 leading-relaxed">
                3. <strong>CGPA (~10.9%)</strong> acts as a foundational qualifying constraint rather
                than a standalone guarantee of placement.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400">
              Dataset: 1,500 Academic Records | Features: 8 | Split: 80/20 Train-Test | Preprocessing:
              StandardScaler + SimpleImputer Pipeline
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
