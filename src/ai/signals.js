// Phrase patterns shared by urgency detection and intent classification.
// They describe what the owner SAID. They never name a condition: PawCare
// does not diagnose, it only decides how quickly someone should be contacted.

export const EMERGENCY_SIGNALS = [
  /\bemergenc(?:y|ies)\b/,
  /(?:not|isn't|can't|cannot|won't|stopped)\s+breath\w*|can't breathe|struggling to breathe|trouble breathing|difficulty breathing|gasping|choking/,
  /collaps\w+|unconscious|unresponsive|passed out|fainted/,
  /seizure\w*|convuls\w+|\bfitting\b/,
  /poison\w*|\btoxic\b|swallowed|ingested|ate (?:some )?(?:chocolate|rat poison|rodent|grapes|medicine|pills?)/,
  /hit by (?:a )?(?:car|bike|vehicle|truck|bus)|road accident|run over/,
  /bleeding (?:a lot|heavily|badly|profusely|won't stop)|heavy bleeding|won't stop bleeding/,
  /bloated|swollen (?:belly|stomach)|can't (?:pee|urinate)|straining to (?:pee|urinate)/,
  /heat ?stroke|overheat\w*|blue gums|pale gums/,
];

export const URGENT_SIGNALS = [
  /\b(?:urgent(?:ly)?|asap|immediately|right now|as soon as possible)\b/,
  /vomit\w*|throwing up|diarrh\w+|loose motions?/,
  /limp\w*|can't put weight|(?:can't|cannot|unable to) (?:walk|move|stand)|\bfell\b|\bfall\b/,
  /bleed\w*|blood in (?:stool|urine|vomit)|wound\w*|injur\w+/,
  /swollen|swelling|fever|in pain|crying|whimper\w*|yelp\w*/,
  /not eating|stopped eating|won't eat|not drinking|lethargic|very weak/,
  /since (?:this )?(?:morning|yesterday|last night|\d+ days?|two days)|getting worse|worse(?:ning)?/,
];

export const ROUTINE_SIGNALS = [
  /vaccin\w+|check-?up|deworm\w*|grooming|neuter\w*|spay\w*|microchip\w*|next week|planning|advice/,
];

/** "not urgent", "no rush", "not an emergency" must not raise urgency. */
export const NEGATED_URGENCY = /\b(?:not|isn't|no|nothing)\s+(?:very\s+)?(?:an?\s+)?(?:urgent|emergency|serious)\b|\bno rush\b/g;
