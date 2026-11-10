import { EMERGENCY_SIGNALS, NEGATED_URGENCY, ROUTINE_SIGNALS, URGENT_SIGNALS } from './signals.js';
import { findMatches, normalise } from './text.js';

export const URGENCY_LEVELS = {
  emergency: { id: 'emergency', label: 'Emergency', rank: 3 },
  urgent: { id: 'urgent', label: 'Urgent', rank: 2 },
  routine: { id: 'routine', label: 'Routine', rank: 1 },
};

const RATIONALE = {
  emergency: 'Your message describes signs that usually need a vet straight away.',
  urgent: 'Your message suggests your pet should be seen today, not next week.',
  routine: 'Nothing in your message suggests time pressure, so we weighted rating and distance more.',
};

/**
 * Step 2 of the pipeline: how quickly does this need attention?
 * Emergency signal → emergency. Any urgent signal → urgent. Otherwise routine.
 * Transport needs ("can't walk") are treated as urgent because the pet cannot get there alone.
 */
export function calculateUrgency(input, { intents = [] } = {}) {
  const text = normalise(input).replace(NEGATED_URGENCY, ' ');
  const emergency = findMatches(text, EMERGENCY_SIGNALS).map((h) => ({ label: h.label, level: 'emergency' }));
  const urgent = findMatches(text, URGENT_SIGNALS).map((h) => ({ label: h.label, level: 'urgent' }));
  const routine = findMatches(text, ROUTINE_SIGNALS).map((h) => ({ label: h.label, level: 'routine' }));

  let level = 'routine';
  if (emergency.length) level = 'emergency';
  else if (urgent.length || intents.some((i) => i.id === 'ambulance')) level = 'urgent';

  const signals = level === 'routine' ? routine : [...emergency, ...urgent];
  return { level, label: URGENCY_LEVELS[level].label, signals, rationale: RATIONALE[level] };
}
