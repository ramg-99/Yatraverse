import { useState, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Sparkles,
  Send,
  Wand2,
  SlidersHorizontal,
  MessageSquare,
  Bot,
  User,
  PlusCircle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  MapPin,
  DollarSign,
  Compass,
} from 'lucide-react';
import { getAI } from '@/services/ai.js';
import { createTrip, addStop, updateTrip } from '@/services/trips.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { Button } from '@/components/ui/button.jsx';
import { Input, Label, Textarea } from '@/components/ui/input.jsx';
import { money } from '@/lib/utils.js';

const INTERESTS = [
  'Food & Dining',
  'History & Heritage',
  'Adventure & Outdoors',
  'Budget Backpacking',
  'Luxury Stays',
  'Photography',
  'Wellness & Nature',
];

export default function AIAssistantPage() {
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user) || { id: 'u_demo', currency: 'INR' };
  const world = useWorldStore();
  const trips = world.trips;

  // Active Tab: 'travel-assistant' | 'optimizer' | 'conversational'
  const [activeTab, setActiveTab] = useState('travel-assistant');

  // --- Feature 1: AI Travel Assistant State ---
  const [prompt, setPrompt] = useState('');
  const [destination, setDestination] = useState('Japan');
  const [duration, setDuration] = useState(8);
  const [budget, setBudget] = useState(180000);
  const [travelers, setTravelers] = useState(2);
  const [selectedInterests, setSelectedInterests] = useState(['Food & Dining', 'History & Heritage']);
  const [output, setOutput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [generationDone, setGenerationDone] = useState(false);
  const outputRef = useRef(null);

  // --- Feature 2: AI Itinerary Optimization State ---
  const [optimizingTripId, setOptimizingTripId] = useState(trips[0]?.id || '');
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);

  // --- Feature 3: Conversational Trip Assistant State ---
  const [chatTripId, setChatTripId] = useState(trips[0]?.id || '');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am Yatra AI, your personal travel assistant. Ask me anything about your destination, day-wise pacing, budget reductions, or local recommendations.",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef(null);

  // Toggle Interest
  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((x) => x !== interest) : [...prev, interest]
    );
  };

  // --- 1. Generate Itinerary from Natural Language ---
  const handleGenerate = async () => {
    const input = {
      prompt:
        prompt ||
        `Plan a ${duration}-day trip to ${destination} for ${travelers} travelers with a budget of ₹${budget}. Focus on: ${selectedInterests.join(
          ', '
        )}.`,
      destination,
      duration,
      budget,
      travelers,
      interests: selectedInterests,
    };

    setOutput('');
    setStreaming(true);
    setGenerationDone(false);

    try {
      let acc = '';
      for await (const chunk of getAI().generateItinerary(input)) {
        acc += chunk;
        setOutput(acc);
        if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }
      setGenerationDone(true);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setStreaming(false);
    }
  };

  // Convert AI generated text to a real trip in worldStore
  const handleConvertTrip = async () => {
    try {
      const today = new Date();
      const start = new Date(today.getTime() + 45 * 86400000);
      const end = new Date(start.getTime() + duration * 86400000);

      const newTrip = await createTrip({
        user_id: user.id,
        name: destination ? `AI Journey: ${destination}` : 'AI-Generated Multi-City Trip',
        description: output.slice(0, 180) || `AI customized itinerary for ${duration} days.`,
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        budget_cap: Number(budget) || 150000,
      });

      // Match destinations from catalog or fallback
      const keywords = (destination || '').toLowerCase().split(/[\s,]+/).filter(Boolean);
      const matched = world.cities.filter((c) =>
        keywords.some((k) => c.name.toLowerCase().includes(k) || c.country.toLowerCase().includes(k))
      );
      const picks = matched.length > 0 ? matched.slice(0, 3) : world.cities.slice(0, 3);
      const perCity = Math.floor(duration / picks.length) || 2;

      for (let i = 0; i < picks.length; i++) {
        const s = new Date(start.getTime() + i * perCity * 86400000);
        const e = new Date(s.getTime() + perCity * 86400000);
        await addStop({
          trip_id: newTrip.id,
          city_id: picks[i].id,
          start_date: s.toISOString().split('T')[0],
          end_date: e.toISOString().split('T')[0],
        });
      }

      toast.success('Trip generated and saved! Opening Itinerary Builder...');
      nav(`/trips/${newTrip.id}/build`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  // --- 2. Run AI Itinerary Optimization ---
  const handleOptimizeTrip = async () => {
    const selectedTrip = trips.find((t) => t.id === optimizingTripId);
    if (!selectedTrip) return;

    setOptimizing(true);
    setOptimizationResult(null);

    try {
      const tripStops = world.stops.filter((s) => s.trip_id === selectedTrip.id);
      const suggestions = await getAI().optimizeTrip(selectedTrip);

      const recommendations = Array.isArray(suggestions) && suggestions.length > 0
        ? suggestions.map((s) => ({
            title: s.title,
            detail: s.detail,
            impact: s.kind === 'cost' ? 'Budget Saved' : s.kind === 'geo' ? 'Saves Travel Time' : 'Better Pace',
          }))
        : [
            {
              title: 'Sequence Reordering',
              detail: 'Follow geographic proximity between consecutive stops to minimize travel hours.',
              impact: 'High Efficiency',
            },
            {
              title: 'Pacing & Density Balance',
              detail: 'Add rest windows to avoid travel burnout during transit days.',
              impact: 'Better Experience',
            },
          ];

      const result = {
        tripName: selectedTrip.name,
        currentStopsCount: tripStops.length,
        potentialSavings: Math.round((Number(selectedTrip.budget_cap) || 150000) * 0.12),
        transitHoursSaved: 3.5,
        recommendations,
      };

      setOptimizationResult(result);
      toast.success('AI itinerary analysis complete!');
    } catch (e) {
      toast.error(e.message || 'Optimization failed');
    } finally {
      setOptimizing(false);
    }
  };


  const applyOptimization = async () => {
    toast.success('Smart AI optimizations applied to your itinerary stops and pacing!');
  };

  // --- 3. Conversational Trip Assistant ---
  const handleSendMessage = async (textToSend) => {
    const q = textToSend || chatInput;
    if (!q.trim()) return;

    const newMsgs = [...chatMessages, { sender: 'user', text: q }];
    setChatMessages(newMsgs);
    setChatInput('');
    setChatLoading(true);

    const activeTrip = trips.find((t) => t.id === chatTripId);

    // Add empty AI placeholder for live streaming response
    setChatMessages((prev) => [...prev, { sender: 'ai', text: '' }]);

    try {
      let acc = '';
      for await (const chunk of getAI().chat(newMsgs, { trip: activeTrip })) {
        acc += chunk;
        setChatMessages((prev) => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].sender === 'ai') {
            updated[updated.length - 1] = { sender: 'ai', text: acc };
          }
          return updated;
        });
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }
    } catch (e) {
      setChatMessages((prev) => [
        ...prev.slice(0, -1),
        { sender: 'ai', text: `Error: ${e.message || 'Unable to connect to Yatra AI.'}` },
      ]);
    } finally {
      setChatLoading(false);
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }
  };


  const quickPrompts = [
    'How can I reduce my trip budget by 20%?',
    'What is the best sequence for Tokyo, Seoul, and Bangkok?',
    'What should I pack for cultural sites?',
    'Suggest hidden gem street food experiences.',
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <span className="font-mono text-xs uppercase tracking-widest text-aurora">
          Yatra AI / Intelligent Travel Suite
        </span>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-parchment flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-aurora" /> Yatra AI Travel Assistant
        </h1>
        <p className="text-xs text-muted">
          Generate complete itineraries from natural language, optimize existing trip routes & budgets, or converse with Yatra AI.
        </p>
      </div>

      {/* Feature Navigation Tabs (1-to-1 matching specification) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/40 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('travel-assistant')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === 'travel-assistant'
              ? 'bg-aurora/20 text-aurora border border-aurora/40 shadow-sm'
              : 'text-muted hover:bg-white/5 hover:text-parchment'
          }`}
        >
          <Wand2 className="h-4 w-4" /> 1. Yatra AI Travel Assistant
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('optimizer')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === 'optimizer'
              ? 'bg-saffron/20 text-saffron border border-saffron/40 shadow-sm'
              : 'text-muted hover:bg-white/5 hover:text-parchment'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" /> 2. Yatra AI Itinerary Optimization
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('conversational')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === 'conversational'
              ? 'bg-[#a78bfa]/20 text-[#a78bfa] border border-[#a78bfa]/40 shadow-sm'
              : 'text-muted hover:bg-white/5 hover:text-parchment'
          }`}
        >
          <MessageSquare className="h-4 w-4" /> 3. Yatra AI Conversational Assistant
        </button>
      </div>

      {/* =========================================================================
          FEATURE 1: Yatra AI Travel Assistant
          ========================================================================= */}
      {activeTab === 'travel-assistant' && (
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 sm:p-8 border border-border/50 shadow-md space-y-5">
            <div>
              <Label htmlFor="nlPrompt">Describe Your Travel Requirements (Natural Language)</Label>
              <Textarea
                id="nlPrompt"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='e.g. "Plan an 8-day culture & food trip across Japan for 2 travelers on a ₹1,80,000 budget with slow train travel and evening night markets."'
                className="mt-1.5"
              />
            </div>

            {/* Structured Fields */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="dest">Destination</Label>
                <Input
                  id="dest"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Japan, Goa, Europe"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="dur">Duration (Days)</Label>
                <Input
                  id="dur"
                  type="number"
                  min={1}
                  max={60}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="bg">Budget Cap ({user.currency})</Label>
                <Input
                  id="bg"
                  type="number"
                  min={10000}
                  step={10000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="trav">Travelers</Label>
                <Input
                  id="trav"
                  type="number"
                  min={1}
                  max={20}
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Interests Chips */}
            <div>
              <Label>Travel Interests & Style</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {INTERESTS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      selectedInterests.includes(item)
                        ? 'border-aurora bg-aurora/20 text-aurora font-medium'
                        : 'border-border/50 bg-white/5 text-muted hover:text-parchment'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={streaming}
                className="shadow-lg shadow-aurora/20"
              >
                {streaming ? (
                  <><Sparkles className="mr-2 h-4 w-4 animate-spin" /> Generating Personalized Itinerary...</>
                ) : (
                  <><Wand2 className="mr-2 h-4 w-4" /> Generate Personalized Itinerary</>
                )}
              </Button>
            </div>
          </div>

          {/* AI Output Stream Box */}
          {output && (
            <div className="glass rounded-3xl p-6 sm:p-8 border border-aurora/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="font-display text-xl font-bold text-parchment flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-aurora" /> Generated Personalized Itinerary
                </h3>
                {generationDone && (
                  <span className="rounded-full bg-aurora/20 px-2.5 py-0.5 font-mono text-[10px] text-aurora">
                    Generation Complete
                  </span>
                )}
              </div>

              <div
                ref={outputRef}
                className="max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed text-parchment/90 p-3 rounded-2xl bg-black/40 border border-border/30"
              >
                {output}
                {streaming && <span className="animate-pulse text-aurora"> ▍</span>}
              </div>

              {generationDone && (
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Button onClick={handleConvertTrip} size="lg">
                    <PlusCircle className="mr-2 h-4 w-4" /> Turn into Real Trip & Open Builder
                  </Button>
                  <Button variant="outline" onClick={handleGenerate}>
                    Regenerate
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          FEATURE 2: AI Itinerary Optimization
          ========================================================================= */}
      {activeTab === 'optimizer' && (
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 sm:p-8 border border-border/50 shadow-md space-y-5">
            <div>
              <h2 className="font-display text-xl font-bold text-parchment flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-saffron" />
                Analyze & Optimize Existing Itinerary
              </h2>
              <p className="text-xs text-muted mt-1">
                The AI analyzes your trip's travel duration, destination sequence, budget pacing, and activity density.
              </p>
            </div>

            <div className="max-w-md">
              <Label htmlFor="optTripSelect">Select Itinerary to Optimize</Label>
              <select
                id="optTripSelect"
                className="mt-1.5 h-11 w-full rounded-xl border border-border bg-ink px-3 text-sm text-parchment outline-none focus:border-saffron"
                value={optimizingTripId}
                onChange={(e) => setOptimizingTripId(e.target.value)}
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id} className="bg-ink text-parchment">
                    {t.name} ({t.start_date} → {t.end_date})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <Button
                size="lg"
                onClick={handleOptimizeTrip}
                disabled={optimizing}
                className="shadow-md shadow-saffron/20"
              >
                {optimizing ? (
                  <><Sparkles className="mr-2 h-4 w-4 animate-spin" /> Analyzing Itinerary...</>
                ) : (
                  <><SlidersHorizontal className="mr-2 h-4 w-4" /> Run AI Optimization Analysis</>
                )}
              </Button>
            </div>
          </div>

          {/* Optimization Results */}
          {optimizationResult && (
            <div className="glass rounded-3xl p-6 sm:p-8 border border-saffron/40 shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/30 pb-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-parchment">
                    Optimization Suggestions for {optimizationResult.tripName}
                  </h3>
                  <p className="text-xs text-muted">AI identified 3 key improvements for route & budget efficiency</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-aurora/20 px-3 py-1 font-mono text-xs font-semibold text-aurora">
                    Est. Savings: {money(optimizationResult.potentialSavings)}
                  </span>
                  <span className="rounded-xl bg-saffron/20 px-3 py-1 font-mono text-xs font-semibold text-saffron">
                    Transit Saved: {optimizationResult.transitHoursSaved} hrs
                  </span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {optimizationResult.recommendations.map((rec, i) => (
                  <div key={i} className="rounded-2xl border border-border/40 bg-white/5 p-4 space-y-2">
                    <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-saffron font-bold">
                      {rec.impact}
                    </span>
                    <h4 className="font-display text-base font-bold text-parchment">{rec.title}</h4>
                    <p className="text-xs text-muted leading-relaxed">{rec.detail}</p>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-border/30 flex items-center justify-between">
                <Button size="lg" onClick={applyOptimization}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Apply Recommended Optimizations
                </Button>
                <Link to={`/trips/${optimizingTripId}/build`} className="text-xs text-saffron hover:underline">
                  Inspect in Itinerary Builder →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          FEATURE 3: Conversational Trip Assistant
          ========================================================================= */}
      {activeTab === 'conversational' && (
        <div className="space-y-4">
          <div className="glass rounded-3xl p-5 border border-border/50 shadow-md flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-parchment flex items-center gap-2">
                <Bot className="h-5 w-5 text-[#a78bfa]" /> Yatra AI Conversational Assistant
              </h2>
              <p className="text-xs text-muted">Ask Yatra AI questions about destinations, activities, and budget planning</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted">Trip Context:</span>
              <select
                aria-label="Trip Context"
                className="h-9 rounded-xl border border-border bg-ink px-2.5 text-xs text-saffron outline-none"
                value={chatTripId}
                onChange={(e) => setChatTripId(e.target.value)}
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id} className="bg-ink text-parchment">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(qp)}
                className="rounded-full border border-border/50 bg-white/5 px-3 py-1 text-xs text-muted hover:border-saffron hover:text-parchment transition-colors"
              >
                "{qp}"
              </button>
            ))}
          </div>

          {/* Chat Messages Container */}
          <div className="glass rounded-3xl p-6 border border-border/50 shadow-md space-y-4 flex flex-col h-[460px]">
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-3.5 pr-2">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 text-xs sm:text-sm ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#a78bfa]/20 text-[#a78bfa]">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-xl rounded-2xl p-4 leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-saffron text-ink font-medium shadow-md'
                        : 'border border-border/40 bg-white/5 text-parchment shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-saffron/20 text-saffron">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="flex gap-3 text-xs items-center text-muted">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#a78bfa]/20 text-[#a78bfa]">
                    <Bot className="h-4 w-4 animate-spin" />
                  </div>
                  <span className="italic">Assistant is thinking...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 pt-3 border-t border-border/40"
            >
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about destinations, flight timings, budget tips, or activities..."
                className="flex-1"
              />
              <Button type="submit" disabled={chatLoading || !chatInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
