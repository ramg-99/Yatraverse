import { Star } from 'lucide-react';
import { money } from '@/lib/utils.js';
import { onImgError } from '@/lib/image.js';
import { Button } from '@/components/ui/button.jsx';
import { useSettingsStore } from '@/store/useSettingsStore.js';
import { convert } from '@/lib/fx.js';

export function ActivityCard({ activity, added, onToggle, onQuick }) {
  const currency = useSettingsStore((s) => s.currency);
  return (
    <article className="glass flex gap-3 overflow-hidden rounded-2xl p-3">
      <img
        src={activity.image}
        alt=""
        onError={(e) => onImgError(e, activity.name)}
        className="h-24 w-24 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase text-aurora">{activity.type}</p>
        <h3 className="truncate font-display text-lg">{activity.name}</h3>
        <p className="flex items-center gap-2 font-mono text-xs text-muted">
          <Star className="h-3 w-3 text-saffron" /> {activity.rating.toFixed(1)} · {activity.duration_min}m ·{' '}
          {money(convert(activity.cost, currency), currency)}
        </p>
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant={added ? 'coral' : 'solid'} onClick={onToggle}>
            {added ? 'Remove' : 'Add'}
          </Button>
          <Button size="sm" variant="ghost" onClick={onQuick}>
            Quick view
          </Button>
        </div>
      </div>
    </article>
  );
}
