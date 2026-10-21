import { useMemo, useState, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format, eachDayOfInterval } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import {
  Share2,
  Copy,
  ExternalLink,
  X,
  Calendar,
  MapPin,
  DollarSign,
  CloudSun,
  QrCode,
  Check,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
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

  // Find trip by share_slug or id
  const trip = world.trips.find(
    (t) => (t.share_slug === slug || t.id === slug) && (t.is_public !== false || true)
  ) || world.trips[0];

  const [showQR, setShowQR] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const stops = useMemo(
    () => (trip ? world.stops.filter((s) => s.trip_id === trip.id).sort((a, b) => a.order_index - b.order_index) : []),
    [trip, world.stops]
  );

  const days = useMemo(() => {
    if (!trip) return [];
    try {
      return eachDayOfInterval({ start: new Date(trip.start_date), end: new Date(trip.end_date) }).map((d, i) => {
        const iso = format(d, 'yyyy-MM-dd');
        const stop = stops.find((s) => iso >= s.start_date && iso <= s.end_date) || stops[0];
        const city = world.cities.find((c) => c.id === stop?.city_id);
        const acts = world.stopActivities
          .filter((sa) => sa.stop_id === stop?.id && sa.day_date === iso)
          .sort((a, b) => a.order_index - b.order_index)
          .map((sa) => ({ sa, act: world.activities.find((a) => a.id === sa.activity_id) }));
        return { iso, d, dayNum: i + 1, stop, city, acts };
      });
    } catch {
      return [];
    }
  }, [trip, stops, world]);

  const spend = useMemo(() => (trip ? spendFor(trip.id) : { total: 0, byCat: {} }), [trip]);
  const points = useMemo(() => (trip ? pointsFor(trip.id) : []), [trip, world.stops]);
  const shareUrl = `${window.location.origin}/s/${trip?.share_slug || 'spice-route-homecoming'}`;

  const handleCopyTrip = async () => {
    if (!user) {
      toast.info('Signed in as Guest. Copying trip to your local atlas...');
    }
    try {
      await cloneTrip(trip.id, user?.id || 'u_demo');
      toast.success(`"${trip.name}" successfully copied to your trips!`);
      nav('/trips');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast.success('Public URL copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareActions = [
    {
      label: 'WhatsApp',
      fn: () =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`Check out this travel itinerary: ${trip.name}\n${shareUrl}`)}`,
          '_blank'
        ),
    },
    {
      label: 'X / Twitter',
      fn: () =>
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Exploring: ${trip.name} ✈️`)}&url=${encodeURIComponent(
            shareUrl
          )}`,
          '_blank'
        ),
    },
    {
      label: 'LinkedIn',
      fn: () =>
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        ),
    },
  ];

  if (!trip) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-ink p-4 text-parchment">
        <ConstellationBg />
        <div className="glass relative z-10 max-w-md rounded-3xl p-8 text-center border border-border/50">
          <ShieldAlert className="mx-auto h-12 w-12 text-coral mb-3" />
          <h2 className="font-display text-2xl font-bold">Itinerary Not Found</h2>
          <p className="mt-2 text-xs text-muted">This trip is either private or does not exist.</p>
          <Link to="/" className="mt-6 inline-block">
            <Button size="sm">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-ink text-parchment pb-20">
      <ConstellationBg />

      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/40 bg-ink/80 px-4 md:px-8 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold tracking-tight text-saffron">Yatraverse</span>
          <span className="rounded-md bg-saffron/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-saffron">
            Public View
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleCopyTrip} className="shadow-md shadow-saffron/20">
            <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Trip
          </Button>
          <Link to="/dashboard">
            <Button size="sm" variant="outline">
              Open Dashboard →
            </Button>
          </Link>
        </div>
      </header>

      {/* Content Container */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* Public Notice Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-aurora/40 bg-aurora/10 p-3.5 text-xs text-aurora">
          <div className="flex items-center gap-2">
            <span className="font-semibold uppercase tracking-wider font-mono">Public Itinerary</span>
            <span>·</span>
            <span className="text-parchment/80">Read-only view for inspiration and sharing</span>
          </div>
          <span className="font-mono text-[11px] text-muted truncate max-w-xs">{shareUrl}</span>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-border/60 shadow-2xl">
          <div className="relative h-72 sm:h-80 w-full">
            <img
              src={trip.cover_url}
              alt={trip.name}
              onError={(e) => onImgError(e, trip.name)}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="rounded-full bg-saffron/20 px-3 py-1 font-mono text-xs font-semibold text-saffron">
                Shared Itinerary Summary
              </span>
              <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-parchment">
                {trip.name}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-parchment/90 max-w-2xl leading-relaxed">
                {trip.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-muted">
                <span className="flex items-center gap-1.5 text-parchment">
                  <Calendar className="h-4 w-4 text-saffron" />
                  {format(new Date(trip.start_date), 'dd MMM yyyy')} →{' '}
                  {format(new Date(trip.end_date), 'dd MMM yyyy')}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5 text-parchment">
                  <MapPin className="h-4 w-4 text-aurora" />
                  {stops.length} Destinations
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5 text-saffron font-semibold">
                  <DollarSign className="h-4 w-4" />
                  Est. Budget: {money(spend.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar: Copy Trip, Social Sharing, QR Code */}
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={handleCopyTrip} className="shadow-lg shadow-saffron/20">
            <Copy className="mr-2 h-4 w-4" /> Copy Trip to My Account
          </Button>
          <Button size="lg" variant="outline" onClick={() => setShowShare(true)}>
            <Share2 className="mr-2 h-4 w-4" /> Share Itinerary
          </Button>
          <Button size="lg" variant="outline" onClick={() => setShowQR(true)}>
            <QrCode className="mr-2 h-4 w-4" /> Mobile QR
          </Button>
          <Button size="lg" variant="ghost" onClick={copyToClipboard}>
            {copiedLink ? <Check className="mr-2 h-4 w-4 text-aurora" /> : <ExternalLink className="mr-2 h-4 w-4" />}
            {copiedLink ? 'Link Copied!' : 'Copy Link'}
          </Button>
        </div>

        {/* Interactive Route Map */}
        <div className="glass rounded-3xl p-5 border border-border/40 shadow-md">
          <h2 className="font-display text-lg font-bold text-parchment mb-3">Destination Route Map</h2>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white/5" />}>
            <TripMap points={points} className="h-64 w-full overflow-hidden rounded-2xl" />
          </Suspense>
        </div>

        {/* Stops Overview Cards */}
        <div>
          <h2 className="font-display text-2xl font-bold text-parchment mb-4">Destinations & Weather</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {stops.map((s) => {
              const city = world.cities.find((c) => c.id === s.city_id);
              const wx = weatherFor(s.city_id);
              return (
                <div key={s.id} className="glass overflow-hidden rounded-2xl border border-border/40 shadow-sm">
                  <div className="relative h-32 w-full">
                    <img
                      src={city?.image}
                      alt={city?.name}
                      onError={(e) => onImgError(e, city?.name)}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3">
                      <p className="font-display text-base font-bold text-parchment">{city?.name}</p>
                      <p className="text-[10px] text-parchment/80">{city?.country}</p>
                    </div>
                  </div>
                  <div className="p-3 text-[11px] text-muted space-y-1">
                    <p className="font-mono">{s.start_date} → {s.end_date}</p>
                    <p className="text-aurora flex items-center gap-1 pt-1 border-t border-border/20">
                      <CloudSun className="h-3 w-3 shrink-0" />
                      {wx.label} ({wx.hint})
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day-by-Day Detailed Itinerary (Read-Only) */}
        <div>
          <h2 className="font-display text-2xl font-bold text-parchment mb-4">Complete Day-Wise Plan</h2>
          <div className="space-y-3">
            {days.map((day) => (
              <article key={day.iso} className="glass rounded-3xl p-5 border border-border/40 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-saffron/20 font-mono text-xs font-bold text-saffron">
                      {day.dayNum}
                    </span>
                    <h3 className="font-display text-base font-bold text-parchment">
                      Day {day.dayNum}: {format(day.d, 'EEEE, dd MMMM yyyy')}
                    </h3>
                  </div>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[11px] text-aurora flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {day.city?.name || 'In Transit'}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {day.acts.length === 0 ? (
                    <p className="text-xs text-muted italic p-2">
                      Free exploration and transit day.
                    </p>
                  ) : (
                    day.acts.map(({ sa, act }) => (
                      <div
                        key={sa.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/5 p-3 text-xs border border-border/20"
                      >
                        <div className="flex items-center gap-3">
                          <span className="rounded-lg bg-saffron/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-saffron">
                            {sa.start_time || '10:00'}
                          </span>
                          <span className="font-medium text-parchment">{act?.name}</span>
                        </div>
                        <span className="font-mono text-saffron">{money(sa.cost_override ?? act?.cost ?? 0)}</span>
                      </div>
                    ))
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Estimated Budget Summary */}
        <div className="glass rounded-3xl p-6 border border-border/50 shadow-md">
          <h2 className="font-display text-xl font-bold text-parchment mb-4">Estimated Budget Summary</h2>
          <div className="grid gap-3 sm:grid-cols-4">
            {Object.entries(spend.byCat).map(([cat, val]) => (
              <div key={cat} className="rounded-2xl bg-white/5 p-3.5 border border-border/30">
                <p className="text-xs capitalize text-muted">{cat}</p>
                <p className="mt-1 font-mono text-xl font-bold text-parchment">{money(val)}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 font-mono text-base font-bold text-saffron">
            Total Estimated Cost: {money(spend.total)}
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="glass rounded-3xl p-8 text-center border border-border/40 shadow-xl space-y-3">
          <h2 className="font-display text-2xl font-bold text-parchment">
            Want to customize this journey?
          </h2>
          <p className="text-xs text-muted max-w-md mx-auto">
            Copy this itinerary into your account to customize dates, adjust city stops, or add new activities.
          </p>
          <div className="pt-2">
            <Button size="lg" onClick={handleCopyTrip}>
              <Copy className="mr-2 h-4 w-4" /> Copy Trip to My Account
            </Button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowQR(false)}
        >
          <div
            className="glass max-w-xs rounded-3xl p-6 text-center border border-border/60 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-bold text-parchment">Scan to View Trip</h3>
            <p className="text-xs text-muted mt-1">Open this itinerary on your phone</p>
            <div className="mx-auto mt-4 w-fit rounded-2xl bg-white p-4 shadow-md">
              <QRCodeSVG value={shareUrl} size={180} />
            </div>
            <p className="mt-3 break-all font-mono text-[10px] text-muted">{shareUrl}</p>
            <Button className="mt-4 w-full" variant="outline" onClick={() => setShowQR(false)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowShare(false)}
        >
          <div
            className="glass w-full max-w-sm rounded-3xl p-6 border border-border/60 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-display text-lg font-bold text-parchment">Share this Itinerary</h3>
              <button
                type="button"
                onClick={() => setShowShare(false)}
                className="p-1 text-muted hover:text-parchment"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {shareActions.map((a) => (
                <Button
                  key={a.label}
                  variant="outline"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    a.fn();
                    setShowShare(false);
                  }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Share on {a.label}
                </Button>
              ))}
              <Button
                variant="solid"
                className="w-full justify-start text-xs"
                onClick={() => {
                  copyToClipboard();
                  setShowShare(false);
                }}
              >
                <Copy className="mr-2 h-4 w-4" /> Copy Public Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
