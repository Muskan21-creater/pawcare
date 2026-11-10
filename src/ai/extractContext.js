import { AREAS, USER_AREA } from '../data/providers.js';
import { normalise } from './text.js';

const PET_ALIASES = { puppy: 'dog', kitten: 'cat', bunny: 'rabbit' };
const PET_PATTERN = /\b(dog|puppy|cat|kitten|rabbit|bunny|parrot|bird|cow|buffalo|goat|horse|hamster|tortoise|turtle)s?\b/;

const AREA_PATTERNS = [
  ['JP Nagar', /\bj\.?\s?p\.?\s?nagar\b/],
  ['Jayanagar', /\bjaya\s?nagar\b/],
  ['Koramangala', /\bkoramangala\b/],
  ['HSR Layout', /\bhsr\b/],
  ['Indiranagar', /\bindira\s?nagar\b/],
  ['Whitefield', /\bwhitefield\b/],
];

/** Which pet, and which neighbourhood? Falls back to the prototype's default area. */
export function extractContext(input) {
  const text = normalise(input);
  const petWord = text.match(PET_PATTERN)?.[1];
  const found = AREA_PATTERNS.find(([area, pattern]) => AREAS.includes(area) && pattern.test(text));
  return {
    pet: petWord ? PET_ALIASES[petWord] ?? petWord : null,
    area: found ? found[0] : USER_AREA,
    areaDetected: Boolean(found),
  };
}
