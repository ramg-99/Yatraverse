const router = require('express').Router();
const { auth } = require('../middleware/auth');

// Heuristic itinerary generator (no API key needed — works 100% offline)
function heuristicItinerary({ destination, duration, budget, travelers, interests }) {
  const days = Number(duration) || 7;
  const bud = Number(budget) || 150000;
  const trav = Number(travelers) || 2;
  const dest = destination || 'your dream destination';

  const lines = [
    `✈️  ${days}-day constellation for ${trav} traveller${trav > 1 ? 's' : ''} to ${dest}`,
    `\n💰 Budget: ₹${bud.toLocaleString()} total | ~₹${Math.round(bud / days).toLocaleString()}/day`,
    `\n\n📅 ITINERARY OVERVIEW`,
    `\nDay 1-2 · Arrival & Orientation\n• Check in, rest, evening walk through the old quarter\n• Explore local markets and street food\n• Budget: ₹${Math.round(bud * 0.15).toLocaleString()} (transport + first hotel nights)`,
    `\nDay 3-4 · Culture & History\n• Major historical sites and museums\n• Guided city tour\n• Budget: ₹${Math.round(bud * 0.20).toLocaleString()}`,
    `\nDay 5-6 · Experiences & Activities\n• Half-day adventure / food tour\n• Evening cultural show\n• Budget: ₹${Math.round(bud * 0.25).toLocaleString()}`,
    `\nDay ${days} · Departure\n• Morning shopping, airport transfer\n• Keep ₹${Math.round(bud * 0.10).toLocaleString()} as weather insurance`,
    `\n\n💡 Tips: Book accommodation 4 weeks ahead. Use local transport cards. Try street food for authentic experiences under ₹300/meal.`,
    `\n\n🎯 Match score for ${interests?.join(', ') || 'general travel'}: ★★★★☆`,
  ];
  return lines.join('');
}

// POST /api/ai/generate — streaming itinerary generation
router.post('/generate', auth, async (req, res, next) => {
  try {
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    if (GEMINI_KEY) {
      // Real Gemini API call
      const { destination, duration, budget, travelers, interests, prompt } = req.body;
      const userPrompt = prompt || `Plan a ${duration}-day trip to ${destination} for ${travelers} travelers with budget ₹${budget}. Interests: ${(interests || []).join(', ')}. Provide a detailed day-by-day itinerary with costs.`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: userPrompt }] }] }),
        },
      );
      const data = await geminiRes.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || heuristicItinerary(req.body);
      res.json({ text });
    } else {
      // Heuristic fallback — zero API cost
      const text = heuristicItinerary(req.body);
      res.json({ text });
    }
  } catch (e) { next(e); }
});

// POST /api/ai/optimize — trip optimization suggestions
router.post('/optimize', auth, async (req, res, next) => {
  try {
    const { trip } = req.body;
    const suggestions = [
      { id: 'opt1', kind: 'cost', title: 'Trim stay spend 15%', detail: 'Swap two 5-star nights for boutique hotels. Same neighbourhoods, better value.', before: 'Stay heavy', after: 'Boutique mix' },
      { id: 'opt2', kind: 'geo', title: 'Reorder by geography', detail: 'Fly as a tighter arc to cut backtracking and save 4 travel hours.', before: 'Current order', after: 'Reversed arc' },
      { id: 'opt3', kind: 'pace', title: 'Balance busy days', detail: 'Move one nightlife block so no single day holds more than 2 high-energy activities.', before: 'Stacked days', after: 'Balanced pace' },
      { id: 'opt4', kind: 'swap', title: 'Activity persona swap', detail: `Replace a generic lookout with an experience better matching your travel style.`, before: 'Generic lookout', after: 'Local experience' },
    ];
    res.json(suggestions);
  } catch (e) { next(e); }
});

// POST /api/ai/chat — context-aware trip chatbot
router.post('/chat', auth, async (req, res, next) => {
  try {
    const { messages, tripName } = req.body;
    const last = (messages || []).slice(-1)[0]?.content?.toLowerCase() || '';
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    if (GEMINI_KEY) {
      const systemPrompt = `You are a helpful travel planning assistant for the app Yatraverse. The user is planning: "${tripName || 'a trip'}". Answer concisely and helpfully.`;
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${last}` }] }] }),
        },
      );
      const data = await geminiRes.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'I can help with your trip planning!';
      return res.json({ reply });
    }

    // Heuristic fallback
    const reply = last.includes('food')
      ? `For ${tripName || 'your trip'}, chase local street food first — it's the most authentic and cheapest way to eat. Reserve one nice restaurant per city for a splurge meal.`
      : last.includes('budget')
      ? `${tripName || 'Your trip'} can be optimised: cap accommodation at 40% of budget, use public transport, and avoid tourist-trap restaurants near landmarks.`
      : `I can sketch a day plan, swap an activity, or check your budget for ${tripName || 'your trip'}. What do you need?`;

    res.json({ reply });
  } catch (e) { next(e); }
});

module.exports = router;
