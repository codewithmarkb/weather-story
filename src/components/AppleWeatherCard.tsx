'use client';

import React from 'react';

interface AppleWeatherCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | React.ReactNode;
  subValue?: string | React.ReactNode;
  footer?: string | React.ReactNode;
  badge?: string;
  className?: string;
}

export function AppleWeatherCard({
  icon,
  title,
  value,
  subValue,
  footer,
  badge,
  className = '',
}: AppleWeatherCardProps) {
  return (
    <div
      className={`glass-panel glass-panel-hover rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-slate-400 font-medium text-xs tracking-wider uppercase">
          {icon}
          <span>{title}</span>
        </div>
        {badge && (
          <span className="glass-pill px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-300">
            {badge}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="my-3 z-10">
        <div className="text-3xl font-bold tracking-tight text-white">{value}</div>
        {subValue && <div className="text-xs text-slate-300 mt-1">{subValue}</div>}
      </div>

      {/* Footer */}
      {footer && (
        <div className="text-xs text-slate-400 border-t border-white/5 pt-3 mt-1 z-10">
          {footer}
        </div>
      )}
    </div>
  );
}

