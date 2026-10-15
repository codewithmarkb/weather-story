'use client';

import React from 'react';

interface RadialGaugeProps {
  value: number;
  min?: number;
  max: number;
  unit: string;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  gradientColors: [string, string];
  formatValue?: (val: number) => string;
}

export function RadialGauge({
  value,
  min = 0,
  max,
  unit,
  label,
  subLabel,
  icon,
  gradientColors,
  formatValue,
}: RadialGaugeProps) {
  const radius = 56;
  const strokeWidth = 9;
  const normalizedValue = Math.min(Math.max(value, min), max);
  const percentage = (normalizedValue - min) / (max - min);

  // 240 degree arc (from 150 deg to 390 deg)
  const arcDegrees = 240;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (circumference * arcDegrees) / 360;
  const strokeDashoffset = arcLength - percentage * arcLength;

  const displayVal = formatValue ? formatValue(value) : value.toString();

  // Unique id for SVG linearGradient
  const gradientId = `gauge-grad-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div className="glass-panel glass-panel-hover rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-slate-300 font-medium text-sm tracking-wide">
          {icon}
          <span>{label}</span>
        </div>
      </div>

      {/* Radial Arc */}
      <div className="relative flex flex-col items-center justify-center my-3">
        <svg className="w-36 h-36" viewBox="0 0 140 140">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientColors[0]} />
              <stop offset="100%" stopColor={gradientColors[1]} />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(150 70 70)"
          />

          {/* Progress Arc */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(150 70 70)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <div className="text-2xl font-bold tracking-tight text-white flex items-baseline">
            {displayVal}
            <span className="text-xs font-normal text-slate-400 ml-1">{unit}</span>
          </div>
          {subLabel && (
            <span className="text-xs font-medium text-slate-300 mt-0.5 px-2 py-0.5 rounded-full bg-white/5">
              {subLabel}
            </span>
          )}
        </div>
      </div>

      {/* Min/Max indicators */}
      <div className="flex justify-between items-center text-[11px] text-slate-400 px-3 z-10 border-t border-white/5 pt-2">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

