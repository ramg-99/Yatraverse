import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { useAuthStore } from '@/store/useAuthStore.js';
import { useWorldStore } from '@/store/useWorldStore.js';

const Q = [
  { q: 'Dawn or midnight?', a: ['Sunrise temples', 'Night markets'] },
  { q: 'Mountains or sea?', a: ['Ridges & tea', 'Coast & salt'] },
  { q: 'Budget mood?', a: ['Thrifty orbits', 'Soft luxury'] },
  { q: 'Pace?', a: ['One museum deep', 'Three neighbourhoods'] },
  { q: 'Plate?', a: ['Street steam', 'Tasting menus'] },
  { q: 'Souvenir?', a: ['Stamp in a notebook', 'A story you cooked'] },
];

function personaFrom(answers) {
  const night = answers[0] === 1;
  const sea = answers[1] === 1;
  const food = answers[4] === 0;
  if (night && food) return 'Midnight Foodie';
  if (!sea) return 'Mountain Wanderer';
  if (answers[2] === 1) return 'Silk Route Softie';
  return 'Atlas Flâneur';
}

export function PersonaQuiz({ onDone }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState([]);
  const user = useAuthStore((s) => s.user);

  const pick = (idx) => {
    const next = [...answers, idx];
    if (i === Q.length - 1) {
      const persona = personaFrom(next);
      useWorldStore.getState().upsertUser({ ...user, persona });
      useAuthStore.getState().setUser({ ...user, persona });
      useAuthStore.getState().setPersonaDone(true);
      onDone?.(persona);
    } else {
      setAnswers(next);
      setI(i + 1);
    }
  };

  const cur = Q[i];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="glass max-w-md rounded-3xl p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-aurora">Travel persona {i + 1}/6</p>
        <h2 className="mt-2 font-display text-3xl">{cur.q}</h2>
        <div className="mt-6 grid gap-3">
          {cur.a.map((label, idx) => (
            <Button key={label} variant="outline" onClick={() => pick(idx)}>
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
