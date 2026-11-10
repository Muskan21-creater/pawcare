/** Lower-case, straighten quotes and collapse whitespace so patterns stay simple. */
export function normalise(input) {
  return String(input ?? '')
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Returns the user's own words for every pattern that matched (each pattern once). */
export function findMatches(text, rules) {
  const hits = [];
  for (const rule of rules) {
    const pattern = rule.pattern ?? rule;
    const match = text.match(pattern);
    if (match) hits.push({ label: match[0].trim(), weight: rule.weight ?? 1 });
  }
  return hits;
}
