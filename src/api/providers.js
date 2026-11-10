// Data access layer. Components only talk to these functions, so connecting a
// real backend means replacing the bodies below with fetch calls, for example:
//   GET /api/providers?text=&area=&category=&minRating=&maxKm=&openNow=&sort=
//   GET /api/providers/:id
import { useEffect, useState } from 'react';
import { PROVIDERS } from '../data/providers.js';
import { getStatus, matchesText } from '../lib/utils.js';

const SORTERS = {
  // Open places first, then a blend of rating and proximity.
  recommended: (a, b) => score(b) - score(a),
  nearest: (a, b) => a.distanceKm - b.distanceKm,
  rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
};

function score(provider) {
  return (getStatus(provider).open ? 2 : 0) + provider.rating - provider.distanceKm * 0.08 + (provider.verified ? 0.3 : 0);
}

export async function searchProviders(query) {
  const results = PROVIDERS.filter(
    (p) =>
      matchesText(p, query.text) &&
      (query.area === 'all' || p.area === query.area) &&
      (query.category === 'all' || p.category === query.category) &&
      p.rating >= query.minRating &&
      (!query.maxKm || p.distanceKm <= query.maxKm) &&
      (!query.openNow || getStatus(p).open),
  );
  return results.sort(SORTERS[query.sort] ?? SORTERS.recommended);
}

export async function getProvider(id) {
  return PROVIDERS.find((p) => p.id === id) ?? null;
}

/** Runs a search whenever the query changes; keeps the previous results on screen meanwhile. */
export function useProviderSearch(query) {
  const [state, setState] = useState({ loading: true, results: [] });
  const key = JSON.stringify(query);
  useEffect(() => {
    let current = true;
    searchProviders(JSON.parse(key)).then((results) => current && setState({ loading: false, results }));
    return () => {
      current = false;
    };
  }, [key]);
  return state;
}

export function useProvider(id) {
  const [state, setState] = useState({ loading: true, provider: null });
  useEffect(() => {
    let current = true;
    setState({ loading: true, provider: null });
    getProvider(id).then((provider) => current && setState({ loading: false, provider }));
    return () => {
      current = false;
    };
  }, [id]);
  return state;
}
