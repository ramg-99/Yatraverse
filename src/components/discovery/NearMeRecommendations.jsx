import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navigation, MapPin, Compass, Car, Plane, Sparkles, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { useWorldStore } from '@/store/useWorldStore.js';
import { haversineDistance } from '@/lib/paceCalculator.js';
import { onImgError } from '@/lib/image.js';

// Pre-configured hub coordinates for 1-click location simulation
const POPULAR_HUBS = [
  { name: 'My Live GPS Location', lat: null, lng: null, isGps: true },
  { name: 'Mumbai (BOM)', lat: 19.076, lng: 72.877 },
  { name: 'Delhi (DEL)', lat: 28.6139, lng: 77.209 },
  { name: 'Bengaluru (BLR)', lat: 12.9716, lng: 77.5946 },
  { name: 'Jaipur (JAI)', lat: 26.912, lng: 75.787 },
  { name: 'London (LON)', lat: 51.5074, lng: -0.1278 },
  { name: 'Paris (PAR)', lat: 48.8566, lng: 2.3522 },
  { name: 'Tokyo (TYO)', lat: 35.6762, lng: 139.6503 },
  { name: 'New York (NYC)', lat: 40.7128, lng: -74.006 },
];

export function NearMeRecommendations() {
  const nav = useNavigate();
  const world = useWorldStore();
  const cities = world.cities || [];
  const trips = world.trips || [];

  const [selectedHub, setSelectedHub] = useState(POPULAR_HUBS[0]);
  const [userCoords, setUserCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationName, setLocationName] = useState('Detecting...');
  const [locationError, setLocationError] = useState(null);

  // Request browser geolocation
  const detectLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      fallbackToHub(POPULAR_HUBS[1]); // Fallback to Mumbai
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setLocationName('Live GPS Detected');
        setIsLocating(false);
      },
      (err) => {
        // Fallback gracefully to Mumbai hub if permission denied or unavailable
        fallbackToHub(POPULAR_HUBS[1]);
        setLocationError('GPS permission was denied or timed out. Defaulted to Mumbai hub.');
        setIsLocating(false);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const fallbackToHub = (hub) => {
    setSelectedHub(hub);
    setUserCoords({ lat: hub.lat, lng: hub.lng });
    setLocationName(hub.name);
  };

  // Run on mount
  useEffect(() => {
    detectLiveLocation();
  }, []);

  // Handle manual selection from dropdown
  const handleHubChange = (hub) => {
    setSelectedHub(hub);
    if (hub.isGps) {
      detectLiveLocation();
    } else {
      setUserCoords({ lat: hub.lat, lng: hub.lng });
      setLocationName(hub.name);
      setLocationError(null);
    }
  };

  // Calculate distance to all cities and rank closest
  const rankedCities = useMemo(() => {
    if (!userCoords || cities.length === 0) return [];

    return cities
      .map((c) => {
        const distKm = Math.round(haversineDistance(userCoords.lat, userCoords.lng, c.lat, c.lng));
        let transitEstimate = '';
        let badge = '';

        if (distKm < 500) {
          const driveHours = Math.round((distKm / 65) * 10) / 10;
          transitEstimate = `~${driveHours}h road / rail`;
          badge = '🚗 Weekend Escape';
        } else if (distKm < 1500) {
          const flightHours = Math.round((distKm / 650) * 10) / 10 + 1.2;
          transitEstimate = `~${flightHours.toFixed(1)}h flight`;
          badge = '✈️ Short Break';
        } else {
          const flightHours = Math.round((distKm / 750) * 10) / 10 + 2;
          transitEstimate = `~${Math.round(flightHours)}h flight`;
          badge = '🌍 Global Odyssey';
        }

        return { ...c, distKm, transitEstimate, badge };
      })
      .filter((c) => c.distKm > 15) // exclude if same spot
      .sort((a, b) => a.distKm - b.distKm)
      .slice(0, 4);
  }, [userCoords, cities]);

  return (
    <div className="glass rounded-3xl border border-border/80 p-6 sm:p-7 shadow-md space-y-5 bg-gradient-to-br from-surface via-surface to-saffron/[0.04]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-saffron/15 text-saffron">
              <Navigation className="h-4 w-4 animate-pulse" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-saffron">
              Location-Based Discovery
            </span>
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold text-parchment">
            Getaways & Trips Near You
          </h2>
          <p className="text-xs text-muted">
            Ranked dynamically using Haversine geodetic distance from your current location
          </p>
        </div>

        {/* Location selector / re-detect button */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            aria-label="Current Location Origin"
            value={selectedHub.name}
            onChange={(e) => {
              const match = POPULAR_HUBS.find((h) => h.name === e.target.value);
              if (match) handleHubChange(match);
            }}
            className="rounded-xl border border-border/80 bg-ink/80 px-3 py-1.5 text-xs text-parchment font-mono outline-none focus:border-saffron cursor-pointer"
          >
            {POPULAR_HUBS.map((hub) => (
              <option key={hub.name} value={hub.name}>
                📍 Origin: {hub.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={detectLiveLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-saffron/50 bg-saffron/10 text-saffron text-xs font-semibold hover:bg-saffron hover:text-slate-950 transition-all cursor-pointer disabled:opacity-60"
            title="Re-query live browser GPS location"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Pinging GPS...' : 'GPS Detect'}</span>
          </button>
        </div>
      </div>

      {locationError && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs text-amber-300">
          ℹ️ {locationError}
        </div>
      )}

      {/* Grid of Nearest Recommended Destinations */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rankedCities.map((city, idx) => (
          <div
            key={city.id}
            className="group relative overflow-hidden rounded-2xl border border-border/70 bg-surface/50 hover:border-saffron transition-all shadow-xs flex flex-col justify-between"
          >
            {/* Image & Distance Tag */}
            <div className="relative h-36 w-full overflow-hidden">
              <img
                src={city.image}
                alt={city.name}
                onError={(e) => onImgError(e, city.name)}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-85" />

              {/* Distance Pill */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 border border-white/10 font-mono text-[10px] text-amber-300 font-bold">
                <MapPin className="h-3 w-3 text-saffron" />
                <span>{city.distKm.toLocaleString()} km</span>
              </div>

              {/* Transit Estimate */}
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white">
                <div>
                  <h3 className="font-display text-base font-bold text-parchment leading-tight">
                    {city.name}
                  </h3>
                  <p className="text-[10px] text-muted">{city.country}</p>
                </div>
                <span className="rounded-full bg-saffron/20 border border-saffron/40 px-2 py-0.5 text-[9px] font-mono text-saffron font-bold">
                  {city.transitEstimate}
                </span>
              </div>
            </div>

            {/* Content & Action */}
            <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="inline-block rounded-md bg-white/5 px-2 py-0.5 font-mono text-[9px] text-muted mb-1">
                  {city.badge}
                </span>
                <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                  {city.description}
                </p>
              </div>

              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-muted">
                  Best: <strong className="text-parchment">{city.best_season}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => nav(`/trips/new?name=${encodeURIComponent(city.name + ' Getaway')}&days=4`)}
                  className="flex items-center gap-1 text-xs font-bold text-saffron hover:underline cursor-pointer"
                >
                  <span>Plan Trip</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
