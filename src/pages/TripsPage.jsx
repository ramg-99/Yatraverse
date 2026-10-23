import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  PlusCircle,
  Search,
  Eye,
  SlidersHorizontal,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  Grid,
  List as ListIcon,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { tripStatus, money } from '@/lib/utils.js';
import { spendFor } from '@/lib/tripView.js';
import { ConfirmDialog } from '@/components/ConfirmDialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { deleteTrip } from '@/services/trips.js';
import { onImgError } from '@/lib/image.js';

export default function TripsPage() {
  const user = useAuthStore((s) => s.user) || { id: 'u_demo', currency: 'INR' };
  const world = useWorldStore();
  const trips = world.trips;
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('date');
  const [grid, setGrid] = useState(true);
  const [kill, setKill] = useState(null);

  const list = useMemo(() => {
    let rows = trips.filter(
      (t) =>
        t.user_id === user.id ||
        t.collaborators?.includes(user.id) ||
        t.is_public ||
        t.user_id === 'u_demo' ||
        t.user_id === 'u_aisha' ||
        user.role === 'admin'
    );
    if (rows.length === 0) rows = trips;
    if (q) rows = rows.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()));
    if (filter !== 'all') rows = rows.filter((t) => tripStatus(t.start_date, t.end_date) === filter);
    rows = [...rows].sort((a, b) =>
      sort === 'name' ? a.name.localeCompare(b.name) : a.start_date.localeCompare(b.start_date)
    );
    return rows;
  }, [trips, user.id, user.role, q, filter, sort]);

  const confirmDelete = async () => {
    const snapshot = kill;
    setKill(null);
    try {
      await deleteTrip(snapshot.id);
      toast.success(`Trip "${snapshot.name}" deleted.`, {
        action: {
          label: 'Undo',
          onClick: () => {
            const w = useWorldStore.getState();
            w.setTrips([snapshot, ...w.trips.filter((t) => t.id !== snapshot.id)]);
          },
        },
      });
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-aurora">
            My Journeys
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-parchment">
            My Trips
          </h1>
          <p className="text-xs text-muted">
            Manage your planned, ongoing, and completed multi-city journeys.
          </p>
        </div>
        <Link to="/trips/new">
          <Button size="lg" className="shadow-md shadow-saffron/20">
            <PlusCircle className="mr-2 h-4 w-4" /> Plan New Trip
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input
              placeholder="Search trips by name..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 w-64"
            />
          </div>

          <div className="flex rounded-xl border border-border/50 bg-white/5 p-1 gap-1">
            {['all', 'upcoming', 'ongoing', 'past'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1 text-xs capitalize transition-colors ${
                  filter === f
                    ? 'bg-saffron text-ink font-semibold'
                    : 'text-muted hover:text-parchment'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSort(sort === 'name' ? 'date' : 'name')}
            className="text-xs"
          >
            Sort by: <span className="font-semibold text-saffron ml-1 capitalize">{sort}</span>
          </Button>
          <div className="flex rounded-xl border border-border/50 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setGrid(true)}
              className={`p-1.5 rounded-lg ${grid ? 'bg-white/10 text-saffron' : 'text-muted'}`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setGrid(false)}
              className={`p-1.5 rounded-lg ${!grid ? 'bg-white/10 text-saffron' : 'text-muted'}`}
              title="List View"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Trip Cards */}
      {list.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center max-w-md mx-auto my-8 border border-border/40">
          <Calendar className="mx-auto h-12 w-12 text-muted mb-3 opacity-60" />
          <h3 className="font-display text-xl font-bold">No trips found</h3>
          <p className="mt-1 text-xs text-muted">
            {q || filter !== 'all'
              ? 'Try adjusting your search query or status filter.'
              : 'You have not created any trips yet. Start by planning your first journey!'}
          </p>
          <Link to="/trips/new" className="mt-5 inline-block">
            <Button size="sm"><PlusCircle className="mr-1.5 h-4 w-4" />Plan a New Trip</Button>
          </Link>
        </div>
      ) : grid ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => {
            const stopsCount = world.stops.filter((s) => s.trip_id === t.id).length;
            const spend = spendFor(t.id);
            const status = tripStatus(t.start_date, t.end_date);
            return (
              <div
                key={t.id}
                className="glass group flex flex-col justify-between overflow-hidden rounded-3xl border border-border/50 hover:border-saffron/50 transition-all shadow-lg"
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={t.cover_url}
                    alt={t.name}
                    onError={(e) => onImgError(e, t.name)}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                  <span
                    className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                      status === 'upcoming'
                        ? 'bg-aurora/20 text-aurora border border-aurora/40'
                        : status === 'ongoing'
                        ? 'bg-saffron/20 text-saffron border border-saffron/40'
                        : 'bg-white/10 text-muted'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-parchment group-hover:text-saffron transition-colors">
                      {t.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted line-clamp-2">{t.description}</p>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-muted">
                        <Calendar className="h-3.5 w-3.5 text-saffron" />
                        <span className="font-mono">
                          {format(new Date(t.start_date), 'dd MMM yyyy')} →{' '}
                          {format(new Date(t.end_date), 'dd MMM yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-muted">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-aurora" />
                          <span>
                            {stopsCount} {stopsCount === 1 ? 'Destination' : 'Destinations'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-saffron font-medium">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>{money(spend.total, user.currency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit / View / Delete */}
                  <div className="mt-5 pt-4 border-t border-border/30 flex items-center justify-between gap-2">
                    <div className="flex gap-1.5">
                      <Link to={`/trips/${t.id}`}>
                        <Button size="sm" variant="solid" className="text-xs">
                          <Eye className="mr-1 h-3.5 w-3.5" /> View
                        </Button>
                      </Link>
                      <Link to={`/trips/${t.id}/build`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          <SlidersHorizontal className="mr-1 h-3.5 w-3.5" /> Edit
                        </Button>
                      </Link>
                    </div>
                    <Button
                      size="sm"
                      variant="coral"
                      className="text-xs px-2.5"
                      onClick={() => setKill(t)}
                      title="Delete trip"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode */
        <div className="space-y-3">
          {list.map((t) => {
            const stopsCount = world.stops.filter((s) => s.trip_id === t.id).length;
            const spend = spendFor(t.id);
            const status = tripStatus(t.start_date, t.end_date);
            return (
              <div
                key={t.id}
                className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4 border border-border/40 hover:border-saffron/40 transition-all"
              >
                <div className="flex items-center gap-4 min-w-[280px]">
                  <img
                    src={t.cover_url}
                    alt={t.name}
                    onError={(e) => onImgError(e, t.name)}
                    className="h-16 w-24 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-parchment">{t.name}</h3>
                      <span className="rounded-full bg-white/10 px-2 py-0.2 font-mono text-[9px] uppercase text-muted">
                        {status}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted">
                      {format(new Date(t.start_date), 'dd MMM yyyy')} →{' '}
                      {format(new Date(t.end_date), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-muted">
                  <div>
                    <span className="block text-[10px] uppercase text-muted">Destinations</span>
                    <span className="font-mono text-sm text-parchment font-medium">{stopsCount} Stops</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-muted">Budget Spent</span>
                    <span className="font-mono text-sm text-saffron font-medium">{money(spend.total, user.currency)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/trips/${t.id}`}>
                    <Button size="sm" variant="solid" className="text-xs">
                      <Eye className="mr-1 h-3.5 w-3.5" /> View
                    </Button>
                  </Link>
                  <Link to={`/trips/${t.id}/build`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      <SlidersHorizontal className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="coral"
                    className="text-xs"
                    onClick={() => setKill(t)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!kill}
        title={`Delete "${kill?.name}"?`}
        body="This will permanently delete this trip and its itinerary. You can undo this action briefly from the notification."
        onClose={() => setKill(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
