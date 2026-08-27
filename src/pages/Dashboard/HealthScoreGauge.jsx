import React from 'react';

export const HealthScoreGauge = ({ score = 85 }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = () => {
    if (score >= 80) return 'stroke-emerald-400 text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'stroke-sky-400 text-sky-600 dark:text-sky-400';
    return 'stroke-amber-400 text-amber-600 dark:text-amber-400';
  };

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          className="stroke-slate-200 dark:stroke-slate-700/80 fill-none"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          className={`fill-none transition-all duration-1000 ease-out ${getScoreColor()}`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{score}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Health Score
        </span>
      </div>
    </div>
  );
};
