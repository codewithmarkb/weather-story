'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Thermometer, Wind, Gauge, Sun } from 'lucide-react';
import { WeatherDataPoint } from '../app/api/weather/route';

interface TrendChartProps {
  history: WeatherDataPoint[];
}

type TabType = 'temperature' | 'wind' | 'barometer' | 'solar';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; unit?: string }>;
  label?: string;
  unit: string;
}

const CustomTooltip = ({ active, payload, label, unit }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 rounded-xl border border-white/20 shadow-xl text-xs space-y-1">
        <div className="font-semibold text-slate-300 border-b border-white/10 pb-1">{label}</div>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span style={{ color: item.color }} className="font-medium">
              {item.name}:
            </span>
            <span className="font-mono text-white font-bold">
              {item.value} {unit}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TrendChart({ history }: TrendChartProps) {
  const [activeTab, setActiveTab] = useState<TabType>('temperature');

  if (!history || history.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-6 text-center text-slate-400">
        No historical telemetry available yet.
      </div>
    );
  }

  const tabs = [
    { id: 'temperature' as TabType, label: 'Temperature', icon: Thermometer, unit: '°F' },
    { id: 'wind' as TabType, label: 'Wind & Gusts', icon: Wind, unit: 'mph' },
    { id: 'barometer' as TabType, label: 'Barometer', icon: Gauge, unit: 'inHg' },
    { id: 'solar' as TabType, label: 'Solar Radiation', icon: Sun, unit: 'W/m²' },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col gap-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-semibold text-white">24-Hour Telemetry Trends</h3>
          <p className="text-xs text-slate-400">Station observations captured over the last 24 hours</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/40 border border-white/10 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm border border-white/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'temperature' ? (
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={['dataMin - 3', 'dataMax + 3']} />
              <Tooltip content={<CustomTooltip unit="°F" />} />
              <Area
                type="monotone"
                dataKey="tempF"
                name="Temperature"
                stroke="#f97316"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#tempGradient)"
              />
            </AreaChart>
          ) : activeTab === 'wind' ? (
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gustGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 'dataMax + 5']} />
              <Tooltip content={<CustomTooltip unit="mph" />} />
              <Area
                type="monotone"
                dataKey="windGustMph"
                name="Gust"
                stroke="#818cf8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#gustGradient)"
              />
              <Area
                type="monotone"
                dataKey="windSpeedMph"
                name="Sustained Wind"
                stroke="#38bdf8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#windGradient)"
              />
            </AreaChart>
          ) : activeTab === 'barometer' ? (
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                domain={['dataMin - 0.05', 'dataMax + 0.05']}
                tickFormatter={(val) => val.toFixed(2)}
              />
              <Tooltip content={<CustomTooltip unit="inHg" />} />
              <Area
                type="monotone"
                dataKey="pressureInHg"
                name="Pressure"
                stroke="#34d399"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#pressureGradient)"
              />
            </AreaChart>
          ) : (
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 'dataMax + 50']} />
              <Tooltip content={<CustomTooltip unit="W/m²" />} />
              <Area
                type="monotone"
                dataKey="solarRadiation"
                name="Solar Radiation"
                stroke="#fbbf24"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#solarGradient)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

