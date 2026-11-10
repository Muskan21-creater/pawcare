import { calculateUrgency } from '../calculateUrgency.js';
import { classifyIntent } from '../classifyIntent.js';
import { extractContext } from '../extractContext.js';

export const LOCAL_ENGINE = {
  id: 'local-rules',
  label: 'PawCare rules engine',
  usesLLM: false,
  note: 'Analysed in your browser with keyword rules and scoring. No external AI model was used and nothing was sent anywhere.',
};

/**
 * Engine contract: (input) → { intents, urgency, context, confidence, engine }
 * Any engine that returns this shape can replace this one; ranking stays local and deterministic.
 */
export async function localEngine(input) {
  const { intents: classified, confidence } = classifyIntent(input);
  const urgency = calculateUrgency(input, { intents: classified });
  const context = extractContext(input);

  let intents = classified;
  let inferred = false;
  if (!intents.length) {
    // Nothing specific was said: infer a sensible default from urgency alone and say so.
    inferred = true;
    intents =
      urgency.level === 'routine'
        ? [{ id: 'consult', score: 1, matched: [] }]
        : [{ id: 'consult', score: 1, matched: [] }, { id: 'hospital', score: 1, matched: [] }];
  }
  if (urgency.level !== 'routine' && intents[0].id === 'ngo' && !intents.some((i) => i.id === 'consult')) {
    // An injured stray needs a vet as well as a welfare group.
    intents = [...intents, { id: 'consult', score: 1, matched: urgency.signals.map((s) => s.label) }];
  }
  if (urgency.level === 'emergency' && intents[0].id !== 'emergency') {
    intents = [{ id: 'emergency', score: 4, matched: urgency.signals.map((s) => s.label) }, ...intents.filter((i) => i.id !== 'emergency')];
  }

  return { intents, urgency, context, confidence: inferred ? 'low' : confidence, inferred, engine: LOCAL_ENGINE };
}
