import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { PredictionRequest } from '../types';

interface SkillRadarProps {
  features: PredictionRequest;
  type?: 'radar' | 'bar';
}

export const SkillRadar: React.FC<SkillRadarProps> = ({ features, type = 'bar' }) => {
  const data = [
    { skill: 'Programming', score: features.programming_skills, benchmark: 75, color: '#3b82f6' },
    { skill: 'Technical', score: features.technical_skills, benchmark: 75, color: '#6366f1' },
    { skill: 'Aptitude', score: features.aptitude_score, benchmark: 70, color: '#0ea5e9' },
    { skill: 'Communication', score: features.communication_skills, benchmark: 70, color: '#10b981' },
    { skill: 'Projects', score: features.projects_score, benchmark: 70, color: '#f59e0b' },
    { skill: 'CGPA (x10)', score: Math.round(features.cgpa * 10), benchmark: 75, color: '#8b5cf6' },
  ];

  if (type === 'radar') {
    return (
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
            <Radar
              name="Student Score"
              dataKey="score"
              stroke="#38bdf8"
              fill="#0ea5e9"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="skill"
            tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }}
            width={95}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              color: '#f8fafc',
            }}
            formatter={(value: any) => [`${value} / 100`, 'Score']}
          />
          <Bar dataKey="score" radius={[0, 6, 6, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
