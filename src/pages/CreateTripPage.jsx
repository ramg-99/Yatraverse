import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { tripSchema } from '@/schemas/auth.js';
import { createTrip } from '@/services/trips.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { Button } from '@/components/ui/button.jsx';
import { Input, Label, Textarea } from '@/components/ui/input.jsx';
import { BoardingPassCard } from '@/components/trip/BoardingPassCard.jsx';

const COVERS = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400',
  'https://images.unsplash.com/photo-1469854523086-e0275085273?w=1400',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400',
];

export default function CreateTripPage() {
  const user = useAuthStore((s) => s.user);
  const nav = useNavigate();
  const [cover, setCover] = useState(COVERS[0]);
  const form = useForm({
    resolver: zodResolver(tripSchema),
    defaultValues: { name: '', description: '', start_date: '2027-01-10', end_date: '2027-01-20' },
  });
  const watch = form.watch();

  const onSubmit = async (values) => {
    try {
      const trip = await createTrip({ ...values, cover_url: cover, user_id: user.id });
      toast.success('Boarding pass printed.');
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

  const preview = {
    name: watch.name || 'Untitled constellation',
    description: watch.description || 'Still mapping the stars.',
    start_date: watch.start_date || '2027-01-10',
    end_date: watch.end_date || '2027-01-20',
    is_public: false,
    cover_url: cover,
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h1 className="font-display text-4xl">Fold a new trip</h1>
        <div>
          <Label>Trip name</Label>
          <Input {...form.register('name')} />
          {form.formState.errors.name ? <p className="text-xs text-coral">{form.formState.errors.name.message}</p> : null}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Start</Label>
            <Input type="date" {...form.register('start_date')} />
          </div>
          <div>
            <Label>End</Label>
            <Input type="date" {...form.register('end_date')} />
            {form.formState.errors.end_date ? (
              <p className="text-xs text-coral">{form.formState.errors.end_date.message}</p>
            ) : null}
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea {...form.register('description')} />
        </div>
        <div>
          <Label>Cover</Label>
          <Input type="file" accept="image/*" onChange={onFile} />
          <div className="mt-2 flex gap-2">
            {COVERS.map((c) => (
              <button key={c} type="button" onClick={() => setCover(c)} className={`h-14 w-20 overflow-hidden rounded ${cover === c ? 'ring-2 ring-saffron' : ''}`}>
                <img src={c} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <Button type="submit">Save trip</Button>
      </form>
      <BoardingPassCard trip={preview} codes={['???']} />
    </div>
  );
}
