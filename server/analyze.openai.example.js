// OPTIONAL TEMPLATE. Not deployed, not used by the app, and not tested against the live OpenAI API.
//
// To use it on Vercel:
//   1. Copy this file to /api/analyze.js (project root, next to /src).
//   2. In Vercel, add OPENAI_API_KEY (and optionally OPENAI_MODEL) as environment variables.
//   3. Build the front end with VITE_AI_ENGINE=remote.
//
// The key stays on the server. The browser only sends the user's message to /api/analyze.
// The model is asked to understand the request and nothing else: it does not diagnose,
// and it does not rank providers (ranking stays in src/ai/recommendProviders.js).

const SYSTEM_PROMPT = `You classify messages from pet owners in Bengaluru. Do not diagnose animals or give medical advice.
Return JSON only, in exactly this shape:
{
  "intents": [{ "id": "emergency|ambulance|hospital|diagnostics|consult|boarding|ngo", "score": 1-5, "matched": ["short phrases from the message"] }],
  "urgency": { "level": "emergency|urgent|routine", "signals": ["short phrases from the message"], "rationale": "one plain sentence" },
  "context": { "pet": "dog|cat|... or null", "area": "JP Nagar|Jayanagar|Koramangala|HSR Layout|Indiranagar|Whitefield or null" }
}
Order intents from most to least relevant. Use "emergency" urgency only for signs such as trouble breathing, collapse, seizures, poisoning, road accidents or heavy bleeding.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(501).json({ error: 'not_configured' });

  const input = String(req.body?.input ?? '').slice(0, 600);
  if (input.trim().length < 3) return res.status(400).json({ error: 'empty' });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: input },
      ],
    }),
  });
  if (!response.ok) return res.status(502).json({ error: 'upstream_error' });

  try {
    const data = await response.json();
    return res.status(200).json(JSON.parse(data.choices[0].message.content));
  } catch {
    return res.status(502).json({ error: 'bad_model_output' });
  }
}
