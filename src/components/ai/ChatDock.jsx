import { useMemo, useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, Maximize2 } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { getAI } from '@/services/ai.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { uid } from '@/lib/utils.js';
import { Button } from '@/components/ui/button.jsx';
import { YatraAiSymbol } from '@/components/ai/YatraAiSymbol.jsx';

export function ChatDock() {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const loc = useLocation();
  const chatOpen = useWorldStore((s) => s.chatOpen);
  const setChatOpen = useWorldStore((s) => s.setChatOpen);
  const chat = useWorldStore((s) => s.chat);
  const setChat = useWorldStore((s) => s.setChat);
  const trips = useWorldStore((s) => s.trips);
  const tripId = loc.pathname.match(/\/trips\/([^/]+)/)?.[1];
  const trip = useMemo(() => trips.find((t) => t.id === tripId), [trips, tripId]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chatOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat, chatOpen]);

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

  const initialGreeting = useMemo(
    () => ({
      id: 'greeting',
      role: 'assistant',
      content: trip
        ? `Namaste! I am Yatra AI, your travel text assistant. I'm ready to help you plan and optimize your itinerary for "${trip.name}". Ask me about daily stops, budget tips, or activities!`
        : 'Namaste! I am Yatra AI, your personal travel text assistant. Ask me anything about multi-city planning, route optimization, budgets, or destination highlights!',
    }),
    [trip]
  );

  const displayMessages = chat.length === 0 ? [initialGreeting] : chat;

  return (
    <div className="no-print fixed bottom-24 right-4 z-40 md:bottom-6 flex flex-col items-end">
      {chatOpen ? (
        <div className="glass mb-3 flex h-[460px] w-[min(92vw,380px)] flex-col rounded-3xl p-4 shadow-2xl border border-border/60 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-saffron to-aurora p-0.5">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-ink">
                  <Sparkles className="h-4 w-4 text-saffron" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-sm text-parchment">Yatra AI</h3>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aurora opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-aurora" />
                  </span>
                  <span className="text-[10px] font-mono text-aurora uppercase tracking-wider font-semibold">
                    Text Assistant
                  </span>
                </div>
                <p className="text-[11px] text-muted truncate max-w-[200px]">
                  {trip ? `Context: ${trip.name}` : 'Multi-city travel intelligence'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                to="/ai"
                onClick={() => setChatOpen(false)}
                title="Open full Yatra AI Suite"
                className="rounded-lg p-1.5 text-muted hover:bg-white/10 hover:text-parchment transition-colors"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                aria-label="Close Yatra AI text assistant"
                onClick={() => setChatOpen(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-white/10 hover:text-parchment transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="my-2 flex-1 space-y-2.5 overflow-y-auto pr-1 text-xs">
            {displayMessages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aurora/20 text-aurora mt-0.5">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-saffron text-black font-semibold shadow-sm'
                      : 'bg-white/10 text-parchment border border-border/40'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-aurora text-xs italic pl-8">
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                <span>Yatra AI is planning routes…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="mt-1 flex flex-wrap gap-1.5 py-1 border-t border-border/30">
            {['Budget tips', 'Packing list', '3-day stops', 'Local food'].map((c) => (
              <button
                key={c}
                type="button"
                className="rounded-full border border-border/50 bg-white/5 px-2.5 py-1 text-[10px] text-muted hover:border-saffron hover:text-parchment hover:bg-white/10 transition-colors"
                onClick={() => send(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              className="h-10 flex-1 rounded-full border border-border/60 bg-white px-3.5 text-xs font-semibold text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-saffron"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Yatra AI anything…"
            />
            <Button size="sm" type="submit" className="rounded-full px-3.5 h-10 shadow-sm" disabled={busy || !input.trim()}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      ) : null}

      {/* Circular Yatra AI Symbol Trigger Button */}
      <YatraAiSymbol
        size="md"
        withPulse={!chatOpen}
        onClick={() => setChatOpen(!chatOpen)}
        title="Yatra AI - Text Assistant (Click to chat)"
      />
    </div>
  );
}
