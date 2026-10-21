import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Eye,
  SlidersHorizontal,
  PieChart,
  Calendar,
  Share2,
  MapPin,
  Compass,
  Sparkles,
  User,
  Shield,
  LogOut,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { ConstellationBg } from '@/components/layout/ConstellationBg.jsx';
import { ChatDock } from '@/components/ai/ChatDock.jsx';
import { CommandPalette } from '@/features/command/CommandPalette.jsx';
import { useAuthStore } from '@/store/useAuthStore.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { cn } from '@/lib/utils.js';

export function AppShell() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const loc = useLocation();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const trips = useWorldStore((s) => s.trips);
  const primaryTripId = trips[0]?.id || 't_spice';

  const navGroups = [
    {
      title: 'Navigation',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/trips', label: 'My Trips', icon: Briefcase },
        { to: '/trips/new', label: 'Create Trip', icon: PlusCircle },
      ],
    },
    {
      title: 'Itinerary Planning',
      items: [
        { to: `/trips/${primaryTripId}`, label: 'Itinerary View', icon: Eye },
        { to: `/trips/${primaryTripId}/build`, label: 'Itinerary Builder', icon: SlidersHorizontal },
        { to: `/trips/${primaryTripId}/budget`, label: 'Trip Budget', icon: PieChart },
        { to: `/trips/${primaryTripId}/timeline`, label: 'Calendar / Timeline', icon: Calendar },
        { to: `/s/spice-route-homecoming`, label: 'Shared Itinerary', icon: Share2, external: false },
      ],
    },
    {
      title: 'Explore & Search',
      items: [
        { to: '/cities', label: 'City Search', icon: MapPin },
        { to: '/activities', label: 'Activity Search', icon: Compass },
      ],
    },
    {
      title: 'AI & Management',
      items: [
        { to: '/ai', label: 'Yatra AI Assistant', icon: Sparkles, badge: 'Yatra AI' },
        { to: '/profile', label: 'Profile & Settings', icon: User },
        { to: '/admin', label: 'Admin Analytics', icon: Shield },
      ],
    },
  ];

  return (
    <div className="relative min-h-screen bg-ink text-parchment">
      <ConstellationBg />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/50 bg-ink/80 px-4 backdrop-blur-md md:px-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold tracking-tight text-saffron">Yatraverse</span>
          </Link>
          <span className="hidden text-xs text-muted md:inline">| Complete Multi-City Travel Planner</span>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Jump Dropdown */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-xl border border-border/60 bg-white/5 px-2.5 py-1 text-xs">
            <span className="text-muted">Quick Jump:</span>
            <select
              aria-label="Quick Navigation"
              value={loc.pathname}
              onChange={(e) => nav(e.target.value)}
              className="bg-transparent text-xs text-saffron outline-none cursor-pointer"
            >
              <option value="/dashboard" className="bg-ink text-parchment">Dashboard</option>
              <option value="/trips/new" className="bg-ink text-parchment">Create Trip</option>
              <option value="/trips" className="bg-ink text-parchment">My Trips</option>
              <option value={`/trips/${primaryTripId}/build`} className="bg-ink text-parchment">Itinerary Builder</option>
              <option value={`/trips/${primaryTripId}`} className="bg-ink text-parchment">Itinerary View</option>
              <option value="/cities" className="bg-ink text-parchment">City Search</option>
              <option value="/activities" className="bg-ink text-parchment">Activity Search</option>
              <option value={`/trips/${primaryTripId}/budget`} className="bg-ink text-parchment">Trip Budget & Breakdown</option>
              <option value={`/trips/${primaryTripId}/timeline`} className="bg-ink text-parchment">Calendar & Timeline</option>
              <option value="/s/spice-route-homecoming" className="bg-ink text-parchment">Shared Itinerary</option>
              <option value="/profile" className="bg-ink text-parchment">User Profile / Settings</option>
              <option value="/admin" className="bg-ink text-parchment">Admin Analytics</option>
              <option value="/ai" className="bg-ink text-parchment">✨ Yatra AI Assistant</option>
              <option value="/login" className="bg-ink text-parchment">Login / Signup</option>
            </select>
          </div>

          {/* User mini badge & Profile */}
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-xl border border-border/40 bg-white/5 px-2.5 py-1 text-xs hover:border-saffron/50 transition-colors"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256'}
              alt={user?.name || 'User'}
              className="h-6 w-6 rounded-full object-cover"
            />
            <span className="hidden sm:inline font-medium text-parchment">{user?.name?.split(' ')[0] || 'User'}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex">
        {/* Desktop Sidebar Navigation */}
        <aside className="no-print hidden md:flex md:w-64 flex-col justify-between border-r border-border/40 bg-ink/60 px-3 py-5 backdrop-blur-md md:h-[calc(100vh-4rem)] md:sticky md:top-16 overflow-y-auto">
          <div className="space-y-6">
            {navGroups.map((grp) => (
              <div key={grp.title}>
                <p className="px-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted">
                  {grp.title}
                </p>
                <div className="mt-2 space-y-1">
                  {grp.items.map(({ to, label, icon: Icon, badge }) => {
                    const isActive = loc.pathname === to || (to !== '/trips' && to !== '/dashboard' && loc.pathname.startsWith(to));
                    return (
                      <NavLink
                        key={to}
                        to={to}
                        className={cn(
                          'flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-saffron/20 text-saffron font-semibold border-l-2 border-saffron'
                            : 'text-muted hover:bg-white/5 hover:text-parchment'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{label}</span>
                        </div>
                        {badge && (
                          <span className="rounded bg-aurora/20 px-1.5 py-0.2 font-mono text-[10px] text-aurora">
                            {badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-border/40 pt-4">
            <Link
              to="/login"
              className="flex items-center justify-between rounded-xl px-3 py-2 text-xs text-muted hover:bg-white/5 hover:text-parchment"
            >
              <span>Login / Sign Up</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </aside>

        {/* Page Content */}
        <main className="relative z-10 flex-1 px-4 py-6 md:px-8 max-w-7xl pb-24 md:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="no-print glass fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t border-border/50 bg-ink/95 p-2 backdrop-blur-lg md:hidden">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            cn('flex flex-col items-center gap-1 p-1 text-[10px]', isActive ? 'text-saffron' : 'text-muted')
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/trips"
          className={({ isActive }) =>
            cn('flex flex-col items-center gap-1 p-1 text-[10px]', isActive ? 'text-saffron' : 'text-muted')
          }
        >
          <Briefcase className="h-4 w-4" />
          <span>Trips</span>
        </NavLink>
        <NavLink
          to="/cities"
          className={({ isActive }) =>
            cn('flex flex-col items-center gap-1 p-1 text-[10px]', isActive ? 'text-saffron' : 'text-muted')
          }
        >
          <MapPin className="h-4 w-4" />
          <span>Cities</span>
        </NavLink>
        <NavLink
          to="/activities"
          className={({ isActive }) =>
            cn('flex flex-col items-center gap-1 p-1 text-[10px]', isActive ? 'text-saffron' : 'text-muted')
          }
        >
          <Compass className="h-4 w-4" />
          <span>Activities</span>
        </NavLink>
        <NavLink
          to="/ai"
          className={({ isActive }) =>
            cn('flex flex-col items-center gap-1 p-1 text-[10px]', isActive ? 'text-aurora' : 'text-muted')
          }
        >
          <Sparkles className="h-4 w-4" />
          <span>Yatra AI</span>
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn('flex flex-col items-center gap-1 p-1 text-[10px]', isActive ? 'text-saffron' : 'text-muted')
          }
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </NavLink>
      </nav>

      <ChatDock />
      <CommandPalette />
    </div>
  );
}
