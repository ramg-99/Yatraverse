import { useMemo, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getAI } from '@/services/ai.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { uid } from '@/lib/utils.js';
import { Button } from '@/components/ui/button.jsx';

export function ChatDock() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const loc = useLocation();
  const chat = useWorldStore((s) => s.chat);
  const setChat = useWorldStore((s) => s.setChat);
  const trips = useWorldStore((s) => s.trips);
  const tripId = loc.pathname.match(/\/trips\/([^/]+)/)?.[1];
  const trip = useMemo(() => trips.find((t) => t.id === tripId), [trips, tripId]);

  const send = async (text) => {
    if (!text.trim()) return;
    const userMsg = { id: uid('m'), role: 'user', content: text };
    const hist = [...chat, userMsg];
    setChat(hist);
    setInput('');
    setBusy(true);
    let acc = '';
    const id = uid('m');
    try {
      for await (const chunk of getAI().chat(hist, { trip })) {
        acc += chunk;
        setChat([...hist, { id, role: 'assistant', content: acc }]);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="no-print fixed bottom-24 right-4 z-40 md:bottom-6">
      {open ? (
        <div className="glass mb-3 flex h-96 w-[min(92vw,360px)] flex-col rounded-2xl p-3">
          <div className="flex items-center justify-between">
            <p className="font-display">Trip assistant</p>
            <button type="button" aria-label="Close chat" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[11px] text-muted">{trip ? `Context: ${trip.name}` : 'Atlas-wide'}</p>
          <div className="mt-2 flex-1 space-y-2 overflow-y-auto text-sm">
            {chat.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'text-right text-saffron' : 'text-parchment'}>
                {m.content}
              </div>
            ))}
            {busy ? <p className="animate-pulse text-aurora">Tracing routes…</p> : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {['Food ideas', 'Budget check', 'Packing'].map((c) => (
              <button key={c} type="button" className="rounded-full border border-border px-2 py-0.5 text-[10px]" onClick={() => send(c)}>
                {c}
              </button>
            ))}
          </div>
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              className="h-9 flex-1 rounded-full border border-border bg-ink/40 px-3 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the atlas…"
            />
            <Button size="sm" type="submit">
              Send
            </Button>
          </form>
        </div>
      ) : null}
      <Button aria-label="Open assistant" onClick={() => setOpen((o) => !o)}>
        <MessageCircle className="h-4 w-4" />
      </Button>
    </div>
  );
}
