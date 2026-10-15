'use client';

import React from 'react';
import { Compass, Wind } from 'lucide-react';

interface WindCompassProps {
  speedMph: number;
  gustMph: number;
  directionDeg: number;
  maxDailyGustMph: number;
}

export function WindCompass({ speedMph, gustMph, directionDeg, maxDailyGustMph }: WindCompassProps) {
  // Convert degrees to cardinal direction name
  const getCardinal = (deg: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round((deg % 360) / 22.5) % 16;
    return directions[idx];
  };

  const cardinal = getCardinal(directionDeg);

  return (
    <div className="glass-panel glass-panel-hover rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-sky-400 font-medium text-sm tracking-wide uppercase">
          <Compass className="w-4 h-4" />
          <span>Ultrasonic Wind</span>
        </div>
        <span className="glass-pill px-2.5 py-0.5 rounded-full text-xs font-mono text-slate-300">
          WS-5000 Sonic
        </span>
      </div>

      {/* Main Gauge */}
      <div className="flex flex-col items-center justify-center my-4 relative">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Outer dial ring */}
          <div className="absolute inset-0 rounded-full border border-white/10 bg-gradient-to-b from-white/5 to-transparent shadow-inner" />
          
          {/* Tick marks and cardinal points */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="absolute top-2 text-xs font-bold text-sky-300 tracking-wider">N</span>
            <span className="absolute right-3 text-xs font-bold text-slate-400">E</span>
            <span className="absolute bottom-2 text-xs font-bold text-slate-400">S</span>
            <span className="absolute left-3 text-xs font-bold text-slate-400">W</span>
            
            {/* Subtle degree ticks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                className="absolute w-full h-full flex justify-center pointer-events-none"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div className={`w-0.5 ${deg % 90 === 0 ? 'h-2 bg-white/40' : 'h-1.5 bg-white/20'}`} />
              </div>
            ))}
          </div>

          {/* Compass Needle Indicator (points toward wind direction) */}
          <div
            className="absolute inset-4 transition-transform duration-1000 ease-out flex justify-center items-start"
            style={{ transform: `rotate(${directionDeg}deg)` }}
          >
            {/* Arrowhead */}
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[14px] border-b-sky-400 filter drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
          </div>

          {/* Inner Display Hub */}
          <div className="w-28 h-28 rounded-full glass-panel flex flex-col items-center justify-center text-center z-10 border border-white/20 shadow-2xl">
            <div className="text-3xl font-bold tracking-tight text-white flex items-baseline justify-center">
              {speedMph.toFixed(1)}
              <span className="text-xs font-normal text-slate-400 ml-1">mph</span>
            </div>
            <div className="text-xs font-semibold text-sky-400 mt-0.5">
              {directionDeg}° {cardinal}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 z-10 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Wind className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-slate-400">Current Gust</div>
            <div className="font-semibold text-slate-100">{gustMph.toFixed(1)} mph</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Wind className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-slate-400">Peak Today</div>
            <div className="font-semibold text-slate-100">{maxDailyGustMph.toFixed(1)} mph</div>
          </div>
        </div>
      </div>
    </div>
  );
}

