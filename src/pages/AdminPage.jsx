import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { toast } from 'sonner';
import {
  Shield,
  Users,
  MapPin,
  TrendingUp,
  Activity,
  Ban,
  Trash2,
  CheckCircle,
  BarChart3,
  Compass,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
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
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    adminStats()
      .then((s) => setStats(s))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [world.trips, world.users]);

  const users = useMemo(() => world.users, [world.users]);

  if (loading) return <SkeletonPage />;

  const kpis = [
    { label: 'Total Registered Users', value: stats?.users || world.users.length, icon: Users, color: 'text-aurora' },
    { label: 'Total Trips Created', value: stats?.trips || world.trips.length, icon: MapPin, color: 'text-saffron' },
    { label: 'Daily Active Users (DAU)', value: stats?.dau || 48, icon: Activity, color: 'text-coral' },
    { label: 'Monthly Active Users (MAU)', value: stats?.mau || 320, icon: TrendingUp, color: 'text-[#a78bfa]' },
    { label: 'Average Trip Length', value: `${stats?.avgLength || 8} Days`, icon: Compass, color: 'text-aurora' },
  ];

  const handleSuspend = async (userId, suspended) => {
    try {
      await setSuspended(userId, suspended);
      toast.success(suspended ? 'User account suspended.' : 'User account reactivated.');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleDelete = async () => {
    const target = killUser;
    setKillUser(null);
    try {
      await deleteUser(target.id);
      toast.success(`User ${target.name} removed from platform.`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const toggleAdminRole = () => {
    if (!currentUser) return;
    const nextRole = currentUser.role === 'admin' ? 'traveller' : 'admin';
    setUser({ ...currentUser, role: nextRole });
    toast.info(`Role switched to ${nextRole}.`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-aurora">
            Admin & Analytics Dashboard
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-parchment">
            Platform Analytics & Administration
          </h1>
          <p className="text-xs text-muted">
            Track user adoption trends, destination popularity, and manage platform traveler accounts.
          </p>
        </div>

        {/* Role Toggle Helper */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleAdminRole}
            className="border-saffron/40 text-saffron text-xs"
          >
            <Shield className="mr-1.5 h-3.5 w-3.5" /> Toggle Role: {currentUser?.role === 'admin' ? 'Admin' : 'Traveller'}
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className="glass rounded-3xl p-5 border border-border/50 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">{k.label}</span>
              <k.icon className={`h-4 w-4 ${k.color}`} />
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-parchment">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Trips Created Over Time Chart */}
      <div className="glass rounded-3xl p-6 border border-border/50 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-parchment flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-saffron" /> Trips Created Over Time
            </h2>
            <p className="text-xs text-muted">Monthly trip generation volume across all travelers</p>
          </div>
          <span className="font-mono text-xs text-saffron bg-saffron/15 rounded-lg px-2.5 py-1">
            +34% Growth this quarter
          </span>
        </div>

        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white/5" />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.tripsOverTime || []}>
                <XAxis dataKey="month" stroke="#9aa3c7" fontSize={11} />
                <YAxis stroke="#9aa3c7" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0e1118', borderColor: '#242b3d', borderRadius: '12px' }}
                />
                <Bar dataKey="trips" fill="#FFB02E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Suspense>
      </div>

      {/* Top Destinations and Top Activities */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Cities */}
        <div className="glass rounded-3xl p-6 border border-border/50 shadow-md">
          <h2 className="font-display text-xl font-bold text-parchment flex items-center gap-2 mb-1">
            <MapPin className="h-5 w-5 text-aurora" /> Top Destinations
          </h2>
          <p className="text-xs text-muted mb-4">Most frequently added cities in user itineraries</p>

          <div className="space-y-2.5">
            {(stats?.topCities || []).map((c, i) => (
              <div
                key={c.city}
                className="flex items-center justify-between rounded-2xl bg-white/5 p-3 text-xs border border-border/30"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-saffron/20 font-mono text-xs font-bold text-saffron">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-parchment text-sm">{c.city}</span>
                </div>
                <span className="font-mono text-muted">{c.n} trips booked</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Activities */}
        <div className="glass rounded-3xl p-6 border border-border/50 shadow-md">
          <h2 className="font-display text-xl font-bold text-parchment flex items-center gap-2 mb-1">
            <Compass className="h-5 w-5 text-[#a78bfa]" /> Top Activities & Experiences
          </h2>
          <p className="text-xs text-muted mb-4">Highest rated activities added by travelers</p>

          <div className="space-y-2.5">
            {(stats?.topActivities || []).map((a, i) => (
              <div
                key={a}
                className="flex items-center justify-between rounded-2xl bg-white/5 p-3 text-xs border border-border/30"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-aurora/20 font-mono text-xs font-bold text-aurora">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-parchment">{a}</span>
                </div>
                <span className="font-mono text-xs text-aurora">Popular</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Management Tools Table */}
      <div className="glass rounded-3xl p-6 border border-border/50 shadow-md space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-parchment flex items-center gap-2">
            <Users className="h-5 w-5 text-saffron" /> User Management Tools
          </h2>
          <p className="text-xs text-muted">Inspect traveler accounts, adjust roles, or toggle suspension status</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/40 text-muted uppercase font-mono text-[10px]">
                <th className="py-3 px-3">Traveler</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256'}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <span className="font-semibold text-parchment">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-muted">{u.email}</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-mono capitalize ${
                        u.role === 'admin' ? 'bg-aurora/20 text-aurora' : 'bg-white/10 text-muted'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    {u.suspended ? (
                      <span className="rounded-full bg-coral/20 px-2 py-0.5 font-mono text-[10px] text-coral">
                        Suspended
                      </span>
                    ) : (
                      <span className="rounded-full bg-aurora/20 px-2 py-0.5 font-mono text-[10px] text-aurora">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[11px] h-7"
                        onClick={() => handleSuspend(u.id, !u.suspended)}
                      >
                        {u.suspended ? (
                          <><CheckCircle className="mr-1 h-3 w-3 text-aurora" /> Activate</>
                        ) : (
                          <><Ban className="mr-1 h-3 w-3 text-coral" /> Suspend</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="coral"
                        className="text-[11px] h-7 px-2"
                        onClick={() => setKillUser(u)}
                        title="Delete user"
                      >
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

      {/* User Deletion Dialog */}
      <ConfirmDialog
        open={!!killUser}
        title={`Delete User: ${killUser?.name}?`}
        body="This will permanently delete this account and all associated itineraries from the platform."
        onClose={() => setKillUser(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
