import { Heart, Coins } from 'lucide-react';
import { cn } from '@/lib/utils.js';
import { onImgError } from '@/lib/image.js';
import { Button } from '@/components/ui/button.jsx';

/**
 * @param {{ city: object, saved?: boolean, onSave?: () => void, onAdd?: () => void, onCompare?: () => void, compared?: boolean }} props
 */
export function CityCard({ city, saved, onSave, onAdd, onCompare, compared }) {
  return (
    <article className="glass relative overflow-hidden rounded-2xl grain">
      <img
        src={city.image}
        alt={city.name}
        onError={(e) => onImgError(e, city.name)}
        className="h-40 w-full object-cover"
      />
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl">{city.name}</h3>
              {city.distKm && (
                <span className="rounded-full bg-saffron/15 text-saffron border border-saffron/30 px-2 py-0.5 font-mono text-[10px] font-bold">
                  📍 {city.distKm.toLocaleString()} km
                </span>
              )}
            </div>
            <p className="text-xs text-muted">
              {city.country} · {city.region} · {city.iata}
            </p>
          </div>
          <button type="button" aria-label="Save city" onClick={onSave} className="text-coral">
            <Heart className={cn('h-5 w-5', saved && 'fill-coral')} />
          </button>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{city.description}</p>
        <div className="mt-3 flex items-center gap-1" aria-label={`Cost index ${city.cost_index} of 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Coins key={i} className={cn('h-4 w-4', i < city.cost_index ? 'text-saffron' : 'text-muted/40')} />
          ))}
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-aurora" style={{ width: `${city.popularity}%` }} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={onAdd}>
            Add to trip
          </Button>
          <Button size="sm" variant={compared ? 'solid' : 'outline'} onClick={onCompare}>
            Compare
          </Button>
        </div>
      </div>
    </article>
  );
}
