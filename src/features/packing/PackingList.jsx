import { useState } from 'react';

const essentials = ['Passport', 'Travel adapter', 'Walking shoes', 'Weather layer'];

export function PackingList() {
  const [packed, setPacked] = useState([]);

  const toggle = (item) => {
    setPacked((current) => (current.includes(item) ? current.filter((value) => value !== item) : [...current, item]));
  };

  return (
    <section className="glass mt-6 rounded-2xl p-5">
      <h2 className="font-display text-2xl">Packing list</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {essentials.map((item) => (
          <label key={item} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={packed.includes(item)} onChange={() => toggle(item)} />
            <span className={packed.includes(item) ? 'text-muted line-through' : ''}>{item}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

export default PackingList;