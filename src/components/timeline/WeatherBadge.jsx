import { useEffect, useState } from 'react';
import { CloudRain, Sun, Cloud, AlertTriangle, Sparkles } from 'lucide-react';
import { getDayWeather } from '@/services/weather.js';

export function WeatherBadge({ city, dateIso, dayIndex = 0, outdoorCount = 0, onFixDay, compact = false }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getDayWeather(city, dateIso, dayIndex).then((w) => {
      if (mounted) {
        setWeather(w);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [city, dateIso, dayIndex]);

  if (loading || !weather) {
    if (compact) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted animate-pulse shrink-0">
          <span>🌤️</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-[11px] text-muted animate-pulse">
        <span>🌤️</span>
        <span>Loading...</span>
      </span>
    );
  }

  const isRainRisk = weather.isBad && outdoorCount > 0;

  // Ultra-sleek Compact View for tight Calendar grid cells
  if (compact) {
    if (isRainRisk) {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onFixDay) onFixDay(weather);
          }}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold border transition-all bg-rose-500/25 border-rose-500/50 text-rose-200 hover:bg-rose-500/40 cursor-pointer animate-pulse shrink-0"
          title={`Rain Alert: ${outdoorCount} outdoor ${outdoorCount === 1 ? 'activity' : 'activities'} at risk! Click to Fix Day ⚡`}
        >
          <span>{weather.icon}</span>
          <span>{weather.temp}°</span>
          <span className="rounded bg-rose-500/60 px-1 text-[9px] text-white font-bold">⚡Fix</span>
        </button>
      );
    }

    return (
      <div
        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] border shrink-0 transition-all ${
          weather.isBad
            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            : weather.icon === '☀️'
            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            : 'bg-white/10 border-border/40 text-parchment'
        }`}
        title={`${weather.condition} · High: ${weather.temp}°C · Rain Chance: ${weather.precipProb}%`}
      >
        <span>{weather.icon}</span>
        <span className="font-semibold">{weather.temp}°</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Weather Pill */}
      <div
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] transition-all border ${
          weather.isBad
            ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            : weather.icon === '☀️'
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
            : 'bg-white/10 border-border/50 text-parchment'
        }`}
        title={`${weather.condition} · High: ${weather.temp}°C · Rain Chance: ${weather.precipProb}%`}
      >
        <span className="text-xs">{weather.icon}</span>
        <span className="font-semibold">{weather.temp}°C</span>
        <span className="text-[10px] opacity-75 hidden sm:inline">({weather.condition})</span>
        {weather.precipProb > 30 && (
          <span className="text-[10px] font-bold text-sky-400">💧 {weather.precipProb}%</span>
        )}
      </div>

      {/* Weather Warning & Fix My Day Trigger */}
      {isRainRisk && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onFixDay) onFixDay(weather);
          }}
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500/20 to-amber-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-rose-300 border border-rose-500/40 hover:brightness-125 transition-all shadow-xs cursor-pointer animate-pulse"
          title="Heavy precipitation forecast! Outdoor activities will be affected."
        >
          <AlertTriangle className="h-3 w-3 shrink-0 text-amber-400" />
          <span>🌧️ {outdoorCount} Outdoor at Risk</span>
          <span className="rounded bg-rose-500/40 px-1 py-0.2 text-[9px] text-white font-bold underline">
            Fix Day ⚡
          </span>
        </button>
      )}
    </div>
  );
}
