import { useEffect, useState } from 'react';
import { CloudRain, Sun, Cloud, AlertTriangle, Sparkles } from 'lucide-react';
import { getDayWeather } from '@/services/weather.js';

export function WeatherBadge({ city, dateIso, dayIndex = 0, outdoorCount = 0, onFixDay }) {
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
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-[11px] text-muted animate-pulse">
        <span>🌤️</span>
        <span>Loading...</span>
      </span>
    );
  }

  const isRainRisk = weather.isBad && outdoorCount > 0;

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
