import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils.js';
import { onImgError } from '@/lib/image.js';

/**
 * @param {{ trip: object, codes?: string[], className?: string, to?: string }} props
 */
export function BoardingPassCard({ trip, codes = [], className, to }) {
  const inner = (
    <article className={cn('boarding-pass relative overflow-hidden rounded-2xl p-4 text-left shadow-glass', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-aurora">Yatraverse Air</p>
          <h3 className="font-display text-xl">{trip.name}</h3>
        </div>
        <span className="rounded-full bg-saffron/20 px-2 py-1 font-mono text-[10px] text-saffron">
          {trip.is_public ? 'PUBLIC' : 'CABIN'}
        </span>
      </div>
      <p className="mt-3 font-mono text-lg tracking-widest text-saffron">{codes.join(' → ') || 'TBD → TBD'}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="text-xs text-muted">
          <p className="font-mono">
            {format(new Date(trip.start_date), 'dd MMM')} — {format(new Date(trip.end_date), 'dd MMM yyyy')}
          </p>
          <p>{trip.description}</p>
        </div>
        {trip.cover_url ? (
          <img
            src={trip.cover_url}
            alt=""
            onError={(e) => onImgError(e, trip.name)}
            className="h-12 w-16 rounded object-cover"
          />
        ) : null}
      </div>
      <div className="barcode mt-4 h-8 w-full rounded-sm opacity-70" aria-hidden />
    </article>
  );
  return to ? (
    <Link to={to} className="block hover:-translate-y-1 transition">
      {inner}
    </Link>
  ) : (
    inner
  );
}
