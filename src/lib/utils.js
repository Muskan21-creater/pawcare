import { CATEGORIES } from '../data/providers.js';

export const cx = (...parts) => parts.filter(Boolean).join(' ');

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const categoryById = (id) => CATEGORIES.find((c) => c.id === id);

export function formatTime(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function formatRange(range) {
  if (!range) return 'Closed';
  if (range[0] === 0 && range[1] === 1440) return 'Open 24 hours';
  return `${formatTime(range[0])} – ${formatTime(range[1])}`;
}

/** Live open/closed status from the provider's hours and the viewer's clock. */
export function getStatus(provider, now = new Date()) {
  if (provider.open24) return { open: true, tone: 'open', label: 'Open 24 hours' };
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const today = provider.hours[day];
  if (today && mins >= today[0] && mins < today[1]) {
    const closingSoon = today[1] - mins <= 60;
    return { open: true, tone: closingSoon ? 'soon' : 'open', label: `${closingSoon ? 'Closes soon' : 'Open'} · until ${formatTime(today[1])}` };
  }
  if (today && mins < today[0]) return { open: false, tone: 'closed', label: `Closed · opens ${formatTime(today[0])}` };
  for (let i = 1; i <= 7; i += 1) {
    const next = provider.hours[(day + i) % 7];
    if (next) {
      const when = i === 1 ? 'tomorrow' : DAY_NAMES[(day + i) % 7];
      return { open: false, tone: 'closed', label: `Closed · opens ${when} ${formatTime(next[0])}` };
    }
  }
  return { open: false, tone: 'closed', label: 'Closed' };
}

export const directionsUrl = (provider) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.address)}`;

const normalise = (word) => (word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word);

/** Free-text match across name, category, services and area. Every word must match. */
export function matchesText(provider, text) {
  const words = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).map(normalise);
  if (!words.length) return true;
  const category = categoryById(provider.category);
  const haystack = [provider.name, provider.area, category.label, category.keywords, provider.services.join(' ')]
    .join(' ')
    .toLowerCase();
  return words.every((word) => haystack.includes(word));
}

export const DEFAULT_QUERY = { text: '', area: 'all', category: 'all', minRating: 0, maxKm: 0, openNow: false, sort: 'recommended' };

export function countActiveFilters(query) {
  return ['area', 'category'].filter((k) => query[k] !== 'all').length + (query.minRating ? 1 : 0) + (query.maxKm ? 1 : 0) + (query.openNow ? 1 : 0);
}
