'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Thermometer,
  Droplets,
  CloudRain,
  Sun,
  Gauge,
  Home,
  RefreshCw,
  Radio,
  BatteryCharging,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
} from 'lucide-react';
import { WeatherResponse } from './api/weather/route';
import { WindCompass } from '@/components/WindCompass';
import { RadialGauge } from '@/components/RadialGauge';
import { TrendChart } from '@/components/TrendChart';
import { AppleWeatherCard } from '@/components/AppleWeatherCard';

export default function WeatherDashboard() {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  const fetchWeather = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/weather');
      if (res.ok) {
        const json: WeatherResponse = await res.json();
        setData(json);
        setLastFetchTime(new Date());
      }
    } catch (err) {
      console.error('Failed to load weather data:', err);
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setRefreshing(false), 600);
      }
    }
  }, []);

  // Initial fetch and 60-second periodic refresh
  useEffect(() => {
    fetchWeather();
    const interval = setInterval(() => {
      fetchWeather();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-slate-300">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-sky-400/20 border-t-sky-400 animate-spin" />
          <Radio className="w-6 h-6 text-sky-400 absolute" />
        </div>
        <p className="mt-4 text-sm font-medium tracking-wide">Connecting to WS-5000 Station...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-slate-300">
        <p className="text-base">Unable to connect to weather service.</p>
        <button
          onClick={() => fetchWeather(true)}
          className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const { current, deviceInfo, history, isMockData } = data;

  // UV Severity Tier
  const getUvDetails = (uv: number) => {
    if (uv <= 2) return { text: 'Low', color: '#34d399', advise: 'Minimal protection needed' };
    if (uv <= 5) return { text: 'Moderate', color: '#fbbf24', advise: 'Wear sunscreen outdoors' };
    if (uv <= 7) return { text: 'High', color: '#f97316', advise: 'Seek shade during midday' };
    if (uv <= 10) return { text: 'Very High', color: '#ef4444', advise: 'Extra sun protection' };
    return { text: 'Extreme', color: '#a855f7', advise: 'Avoid direct sun exposure' };
  };
  const uvInfo = getUvDetails(current.uvIndex);

  // Pressure Trend Icon
  const renderPressureTrendIcon = () => {
    if (current.pressureTrend === 'rising') {
      return (
        <span className="flex items-center text-emerald-400 text-xs font-medium gap-0.5">
          <ArrowUpRight className="w-3.5 h-3.5" /> Rising
        </span>
      );
    }
    if (current.pressureTrend === 'falling') {
      return (
        <span className="flex items-center text-rose-400 text-xs font-medium gap-0.5">
          <ArrowDownRight className="w-3.5 h-3.5" /> Falling
        </span>
      );
    }
    return (
      <span className="flex items-center text-slate-400 text-xs font-medium gap-0.5">
        <Minus className="w-3.5 h-3.5" /> Steady
      </span>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#070b14] text-slate-100 overflow-x-hidden selection:bg-sky-500/30 selection:text-white">
      {/* Ambient background glows for glass depth */}
      <div className="ambient-glow bg-sky-600 w-96 h-96 -top-20 -left-20" />
      <div className="ambient-glow bg-indigo-600 w-[30rem] h-[30rem] top-1/3 -right-32 opacity-20" />
      <div className="ambient-glow bg-amber-600 w-80 h-80 bottom-10 left-1/4 opacity-15" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-3xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">{deviceInfo.name}</h1>
              <span className="glass-pill px-2.5 py-0.5 rounded-full text-[11px] font-mono text-sky-300">
                WS-5000
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>{deviceInfo.location || 'Local Station'}</span>
              <span>•</span>
              <span>MAC: {deviceInfo.macAddress}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status indicator */}
            {isMockData ? (
              <button
                onClick={() => setShowConfigHelp(!showConfigHelp)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs hover:bg-amber-500/20 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Preview Mode</span>
                <Info className="w-3 h-3 text-amber-400" />
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Telemetry</span>
              </div>
            )}

            {/* Refresh button */}
            <button
              onClick={() => fetchWeather(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill hover:bg-white/10 text-xs font-medium text-slate-200 transition-all cursor-pointer"
              title="Refresh weather data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>
                {lastFetchTime ? lastFetchTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Refresh'}
              </span>
            </button>
          </div>
        </header>

        {/* API Key Banner Helper (collapsible) */}
        {(isMockData || showConfigHelp) && (
          <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 bg-amber-500/5 text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between text-amber-300 font-semibold">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span>Connect Your Live Ambient Weather WS-5000</span>
              </div>
              <button
                onClick={() => setShowConfigHelp(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p>
              To stream real-time data from your physical station, copy your keys from{' '}
              <a
                href="https://ambientweather.net/account"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 underline hover:text-sky-300"
              >
                AmbientWeather.net/account
              </a>{' '}
              into your local <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-200">.env.local</code> file:
            </p>
            <pre className="p-3 rounded-xl bg-black/60 font-mono text-[11px] text-emerald-300 overflow-x-auto">
{`AMBIENT_API_KEY=your_api_key_here
AMBIENT_APPLICATION_KEY=your_application_key_here`}
            </pre>
          </div>
        )}

        {/* Hero Section: Apple Weather Style Giant Glass Display */}
        <section className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 relative overflow-hidden">
          <div className="space-y-3 z-10">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold tracking-wider uppercase">
              <Thermometer className="w-4 h-4" />
              <span>Outdoor Conditions</span>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-6xl sm:text-7xl font-extrabold tracking-tighter text-white">
                {current.tempF.toFixed(1)}°
              </span>
              <div className="space-y-0.5">
                <div className="text-lg font-medium text-slate-200">
                  Feels like {current.feelsLikeF.toFixed(1)}°
                </div>
                <div className="text-xs text-slate-400">
                  Dew Point: <span className="text-slate-200 font-medium">{current.dewPointF.toFixed(1)}°</span>
                </div>
              </div>
            </div>

            {/* Quick Climate Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="glass-pill px-3 py-1 rounded-full text-xs flex items-center gap-1.5 text-slate-300">
                <Home className="w-3.5 h-3.5 text-emerald-400" />
                <span>Indoor: <strong className="text-white">{current.tempIndoorF.toFixed(1)}°F</strong> ({current.humidityIndoor}%)</span>
              </div>

              <div className="glass-pill px-3 py-1 rounded-full text-xs flex items-center gap-1.5 text-slate-300">
                <Gauge className="w-3.5 h-3.5 text-sky-400" />
                <span>Barometer: <strong className="text-white">{current.pressureRelInHg.toFixed(2)} inHg</strong></span>
                <span>•</span>
                {renderPressureTrendIcon()}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar on the Right */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:max-w-md w-full z-10 text-xs">
            <div className="glass-panel p-3 rounded-2xl">
              <div className="text-slate-400">Outdoor Humidity</div>
              <div className="text-xl font-bold text-white mt-0.5">{current.humidity}%</div>
            </div>

            <div className="glass-panel p-3 rounded-2xl">
              <div className="text-slate-400">Daily Rain</div>
              <div className="text-xl font-bold text-sky-400 mt-0.5">{current.rainDailyIn.toFixed(2)} in</div>
            </div>

            <div className="glass-panel p-3 rounded-2xl col-span-2 sm:col-span-1">
              <div className="text-slate-400">Solar Radiation</div>
              <div className="text-xl font-bold text-amber-400 mt-0.5">{current.solarRadiation} <span className="text-xs font-normal text-slate-400">W/m²</span></div>
            </div>
          </div>
        </section>

        {/* WS-5000 Instrument Gauges & Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Ultrasonic Wind Dial */}
          <div className="lg:col-span-2">
            <WindCompass
              speedMph={current.windSpeedMph}
              gustMph={current.windGustMph}
              directionDeg={current.windDirectionDeg}
              maxDailyGustMph={current.maxDailyGustMph}
            />
          </div>

          {/* 2. UV Index Radial Gauge */}
          <RadialGauge
            value={current.uvIndex}
            min={0}
            max={12}
            unit="UVI"
            label="UV Index"
            subLabel={uvInfo.text}
            icon={<Sun className="w-4 h-4 text-amber-400" />}
            gradientColors={['#fbbf24', uvInfo.color]}
          />

          {/* 3. Outdoor Humidity Radial Gauge */}
          <RadialGauge
            value={current.humidity}
            min={0}
            max={100}
            unit="%"
            label="Outdoor Humidity"
            subLabel={current.humidity > 70 ? 'Humid' : current.humidity < 30 ? 'Dry' : 'Comfortable'}
            icon={<Droplets className="w-4 h-4 text-sky-400" />}
            gradientColors={['#38bdf8', '#0284c7']}
          />
        </section>

        {/* Secondary Row: Rain, Barometer, Solar, Indoor */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Rain Detail Card */}
          <AppleWeatherCard
            icon={<CloudRain className="w-4 h-4 text-sky-400" />}
            title="Precipitation"
            badge="Tipping Gauge"
            value={
              <span>
                {current.rainDailyIn.toFixed(2)} <span className="text-base font-normal text-slate-400">in today</span>
              </span>
            }
            subValue={`Rate: ${current.rainHourlyIn.toFixed(2)} in/hr`}
            footer={
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[10px] text-slate-400">Event</div>
                  <div className="font-semibold text-slate-200">{current.rainEventIn.toFixed(2)}&quot;</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Monthly</div>
                  <div className="font-semibold text-slate-200">{current.rainMonthlyIn.toFixed(2)}&quot;</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Yearly</div>
                  <div className="font-semibold text-slate-200">{current.rainYearlyIn.toFixed(2)}&quot;</div>
                </div>
              </div>
            }
          />

          {/* Barometric Pressure Card */}
          <AppleWeatherCard
            icon={<Gauge className="w-4 h-4 text-emerald-400" />}
            title="Barometric Pressure"
            badge={current.pressureTrend}
            value={
              <span>
                {current.pressureRelInHg.toFixed(2)} <span className="text-base font-normal text-slate-400">inHg</span>
              </span>
            }
            subValue={`Absolute: ${current.pressureAbsInHg.toFixed(2)} inHg`}
            footer={
              <div className="flex items-center justify-between">
                <span>3h Trend:</span>
                {renderPressureTrendIcon()}
              </div>
            }
          />

          {/* Solar Radiation Meter */}
          <RadialGauge
            value={current.solarRadiation}
            min={0}
            max={1200}
            unit="W/m²"
            label="Solar Radiation"
            subLabel={current.solarRadiation > 500 ? 'Bright Daylight' : current.solarRadiation > 100 ? 'Low Sun' : 'Night / Overcast'}
            icon={<Sun className="w-4 h-4 text-yellow-400" />}
            gradientColors={['#f59e0b', '#fbbf24']}
          />

          {/* Indoor Console Card */}
          <AppleWeatherCard
            icon={<Home className="w-4 h-4 text-indigo-400" />}
            title="Indoor Console"
            badge="WS-5000 Console"
            value={
              <span>
                {current.tempIndoorF.toFixed(1)}° <span className="text-base font-normal text-slate-400">Indoor</span>
              </span>
            }
            subValue={`Relative Humidity: ${current.humidityIndoor}%`}
            footer={
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> Sensor Batteries
                </span>
                <span className="font-semibold text-emerald-400">Optimal</span>
              </div>
            }
          />
        </section>

        {/* 24-Hour Historical Trend Charts */}
        <section>
          <TrendChart history={history} />
        </section>

        {/* Footer info */}
        <footer className="text-center text-xs text-slate-500 py-4 border-t border-white/5 space-y-1">
          <p>
            Connected to <strong>Ambient Weather WS-5000</strong> Ultrasonic Personal Weather Station
          </p>
          <p>
            Auto-refreshes every 60 seconds • Local and Cloudflare/Netlify Ready
          </p>
        </footer>
      </main>
    </div>
  );
}
