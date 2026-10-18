import { Link } from 'react-router-dom';
import { lazy, Suspense, useMemo } from 'react';
import { differenceInDays } from 'date-fns';
import { useAuthStore } from '@/store/useAuthStore.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { greeting, money, tripStatus } from '@/lib/utils.js';
import { codesFor, pointsFor, spendFor } from '@/lib/tripView.js';
import { BoardingPassCard } from '@/components/trip/BoardingPassCard.jsx';
import { Button } from '@/components/ui/button.jsx';
import { useCountUp } from '@/hooks/useCountUp.js';
import { onImgError } from '@/lib/image.js';
import { PersonaQuiz } from '@/features/persona/PersonaQuiz.jsx';
import { SurpriseMe } from '@/features/surprise/SurpriseMe.jsx';

const TripMap = lazy(() => import('@/components/map/TripMap.jsx').then((m) => ({ default: m.TripMap })));

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const personaDone = useAuthStore((s) => s.personaDone);
  const world = useWorldStore();
  const mine = world.trips.filter((t) => t.user_id === user.id);
  const upcoming = mine.find((t) => tripStatus(t.start_date, t.end_date) === 'upcoming') || mine[0];
  const days = upcoming ? Math.max(0, differenceInDays(new Date(upcoming.start_date), new Date())) : 0;
  const planned = mine.reduce((s, t) => s + spendFor(t.id).total, 0);
  const n = useCountUp(planned);
  const recs = useMemo(() => {
    const persona = user.persona || '';
    if (persona.includes('Foodie')) return world.cities.filter((c) => ['c_bkk', 'c_mum', 'c_lis', 'c_mex'].includes(c.id));
    if (persona.includes('Mountain')) return world.cities.filter((c) => ['c_kyo', 'c_cpt', 'c_akl', 'c_jai'].includes(c.id));
    return world.cities.slice(0, 6);
  }, [user.persona, world.cities]);
  const allPoints = mine.flatMap((t) => pointsFor(t.id));
  const showQuiz = user && !user.persona && !personaDone;

  return (
    <div className="space-y-8">
      {showQuiz ? <PersonaQuiz /> : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-aurora">
            {greeting()}, {user.name.split(' ')[0]}
          </p>
          <h1 className="font-display text-4xl">Your universe is lit</h1>
          <p className="text-sm text-muted">Persona: {user.persona || 'unmapped'}</p>
        </div>
        <Link to="/trips/new">
          <Button size="lg">Plan new trip</Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-muted">Planned burn</p>
          <p className="font-mono text-3xl">{money(n, user.currency)}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-muted">Next departure</p>
          <p className="font-display text-3xl">{days}d</p>
          <p className="text-sm">{upcoming?.name}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-muted">Trips in orbit</p>
          <p className="font-display text-3xl">{mine.length}</p>
        </div>
      </div>
      <section>
        <h2 className="mb-3 font-display text-2xl">Recent boarding passes</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {mine.slice(0, 4).map((t) => (
            <BoardingPassCard key={t.id} trip={t} codes={codesFor(t.id)} to={`/trips/${t.id}`} />
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-3 font-display text-2xl">Recommended for {user.persona || 'you'}</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {recs.map((c) => (
            <Link key={c.id} to="/cities" className="w-56 shrink-0 overflow-hidden rounded-2xl glass">
              <img src={c.image} alt="" onError={(e) => onImgError(e, c.name)} className="h-28 w-full object-cover" />
              <p className="p-3 font-display">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white/5" />}>
        <TripMap points={allPoints} />
      </Suspense>
      <div className="flex flex-wrap gap-3">
        <Link to="/ai">
          <Button variant="outline">Ask the atlas</Button>
        </Link>
        <Link to="/cities">
          <Button variant="ghost">Browse cities</Button>
        </Link>
        <SurpriseMe />
      </div>
    </div>
  );
}
