/**
 * Trip Pace & Burnout Score Calculator
 * Calculates realistic daily exertion, travel transit, gap penalties, and trip balance.
 */

/**
 * Haversine distance in kilometers between two geo coordinates
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 3.5; // Default average intra-city transit in km
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Convert HH:MM time string to minutes from midnight
 */
function timeToMinutes(timeStr = '10:00') {
  const parts = String(timeStr).split(':');
  const h = Number(parts[0]) || 10;
  const m = Number(parts[1]) || 0;
  return h * 60 + m;
}

/**
 * Calculate pace for a single day's activities
 *
 * @param {Array<{ id: string, start_time?: string, startTime?: string, activity?: any, activity_id?: string }>} stopActivities
 * @param {Array<any>} allActivities
 * @param {any} city
 */
export function calculateDayPace(stopActivities = [], allActivities = [], city = null) {
  if (!stopActivities || stopActivities.length === 0) {
    return {
      score: 1.0,
      activeHours: 0,
      travelHours: 0,
      status: 'relaxed',
      label: 'Free & Leisurely',
      color: '#10b981', // green
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      badge: '🟢 Relaxed',
      reasons: ['No scheduled bookings. Free exploration day.'],
      isOverloaded: false,
    };
  }

  // Enrich items with activity details
  const items = stopActivities
    .map((sa) => {
      const act = sa.activity || allActivities.find((a) => a.id === (sa.activity_id || sa.activityId)) || {};
      const timeStr = sa.start_time || sa.startTime || '10:00';
      const durMin = Number(act.duration_min || act.durationMin) || 90;
      return {
        ...sa,
        act,
        timeStr,
        startMin: timeToMinutes(timeStr),
        endMin: timeToMinutes(timeStr) + durMin,
        durMin,
      };
    })
    .sort((a, b) => a.startMin - b.startMin);

  // 1. Total Activity Duration Hours
  const totalActMin = items.reduce((sum, item) => sum + item.durMin, 0);
  const activeHours = Math.round((totalActMin / 60) * 10) / 10;

  // 2. Travel Transit Hours between consecutive activities
  let totalTravelMin = 0;
  for (let i = 0; i < items.length - 1; i++) {
    const from = items[i].act;
    const to = items[i + 1].act;
    const distKm = haversineDistance(
      from?.lat || city?.lat,
      from?.lng || city?.lng,
      to?.lat || city?.lat,
      to?.lng || city?.lng
    );
    // 25 km/h urban travel speed + 12 min buffer for parking/waiting
    const transitMin = Math.round((distKm / 25) * 60 + 12);
    totalTravelMin += transitMin;
  }
  const travelHours = Math.round((totalTravelMin / 60) * 10) / 10;

  // 3. Gap Penalties (back-to-back with no breathing room < 25 mins)
  let gapPenalty = 0;
  const reasons = [];
  for (let i = 0; i < items.length - 1; i++) {
    const gap = items[i + 1].startMin - items[i].endMin;
    if (gap < 20) {
      gapPenalty += 0.8;
      reasons.push(`Tight transition (${gap <= 0 ? 'overlapping' : `${gap}m gap`}) between ${items[i].act.name || 'Activity'} and ${items[i + 1].act.name || 'Next'}`);
    }
  }

  // 4. Early start (< 08:30) or late finish (> 21:30)
  let timePenalty = 0;
  if (items[0].startMin < 8 * 60 + 30) {
    timePenalty += 0.8;
    reasons.push(`Very early start at ${items[0].timeStr}`);
  }
  const lastEnd = items[items.length - 1].endMin;
  if (lastEnd > 21 * 60 + 30) {
    timePenalty += 0.8;
    reasons.push(`Late night wrap-up past 9:30 PM`);
  }

  // Combined Burnout Score
  const rawScore = activeHours + 1.25 * travelHours + gapPenalty + timePenalty;
  const score = Math.round(rawScore * 10) / 10;

  let status = 'relaxed';
  let label = 'Relaxed Pace';
  let color = '#10b981'; // emerald
  let bg = 'bg-emerald-500/15';
  let border = 'border-emerald-500/30';
  let text = 'text-emerald-400';
  let badge = '🟢 Relaxed';
  let isOverloaded = false;

  if (score > 9.0 || items.length >= 4) {
    status = 'exhausting';
    label = 'Exhausting / Burnout Risk';
    color = '#ef4444'; // coral/red
    bg = 'bg-rose-500/15';
    border = 'border-rose-500/35';
    text = 'text-rose-400';
    badge = '🔴 Exhausting';
    isOverloaded = true;
    reasons.unshift(`${activeHours}h active time + ${travelHours}h transit is exhausting for one day.`);
  } else if (score >= 6.0) {
    status = 'balanced';
    label = 'Balanced Flow';
    color = '#f59e0b'; // amber
    bg = 'bg-amber-500/15';
    border = 'border-amber-500/30';
    text = 'text-amber-400';
    badge = '🟡 Balanced';
  } else {
    reasons.push('Comfortable rhythm with generous downtime.');
  }

  return {
    score,
    activeHours,
    travelHours,
    status,
    label,
    color,
    bg,
    border,
    text,
    badge,
    reasons,
    isOverloaded,
    activityCount: items.length,
    items,
  };
}

/**
 * Calculates trip-wide Burnout & Pace distribution
 */
export function calculateTripPaceOverview(days = [], stops = [], stopActivities = [], allActivities = [], cities = []) {
  if (!days || days.length === 0) {
    return {
      averageScore: 0,
      overallStatus: 'balanced',
      relaxedCount: 0,
      balancedCount: 0,
      exhaustingCount: 0,
      overloadedDays: [],
      balancePercent: 100,
    };
  }

  let totalScore = 0;
  let relaxedCount = 0;
  let balancedCount = 0;
  let exhaustingCount = 0;
  const overloadedDays = [];
  const dayPaces = [];

  days.forEach((d, idx) => {
    const iso = typeof d === 'string' ? d : d.toISOString().split('T')[0];
    const stop = stops.find((s) => {
      const sStart = s.start_date || s.startDate;
      const sEnd = s.end_date || s.endDate;
      return iso >= sStart && iso <= sEnd;
    }) || stops[0];

    const city = cities.find((c) => c.id === (stop?.city_id || stop?.cityId)) || stop?.city;
    const acts = stopActivities.filter((sa) => (sa.day_date || sa.dayDate) === iso);
    const pace = calculateDayPace(acts, allActivities, city);

    totalScore += pace.score;
    dayPaces.push({ iso, dayIndex: idx, city, pace });

    if (pace.status === 'relaxed') relaxedCount++;
    else if (pace.status === 'balanced') balancedCount++;
    else if (pace.status === 'exhausting') {
      exhaustingCount++;
      overloadedDays.push({ iso, dayIndex: idx, city, pace, acts });
    }
  });

  const avg = Math.round((totalScore / days.length) * 10) / 10;
  const balancePercent = Math.max(0, Math.round(((days.length - exhaustingCount) / days.length) * 100));

  let overallStatus = 'balanced';
  if (exhaustingCount >= 2 || avg > 8.5) overallStatus = 'exhausting';
  else if (avg < 5.5 && exhaustingCount === 0) overallStatus = 'relaxed';

  return {
    averageScore: avg,
    overallStatus,
    relaxedCount,
    balancedCount,
    exhaustingCount,
    overloadedDays,
    balancePercent,
    dayPaces,
  };
}
