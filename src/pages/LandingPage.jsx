import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { ConstellationBg } from '@/components/layout/ConstellationBg.jsx';
import { BoardingPassCard } from '@/components/trip/BoardingPassCard.jsx';
import { trips } from '@/data/trips.js';

const Globe = lazy(() => import('@/components/map/Globe.jsx').then((m) => ({ default: m.Globe })));

export default function LandingPage() {
  const demo = trips[0];
  return (
    <div className="relative min-h-screen overflow-hidden">
      <ConstellationBg />
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <p className="font-display text-2xl text-saffron">Yatraverse</p>
        <div className="flex gap-2">
          <Link to="/login">
            <Button variant="ghost">Enter</Button>
          </Link>
          <Link to="/signup">
            <Button>Stamp a passport</Button>
          </Link>
        </div>
      </header>
      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 md:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-aurora">Your journey, your universe</p>
          <h1 className="mt-3 font-display text-5xl leading-tight md:text-6xl">Cities as stars. Trips as constellations.</h1>
          <p className="mt-4 max-w-md text-muted">
            A boarding-pass planner for multi-city wanderers — AI orbits, live maps, and a passport that remembers every stamp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup">
              <Button size="lg">Begin the atlas</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                Demo traveller
              </Button>
            </Link>
          </div>
        </div>
        <Suspense fallback={<div className="h-[300px]" />}>
          <div className="flex justify-center">
            <Globe />
          </div>
        </Suspense>
      </section>
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 mx-auto max-w-6xl px-6 pb-24"
      >
        <h2 className="font-display text-3xl">A live boarding pass</h2>
        <p className="mb-4 text-sm text-muted">Spice Route Homecoming — the public demo itinerary judges can open.</p>
        <BoardingPassCard trip={demo} codes={['BOM', 'GOI', 'COK']} className="max-w-lg" />
      </motion.section>
    </div>
  );
}
