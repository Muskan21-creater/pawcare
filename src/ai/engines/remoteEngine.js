import { INTENTS } from '../classifyIntent.js';
import { URGENCY_LEVELS } from '../calculateUrgency.js';
import { AREAS, USER_AREA } from '../../data/providers.js';

export const REMOTE_ENGINE = {
  id: 'remote-llm',
  label: 'LLM-assisted analysis',
  usesLLM: true,
  note: 'Intent and urgency were read by a language model through PawCare’s own server endpoint. Ranking is still done by the transparent scoring formula.',
};

const ENDPOINT = import.meta.env?.VITE_AI_ENDPOINT || '/api/analyze';

/**
 * Calls a server endpoint that wraps an LLM. The API key lives on the server
 * (see server/analyze.openai.example.js); the browser never sees it.
 * The response is validated so a bad model answer cannot break the UI.
 */
export async function remoteEngine(input) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });
  if (!res.ok) throw new Error(`Analysis endpoint returned ${res.status}`);
  const data = await res.json();

  const intents = (data.intents ?? [])
    .filter((i) => INTENTS[i?.id])
    .map((i) => ({ id: i.id, score: Number(i.score) || 1, matched: Array.isArray(i.matched) ? i.matched.map(String) : [] }));
  const level = data.urgency?.level;
  if (!intents.length || !URGENCY_LEVELS[level]) throw new Error('Analysis endpoint returned an unusable answer');

  const area = AREAS.includes(data.context?.area) ? data.context.area : USER_AREA;
  return {
    intents,
    urgency: {
      level,
      label: URGENCY_LEVELS[level].label,
      signals: (data.urgency.signals ?? []).map((s) => ({ label: String(s), level })),
      rationale: String(data.urgency.rationale ?? ''),
    },
    context: { pet: data.context?.pet ?? null, area, areaDetected: AREAS.includes(data.context?.area) },
    confidence: 'medium',
    inferred: false,
    engine: REMOTE_ENGINE,
  };
}
