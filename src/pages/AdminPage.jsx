import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { toast } from 'sonner';
import { Shield, Users, MapPin, TrendingUp, Activity, Ban, Trash2, CheckCircle } from 'lucide-react';
import { adminStats, setSuspended, deleteUser } from '@/services/admin.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { Button } from '@/components/ui/button.jsx';
import { ConfirmDialog } from '@/components/ConfirmDialog.jsx';
import { SkeletonPage } from '@/components/SkeletonBlock.jsx';

const BarChart = lazy(() => import('recharts').then((m) => ({ default: m.BarChart })));
const Bar = lazy(() => import('recharts').then((m) => ({ default: m.Bar })));
const XAxis = lazy(() => import('recharts').then((m) => ({ default: m.XAxis })));
const YAxis = lazy(() => import('recharts').then((m) => ({ default: m.YAxis })));
const Tooltip = lazy(() => import('recharts').then((m) => ({ default: m.Tooltip })));
const ResponsiveContainer = lazy(() => import('recharts').then((m) => ({ default: m.ResponsiveContainer })));

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [killUser, setKillUser] = useState(null);
  const world = useWorldStore();
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    adminStats()
      .then((s) => setStats(s))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [world.trips, world.users]);

  const users = useMemo(() => world.users.filter((u) => u.id !== currentUser?.id), [world.users, currentUser]);

  if (loading) return <SkeletonPage />;

  const kpis = [
    { label: 'Total users', value: stats?.users || 0, icon: Users, color: 'text-aurora' },
    { label: 'Total trips', value: stats?.trips || 0, icon: MapPin, color: 'text-saffron' },
    { label: 'DAU', value: stats?.dau || 0, icon: Activity, color: 'text-coral' },
    { label: 'MAU', value: stats?.mau || 0, icon: TrendingUp, color: 'text-[#a78bfa]' },
    { label: 'Avg trip length', value: `${stats?.avgLength || 0}d`, icon: TrendingUp, color: 'text-aurora' },
  ];

  const handleSuspend = async (userId, suspended) => {
    try {
      await setSuspended(userId, suspended);
      toast.success(suspended ? 'User suspended.' : 'User reactivated.');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleDelete = async () => {
    const target = killUser;
    setKillUser(null);
    try {
      await deleteUser(target.id);
      toast.success('User deleted.');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-aurora"><Shield className="mr-1 inline h-3 w-3" />Admin dashboard</p>
        <h1 className="mt-1 font-display text-4xl">Atlas command centre</h1>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className="glass rounded-2xl p-4">
            <k.icon className={`h-5 w-5 ${k.color}`} />
            <p className="mt-2 font-display text-3xl">{k.value}</p>
            <p className="text-xs text-muted">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Trips growth chart */}
      {stats?.tripsOverTime && (
        <div className="glass rounded-2xl p-5">
          <h2 className="mb-3 font-display text-xl">Trips created over time</h2>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-white/5" />}>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={stats.tripsOverTime}>
                  <XAxis dataKey="month" stroke="#9aa3c7" />
                  <YAxis stroke="#9aa3c7" />
                  <Tooltip />
                  <Bar dataKey="trips" fill="#FFB02E" radius={6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Suspense>
        </div>
      )}

      {/* Top cities & activities */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-xl">Top destinations</h2>
          <ol className="mt-3 space-y-2">
            {(stats?.topCities || []).map((c, i) => (
              <li key={c.city} className="flex items-center gap-3 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-saffron/20 font-mono text-xs text-saffron">{i + 1}</span>
                <span className="flex-1">{c.city}</span>
                <span className="font-mono text-xs text-muted">{c.n} trips</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-xl">Top activities</h2>
          <ol className="mt-3 space-y-2">
            {(stats?.topActivities || []).map((a, i) => (
              <li key={a} className="flex items-center gap-3 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-aurora/20 font-mono text-xs text-aurora">{i + 1}</span>
                <span>{a}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* User management table */}
      <div className="glass rounded-2xl p-5">
        <h2 className="font-display text-xl">User management</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted">
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 font-medium">{u.name}</td>
                  <td className="py-3 text-muted">{u.email}</td>
                  <td className="py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${u.role === 'admin' ? 'bg-aurora/20 text-aurora' : 'bg-white/10 text-muted'}`}>{u.role}</span></td>
                  <td className="py-3">
                    {u.suspended ? (
                      <span className="text-xs text-coral">Suspended</span>
                    ) : (
                      <span className="text-xs text-aurora">Active</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleSuspend(u.id, !u.suspended)}>
                        {u.suspended ? <><CheckCircle className="mr-1 h-3 w-3" />Activate</> : <><Ban className="mr-1 h-3 w-3" />Suspend</>}
                      </Button>
                      <Button size="sm" variant="coral" onClick={() => setKillUser(u)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!killUser}
        title={`Delete ${killUser?.name}?`}
        body="This will permanently remove the user and all their data."
        onClose={() => setKillUser(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
