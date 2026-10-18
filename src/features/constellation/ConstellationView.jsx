import { useWorldStore } from '@/store/useWorldStore.js';

export function ConstellationView({ tripId }) {
  const world = useWorldStore();
  const stops = world.stops.filter((stop) => stop.trip_id === tripId).sort((a, b) => a.order_index - b.order_index);

  return (
    <section className="glass mt-6 rounded-2xl p-5">
      <h2 className="font-display text-2xl">Trip constellation</h2>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {stops.length ? stops.map((stop, index) => (
          <span key={stop.id} className="flex items-center gap-2">
            <span className="rounded-full bg-saffron/20 px-3 py-1 text-saffron">
              {world.cities.find((city) => city.id === stop.city_id)?.name || 'Unknown city'}
            </span>
            {index < stops.length - 1 ? <span className="text-muted">→</span> : null}
          </span>
        )) : <span className="text-muted">Add a stop to start the constellation.</span>}
      </div>
    </section>
  );
}

export default ConstellationView;