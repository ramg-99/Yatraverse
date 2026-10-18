import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useWorldStore } from '@/store/useWorldStore.js';
import { useSettingsStore } from '@/store/useSettingsStore.js';
import { useAuthStore } from '@/store/useAuthStore.js';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const trips = useWorldStore((s) => s.trips);
  const cities = useWorldStore((s) => s.cities);
  const user = useAuthStore((s) => s.user);
  const setTheme = useSettingsStore((s) => s.setTheme);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!open || !user) return null;

  const go = (path) => {
    setOpen(false);
    nav(path);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-4" onClick={() => setOpen(false)}>
      <Command
        className="glass mx-auto mt-[12vh] max-w-lg rounded-2xl p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Command.Input autoFocus placeholder="Jump the atlas…" className="h-12 w-full bg-transparent px-3 text-sm outline-none" />
        <Command.List className="max-h-72 overflow-auto py-2 text-sm">
          <Command.Item onSelect={() => go('/trips/new')}>Create trip</Command.Item>
          <Command.Item onSelect={() => go('/dashboard')}>Dashboard</Command.Item>
          <Command.Item onSelect={() => setTheme(useSettingsStore.getState().theme === 'dark' ? 'light' : 'dark')}>
            Toggle theme
          </Command.Item>
          {trips
            .filter((t) => t.user_id === user.id)
            .map((t) => (
              <Command.Item key={t.id} onSelect={() => go(`/trips/${t.id}`)}>
                Trip · {t.name}
              </Command.Item>
            ))}
          {cities.slice(0, 8).map((c) => (
            <Command.Item key={c.id} onSelect={() => go('/cities')}>
              City · {c.name}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </div>
  );
}
