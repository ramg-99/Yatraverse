import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';

export function TripNotes({ trip }) {
  const [notes, setNotes] = useState(trip.notes || '');

  return (
    <section className="glass mt-6 rounded-2xl p-5">
      <h2 className="font-display text-2xl">Trip notes</h2>
      <textarea
        className="mt-3 min-h-24 w-full rounded-xl border border-border bg-ink/40 p-3 text-sm"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Leave a note for your future self"
      />
      <Button size="sm" className="mt-3" onClick={() => setNotes(notes.trim())}>Save note</Button>
    </section>
  );
}

export default TripNotes;