import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, Map, Sparkles, User, LayoutDashboard, Landmark, Shield } from 'lucide-react';
import { ConstellationBg } from '@/components/layout/ConstellationBg.jsx';
import { ChatDock } from '@/components/ai/ChatDock.jsx';
import { CommandPalette } from '@/features/command/CommandPalette.jsx';
import { useAuthStore } from '@/store/useAuthStore.js';
import { cn } from '@/lib/utils.js';

const links = [
  { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { to: '/trips', key: 'trips', icon: Compass },
  { to: '/cities', key: 'cities', icon: Map },
  { to: '/activities', key: 'activities', icon: Landmark },
  { to: '/ai', key: 'ai', icon: Sparkles },
  { to: '/profile', key: 'profile', icon: User },
];

export function AppShell() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const loc = useLocation();
  const items = user?.role === 'admin' ? [...links, { to: '/admin', key: 'admin', icon: Shield }] : links;

  return (
    <div className="relative min-h-screen">
      <ConstellationBg />
      <aside className="no-print glass fixed bottom-0 left-0 right-0 z-30 mx-3 mb-3 flex justify-around rounded-2xl p-2 md:bottom-auto md:left-4 md:top-4 md:mb-0 md:h-[calc(100vh-2rem)] md:w-56 md:flex-col md:justify-start md:gap-2">
        <div className="hidden px-2 py-3 md:block">
          <p className="font-display text-2xl text-saffron">Yatraverse</p>
          <p className="text-[11px] text-muted">{t('tagline')}</p>
        </div>
        {items.map(({ to, key, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] md:flex-row md:text-sm',
                isActive || loc.pathname.startsWith(to) ? 'bg-saffron/20 text-saffron' : 'text-muted hover:text-parchment',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {t(`nav.${key}`)}
          </NavLink>
        ))}
      </aside>
      <main className="relative z-10 px-4 pb-28 pt-6 md:ml-64 md:pb-10 md:pr-8">
        <Outlet />
      </main>
      <ChatDock />
      <CommandPalette />
    </div>
  );
}
