import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { tripStatus } from '@/lib/utils.js';
import { codesFor } from '@/lib/tripView.js';
import { BoardingPassCard } from '@/components/trip/BoardingPassCard.jsx';
import { EmptyState } from '@/components/EmptyState.jsx';
import { ConfirmDialog } from '@/components/ConfirmDialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { deleteTrip } from '@/services/trips.js';

export default function TripsPage() {
  const user = useAuthStore((s) => s.user);
  const trips = useWorldStore((s) => s.trips);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('start');
  const [grid, setGrid] = useState(true);
  const [kill, setKill] = useState(null);

  const list = useMemo(() => {
    let rows = trips.filter((t) => t.user_id === user.id || t.collaborators?.includes(user.id));
    if (q) rows = rows.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()));
    if (filter !== 'all') rows = rows.filter((t) => tripStatus(t.start_date, t.end_date) === filter);
    rows = [...rows].sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : a.start_date.localeCompare(b.start_date)));
    return rows;
  }, [trips, user.id, q, filter, sort]);

  const confirmDelete = async () => {
    const snapshot = kill;
    setKill(null);
    try {
      await deleteTrip(snapshot.id);
      toast.success('Trip folded.', {
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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl">My trips</h1>
        <Link to="/trips/new">
          <Button>Plan new trip</Button>
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Input placeholder="Search constellations" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        {['all', 'upcoming', 'ongoing', 'past'].map((f) => (
          <Button key={f} size="sm" variant={filter === f ? 'solid' : 'outline'} onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => setSort(sort === 'name' ? 'start' : 'name')}>
          Sort: {sort}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setGrid((g) => !g)}>
          {grid ? 'List' : 'Grid'}
        </Button>
      </div>
      {list.length === 0 ? (
        <EmptyState title="No stamps yet" hint="Fold a boarding pass and the atlas will remember." action={<Link to="/trips/new"><Button>Create trip</Button></Link>} />
      ) : (
        <div className={grid ? 'mt-6 grid gap-4 md:grid-cols-2' : 'mt-6 space-y-3'}>
          {list.map((t) => (
            <div key={t.id} className="relative">
              <BoardingPassCard trip={t} codes={codesFor(t.id)} to={`/trips/${t.id}`} />
              <div className="mt-2 flex gap-2">
                <Link to={`/trips/${t.id}/build`}>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </Link>
                <Link to={`/trips/${t.id}`}>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </Link>
                <Button size="sm" variant="coral" onClick={() => setKill(t)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={!!kill}
        title="Fold this trip?"
        body="The constellation can be undone from the toast for a moment."
        onClose={() => setKill(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
