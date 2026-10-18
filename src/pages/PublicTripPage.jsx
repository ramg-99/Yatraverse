import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format, eachDayOfInterval } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Copy, ExternalLink, X } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { toast } from 'sonner';
import { useWorldStore } from '@/store/useWorldStore.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { weatherFor } from '@/services/ai.js';
import { cloneTrip } from '@/services/trips.js';
import { onImgError } from '@/lib/image.js';
import { money } from '@/lib/utils.js';
import { pointsFor, spendFor } from '@/lib/tripView.js';
import { Button } from '@/components/ui/button.jsx';
import { ConstellationBg } from '@/components/layout/ConstellationBg.jsx';

const TripMap = lazy(() => import('@/components/map/TripMap.jsx').then((m) => ({ default: m.TripMap })));

export default function PublicTripPage() {
  const { slug } = useParams();
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);
  const world = useWorldStore();
  const trip = world.trips.find((t) => t.share_slug === slug && t.is_public);
  const [showQR, setShowQR] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const stops = useMemo(
    () => (trip ? world.stops.filter((s) => s.trip_id === trip.id).sort((a, b) => a.order_index - b.order_index) : []),
    [trip, world.stops],
  );

  const days = useMemo(() => {
    if (!trip) return [];
    return eachDayOfInterval({ start: new Date(trip.start_date), end: new Date(trip.end_date) }).map((d) => {
      const iso = format(d, 'yyyy-MM-dd');
      const stop = stops.find((s) => iso >= s.start_date && iso < s.end_date) || stops.find((s) => iso === s.start_date);
      const city = world.cities.find((c) => c.id === stop?.city_id);
      const acts = world.stopActivities
        .filter((sa) => sa.stop_id === stop?.id && sa.day_date === iso)
        .sort((a, b) => a.order_index - b.order_index)
        .map((sa) => ({ sa, act: world.activities.find((a) => a.id === sa.activity_id) }));
      return { iso, d, stop, city, acts };
    });
  }, [trip, stops, world]);

  const spend = useMemo(() => (trip ? spendFor(trip.id) : { total: 0, byCat: {} }), [trip]);
  const points = useMemo(() => (trip ? pointsFor(trip.id) : []), [trip, world.stops]);
  const shareUrl = `${window.location.origin}/s/${slug}`;

  if (!trip) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <ConstellationBg />
        <div className="glass relative z-10 max-w-md rounded-3xl p-8 text-center">
          <p className="font-display text-3xl">Constellation not found</p>
          <p className="mt-2 text-sm text-muted">This itinerary is either private or the link has expired.</p>
          <Link to="/">
            <Button className="mt-6">Back to home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleCopy = async () => {
    if (!user) {
      toast.info('Sign in first to copy this trip.');
      nav('/login', { state: { from: `/s/${slug}` } });
      return;
    }
    try {
      await cloneTrip(trip.id, user.id);
      toast.success('Trip copied to your atlas!');
      nav('/trips');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const shareActions = [
    { label: 'WhatsApp', fn: () => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my trip: ${trip.name}\n${shareUrl}`)}`, '_blank') },
    { label: 'X / Twitter', fn: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${trip.name} ✈️`)}&url=${encodeURIComponent(shareUrl)}`, '_blank') },
    { label: 'LinkedIn', fn: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank') },
    { label: 'Copy link', fn: () => { navigator.clipboard.writeText(shareUrl); toast.success('Link copied!'); } },
  ];

  return (
    <div className="relative min-h-screen">
      <ConstellationBg />
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl">
          <img src={trip.cover_url} alt="" onError={(e) => onImgError(e, trip.name)} className="h-64 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-aurora">Shared itinerary</p>
            <h1 className="mt-1 font-display text-4xl md:text-5xl">{trip.name}</h1>
            <p className="mt-1 text-sm text-muted">{trip.description}</p>
            <p className="mt-2 font-mono text-xs text-saffron">
              {format(new Date(trip.start_date), 'dd MMM yyyy')} → {format(new Date(trip.end_date), 'dd MMM yyyy')} · {stops.length} cities · est. {money(spend.total)}
            </p>
          </div>
        </div>

        {/* Action bar */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={handleCopy}><Copy className="mr-2 h-4 w-4" />Copy trip to my atlas</Button>
          <Button variant="outline" onClick={() => setShowShare(true)}><Share2 className="mr-2 h-4 w-4" />Share</Button>
          <Button variant="outline" onClick={() => setShowQR(true)}>QR Code</Button>
        </div>

        {/* Map */}
        <Suspense fallback={<div className="mt-6 h-64 animate-pulse rounded-2xl bg-white/5" />}>
          <TripMap points={points} className="mt-6 h-72 overflow-hidden rounded-2xl" />
        </Suspense>

        {/* Stops overview */}
        <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
          {stops.map((s) => {
            const city = world.cities.find((c) => c.id === s.city_id);
            const wx = weatherFor(s.city_id);
            return (
              <div key={s.id} className="glass w-52 shrink-0 overflow-hidden rounded-2xl">
                <img src={city?.image} alt="" onError={(e) => onImgError(e, city?.name)} className="h-28 w-full object-cover" />
                <div className="p-3">
                  <p className="font-display">{city?.name}</p>
                  <p className="font-mono text-[10px] text-aurora">{wx.label} · {wx.hint}</p>
                  <p className="text-[10px] text-muted">{s.start_date} → {s.end_date}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Day-wise itinerary */}
        <h2 className="mt-8 font-display text-2xl">Day-by-day itinerary</h2>
        <div className="mt-4 space-y-3">
          {days.map((day) => (
            <article key={day.iso} className="glass rounded-2xl p-4">
              <p className="font-mono text-xs text-saffron">{format(day.d, 'EEE dd MMM')} · {day.city?.name || 'Transit'}</p>
              {day.acts.length === 0 && <p className="mt-1 text-xs text-muted">Free day — explore on your own</p>}
              {day.acts.map(({ sa, act }) => (
                <div key={sa.id} className="mt-2 border-l-2 border-aurora pl-3 text-sm">
                  <p className="font-medium">{act?.name}</p>
                  <p className="font-mono text-xs text-muted">{sa.start_time} · {money(sa.cost_override ?? act?.cost ?? 0)}</p>
                </div>
              ))}
            </article>
          ))}
        </div>

        {/* Budget summary */}
        <div className="glass mt-8 rounded-2xl p-5">
          <h2 className="font-display text-2xl">Estimated budget</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            {Object.entries(spend.byCat).map(([cat, val]) => (
              <div key={cat} className="rounded-xl bg-white/5 p-3">
                <p className="text-xs capitalize text-muted">{cat}</p>
                <p className="font-mono text-lg">{money(val)}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 font-mono text-sm text-aurora">Total: {money(spend.total)}</p>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted">Want to plan your own version of this trip?</p>
          <Link to={user ? '/trips/new' : '/signup'}>
            <Button className="mt-3" size="lg">{user ? 'Plan my trip' : 'Sign up free'}</Button>
          </Link>
        </div>
      </div>

      {/* QR modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowQR(false)}>
          <div className="glass max-w-xs rounded-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="font-display text-xl">Scan to view trip</p>
            <div className="mx-auto mt-4 w-fit rounded-xl bg-white p-3">
              <QRCodeSVG value={shareUrl} size={180} />
            </div>
            <p className="mt-3 break-all font-mono text-xs text-muted">{shareUrl}</p>
            <Button className="mt-4" variant="ghost" onClick={() => setShowQR(false)}>Close</Button>
          </div>
        </div>
      )}

      {/* Share modal */}
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowShare(false)}>
          <div className="glass w-full max-w-sm rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-display text-xl">Share this trip</p>
              <button type="button" onClick={() => setShowShare(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 space-y-2">
              {shareActions.map((a) => (
                <Button key={a.label} variant="outline" className="w-full justify-start" onClick={() => { a.fn(); setShowShare(false); }}>
                  <ExternalLink className="mr-2 h-4 w-4" />{a.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
