import { searchProviders } from '../api/providers.js';
import { DEFAULT_QUERY } from '../lib/utils.js';
import { analyzeRequest } from './analyzeRequest.js';
import { INTENTS } from './classifyIntent.js';
import { recommendProviders } from './recommendProviders.js';

export class AnalysisError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

/**
 * The whole workflow:
 *   input → analyzeRequest (intent + urgency + context) → provider matching → ranking → recommendations
 * `trace` records what each stage produced so the UI can show its working.
 */
export async function analyzePetRequest(input, { providers, now = new Date(), engine, limit = 3 } = {}) {
  const text = String(input ?? '').trim();
  if (text.length < 3) throw new AnalysisError('Describe what is happening, even in a few words.', 'empty');
  if (text.length > 600) throw new AnalysisError('Please keep it under 600 characters.', 'too_long');

  const understanding = await analyzeRequest(text, { engine });
  const directory = providers ?? (await searchProviders(DEFAULT_QUERY));
  if (!directory.length) throw new AnalysisError('The provider directory is empty right now. Try again shortly.', 'no_data');

  const { intents, urgency, context } = understanding;
  const { candidates, top } = recommendProviders({ providers: directory, intents, urgency, area: context.area, now, limit });

  const mainIntent = INTENTS[intents[0].id];
  const urgentSearch = urgency.level !== 'routine';

  const trace = [
    { id: 'read', label: 'Read your message', summary: [context.pet && `Pet: ${context.pet}`, `Area: ${context.area}${context.areaDetected ? '' : ' (assumed)'}`].filter(Boolean).join(' · ') },
    { id: 'urgency', label: 'Detected urgency', summary: `${urgency.label}${urgency.signals.length ? `, from “${urgency.signals.map((s) => s.label).join('”, “')}”` : ''}` },
    { id: 'classify', label: 'Identified the type of care', summary: intents.slice(0, 2).map((i) => INTENTS[i.id].label).join(', then ') },
    { id: 'match', label: 'Matched providers', summary: `${candidates} of ${directory.length} listings fit` },
    { id: 'rank', label: 'Ranked for your situation', summary: top[0] ? `${top[0].provider.name} scored ${top[0].score}/100` : 'No providers matched' },
  ];

  return {
    input: text,
    ...understanding,
    mainIntent,
    candidates,
    recommendations: top,
    trace,
    // Lets the UI hand the user to the full directory with the right filters already set.
    searchPreset: {
      category: mainIntent.category,
      area: context.areaDetected ? context.area : 'all',
      openNow: urgentSearch,
      sort: urgentSearch ? 'nearest' : 'recommended',
    },
    analysedAt: now.toISOString(),
  };
}
