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
  Sun,
  Moon,
  Palette,
  Compass as GlobeIcon,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { ConstellationBg } from '@/components/layout/ConstellationBg.jsx';
import { ChatDock } from '@/components/ai/ChatDock.jsx';
import { CommandPalette } from '@/features/command/CommandPalette.jsx';
import { useAuthStore } from '@/store/useAuthStore.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { useThemeStore } from '@/store/useThemeStore.js';
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

  const { mode, themeStyle, toggleMode, setThemeStyle } = useThemeStore();

  const navGroups = [
    {
      title: 'Navigation',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/trips', label: 'My Trips', icon: Briefcase, count: trips.length },
        { to: '/trips/new', label: 'Plan New Trip', icon: PlusCircle },
      ],
    },
    {
      title: 'Itinerary Planning',
      items: [
        { to: `/trips/${primaryTripId}`, label: 'Itinerary View', icon: Eye },
        { to: `/trips/${primaryTripId}/build`, label: 'Itinerary Builder', icon: SlidersHorizontal },
        { to: `/trips/${primaryTripId}/budget`, label: 'Trip Budget', icon: PieChart },
        { to: `/trips/${primaryTripId}/timeline`, label: 'Calendar / Timeline', icon: Calendar },
        { to: `/s/spice-route-homecoming`, label: 'Shared Itinerary', icon: Share2 },
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
        { to: '/ai', label: 'Yatra AI Assistant', icon: Sparkles, badge: 'AI Live' },
        { to: '/profile', label: 'Profile & Settings', icon: User },
        ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin Analytics', icon: Shield }] : []),
      ],
    },
  ];

  return (
    <div className="relative min-h-screen bg-ink text-parchment transition-colors duration-200">
      <ConstellationBg />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/70 bg-surface/90 px-4 backdrop-blur-md md:px-8 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-sm font-black text-lg group-hover:scale-105 transition-transform">
              ✈
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-parchment">
              Yatraverse
            </span>
          </Link>
          <span className="hidden text-xs text-muted md:inline font-medium">| Intelligent Multi-City Travel Studio</span>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Jump Dropdown */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-xl border border-border/80 bg-surface px-2.5 py-1 text-xs shadow-xs">
            <span className="text-muted text-[11px] font-medium">Jump:</span>
            <select
              aria-label="Quick Navigation"
              value={loc.pathname}
              onChange={(e) => nav(e.target.value)}
              className="bg-transparent text-xs text-accent font-semibold outline-none cursor-pointer"
            >
              <option value="/dashboard" className="bg-surface text-parchment">Dashboard</option>
              <option value="/trips/new" className="bg-surface text-parchment">Plan New Trip</option>
              <option value="/trips" className="bg-surface text-parchment">My Trips</option>
              <option value={`/trips/${primaryTripId}/build`} className="bg-surface text-parchment">Itinerary Builder</option>
              <option value={`/trips/${primaryTripId}`} className="bg-surface text-parchment">Itinerary View</option>
              <option value="/cities" className="bg-surface text-parchment">City Search</option>
              <option value="/activities" className="bg-surface text-parchment">Activity Search</option>
              <option value={`/trips/${primaryTripId}/budget`} className="bg-surface text-parchment">Trip Budget</option>
              <option value={`/trips/${primaryTripId}/timeline`} className="bg-surface text-parchment">Calendar Timeline</option>
              <option value="/s/spice-route-homecoming" className="bg-surface text-parchment">Shared Itinerary</option>
              <option value="/profile" className="bg-surface text-parchment">User Profile</option>
              {user?.role === 'admin' && (
                <option value="/admin" className="bg-surface text-parchment">Admin Analytics</option>
              )}
              <option value="/ai" className="bg-surface text-parchment">✨ Yatra AI Assistant</option>
              <option value="/login" className="bg-surface text-parchment">Login / Signup</option>
            </select>
          </div>

          {/* Compact High-Contrast Light / Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleMode}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer select-none shrink-0',
              mode === 'dark'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/60 hover:bg-amber-400/30 hover:border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.35)]'
                : 'bg-amber-50 text-amber-900 border border-amber-400/70 hover:bg-amber-100 shadow-xs'
            )}
            title={mode === 'dark' ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌙'}
            aria-label="Toggle theme mode"
          >
            {mode === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="h-4 w-4 text-amber-800" />
            )}
          </button>

          {/* User mini badge & Profile */}
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-xl border border-border/80 bg-surface px-2.5 py-1 text-xs hover:border-accent transition-colors shadow-xs"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256'}
              alt={user?.name || 'User'}
              className="h-6 w-6 rounded-full object-cover ring-1 ring-border"
            />
            <span className="hidden sm:inline font-semibold text-parchment">{user?.name?.split(' ')[0] || 'User'}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex">
        {/* Desktop Sidebar Navigation */}
        <aside className="no-print hidden md:flex md:w-64 flex-col justify-between border-r border-border/80 bg-surface/75 px-3 py-5 backdrop-blur-md md:h-[calc(100vh-4rem)] md:sticky md:top-16 overflow-y-auto">
          <div className="space-y-6">
            {navGroups.map((grp) => (
              <div key={grp.title}>
                <p className="px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                  {grp.title}
                </p>
                <div className="mt-2 space-y-1">
                  {grp.items.map(({ to, label, icon: Icon, badge, count }) => {
                    const isActive = loc.pathname === to || (to !== '/trips' && to !== '/dashboard' && loc.pathname.startsWith(to));
                    return (
                      <NavLink
                        key={to}
                        to={to}
                        className={cn(
                          'relative flex items-center justify-between rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 group overflow-hidden',
                          isActive
                            ? 'bg-accent/15 text-accent font-bold border-l-4 border-accent shadow-xs translate-x-1'
                            : 'text-muted hover:text-parchment hover:bg-surface hover:translate-x-1.5 hover:shadow-xs hover:border-l-3 hover:border-accent/80'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={cn('h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-115 group-hover:text-accent', isActive ? 'text-accent' : 'text-muted')} />
                          <span className="transition-colors">{label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {badge && (
                            <span className="rounded-md bg-accent/20 px-1.5 py-0.5 font-mono text-[10px] text-accent font-semibold">
                              {badge}
                            </span>
                          )}
                          {count !== undefined && (
                            <span className="rounded-full bg-border/60 px-2 py-0.5 text-[11px] text-muted font-mono group-hover:bg-accent/20 group-hover:text-accent transition-colors">
                              {count}
                            </span>
                          )}
                          <ChevronRight className="h-3.5 w-3.5 text-muted opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-accent" />
                        </div>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-border/70 pt-4 space-y-2">
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface/50 border border-border/50 text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256'}
                  alt={user?.name || 'User'}
                  className="h-7 w-7 rounded-full object-cover shrink-0"
                />
                <div className="truncate text-left">
                  <p className="font-semibold text-parchment truncate">{user?.name || 'Demo Traveller'}</p>
                  <p className="text-[10px] text-muted truncate">{user?.email || 'demo@yatraverse.app'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="text-muted hover:text-coral transition-colors p-1"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            <Link
              to="/login"
              className="flex items-center justify-between rounded-xl px-3 py-1.5 text-xs text-muted hover:bg-white/5 hover:text-parchment"
            >
              <span>Switch Account</span>
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
