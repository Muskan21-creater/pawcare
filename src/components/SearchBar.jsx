import { useEffect, useState } from 'react';
import { ChevronDown, MapPin, Search } from 'lucide-react';
import { AREAS, CITY } from '../data/providers.js';
import { cx } from '../lib/utils.js';

/** Service + location search. Used large in the hero and compact above results. */
export default function SearchBar({ initialText = '', initialArea = 'all', onSearch, compact = false, idPrefix = 'search' }) {
  const [text, setText] = useState(initialText);
  const [area, setArea] = useState(initialArea);

  // Keep the fields in step when the query changes elsewhere (chips, category cards, clear filters).
  useEffect(() => setText(initialText), [initialText]);
  useEffect(() => setArea(initialArea), [initialArea]);

  const submit = (e) => {
    e.preventDefault();
    onSearch({ text: text.trim(), area });
  };

  return (
    <form
      onSubmit={submit}
      role="search"
      className={cx(
        'flex flex-col gap-2 rounded-2xl bg-white p-2 md:flex-row md:items-center',
        compact ? 'border border-line shadow-card' : 'shadow-lift ring-1 ring-ink/5',
      )}
    >
      <label htmlFor={`${idPrefix}-text`} className="flex min-h-[52px] flex-1 items-center gap-3 rounded-xl px-3 transition focus-within:bg-surface">
        <Search className="h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
        <span className="sr-only">Service or provider</span>
        <input
          id={`${idPrefix}-text`}
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search vets, hospitals, boarding..."
          className="w-full bg-transparent text-base text-ink placeholder:text-ink-muted focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          autoComplete="off"
        />
      </label>

      <span className="hidden h-8 w-px bg-line md:block" aria-hidden="true" />
      <span className="h-px bg-line md:hidden" aria-hidden="true" />

      <label htmlFor={`${idPrefix}-area`} className="relative flex min-h-[52px] items-center gap-3 rounded-xl px-3 transition focus-within:bg-surface md:w-52">
        <MapPin className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
        <span className="sr-only">Location</span>
        <select
          id={`${idPrefix}-area`}
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="w-full cursor-pointer appearance-none truncate bg-transparent pr-6 text-base text-ink focus:outline-none"
        >
          <option value="all">{CITY}</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>{a}, Bengaluru</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-ink-muted" aria-hidden="true" />
      </label>

      <button type="submit" className="btn-primary min-h-[52px] px-6 text-base">
        <Search className="h-4 w-4 md:hidden" aria-hidden="true" />
        {compact ? 'Search' : 'Search Now'}
      </button>
    </form>
  );
}
