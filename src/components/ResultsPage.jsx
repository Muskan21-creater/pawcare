import { useState } from 'react';
import { ArrowUpDown, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { AREAS, CATEGORIES, CITY, USER_AREA } from '../data/providers.js';
import { categoryById, countActiveFilters, cx, DEFAULT_QUERY } from '../lib/utils.js';
import ProviderCard from './ProviderCard.jsx';
import SearchBar from './SearchBar.jsx';

const RATING_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 4, label: '4.0+' },
  { value: 4.5, label: '4.5+' },
  { value: 4.8, label: '4.8+' },
];
const DISTANCE_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 3, label: 'Within 3 km' },
  { value: 6, label: 'Within 6 km' },
  { value: 10, label: 'Within 10 km' },
];
const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'nearest', label: 'Nearest first' },
  { value: 'rating', label: 'Highest rated' },
];

function FilterGroup({ title, children }) {
  return (
    <fieldset className="border-t border-line pt-5 first:border-0 first:pt-0">
      <legend className="float-left mb-3 w-full text-sm font-semibold text-ink">{title}</legend>
      <div className="clear-both flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Option({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cx('pill', active && 'pill-active')}>
      {children}
    </button>
  );
}

function Filters({ query, onChange }) {
  return (
    <div className="flex flex-col gap-5">
      <label htmlFor="filter-open" className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-surface px-4 py-3">
        <span>
          <span className="block text-sm font-semibold text-ink">Open now</span>
          <span className="block text-xs text-ink-muted">Hide places that are closed</span>
        </span>
        <span className="relative inline-flex shrink-0">
          <input id="filter-open" type="checkbox" role="switch" checked={query.openNow} onChange={(e) => onChange({ openNow: e.target.checked })} className="peer sr-only" />
          <span className="h-7 w-12 rounded-full bg-ink/15 transition peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2" />
          <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
        </span>
      </label>

      <FilterGroup title="Category">
        <Option active={query.category === 'all'} onClick={() => onChange({ category: 'all' })}>All</Option>
        {CATEGORIES.map((c) => (
          <Option key={c.id} active={query.category === c.id} onClick={() => onChange({ category: c.id })}>{c.short}</Option>
        ))}
      </FilterGroup>

      <FilterGroup title="Rating">
        {RATING_OPTIONS.map((o) => (
          <Option key={o.value} active={query.minRating === o.value} onClick={() => onChange({ minRating: o.value })}>{o.label}</Option>
        ))}
      </FilterGroup>

      <FilterGroup title={`Distance from ${USER_AREA}`}>
        {DISTANCE_OPTIONS.map((o) => (
          <Option key={o.value} active={query.maxKm === o.value} onClick={() => onChange({ maxKm: o.value })}>{o.label}</Option>
        ))}
      </FilterGroup>

      <FilterGroup title="Neighbourhood">
        <Option active={query.area === 'all'} onClick={() => onChange({ area: 'all' })}>All</Option>
        {AREAS.map((a) => (
          <Option key={a} active={query.area === a} onClick={() => onChange({ area: a })}>{a}</Option>
        ))}
      </FilterGroup>
    </div>
  );
}

function heading(query, count) {
  const what = query.category !== 'all' ? categoryById(query.category).label : query.text ? `Results for “${query.text}”` : 'Animal care';
  const where = query.area !== 'all' ? `${query.area}, Bengaluru` : CITY;
  return { title: `${what} in ${where}`, summary: `${count} ${count === 1 ? 'provider' : 'providers'}${query.openNow ? ' open now' : ''}` };
}

export default function ResultsPage({ query, results, loading, onChange, onReset, onView }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const active = countActiveFilters(query);
  const { title, summary } = heading(query, results.length);
  const canReset = active > 0 || query.text;

  return (
    <div className="container-page py-6 sm:py-8">
      <SearchBar compact idPrefix="results" initialText={query.text} initialArea={query.area} onSearch={onChange} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-8">
        <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Filters">
          <div className="flex gap-2 lg:hidden">
            <button type="button" onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen} aria-controls="filter-panel" className={cx('btn-secondary flex-1', filtersOpen && 'border-brand')}>
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filters
              {active > 0 && <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1.5 text-xs font-semibold text-white">{active}</span>}
            </button>
            <button type="button" onClick={() => onChange({ openNow: !query.openNow })} aria-pressed={query.openNow} className={cx('btn-secondary flex-1', query.openNow && 'border-brand bg-brand-tint text-brand-deep hover:bg-brand-tint')}>
              <span className={cx('h-2 w-2 rounded-full', query.openNow ? 'bg-emerald-500' : 'bg-ink-muted/50')} aria-hidden="true" />
              Open now
            </button>
          </div>

          <div id="filter-panel" className={cx('card mt-3 p-5 lg:mt-0 lg:block', filtersOpen ? 'animate-rise block' : 'hidden')}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold">Filters</h2>
              {canReset && (
                <button type="button" onClick={onReset} className="rounded text-sm font-semibold text-brand-deep hover:underline">Clear all</button>
              )}
            </div>
            <Filters query={query} onChange={onChange} />
            <button type="button" onClick={() => setFiltersOpen(false)} className="btn-primary mt-5 w-full lg:hidden">
              Show {results.length} {results.length === 1 ? 'result' : 'results'}
            </button>
          </div>
        </aside>

        <section aria-live="polite" aria-busy={loading}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
              <p className="mt-1 text-sm text-ink-muted">
                {summary} · distances from {USER_AREA}
              </p>
            </div>
            <label htmlFor="sort" className="relative flex shrink-0 items-center gap-2 self-start rounded-xl border border-line bg-white pl-3 text-sm text-ink-muted sm:self-auto">
              <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Sort by</span>
              <select id="sort" value={query.sort} onChange={(e) => onChange({ sort: e.target.value })} className="min-h-[44px] cursor-pointer appearance-none bg-transparent pr-4 font-semibold text-ink focus:outline-none">
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>

          {canReset && (
            <div className="mt-4 flex flex-wrap gap-2">
              {query.text && <ActiveChip label={`“${query.text}”`} onRemove={() => onChange({ text: '' })} />}
              {query.category !== 'all' && <ActiveChip label={categoryById(query.category).short} onRemove={() => onChange({ category: 'all' })} />}
              {query.area !== 'all' && <ActiveChip label={query.area} onRemove={() => onChange({ area: 'all' })} />}
              {query.minRating > 0 && <ActiveChip label={`${query.minRating.toFixed(1)}+ rating`} onRemove={() => onChange({ minRating: 0 })} />}
              {query.maxKm > 0 && <ActiveChip label={`Within ${query.maxKm} km`} onRemove={() => onChange({ maxKm: 0 })} />}
              {query.openNow && <ActiveChip label="Open now" onRemove={() => onChange({ openNow: false })} />}
            </div>
          )}

          {loading && results.length === 0 ? (
            <ul className="mt-6 flex flex-col gap-4" aria-label="Loading results">
              {[0, 1, 2].map((n) => (
                <li key={n} className="card h-48 animate-pulse bg-white/60" />
              ))}
            </ul>
          ) : results.length === 0 ? (
            <div className="card mt-6 flex flex-col items-center px-6 py-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-ink-muted">
                <SearchX className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-xl font-semibold">No providers match these filters</h2>
              <p className="mt-2 max-w-sm text-sm text-ink-soft">Try a wider distance, a lower rating, or turn off “Open now”. If it is urgent, emergency services stay open all night.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={onReset} className="btn-primary">Clear all filters</button>
                <button type="button" onClick={() => onChange({ ...DEFAULT_QUERY, category: 'emergency' })} className="btn-secondary">See Emergency Care</button>
              </div>
            </div>
          ) : (
            <ul className="mt-6 flex flex-col gap-4">
              {results.map((p) => (
                <li key={p.id}>
                  <ProviderCard provider={p} onView={onView} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function ActiveChip({ label, onRemove }) {
  return (
    <button type="button" onClick={onRemove} className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full bg-ink px-3 text-xs font-semibold text-white transition hover:bg-ink-soft" aria-label={`Remove filter ${label}`}>
      {label}
      <X className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}
