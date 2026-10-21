import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Calendar, Image, DollarSign, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { tripSchema } from '@/schemas/auth.js';
import { createTrip } from '@/services/trips.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { Button } from '@/components/ui/button.jsx';
import { Input, Label, Textarea } from '@/components/ui/input.jsx';
import { money } from '@/lib/utils.js';

const COVERS = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400',
  'https://images.unsplash.com/photo-1469854523086-e0275085273?w=1400',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1400',
];

export default function CreateTripPage() {
  const user = useAuthStore((s) => s.user) || { id: 'u_demo', currency: 'INR' };
  const nav = useNavigate();
  const [cover, setCover] = useState(COVERS[0]);
  const [budgetCap, setBudgetCap] = useState(150000);

  const form = useForm({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      name: '',
      description: '',
      start_date: '2027-02-15',
      end_date: '2027-02-25',
    },
  });

  const watch = form.watch();

  const onSubmit = async (values) => {
    try {
      const trip = await createTrip({
        ...values,
        cover_url: cover,
        user_id: user.id,
        budget_cap: Number(budgetCap) || 150000,
      });
      toast.success('Trip created successfully! Now add cities and stops.');
      nav(`/trips/${trip.id}/build`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCover(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/trips" className="text-muted hover:text-parchment transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="font-mono text-xs uppercase tracking-widest text-aurora">
              Create Trip
            </span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-parchment">
            Plan a New Journey
          </h1>
          <p className="text-xs text-muted">
            Provide the basic trip details, select travel dates, and start building your custom itinerary.
          </p>
        </div>
        <Link to="/ai">
          <Button variant="outline" size="sm" className="border-aurora/40 text-aurora">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Or Use Yatra AI
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="glass rounded-3xl p-6 sm:p-8 space-y-5 border border-border/50">
          <div>
            <Label htmlFor="tripName">Trip Name *</Label>
            <Input
              id="tripName"
              placeholder="e.g. Rajasthan Heritage Tour, European Summer"
              {...form.register('name')}
              className="mt-1.5"
            />
            {form.formState.errors.name ? (
              <p className="mt-1 text-xs text-coral">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                {...form.register('start_date')}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                {...form.register('end_date')}
                className="mt-1.5"
              />
              {form.formState.errors.end_date ? (
                <p className="mt-1 text-xs text-coral">{form.formState.errors.end_date.message}</p>
              ) : null}
            </div>
          </div>

          <div>
            <Label htmlFor="budget">Estimated Budget Cap ({user.currency})</Label>
            <Input
              id="budget"
              type="number"
              min={5000}
              step={5000}
              value={budgetCap}
              onChange={(e) => setBudgetCap(e.target.value)}
              className="mt-1.5"
              placeholder="e.g. 150000"
            />
          </div>

          <div>
            <Label htmlFor="description">Trip Description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Brief summary of what this trip is about..."
              {...form.register('description')}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Cover Photo (Optional)</Label>
            <div className="mt-2 flex items-center gap-3">
              <Input type="file" accept="image/*" onChange={onFile} className="text-xs file:mr-2 file:rounded-md file:border-0 file:bg-white/10 file:px-2 file:py-1 file:text-xs file:text-parchment" />
            </div>
            <p className="mt-2 text-xs text-muted">Or pick from curated travel covers:</p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {COVERS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCover(c)}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border transition-all ${
                    cover === c ? 'border-saffron ring-2 ring-saffron/50 scale-105' : 'border-border/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={c} alt="Cover preview" className="h-full w-full object-cover" />
                  {cover === c && (
                    <div className="absolute inset-0 bg-saffron/20 flex items-center justify-center">
                      <Check className="h-4 w-4 text-saffron" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <Button type="submit" size="lg" className="w-full">
              Save Trip & Build Itinerary →
            </Button>
          </div>
        </form>

        {/* Live Preview Card */}
        <div className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted">Live Trip Preview</p>
          <div className="glass overflow-hidden rounded-3xl border border-border/60 shadow-xl">
            <div className="relative h-56 w-full">
              <img src={cover} alt="Trip cover preview" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="rounded-full bg-saffron/20 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-saffron">
                  Upcoming Trip
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-parchment">
                  {watch.name || 'Untitled Travel Plan'}
                </h2>
                <p className="mt-1 text-xs text-parchment/80 line-clamp-2">
                  {watch.description || 'Description will appear here once entered...'}
                </p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-white/5 p-3">
                  <span className="text-muted block">Travel Dates</span>
                  <span className="font-mono text-parchment font-medium mt-0.5 block">
                    {watch.start_date || 'Start'} → {watch.end_date || 'End'}
                  </span>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <span className="text-muted block">Budget Cap</span>
                  <span className="font-mono text-saffron font-medium mt-0.5 block">
                    {money(Number(budgetCap) || 0, user.currency)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-aurora/30 bg-aurora/5 p-3 text-xs text-muted flex items-start gap-2">
                <Check className="h-4 w-4 text-aurora shrink-0 mt-0.5" />
                <span>
                  After saving, you can add cities, select dates for each stop, and assign sightseeing activities.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
