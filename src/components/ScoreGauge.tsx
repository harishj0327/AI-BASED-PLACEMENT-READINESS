import React from 'react';

interface ScoreGaugeProps {
  score: number;
  category: string;
  size?: 'sm' | 'md' | 'lg';
  showCategory?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  category,
  size = 'md',
  showCategory = true,
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score * 10) / 10));

  // Determine styling based on category
  const getCategoryConfig = () => {
    if (clampedScore >= 80) {
      return {
        label: 'Highly Ready',
        color: '#10b981', // emerald
        badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        textColor: 'text-emerald-400',
        glow: 'shadow-emerald-500/20',
      };
    } else if (clampedScore >= 60) {
      return {
        label: 'Moderately Ready',
        color: '#0ea5e9', // sky blue
        badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
        textColor: 'text-sky-400',
        glow: 'shadow-sky-500/20',
      };
    } else if (clampedScore >= 40) {
      return {
        label: 'Needs Improvement',
        color: '#f59e0b', // amber
        badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        textColor: 'text-amber-400',
        glow: 'shadow-amber-500/20',
      };
    } else {
      return {
        label: 'Not Ready',
        color: '#ef4444', // red
        badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        textColor: 'text-rose-400',
        glow: 'shadow-rose-500/20',
      };
    }
  };

  const config = getCategoryConfig();

  // Dimensions
  const radius = size === 'lg' ? 90 : size === 'md' ? 70 : 45;
  const strokeWidth = size === 'lg' ? 14 : size === 'md' ? 11 : 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;
  const dimension = (radius + strokeWidth) * 2;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className={`relative flex items-center justify-center ${config.glow}`}>
        <svg
          width={dimension}
          height={dimension}
          className="transform -rotate-90 transition-all duration-1000 ease-out"
        >
          {/* Background Track */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Fill */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke={config.color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-black tracking-tight text-white ${
              size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-3xl' : 'text-xl'
            }`}
          >
            {clampedScore}
          </span>
          <span
            className={`font-medium text-slate-400 uppercase tracking-wider ${
              size === 'lg' ? 'text-xs' : 'text-[10px]'
            }`}
          >
            / 100
          </span>
        </div>
      </div>

      {showCategory && (
        <div className="mt-4 text-center">
          <span
            className={`inline-block px-3.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${config.badgeBg}`}
          >
            {category || config.label}
          </span>
        </div>
      )}
    </div>
  );
};
