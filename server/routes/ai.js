const router = require('express').Router();
const { optionalAuth } = require('../middleware/auth');

const GEMINI_MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];

async function callGemini(prompt, systemInstruction = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }),
      });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch {
      // try next model
    }
  }
  return null;
}

// Heuristic itinerary generator (fallback)
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

// POST /api/ai/generate — live Gemini itinerary generation
router.post('/generate', optionalAuth, async (req, res, next) => {
  try {
    const { destination, duration, budget, travelers, interests, prompt } = req.body;
    const userPrompt = prompt || `Create an inspiring, highly practical, day-by-day travel itinerary for a ${duration || 7}-day trip to ${destination || 'India and Asia'} for ${travelers || 2} travelers with an estimated budget of ₹${(budget || 150000).toLocaleString()}. Focus areas: ${(interests || []).join(', ') || 'culture, food, hidden gems'}. Include estimated costs in INR and insider tips.`;

    const liveText = await callGemini(userPrompt, 'You are Yatra AI, the world-class intelligent travel assistant for Yatraverse. Provide structured, engaging, actionable travel itineraries with markdown headings and clear bullet points.');
    
    res.json({ text: liveText || heuristicItinerary(req.body) });
  } catch (e) { next(e); }
});

// POST /api/ai/optimize — trip optimization suggestions
router.post('/optimize', optionalAuth, async (req, res, next) => {
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

// POST /api/ai/chat — live interactive Gemini travel chat
router.post('/chat', optionalAuth, async (req, res, next) => {
  try {
    const { messages, tripName } = req.body;
    const msgList = Array.isArray(messages) ? messages : [];

    // Extract text from messages whether sent as text or content
    const conversationHistory = msgList.map((m) => {
      const sender = m.role === 'assistant' || m.sender === 'ai' ? 'Assistant' : 'User';
      const body = m.content || m.text || '';
      return `${sender}: ${body}`;
    }).join('\n');

    const lastMsg = msgList.length > 0 ? (msgList[msgList.length - 1].content || msgList[msgList.length - 1].text || '') : '';

    const systemPrompt = `You are Yatra AI, an empathetic, knowledgeable, and energetic travel assistant for the travel planning platform Yatraverse. 
The user is planning or exploring: "${tripName || 'a wonderful trip'}".
Give live, personalized, creative, and actionable travel answers. Use clear formatting, bullet points, recommendations on food, budget, logistics, secret spots, and safety. Keep answers friendly and concise.`;

    const promptToSend = conversationHistory ? `Conversation so far:\n${conversationHistory}\n\nPlease respond to the user's latest query.` : lastMsg;

    const liveReply = await callGemini(promptToSend, systemPrompt);

    if (liveReply) {
      return res.json({ reply: liveReply });
    }

    // Heuristic fallback only if API key is not configured or offline
    const lower = lastMsg.toLowerCase();
    const reply = lower.includes('food')
      ? `For ${tripName || 'your trip'}, chase local street food first — it's the most authentic and cheapest way to eat. Reserve one nice restaurant per city for a splurge meal.`
      : lower.includes('budget')
      ? `${tripName || 'Your trip'} can be optimised: cap accommodation at 40% of budget, use public transport, and avoid tourist-trap restaurants near landmarks.`
      : `I can sketch a day plan, swap an activity, or check your budget for ${tripName || 'your trip'}. What do you need?`;

    res.json({ reply });
  } catch (e) { next(e); }
});

module.exports = router;

