import { EMERGENCY_SIGNALS } from './signals.js';
import { findMatches, normalise } from './text.js';

const rule = (pattern, weight) => ({ pattern, weight });

/**
 * The seven kinds of help PawCare can route to. `category` is the directory
 * category used when the user asks to see every provider of that type.
 */
export const INTENTS = {
  emergency: {
    id: 'emergency',
    label: 'Emergency care',
    category: 'emergency',
    rules: EMERGENCY_SIGNALS.map((p) => rule(p, 4)),
  },
  ambulance: {
    id: 'ambulance',
    label: 'Ambulance',
    category: 'emergency',
    rules: [rule(/ambulance|stretcher|transport\w*|(?:can't|cannot|unable to) (?:walk|move|stand)|carry (?:him|her|my)|pick (?:him|her|it|my \w+) up/, 3)],
  },
  hospital: {
    id: 'hospital',
    label: 'Pet hospital',
    category: 'hospital',
    rules: [rule(/hospital|surger\w+|operat\w+|admit\w*|in-?patient|fracture\w*|broken (?:leg|bone)|specialist|orthop\w+|cardio\w+|\bicu\b|post-?op\w*/, 3)],
  },
  diagnostics: {
    id: 'diagnostics',
    label: 'Diagnostics',
    category: 'diagnostics',
    rules: [rule(/blood (?:test|work|report)|x-?ray|ultrasound|sonograph\w*|\bscan\b|\blab\b|\becg\b|pathology|diagnostic\w*|\btests?\b|\breports?\b|sample collection|biopsy/, 3)],
  },
  consult: {
    id: 'consult',
    label: 'Veterinary consultation',
    category: 'clinic',
    rules: [
      rule(/vomit\w*|throwing up|diarrh\w+|loose motions?/, 2),
      rule(/limp\w*|itch\w*|scratch\w*|\brash\b|hair loss|\bskin\b|hot ?spot/, 2),
      rule(/cough\w*|sneez\w*|fever|runny nose|ear infection|eye discharge/, 2),
      rule(/not eating|stopped eating|won't eat|loss of appetite|lethargic|\bweak\b|sluggish/, 2),
      rule(/vaccin\w+|check-?up|deworm\w*|\bticks?\b|\bfleas?\b|neuter\w*|spay\w*|microchip\w*/, 2),
      rule(/\b(?:vets?|veterinar\w+|doctor|clinic|consult\w*)\b/, 2),
      rule(/dental|teeth|nutrition|diet\b/, 1),
    ],
  },
  boarding: {
    id: 'boarding',
    label: 'Boarding',
    category: 'boarding',
    rules: [rule(/\bboard(?:ing|ed)?\b|kennel|day ?care|pet ?sitt\w+|while i(?:'m| am| will be)? ?(?:away|travelling|traveling|out)|going (?:on )?(?:a )?(?:trip|vacation|holiday)|out of town|\bhostel\b|stay(?:ing)? (?:for|while)/, 3)],
  },
  ngo: {
    id: 'ngo',
    label: 'NGO / animal welfare',
    category: 'ngo',
    rules: [rule(/rescue\w*|stray\w*|street (?:dog|cat|animal|puppy)s?|adopt\w*|abandon\w*|shelter|\bngo\b|volunteer\w*|sterili[sz]\w+|found (?:a |an )?(?:puppy|kitten|dog|cat|injured)/, 3)],
  },
};

/**
 * Step 3 of the pipeline: what type of care is being asked for?
 * Every intent is scored by the weight of the phrases that matched; the user's
 * own words are returned so the UI can show what the decision was based on.
 */
export function classifyIntent(input) {
  const text = normalise(input);
  const intents = Object.values(INTENTS)
    .map((intent) => {
      const hits = findMatches(text, intent.rules);
      return { id: intent.id, score: hits.reduce((sum, h) => sum + h.weight, 0), matched: hits.map((h) => h.label) };
    })
    .filter((i) => i.score > 0)
    .sort((a, b) => b.score - a.score);

  const top = intents[0]?.score ?? 0;
  const confidence = top >= 4 ? 'high' : top >= 2 ? 'medium' : 'low';
  return { intents, confidence };
}
