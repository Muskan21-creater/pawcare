import { AREA_COORDS, USER_AREA } from '../data/providers.js';
import { categoryById, getStatus } from '../lib/utils.js';
import { INTENTS } from './classifyIntent.js';

/**
 * Provider ranking. Total = 100 points, every component is visible in the UI.
 *
 *   category match   40  does the provider type fit what was asked for
 *   urgency fit      20  can this provider handle how urgent it is
 *   availability     15  is it open right now
 *   distance         15  closer is better; urgent cases are penalised faster
 *   rating           10  from 3.5 stars (0) to 4.8 stars (full marks)
 *
 * For emergency and urgent requests, providers that are open always rank
 * above providers that are closed, whatever their score.
 */
export const SCORE_MAX = { category: 40, urgency: 20, availability: 15, distance: 15, rating: 10 };

export const SCORE_LABELS = {
  category: 'Category match',
  urgency: 'Urgency fit',
  availability: 'Availability',
  distance: 'Distance',
  rating: 'Rating',
};

const DISTANCE_SCALE_KM = { emergency: 10, urgent: 15, routine: 25 };
const INTENT_WEIGHTS = [1, 0.6]; // main intent counts fully, the runner-up at 60%
const CRITICAL_SERVICE = /icu|emergency|inpatient|ambulance|oxygen|triage/i;

/** 0 to 1: how well does this provider type fit a single intent? */
function categoryFit(intentId, p) {
  const has = (re) => p.services.some((s) => re.test(s));
  switch (intentId) {
    case 'emergency':
      if (p.category === 'emergency' || (p.category === 'hospital' && p.open24)) return 1;
      return p.category === 'hospital' ? 0.5 : 0;
    case 'ambulance':
      if (has(/ambulance/i)) return 1;
      if (p.category === 'emergency') return 0.5;
      return p.category === 'hospital' ? 0.25 : 0;
    case 'consult':
      return p.category === 'clinic' ? 1 : p.category === 'hospital' ? 0.5 : 0;
    case 'hospital':
      return p.category === 'hospital' ? 1 : p.category === 'emergency' ? 0.5 : 0;
    case 'diagnostics':
      if (p.category === 'diagnostics') return 1;
      return p.category === 'hospital' && has(/x-?ray|ultrasound|blood/i) ? 0.5 : 0;
    case 'boarding':
      return p.category === 'boarding' ? 1 : 0;
    case 'ngo':
      return p.category === 'ngo' ? 1 : 0;
    default:
      return 0;
  }
}

function urgencyFit(p, level) {
  const critical = p.open24 || p.services.some((s) => CRITICAL_SERVICE.test(s));
  if (level === 'emergency') return p.open24 ? 20 : critical ? 12 : p.category === 'hospital' ? 8 : 3;
  if (level === 'urgent') return p.open24 ? 18 : critical ? 16 : p.category === 'clinic' ? 14 : p.category === 'diagnostics' ? 10 : 8;
  return (p.verified ? 20 : 16) - (p.category === 'emergency' ? 8 : 0); // routine: emergency units are not the point
}

function availabilityScore(status, level) {
  if (status.tone === 'open') return status.label.startsWith('Open 24') ? 15 : 12;
  if (status.tone === 'soon') return 6;
  return level === 'routine' ? 3 : 0; // a closed place can still be planned around for routine care
}

const ratingScore = (rating) => Math.round(Math.min(1, Math.max(0, (rating - 3.5) / 1.3)) * SCORE_MAX.rating * 10) / 10;

function haversineKm([lat1, lon1], [lat2, lon2]) {
  const rad = (d) => (d * Math.PI) / 180;
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

/** Sample data stores distance from JP Nagar; other areas use centre-to-centre distance with a road factor. */
export function distanceFrom(area, p) {
  if (area === USER_AREA) return p.distanceKm;
  if (p.area === area) return 1.2;
  return Math.max(1, Math.round(haversineKm(AREA_COORDS[area], AREA_COORDS[p.area]) * 1.35 * 10) / 10);
}

function buildReasons(p, ctx) {
  const { status, distanceKm, area, intents, level } = ctx;
  const category = categoryById(p.category);
  const main = INTENTS[intents[0].id];
  const reasons = [];

  const critical = p.services.filter((s) => CRITICAL_SERVICE.test(s));
  if (p.category === 'emergency' || (p.category === 'hospital' && p.open24)) {
    reasons.push(`${category.singular} with ${critical.slice(0, 2).join(' and ').toLowerCase() || 'round-the-clock care'}, built for urgent cases`);
  } else if (ctx.fit >= 1) {
    reasons.push(`${category.singular}, which is the right type for ${main.label.toLowerCase()}`);
  } else {
    reasons.push(`${category.singular}: a secondary fit for ${main.label.toLowerCase()}`);
  }

  if (status.tone === 'open') reasons.push(status.label.startsWith('Open 24') ? 'Open 24 hours, so someone can see your pet right now' : `${status.label.replace(' · ', ' ')} right now`);
  else if (status.tone === 'soon') reasons.push(`${status.label}: call ahead before you travel`);
  else reasons.push(`${status.label}${level === 'routine' ? ', so you can plan ahead' : '. Call to confirm before travelling'}`);

  reasons.push(`${distanceKm.toFixed(1)} km from ${area}`);
  reasons.push(`Rated ${p.rating.toFixed(1)} from ${p.reviewCount.toLocaleString('en-IN')} reviews${p.verified ? ', verified listing' : ''}`);
  return reasons;
}

/**
 * Steps 4 and 5 of the pipeline: match providers, then rank them.
 * Pure function of (providers, understanding, clock), so results are reproducible and testable.
 */
export function recommendProviders({ providers, intents, urgency, area, now = new Date(), limit = 3 }) {
  const level = urgency.level;
  const considered = intents.slice(0, INTENT_WEIGHTS.length);

  const scored = providers
    .map((p) => {
      const fit = Math.max(...considered.map((intent, i) => categoryFit(intent.id, p) * INTENT_WEIGHTS[i]));
      if (fit <= 0) return null;
      const status = getStatus(p, now);
      const distanceKm = distanceFrom(area, p);
      const breakdown = {
        category: Math.round(fit * SCORE_MAX.category * 10) / 10,
        urgency: urgencyFit(p, level),
        availability: availabilityScore(status, level),
        distance: Math.round(SCORE_MAX.distance * Math.max(0, 1 - distanceKm / DISTANCE_SCALE_KM[level]) * 10) / 10,
        rating: ratingScore(p.rating),
      };
      const score = Math.round(Object.values(breakdown).reduce((a, b) => a + b, 0));
      return { provider: p, score, breakdown, status, distanceKm, fit };
    })
    .filter(Boolean);

  const openFirst = level !== 'routine';
  scored.sort((a, b) => (openFirst ? Number(b.status.open) - Number(a.status.open) : 0) || b.score - a.score || a.distanceKm - b.distanceKm);

  const top = scored.slice(0, limit);
  const nearest = Math.min(...top.map((r) => r.distanceKm));
  const bestRated = Math.max(...top.map((r) => r.provider.rating));

  top.forEach((rec, index) => {
    const p = rec.provider;
    const labels = [];
    if (index === 0) labels.push('Best Match');
    if (p.open24 && (level !== 'routine' || intents.some((i) => i.id === 'emergency' || i.id === 'ambulance'))) labels.push('Emergency Available');
    if (top.length > 1 && rec.distanceKm === nearest) labels.push('Closest Option');
    if (p.rating >= 4.7 && p.reviewCount >= 150 && p.rating === bestRated) labels.push('Highly Rated');
    rec.rank = index + 1;
    rec.labels = labels.slice(0, 3);
    rec.reasons = buildReasons(p, { status: rec.status, distanceKm: rec.distanceKm, area, intents, level, fit: rec.fit });
    rec.warning = !rec.status.open ? `${rec.status.label}. Call before travelling.` : null;
  });

  return { candidates: scored.length, top };
}
