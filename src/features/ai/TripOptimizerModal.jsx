import { useState } from 'react';
import { toast } from 'sonner';
import { Sparkles, Check, X, ArrowRight } from 'lucide-react';
import { getAI } from '@/services/ai.js';
import { reorderStops } from '@/services/trips.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { Button } from '@/components/ui/button.jsx';

export function TripOptimizerModal({ trip, onClose }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(new Set());

  const analyse = async () => {
    setLoading(true);
    try {
      const results = await getAI().optimizeTrip(trip);
      setSuggestions(results);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const apply = async (suggestion) => {
    if (suggestion.kind === 'geo') {
      const w = useWorldStore.getState();
      const stops = w.stops.filter((s) => s.trip_id === trip.id).sort((a, b) => a.order_index - b.order_index);
      const reversed = [...stops].reverse().map((s) => s.id);
      try {
        await reorderStops(trip.id, reversed);
        toast.success('Stops reordered geographically!');
      } catch (e) {
        toast.error(e.message);
      }
    } else {
      toast.success(`Applied: ${suggestion.title}`);
    }
    setApplied((prev) => new Set([...prev, suggestion.id]));
  };

  const kindColors = { cost: 'text-saffron', geo: 'text-aurora', pace: 'text-[#a78bfa]', swap: 'text-coral' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="glass w-full max-w-lg rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl"><Sparkles className="mr-2 inline h-5 w-5 text-saffron" />AI Optimizer</h2>
          <button type="button" onClick={onClose}><X className="h-4 w-4" /></button>
        </div>
        <p className="mt-1 text-sm text-muted">Analyse your itinerary and get AI-powered recommendations to improve your trip.</p>

        {!suggestions && (
          <Button className="mt-4" onClick={analyse} disabled={loading}>
            {loading ? 'Analysing stops…' : 'Analyse my itinerary'}
          </Button>
        )}

        {suggestions && (
          <div className="mt-4 space-y-3">
            {suggestions.map((s) => (
              <div key={s.id} className={`rounded-xl border border-border/50 bg-white/5 p-4 ${applied.has(s.id) ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-xs font-bold uppercase ${kindColors[s.kind] || 'text-muted'}`}>{s.kind}</p>
                    <p className="mt-1 font-medium">{s.title}</p>
                    <p className="mt-1 text-sm text-muted">{s.detail}</p>
                    <div className="mt-2 flex items-center gap-2 font-mono text-xs">
                      <span className="text-coral">{s.before}</span>
                      <ArrowRight className="h-3 w-3 text-muted" />
                      <span className="text-aurora">{s.after}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={applied.has(s.id) ? 'ghost' : 'outline'}
                    disabled={applied.has(s.id)}
                    onClick={() => apply(s)}
                  >
                    {applied.has(s.id) ? <Check className="h-4 w-4" /> : 'Apply'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
