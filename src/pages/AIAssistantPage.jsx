import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Sparkles, Send, Wand2 } from 'lucide-react';
import { getAI } from '@/services/ai.js';
import { createTrip, addStop } from '@/services/trips.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { Button } from '@/components/ui/button.jsx';
import { Input, Label, Textarea } from '@/components/ui/input.jsx';

const PERSONAS = ['Foodie', 'History buff', 'Adventure seeker', 'Budget backpacker', 'Luxury traveller', 'Photographer'];

export default function AIAssistantPage() {
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);
  const world = useWorldStore();

  const [prompt, setPrompt] = useState('');
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(7);
  const [budget, setBudget] = useState(150000);
  const [travelers, setTravelers] = useState(2);
  const [interests, setInterests] = useState([]);
  const [output, setOutput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [done, setDone] = useState(false);
  const outputRef = useRef(null);

  const toggleInterest = (p) => {
    setInterests((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const generate = async () => {
    const input = {
      prompt: prompt || `Plan a ${duration}-day trip to ${destination || 'surprise me'} for ${travelers} travelers`,
      destination,
      duration,
      budget,
      travelers,
      interests,
    };
    setOutput('');
    setStreaming(true);
    setDone(false);
    try {
      let acc = '';
      for await (const chunk of getAI().generateItinerary(input)) {
        acc += chunk;
        setOutput(acc);
        if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }
      setDone(true);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setStreaming(false);
    }
  };

  const convertToTrip = async () => {
    if (!user) return;
    try {
      const today = new Date();
      const start = new Date(today.getTime() + 30 * 86400000);
      const end = new Date(start.getTime() + duration * 86400000);
      const trip = await createTrip({
        user_id: user.id,
        name: destination ? `AI: ${destination} adventure` : 'AI-generated trip',
        description: output.slice(0, 200),
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        budget_cap: budget,
      });
      // Add first 3 matching cities as stops
      const keywords = (destination || '').toLowerCase().split(/[\s,]+/).filter(Boolean);
      const matched = world.cities.filter((c) => keywords.some((k) => c.name.toLowerCase().includes(k) || c.country.toLowerCase().includes(k)));
      const picks = matched.length > 0 ? matched.slice(0, 3) : world.cities.slice(0, 3);
      const perCity = Math.floor(duration / picks.length) || 2;
      for (let i = 0; i < picks.length; i++) {
        const s = new Date(start.getTime() + i * perCity * 86400000);
        const e = new Date(s.getTime() + perCity * 86400000);
        await addStop({
          trip_id: trip.id,
          city_id: picks[i].id,
          start_date: s.toISOString().split('T')[0],
          end_date: e.toISOString().split('T')[0],
        });
      }
      toast.success('Trip created from AI itinerary!');
      nav(`/trips/${trip.id}/build`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-aurora">AI Travel Assistant</p>
        <h1 className="mt-1 font-display text-4xl">Describe your dream trip</h1>
        <p className="mt-1 text-sm text-muted">Tell the atlas what you want, and it will chart a constellation for you.</p>
      </div>

      <div className="glass rounded-2xl p-6">
        {/* Natural language prompt */}
        <div>
          <Label>Describe your trip in your own words (optional)</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g. "10-day food and culture trip across Japan under ₹1,80,000 for 2 people"'
            rows={3}
          />
        </div>

        {/* Structured inputs */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Label>Destination</Label>
            <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Japan, Goa, Europe…" />
          </div>
          <div>
            <Label>Duration (days)</Label>
            <Input type="number" min={1} max={60} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </div>
          <div>
            <Label>Budget (₹)</Label>
            <Input type="number" min={10000} step={10000} value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
          </div>
          <div>
            <Label>Travelers</Label>
            <Input type="number" min={1} max={20} value={travelers} onChange={(e) => setTravelers(Number(e.target.value))} />
          </div>
        </div>

        {/* Interest chips */}
        <div className="mt-4">
          <Label>Travel style / interests</Label>
          <div className="mt-1 flex flex-wrap gap-2">
            {PERSONAS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => toggleInterest(p)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${interests.includes(p) ? 'border-saffron bg-saffron/20 text-saffron' : 'border-border text-muted hover:text-parchment'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <Button className="mt-6" onClick={generate} disabled={streaming}>
          {streaming ? (
            <><Sparkles className="mr-2 h-4 w-4 animate-spin" />Charting route…</>
          ) : (
            <><Wand2 className="mr-2 h-4 w-4" />Generate itinerary</>
          )}
        </Button>
      </div>

      {/* Output */}
      {output && (
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-2xl">Your AI itinerary</h2>
          <div ref={outputRef} className="mt-3 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-parchment/90">
            {output}
            {streaming && <span className="animate-pulse text-aurora">▍</span>}
          </div>
          {done && (
            <div className="mt-4 flex gap-3">
              <Button onClick={convertToTrip}><Send className="mr-2 h-4 w-4" />Turn into real trip</Button>
              <Button variant="outline" onClick={generate}>Regenerate</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
